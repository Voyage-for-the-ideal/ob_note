# s05 — 技能系统：把知识拆成技能包，用到的时候再加载

## 问题：你不能把所有知识都塞进系统提示词

s04 的 agent 已经能读文件、写代码、规划步骤、把局部任务派给子 agent。但不同类型的工作需要不同类型的知识：

- 代码审查需要一份检查清单
- 提交代码需要遵循 conventional commit 规范
- 集成 MCP 工具有一整套配置步骤
- 写测试要遵循特定的测试框架惯例

**如果把这些全塞进 system prompt，会出现什么结果？**

- 大部分时候用不上的知识白白占着 token
- system prompt 越来越长，核心规则被淹没
- 每次 API 调用都在为这些知识付费

所以需要换一种做法：**把知识跟 system prompt 解耦**。不常用的、领域相关的知识单独放，用到的时候才加载。

## 核心概念

### skill（技能）

一块"选配"的领域知识。比如"Git 提交规范"是一个技能，"MCP 服务端集成"是另一个技能。

每个技能是一个目录，里面有一个 `SKILL.md` 文件，包含技能的说明文本。

### discovery（发现层）

告诉模型"有哪些技能可用"。信息量很小——只有技能的名字和一句话描述。

你可以在 system prompt 里加一小段：

```
可用的技能：
  - code-review：代码审查检查清单
  - conventional-commit：Git 提交信息规范
  - mcp-integration：MCP 服务端集成步骤
```

模型看到这个，就知道"遇到代码审查任务时，我该加载 code-review 技能"。

### loading（加载层）

模型真的需要用到某个技能时，调用 `load_skill` 工具，把技能的完整文本拉进来。

**发现层省 token，加载层给足信息。** 两层配合。

## 关键数据结构

### SkillManifest（技能名片）

```python
{
    "name": "code-review",
    "description": "审查代码变更的检查清单，包括安全性、性能、可读性维度"
}
```

就两行信息。适合放在 system prompt 里。

### SkillDocument（技能完整内容）

```python
{
    "manifest": { "name": "code-review", "description": "..." },
    "body": "# Code Review Checklist\n\n## 安全性\n- 检查所有用户输入是否有验证\n..."
}
```

`body` 就是 SKILL.md 的正文。只在模型调用 `load_skill` 之后才进入上下文。

### SkillRegistry（技能注册中心）

```python
class SkillRegistry:
    def __init__(self, skills_dir: str):
        self.skills = {}
        for path in Path(skills_dir).rglob("SKILL.md"):
            meta, body = self._parse_frontmatter(path.read_text())
            name = meta.get("name", path.parent.name)
            self.skills[name] = {
                "manifest": {
                    "name": name,
                    "description": meta.get("description", ""),
                },
                "body": body,
            }

    def describe_available(self) -> str:
        """返回技能目录（放在 system prompt 里）"""
        lines = []
        for s in self.skills.values():
            lines.append(f"  - {s['manifest']['name']}: {s['manifest']['description']}")
        return "\n".join(lines)

    def load_skill(self, name: str) -> str:
        """按需加载一个技能的完整文本"""
        return self.skills[name]["body"]
```

## 具体做法

### 第一步：把技能目录写进 system prompt

```python
SYSTEM = f"""你是一个编程 agent，工作目录是 {os.getcwd()}。

可用的技能（如果你觉得当前任务需要，调用 load_skill 加载）：
{registry.describe_available()}
"""
```

### 第二步：把 load_skill 注册为一个工具

```python
{
    "name": "load_skill",
    "description": "按需加载一个技能的完整知识。",
    "input_schema": {
        "type": "object",
        "properties": {"name": {"type": "string"}},
        "required": ["name"]
    }
}

# handler
def handle_load_skill(name: str) -> str:
    return registry.load_skill(name)
```

### 第三步：加载后的内容进入上下文

当模型调用 `load_skill("code-review")` 时，SKILL.md 的完整正文就作为 `tool_result` 注入到了 messages 里。下一轮模型就能用这些知识来工作了。

### 目录结构长什么样

```
skills/
  code-review/
    SKILL.md         ← 里面是完整的审查清单
  conventional-commit/
    SKILL.md         ← 里面是提交信息规范
  mcp-integration/
    SKILL.md         ← 里面是 MCP 集成步骤
```

每个技能一个目录，入口文件叫 `SKILL.md`。

## skill、memory、CLAUDE.md 的边界

这三个容易搞混：

| | skill | memory | CLAUDE.md |
|---|---|---|---|
| **是什么** | 可选的领域知识包 | 跨会话有价值的记忆 | 全局的、长期稳定的规则 |
| **何时用** | 特定任务类型需要时按需加载 | 跨会话保留，自动读取 | 每次对话都自动加载 |
| **谁管** | 模型主动调用 load_skill | 系统自动读写 | 用户手动维护 |
| **举例** | "代码审查清单" | "用户偏好：Python 项目用 pytest" | "你是这个项目的后端开发助手" |

一句话区分：**skill 是"工具书"（需要时翻），memory 是"笔记"（积累下来的），CLAUDE.md 是"身份"（一直在的）。**

## 常见错误

### 1. 把技能目录写得太长

发现层只放名字和一句话描述就够了。别在目录里就开始写详细说明——那是 body 该做的事。

### 2. system prompt 里硬塞所有技能的完整文本

那 skills 系统就白做了。system prompt = 身份 + 规则 + 工具定义 + 技能目录（轻量）。完整内容走 tool_result 按需注入。

### 3. 技能之间的内容重叠

如果两个 SKILL.md 都写了相同的东西（比如都写了"如何做代码审查"），说明该拆出来共享。每个技能只负责一个清晰的领域。

### 4. 技能粒度太细

一个技能 = 完成一类任务所需的知识。不要拆成"读文件技能""写文件技能"——那不是知识，那是工具。

## 一句总结

**技能系统的核心，不是多一个工具，而是把"有时用、有时不用"的知识从 system prompt 里拆出来，改成按需加载。**

---

下一章：[s06 — 上下文压缩](s06-context-compact.md)——对话越长越长，得有办法腾地方，还不能丢掉关键信息。
