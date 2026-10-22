# s02 — 工具使用：给 agent 装上"专用的手"

## 问题：只有一个 bash，太糙了

s01 的 agent 只有一个工具：bash。所有操作都靠 shell 命令。这带来几个麻烦：

- `cat` 读大文件时截断不可控
- `sed` 碰到特殊字符就出错
- 每次调 bash 都是一次安全风险（路径没有隔离）
- 既然模型总在读写文件，与其每次都拼 shell 命令，不如直接给它"读文件""写文件""编辑文件"的专用工具

**这一章的核心发现：加工具不需要改循环。** 循环还是那个循环，只是"执行工具"这一步从直接调 bash 变成了"查表找 handler"。

## 核心概念

### dispatch map（工具路由表）

就是一个字典，把工具名映射到对应的处理函数：

```python
TOOL_HANDLERS = {
    "bash":       run_bash,
    "read_file":  run_read,
    "write_file": run_write,
    "edit_file":  run_edit,
}
```

当模型说"我要用 read_file"，代码就查这个字典，找到 `run_read`，执行它。一个 if-elif 都不用写。

### 消息规范化（normalize_messages）

这是 s02 里最被低估的一个东西。

Anthropic API 对消息格式有严格的要求：

1. 每个 `tool_use` 必须有一个配对的 `tool_result`
2. `user` 和 `assistant` 消息必须严格交替出现
3. 只接受协议定义的字段，多余的字段会导致 400 错误

你内部维护的 messages 里可能有调试信息、时间戳这些额外字段。所以在调用 API 之前，需要先跑一遍 `normalize_messages()` 把消息清洗干净。

**内部 messages（带调试信息） ≠ 发给 API 的 messages（干净的）**

## 关键数据结构

### 工具的定义（Tools Schema）

每个工具需要告诉模型三件事：

```python
{
    "name": "read_file",
    "description": "读取工作目录下的文件内容",
    "input_schema": {
        "type": "object",
        "properties": {
            "path":      {"type": "string", "description": "文件路径"},
            "max_lines": {"type": "integer", "description": "最多读多少行"}
        },
        "required": ["path"]
    }
}
```

`description` 很重要——模型是靠这段文字决定什么时候该用哪个工具的。写得不清楚，模型就不会正确地用。

### safe_path（路径安全）

```python
WORKDIR = os.getcwd()

def safe_path(path: str) -> str:
    full = os.path.normpath(os.path.join(WORKDIR, path))
    if not full.startswith(WORKDIR):#检查是否以WORKDIR对应路径开头
        raise ValueError(f"不允许访问工作目录以外的路径: {path}")
    return full
```

这层检查保证模型不能通过 `../../etc/passwd` 这样的路径逃出工作目录。安全边界落到工具层，而不是指望模型自觉。

### 消息规范化函数

```python
def normalize_messages(messages: list) -> list:
    cleaned = []
    for msg in messages:
        # 1. 删掉内部字段（_internal、_source、_timestamp 等）
        clean_msg = {k: v for k, v in msg.items() if not k.startswith("_")}
        cleaned.append(clean_msg)

    # 2. 检查 tool_use / tool_result 配对，孤儿 tool_use 补一个 (cancelled)
    # 3. 合并连续的同 role 消息（API 要求严格交替）

    return cleaned
```

## 具体做法

### 在循环里用 dispatch map

```python
# s01 的旧写法（只支持 bash）
for block in response.content:
    if block.type == "tool_use":
        output = run_bash(block.input["command"])

# s02 的新写法（支持 N 个工具）
for block in response.content:
    if block.type == "tool_use":
        handler = TOOL_HANDLERS[block.name]   # 查表
        output = handler(**block.input)       # 调用
```

循环的其他部分一模一样。这就是 dispatch map 的价值：**加工具就像加一行字典条目，循环代码零改动**。

## 和 s01 的对比

| | s01 | s02 |
|---|---|---|
| 工具数量 | 1（bash） | 4（bash + read + write + edit） |
| 工具调用方式 | 硬编码调 bash | 查 TOOL_HANDLERS 字典 |
| 路径安全 | 无 | safe_path 隔离 |
| 消息处理 | 直接发给 API | 先 normalize 再发 |
| **循环结构** | **不变** | **不变** |

## 常见错误

### 1. 忘了 normalize_messages

这是 s02 最容易踩的坑。内部 messages 里带了一些临时字段，直接发给 API 就报 400 错误。每次调用 API 之前先跑一遍 normalize。

### 2. tool_use 和 tool_result 没配对

如果你在循环里碰到了 tool_use 但执行失败了，不要跳过——也要补一个 tool_result（内容写 "Error: xxx"），否则消息格式不合法。

### 3. 把 dispatch map 写得跟 if-elif 链一样

dispatch map 的意义是用数据结构替代控制流。如果你在一个工具 handler 里又写了一大串 if-elif 判断子命令，说明设计没做对。handler 应该是一层薄薄的适配层。

## 一句总结

**加工具 = 加 handler 函数 + 加工具定义。循环永远不变。工具层和循环层是解耦的。**

---

下一章：[s03 — 待办写入](s03-todo-write.md)——给模型一个 todo 列表，防止它在多步骤任务中跑偏。
