# UI/UX 交接

- 阶段：9 — 交接
- 日期：2026-11-20
- 状态：用户于 2026-11-20 接受 UI/UX 设计包之后整理。本交接不授权应用代码、安装依赖，也不修改 Implementation Plan。
- 用户于 2026-11-20 接受计划差额并授权实现。差额是 `docs/technical/10-implementation-plan.md` 中的 IMP-022。发布仍然未授权。
- 英文 `14-handoff.md` 是规范文本。本文件是对照译文。

## 1. 已接受的内容

用户于 2026-11-20 接受这些呈现和交互文档：

| 文档 | 作用 |
|---|---|
| `01-information-architecture.md` | 已接受的结构。一个窗口是一个会话。 |
| `02-user-flows.md` | F-01 到 F-09。 |
| `03-screen-inventory.md` | S-01 到 S-08。 |
| `04-wireframes.md` | 低保真结构。 |
| `05-visual-design.md` | 方向 L 加上 Token 基线。 |
| `06-interaction-specifications.md` | I-01 到 I-15。 |
| `12-page-specifications.md` | 页面组合。 |
| `10-design-tokens.md` 和 `tokens/design-tokens.json` | 已批准的 Token 基线，以及后来增加的输入边框。 |
| `11-component-specifications.md` | C-01 到 C-09。 |

英文文件是规范。对应的 `-zh.md` 是译文。译文落后时以英文文件为准。

## 2. 约束渲染器的决定

- 只有浅色主题。没有主题控件、导航栏、日历、时区选择器、重复事件控件或全天控件。
- 页面使用语义或组件 Token。唯一点名的例外是 EX-01，即 1 px 区域线。输入边框使用 `semantic.color.border-field`。
- 失败的命令显示结果代码。C-08 不增加成功句。成功时按投影重绘。
- 时钟输入是一行，`YYYY-MM-DD HH:mm`。空白或不匹配的行不发送，并显示 `invalid-local-time`。
- 放弃「较早 / 较晚」回到 S-05，并丢掉未发送的编辑。
- 移除、删除和解散使用 I-15。第一次按下不发送。确认用的危险按钮才发送。取消恢复原来的按钮，并且不写入。没有对话框。
- 只有该操作者可以更改事件时才出现编辑。每条可见事件的标题、地点和描述留在 S-05 的行上。
- `record-unreadable` 显示 S-07，并且不打开创建团队。`second-instance` 聚焦现有窗口并显示 C-09。

## 3. 提议的计划差额

尚未应用。`docs/technical/10-implementation-plan.md` 仍规定 IMP-020 停在绑定、另一个会话、一个事件、发生时刻选择和 `busyAt`，并认为超出这些操作的视觉设计不在范围内。

领域任务已经覆盖创建团队、邀请、维护者、移除、解散和事件命令。缺口在渲染器。

提议在 IMP-020 之后、IMP-021 之前增加：

- 按已接受的 UI 文档实现 S-01 到 S-08 和 I-01 到 I-15。
- 在桌面渲染器里把 Token JSON 映射为普通 CSS 自定义属性。不安装 Token 编译器，也不安装组件库。
- 渲染器仍然只能导入 `busyAt`。
- 把该渲染器任务加入 IMP-021 的前置任务。
- 删去「超出 IMP-020 原先那些操作的视觉设计不在范围内」这句话，改为已接受的 UI 包。

在这份差额被明确接受之前，计划不授权实现这些额外表面。

## 4. 仍然未授权

应用代码、安装依赖，以及对 PRD、Technical Design 或 Implementation Plan 的修改。评审后的修正和 I-15 还没有再做一次独立复审。
