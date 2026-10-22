# s04 — 子代理：给每个任务一个干净的空间

## 问题：主对话被中间过程塞满了

s03 的 agent 已经会在一个多步骤任务里保持专注了。但新的麻烦出现了：

你问："这个项目用的什么测试框架？"

agent 开始干：读 `pyproject.toml` → 读 `requirements.txt` → 搜 pytest 相关配置 → 跑 `pytest --collect-only` → 读测试文件……折腾了一大圈。

最后给你的答案就一句话："这个项目主要用 pytest。"

**但中间这几十条工具调用和执行结果全堆在主 messages 里了。**

等你问下一个问题时，这些噪音还留在上下文里。模型看上下文就像在一堆垃圾邮件里找关键信息——越来越费劲。

## 核心概念

### 父代理（parent agent）

正在跟你对话的那个 agent，持有主 messages。

### 子代理（subagent）

父 agent 临时派出去干一件具体小事的小弟。子 agent 有自己的 messages，跟父 agent 完全隔离。

### 上下文隔离（context isolation）

这是 s04 的灵魂。

父 agent 的 messages 是它自己的，子 agent 的 messages 是它自己的，两个互不污染。子 agent 在局部任务里的所有中间过程——读了什么文件、跑了什么命令、试错了多少次——都不会自动混进父对话里。

子 agent 只带回最终结果的一句摘要。

## 关键数据结构

### SubagentContext

```python
@dataclass
class SubagentContext:
    messages: list        # 子 agent 自己的上下文
    tools: list           # 子 agent 能用的工具
    handlers: dict        # 工具名 → 处理函数
    max_turns: int = 30   # 最多跑 30 轮，防止死循环
```

### 父 agent 的 task 工具定义

```python
{
    "name": "task",
    "description": "派一个子 agent 去执行一个局部任务，子 agent 有独立的上下文。"
                  "只在需要搜索、阅读或调查信息时使用，用于收集结果而非修改代码。",
    "input_schema": {
        "type": "object",
        "properties": {
            "description": {"type": "string", "description": "这个子任务的简短描述"},
            "prompt":      {"type": "string", "description": "子 agent 收到的具体任务指令"},
        },
        "required": ["description", "prompt"]
    }
}
```

## 具体做法

### 子 agent 的运行函数

```python
def run_subagent(prompt: str) -> str:
    # 关键：用自己的空白 messages，不共享父 agent 的
    sub_messages = [{"role": "user", "content": prompt}]

    turn = 0
    while turn < 30:  # 最多 30 轮，防止死循环
        response = client.messages.create(
            model=MODEL,
            system="你是一个代码搜索助手。读取文件、搜索代码、然后返回一个简洁的摘要。",
            messages=sub_messages,
            tools=CHILD_TOOLS,  # 子 agent 只有基础工具（读文件、搜索、bash）
            max_tokens=4000,
        )

        sub_messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            break  # 模型觉得回答完了

        # 执行工具……
        for block in response.content:
            if block.type == "tool_use":
                handler = CHILD_HANDLERS[block.name]
                output = handler(**block.input)
                sub_messages.append({
                    "role": "user",
                    "content": [{"type": "tool_result", "tool_use_id": block.id, "content": output}]
                })

        turn += 1

    # 只返回最后模型的文本回答（摘要），不返回全部中间过程
    return extract_text(sub_messages[-1]["content"])
```

### 在父 agent 的循环里接入

```python
# 在父 agent 的工具执行循环里
for block in response.content:
    if block.type == "tool_use":
        if block.name == "task":
            # 子 agent 调用——不走普通 handler
            result_text = run_subagent(block.input["prompt"])
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result_text,
            })
        else:
            # 普通工具调用
            output = TOOL_HANDLERS[block.name](**block.input)
            results.append({...})
```

### 子 agent 只能用哪些工具

教学版的做法：

```python
CHILD_TOOLS = [bash_tool, read_file_tool, edit_file_tool, write_file_tool]
# 注意：不包含 task 工具，防止子 agent 再 spawn 子子 agent（无限递归）
```

## 什么是 fork，为什么先不用它

上面讲的方案是：子 agent 从空白上下文开始。这叫"blank context subagent"。

有些场景下，子 agent 需要知道父 agent 之前聊了什么。比如："基于我们刚才讨论的方案，把测试文件创建好。"

这就引出了 **fork**：

```python
# 不是从空开始，而是拷贝父 agent 的 messages
sub_messages = list(parent_messages)
sub_messages.append({"role": "user", "content": "基于以上对话，创建测试文件"})
```

fork 的本质是**继承上下文，而不是重头开始**。

但教学版把它放到"进阶"里。原因：先理解清楚"空白上下文 + 摘要返回"这个最简单的隔离模型，再去学 fork。

## 为什么子代理真的有用

不只是"看起来像多 agent 系统所以很酷"。实际收益：

1. **减少父 agent 上下文负担**：读文件、跑命令、试错的中间噪音不留存在主对话里
2. **让子任务的指令更集中**：子 agent 收到的 prompt 非常聚焦，比如"读这三个文件，告诉我它们和 `pyproject.toml` 的关系"
3. **为多 agent 协作打基础**：子 agent 是最小形态的"把一个任务外包给另一个 agent"

## 常见错误

### 1. 把子 agent 当成"来给多 agent 炫技的"

子 agent 首要解决的问题是**上下文污染**，不是"看我有很多个 agent"。

### 2. 把子 agent 的全部对话历史塞回父 agent

如果你把子 agent 的完整中间过程全部追回父对话，上下文隔离的价值就白费了。**只带回最终摘要。**

### 3. 一上来就设计复杂的角色体系

别一开始就搞 explorer/reviewer/planner/tester 的角色分工。先把"一个干净上下文的子任务执行者"做对。角色分工只是在这个基础上的包装。

### 4. 忘了给子 agent 设停止条件

没有 max_turns、没有异常处理、没有工具过滤，子 agent 真的会无限循环。至少设一个最大轮数上限。

## 一句总结

**子 agent 的核心不是"多一个角色"，而是"多一个干净上下文"。把局部任务隔离出去，主 agent 才能持续盯住主要目标。**

---

下一章：[s05 — 技能系统](s05-skill-system.md)——把不同的领域知识拆成技能包，用到的时候按需加载。
