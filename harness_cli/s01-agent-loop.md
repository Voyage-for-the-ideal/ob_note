# s01 — Agent 循环：让模型从"会说"变成"会做"

## 问题：LLM 本身只会生成文字，不会干活

你把一个需求发给 Claude 或 GPT——比如"帮我看看这个项目里有哪些 Python 文件"——模型只会给你一段文字回复："你可以用 `ls *.py` 命令来查看"。

它不会真的去执行 `ls`。它没有手。

**Agent 循环要解决的就是这一点**：写一层代码，在模型和真实世界之间来回跑——模型说要执行什么，代码就真的去执行；执行完了，把结果重新喂给模型，让模型继续往下推理。

## 核心概念

### loop（循环）

不是什么复杂概念。就是一个 while True：

```
只要任务没做完，就重复：发消息 → 拿回复 → 执行工具 → 把结果写回去
```

### turn（一轮）

一轮 = 一次完整的"模型思考 + 工具执行"：

1. 把当前消息历史发给模型
2. 读模型的回复
3. 如果模型回复里说要调工具，就去执行
4. 把执行结果追加回消息历史

然后进入下一轮。

### tool_result（工具执行结果）

这是整个循环里最容易出错的地方。

很多人写了工具执行代码后，把结果用 `print()` 打印出来就完事了。这不对。

**tool_result 必须写回 messages（消息历史）里**，让模型下一轮能读到。就像你跟同事合作——你做完一件事，得告诉对方结果，对方才能基于这个结果往下推进。

### state（运行状态）

循环往前走的时候，一直带在身边的数据。最小版本就三样东西：

- `messages`：对话历史
- `turn_count`：当前是第几轮
- `transition_reason`：这一轮结束后为什么要继续（比如"因为刚执行了一个工具"）

## 关键数据结构

### messages（消息历史）

```python
messages = [
    {"role": "user", "content": "帮我创建一个 hello.py"},
    {"role": "assistant", "content": [{"type": "tool_use", ...}]},
    {"role": "user", "content": [{"type": "tool_result", ...}]},  # 工具结果包在 user 消息里返回
]
```

在 Anthropic API 里，工具执行结果要放在 `role: "user"` 的消息里。这跟普通对话不同——**工具结果不是 assistant 说的，是系统替用户交回去的**。

### tool_result block

```python
{
    "type": "tool_result",
    "tool_use_id": "toolu_xxx",   # 告诉模型：这个结果是针对你刚才哪一次工具调用
    "content": "文件创建成功"
}
```

`tool_use_id` 就像快递单号——模型可能同时调了 3 个工具，每个结果必须标明是哪个调用的返回值。

### 循环状态

```python
state = {
    "messages": [...],
    "turn_count": 1,
    "transition_reason": None,   # "tool_result" = 刚执行完工具，继续；None = 结束
}
```

## 具体做法

### 完整的 agent_loop 函数

```python
def agent_loop(state):
    while True:
        # 1. 把消息发给模型
        response = client.messages.create(
            model=MODEL,
            system=SYSTEM,          # 系统提示词：告诉模型它是谁、能做什么
            messages=state["messages"],
            tools=TOOLS,             # 告诉模型有哪些工具可用
            max_tokens=8000,
        )

        # 2. 把模型的回复写回消息历史（这步容易被遗忘！）
        state["messages"].append({
            "role": "assistant",
            "content": response.content,
        })

        # 3. 如果模型不想调工具了（stop_reason 不是 tool_use），就结束循环
        if response.stop_reason != "tool_use":
            state["transition_reason"] = None
            return

        # 4. 否则，遍历模型的回复，找出所有 tool_use
        results = []
        for block in response.content:
            if block.type == "tool_use":
                cmd = block.input["command"]
                output = run_bash(cmd)       # 真的去执行 shell 命令
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })

        # 5. 把工具结果包装成 user 消息，追加回历史
        state["messages"].append({
            "role": "user",
            "content": results
        })
        state["turn_count"] += 1
        state["transition_reason"] = "tool_result"
        # 循环回到第 1 步
```

### 教学版做的简化

为了让第一章容易理解，教学代码只用了一行判断：

```python
if response.stop_reason != "tool_use":
    return
```

意思是：只要模型还在想调工具，就继续循环；一旦模型觉得"我回答完了"，就停下来。

真实的系统（比如 Claude Code）会有更多判断条件，不是只看 `stop_reason`。但那是在后面章节逐步加的。第一章的关键是**先把这条回路跑通**。

## 常见错误

### 1. 工具结果打印出来，但不写回 messages

这是最常见的错误。print 出来的东西模型看不到。模型只能读到 messages 里的内容。

### 2. 不保存 assistant 回复

每次模型的回复也要追加到 messages。如果不追加，下一轮模型就会"失忆"——它不知道上一轮自己说了什么。

### 3. 不给 tool_result 绑定 tool_use_id

模型同时调了多个工具，结果回来不标 ID，模型根本分不清哪个是哪个。

### 4. 一上来就加入流式、并发、恢复、压缩

第一章的目标是把最小回路搭起来。先让它跑起来，再逐步加固。别一上来就想造火箭。

### 5. 把 messages 当聊天记录

messages 不是给你看的日志。**它是模型下一轮推理的工作输入。** 里面的每一条数据，都会影响模型接下来说什么。

## 一句总结

**Agent 的核心不是"模型很聪明"，而是"系统的每一轮都把真实执行结果喂回模型，让模型继续推理"。**

循环的这一来一回，就是把"文字回答"变成"实际行动"的全部秘密。

---

下一章：[s02 — 工具使用](s02-tool-use.md)——从一个 bash 工具扩展到 4 个专用工具，循环完全不用改。
