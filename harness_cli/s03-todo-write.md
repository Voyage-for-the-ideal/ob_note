# s03 — 待办写入：让模型把"计划"写出来，别只靠脑子记

## 问题：多步骤任务，做着做着就跑偏了

s02 的 agent 已经能读能写能执行命令了。但当你给它一个需要多步完成的任务时——比如"帮我搭一个 Flask 项目，要有用户登录和数据库"——马上就会出问题：

- 做着做着忘了做到哪一步
- 已经做完的事又检查一遍
- 一开始列了一大堆步骤，两轮之后就放飞自我、即兴发挥了

根本原因：**模型的工作记忆全在 messages 里，上下文一长，注意力就漂移。** 没有一个显式的、随时更新的"当前计划"，模型就跟没带清单去超市的人一样——多买了两样没用的，忘了一样该买的。

## 核心概念

### 会话内规划（in-session planning）

这不是"项目管理"，不是在写甘特图。就是一件事：**"为了完成你刚才提的需求，我现在先列出接下来几步，每一步做完了划掉，有变化了就更新。"**

它活在当前会话里，会话关了就不需要了。

### todo（待办事项）

就是模型用来写当前计划的工具入口。教学版叫 `todo`，实际系统里可能叫别的名字。本质一样：让模型能把计划写成结构化数据，而不是散在自然语言里。

### active step / in_progress（当前正在做的步骤）

任何时候最多只有一个步骤是 `in_progress`。这是教学版强制约束——**做完一件事再做下一件**。目的不是限制能力，而是帮模型维持注意力。

### 提醒（reminder）

不是帮模型规划，而是：**模型好几轮都没更新 todo 了，系统轻轻碰它一下**——"嘿，你的计划还准吗？"

## 关键数据结构

### PlanItem（一条计划）

```python
@dataclass
class PlanItem:
    content: str              # 要做什么："创建 Flask 项目结构"
    status: str               # pending | in_progress | completed
    activeForm: str = ""      # 进行时的说法："正在创建 Flask 项目结构"
```

### PlanningState（计划状态）

```python
@dataclass
class PlanningState:
    items: list                         # PlanItem 的列表
    rounds_since_update: int = 0        # 有多少轮没更新了
```

`rounds_since_update` 是关键——它让系统能感知到"计划是不是已经过时了"，并在需要的时候发出提醒。

### TodoManager（计划管理者）

```python
class TodoManager:
    def update(self, items: list) -> str:
        # 1. 校验：最多一个 in_progress
        # 2. 保存
        # 3. 返回渲染后的计划文本
        return self.render()

    def render(self) -> str:
        lines = []
        for item in self.items:
            marker = {"pending": "[ ]", "in_progress": "[>]", "completed": "[x]"}
            lines.append(f"{marker[item.status]} {item.content}")
        return "\n".join(lines)
```

注意 `update` 接受的是整个列表，不是单条增删改。教学版的设计是让模型"整个计划重写"，因为这样最简单。

## 具体做法

### 第一步：把 todo 注册为一个工具

```python
{
    "name": "todo",
    "description": "更新当前会话的工作计划。用这个工具把大任务拆成几个步骤，做完一步更新一步。",
    "input_schema": {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "content":    {"type": "string"},
                        "status":     {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                        "activeForm": {"type": "string"}
                    },
                    "required": ["content", "status"]
                }
            }
        },
        "required": ["items"]
    }
}
```

### 第二步：在主循环里加入"计划是否过时"的检查

```python
# 在 agent_loop 里
used_todo = False

for block in response.content:
    if block.type == "tool_use":
        if block.name == "todo":
            used_todo = True
            result = todo_manager.update(block.input["items"])
        else:
            result = TOOL_HANDLERS[block.name](**block.input)

# 这一轮没有用 todo？计数器 +1
if not used_todo:
    state.rounds_since_update += 1
else:
    state.rounds_since_update = 0

# 连续 3 轮没更新计划了？注入提醒
if state.rounds_since_update >= 3:
    # 在 tool_result 列表最前面插入一条提醒
    results.insert(0, {
        "type": "text",
        "text": "提醒：你已经连续几轮没有更新计划了。请在继续之前检查一下当前计划是否还准确。"
    })
```

### 看起来是什么样的

模型用起来的样子：

```
[ ] 检查项目现有结构
[>] 创建 Flask app 主文件            ← 当前在做
[ ] 添加用户登录路由
[ ] 配置数据库连接
[x] 确认依赖包已安装                  ← 已做完
```

## 它跟"任务系统"的区别（重要边界）

很多初学者在这里产生混淆：

| | s03 的 todo | 后续章节的任务系统 (s12) |
|---|---|---|
| **存活范围** | 当前会话 | 持久化到磁盘，跨会话 |
| **作用** | 帮模型在当前请求里集中注意力 | 多 agent 共享的工作协调 |
| **有依赖图吗** | 没有 | 有 |
| **有后台运行吗** | 没有 | 有 |

s03 不是"任务平台"，是"当前会话里的外显计划"。

## 常见错误

### 1. 一次写 10+ 步骤的计划

计划太长，模型很快就不愿意维护了。3-5 步最合适。做完了再加。

### 2. 不区分"当前步"和"未来步"

多个步骤同时标 `in_progress` 等于没有焦点。始终只有一个 `in_progress`。

### 3. 写一次计划就不再更新

做完了一步不划掉、情况变了不改计划——那计划跟没写一样。

### 4. 觉得提醒（reminder）是可有可无的装饰

reminder 背后的思想很重要：**主循环不仅管理消息流，还要管理结构化的"进程状态"。** 这是从"对话机器人"向"工作代理"的关键一步。

## 一句总结

**todo 不是任务平台，而是把"正在做什么"从模型脑子里搬到纸面上——让计划变成系统看得见、维护得了的东西。**

---

下一章：[s04 — 子代理](s04-subagent.md)——把探索性的脏活派给子 agent，主对话保持清爽。
