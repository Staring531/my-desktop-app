# UI/UX 设计工作流

> 版本：1.0.0  
> 状态：正式工作流定义  
> 范围：为用户已批准的 Version 1 PRD 制定界面与体验规格，不包含应用实现。

## 权威依据与启动条件
PRD 和 Technical Design 已获批准，且 Implementation Plan 可用后，用户要求开始 UI/UX Design 时方可启动。阅读已批准 PRD、Decision Log、Technical Design、评审报告、Implementation Plan 和仓库证据。

权威顺序：已批准 PRD（行为和范围）→ 已批准 Technical Design（架构和技术契约）→ Implementation Plan（任务顺序）→ UI/UX Design（仅呈现和交互）。

不得修改更高权威文档。发现产品歧义时询问用户；发现技术冲突时记录并通过相应工作流请求修改。不得自行编造行为来消除冲突。

## 不可违反的约束
- 保持 PRD 范围不变，不增加身份验证/邮箱验证、多团队、跨设备同步、提醒、重复/全天事件或其他已排除行为。
- Version 1 是一款桌面应用，在一台电脑上保存一个本地团队记录。
- 除非用户明确修改已批准文档，否则 Website、Admin、API 不是 Version 1 的 UI 界面。
- 不编写应用代码、不安装依赖、不改变架构或 PRD。
- 不直接修改 Implementation Plan；如有必要，提出可追溯的变更建议并等待用户批准。
- 未经单独授权，不提交、推送、合并或发布。
- 设计提案或 Reviewer finding 不等于用户批准。
- Skill 是可复用流程，不是隔离 subagent。无法原生委派时必须披露，不得将自检称为独立评审。

## 双 Agent 模式
### UI/UX Designer — 主设计 Agent / 调度者
主会话是唯一面向用户的设计者。负责检查现有 UI 代码、资源、组件、样式和测试；先做就绪分析；获授权后创建和维护设计文档；维护 PRD AC → 流程 → 页面 → 交互追溯；委派独立评审；处理 findings；产品决策交由用户。不得编写应用代码或修改已批准 PRD/Technical Design。

### UI/UX Design Reviewer — 独立只读评审
仅在 Design Review Gate 调用。检查正式文档和证据，只返回 findings。不得编辑文件、访谈用户、作产品决策或编写代码。平台支持时使用工具级只读限制；仅靠提示词不构成沙箱。

## 阶段与门槛
### Stage 0 — 就绪分析
检查 UI 框架/renderer、导航、可复用组件、样式、字体/图标/资源、桌面窗口约束、无障碍模式、UI 测试和实施任务依赖。输出 Readiness Report、候选信息架构、候选页面清单、AC 到流程/页面/交互的初步映射、可复用资源、风险和待确认问题。本阶段只分析，不画线框、不写代码。完成后等待用户审阅。

### Stage 1 — 信息架构和用户流程
定义导航、角色入口、用户旅程、进入/退出条件和所有适用 PRD 流程。映射需求/AC 编号。用户接受结构基线后再继续。

### Stage 2 — 页面清单和低保真线框
创建页面清单和低保真线框，定义布局层级、控件、内容、权限、状态、键盘导航和窗口缩放。结构基线获接受前不得开展高保真设计。

### Stage 3 — 交互与视觉设计
定义控件行为、校验、操作反馈、取消/失败语义、破坏性操作确认、本地时间边界情况和 UI 状态。建立轻量设计系统及高保真视觉规格，范围仅限已批准界面。

### Stage 4 — 设计评审门槛
Stage 1–3 形成一致版本且追溯完整后，委派独立 Reviewer。报告保存至 `docs/ui-ux/08-design-review.md`。每项 finding 记录严重程度、证据、场景、影响、建议和是否需要产品决策。主设计者处理设计问题；产品决策交由用户。重大修改后重新评审。

### Stage 5 — 实施就绪和用户批准
检查每个适用 PRD AC 是否映射到流程/页面/交互或有合理的非 UI 说明；UI 契约是否符合 Technical Design；页面/状态/无障碍覆盖是否完整；findings 是否解决或跟踪；UI 任务是否与 Implementation Plan 对齐。计划变更必须先提交用户批准，不得静默应用。用户明确批准前状态保持 READY FOR USER REVIEW。

### Stage 6 — 交接
UI/UX 获批后准备设计交接及已批准的计划变更。交接不等于编码授权；必须等待用户单独明确授权才能开始实现。

## 正式文档
见 `docs/ui-ux/`：`00-design-requirements.md`、`01-information-architecture.md`、`02-user-flows.md`、`03-screen-inventory.md`、`04-wireframes.md`、`05-visual-design.md`、`06-interaction-specifications.md`、`07-design-system.md`、`08-design-review.md`。中文翻译使用对应 `-zh.md` 后缀；英文文件为规范基准，中文需保持语义一致。
