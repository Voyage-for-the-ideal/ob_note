# s06 — 上下文压缩：对话太长时，怎么"腾地方"还不丢信息

## 问题：上下文窗口是有上限的

经过前面 5 章，agent 能做很多事了。但做得越多，messages 里的内容就越多：

- 大文件读进来，几千行代码占在上下文里
- 命令行输出动辄几万字符
- 多轮工具调用的旧结果堆积在那里

问题有三层：

1. **模型注意力被稀释**：关键指令埋在旧结果里，模型越来越难找
2. **API 调用越来越贵**：每次请求都带着全部历史，token 费用持续攀升
3. **最终撞到上下文上限**：模型能处理的输入是有硬限制的，到了就报错，任务中断

**所以需要一种机制：在需要的时候释放上下文空间，但又不丢掉"继续工作所需的关键信息"。**

## 核心概念

### 上下文窗口（context window）

模型一次能看到的输入总量的上限。不是无限大的。比如 Claude 的上下文窗口是 200K token——听着很大，但面对一个真正常年干活的 agent，迟早会满。

### 活跃上下文（active context）

messages 里"当前阶段最有价值、模型最需要看到"的那部分。压缩的目标就是：**把不重要的移走，保住活跃上下文的"连续性"。**

### 压缩（compaction）

用更短的表示来保留继续工作所需的关键信息。不是"删除历史"，是"把历史浓缩"。

## 三层压缩策略

教学版从浅到深给了三种方法，越往后力度越大：

```
第一层：大结果先存盘，上下文里只留摘要
     ↓  还不够？
第二层：旧的工具结果替换为占位符
     ↓  还不够？
第三层：让模型自己总结整个对话，然后清空历史，用总结重建上下文
```

## 关键数据结构

### 持久化输出标记

```python
PERSIST_THRESHOLD = 30000  # 超过 30000 字符就算"大结果"

def persist_large_output(tool_use_id: str, output: str) -> str:
    if len(output) <= PERSIST_THRESHOLD:
        return output  # 不大，直接返回

    # 存到磁盘
    filepath = f".task_outputs/tool-results/{tool_use_id}.txt"
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        f.write(output)

    # 上下文里只留摘要
    return (
        f"<persisted-output>\n"
        f"完整输出已保存到：{filepath}\n"
        f"前 2000 字符预览：\n{output[:2000]}\n"
        f"</persisted-output>"
    )
```

### 微压缩状态

```python
def micro_compact(messages: list) -> list:
    """只保留最近 3 个 tool_result 的原文，更早的替换为占位符"""
    tool_result_positions = []  # 记录所有 tool_result 在 messages 中的位置
    for i, msg in enumerate(messages):
        if msg["role"] == "user" and isinstance(msg["content"], list):
            for block in msg["content"]:
                if block.get("type") == "tool_result":
                    tool_result_positions.append(i)

    # 除了最后 3 个，其余替换
    for pos in tool_result_positions[:-3]:
        for block in messages[pos]["content"]:
            if block.get("type") == "tool_result":
                block["content"] = "[更早的工具结果已省略]"

    return messages
```

### 完整压缩

```python
def compact_history(messages: list) -> list:
    """让模型自己总结这段对话，然后用总结替代全部历史"""

    # 1. 先把完整历史存到磁盘（以备未来回顾）
    transcript_path = f".task_outputs/transcripts/{uuid4()}.jsonl"
    write_transcript(messages, transcript_path)

    # 2. 让模型为这段历史生成一个连续性摘要
    summary = summarize(messages)  # 调用模型，让它写摘要

    # 3. 用一条摘要消息替代全部历史
    return [{
        "role": "user",
        "content": (
            "## 对话摘要（为节省上下文已压缩）\n"
            f"完整记录已保存至：{transcript_path}\n\n"
            f"### 摘要\n{summary}"
        ),
    }]
```

`summarize()` 里的提示词特别重要——你需要明确告诉模型，摘要里必须包括这五样东西：

1. **当前任务目标**——我们在做什么
2. **已完成的步骤**——做完了什么
3. **涉及的文件**——改了/读了哪些文件
4. **关键决策和约束**——有哪些需要记住的限制条件
5. **下一步要做什么**——接下来往哪走

**丢掉任何一样，模型的"连续性"就会断。**

## 具体做法

### 在主循环里接入压缩

```python
def agent_loop(state: LoopState):
    while True:
        # ---- 压缩检查 ----

        # 每轮都跑微压缩（代价很低）
        state.messages = micro_compact(state.messages)

        # 估算当前上下文大小
        if estimate_tokens(state.messages) > CONTEXT_LIMIT * 0.8:
            # 接近上限了，做一次完整压缩
            state.messages = compact_history(state.messages)
            state.has_compacted = True

        # ---- 继续正常的 agent 循环 ----
        response = client.messages.create(
            model=MODEL,
            messages=state.messages,
            tools=TOOLS,
            ...
        )
        ...
```

### 手动压缩和自动压缩用同一个机制

教学版还提供了一个 `compact` 工具，模型可以自己决定什么时候做压缩：

```python
{
    "name": "compact",
    "description": "压缩当前对话历史，用连续性摘要替代全部消息。",
    "input_schema": {"type": "object", "properties": {}}
}
```

手动和自动走的是同一个 `compact_history()` 函数。

## 压缩的本质不是删，而是"保住连续性"

压缩完后的 contexts 一定会比之前短。但绝对不能出现这种情况：

- 模型忘了自己在做什么任务
- 模型不知道刚才改了什么文件
- 模型重复已经做完的步骤

**压缩的目标是：虽然上下文变短了，但模型继续往下做这件事的能力不该下降。**

## 常见错误

### 1. 只压缩、不保存

压缩前一定要把完整历史存到磁盘。未来 debug、回顾、或者模型需要查"刚才到底发生了什么"的时候，还有地方可以翻。

### 2. 微压缩把最近的 tool_result 也删了

微压缩只删"旧的"——至少保留最近 3 个 tool_result。如果全删了，模型无法知道刚才是怎么走到这一步的。

### 3. 压缩摘要写得太模糊

"我们做了一些事，遇到了一些问题，接下来继续做"——这种摘要等于没写。摘要要具体：改了哪个文件、做了什么改动、为什么这么做。

### 4. 等到上下文彻底爆了才压缩

最好在接近 80% 上限时就做完整压缩。等到真正撞墙再处理，一是 API 直接报错，二是最后几轮可能已经在萎缩的注意力下做了错误决策。

### 5. 觉得压缩就是少写几个字

压缩不是"缩句练习"，是**信息筛选**——筛掉噪音（旧工具输出），保留信号（任务目标、关键决策、文件状态）。

## 一句总结

**上下文压缩的核心，不是尽量少字，而是让模型在更短的上下文里，仍然能像什么都没删一样继续干活。**

---

## 回到起点

到 s06，你已经完成了"核心闭环"阶段。回顾前面 6 章：

```
s01  主循环    → 模型有了"手"
s02  工具路由  → 手更灵活了
s03  待办计划  → 做事不跑偏了
s04  子代理    → 杂活不污染主干
s05  技能加载  → 知识按需取用
s06  上下文压缩 → 持续干活不爆内存
```

这六个机制组合在一起，就是一个能**持续、专注、有效地干活**的 AI 编程 agent 的基础架构。

后面的章节（s07-s19）是在这个基础上继续叠机制：权限系统、任务持久化、多 agent 团队、工作区隔离……但核心回路就是这 6 章搭建起来的。
