# UI/UX 设计工作流

> 版本：2.0.0  
> 状态：正式工作流定义  
> 范围：为已批准的 Version 1 PRD 制定 UI/UX 规格，不包含应用实现。  
> 设计方式：System-First、Linear-inspired（视觉参考方向，不复制某个产品）。

## 1. 权威依据、启动条件与启动协议

仅当 PRD、Technical Design 已获批准且 Implementation Plan 已存在时，才能在用户明确要求后启动。所有参与 Agent 必须先阅读 `docs/process/DEVELOPMENT_WORKFLOW.md`、`AGENTS.md`、本文件、已批准 PRD/Decision Log、Technical Design/评审、Implementation Plan，以及相关仓库和 package 文档。

权威顺序：已批准 PRD（行为和范围）→ 已批准 Technical Design（架构和技术契约）→ 已确认 Implementation Plan（任务顺序）→ 用户批准的 UI/UX 决策（仅呈现和交互）。

不得修改更高权威文档。发现产品歧义时询问用户；发现技术冲突时记录并通过 Technical Design 工作流请求修改。设计提案、Gate 完成、Reviewer PASS 或文档 PR 合并都不等于用户批准。

## 2. 不可违反的约束

- 保持已批准 PRD 范围，不增加身份验证/邮箱验证、多团队、跨设备同步、提醒、重复/全天事件或其他已排除行为。
- Version 1 是一款桌面应用，在一台电脑上保存一个本地团队记录。
- 除非用户明确修改已批准文档，否则 Website、Admin、API 不是 Version 1 UI 界面。
- 不编写应用代码、不安装依赖、不改变架构/PRD、不静默修改 Implementation Plan。
- 未经单独授权，不提交、推送、合并或发布。
- 设计提案或 Reviewer finding 不等于用户批准。
- Skill 是可复用流程，不是隔离 subagent。无法原生委派时必须披露，不得将自检称为独立评审。
- 不得擅自假设深色模式、主题切换、移动端响应式布局、新设置或新产品界面。只设计已批准需求和现有技术约束支持的内容。
- Linear 仅作为克制、精致、信息密度较高的桌面工具视觉参考；不得复制其品牌、产品专属模式或未经批准的功能。

## 3. Agent 角色与职责

### UI/UX Designer — 主设计 Agent / 调度者
主会话是唯一面向用户的设计者。负责检查现有 UI 代码/资源/组件/样式/测试；执行就绪分析；维护正式设计文档；保证设计系统一致性和 PRD AC → 流程 → 页面 → 组件/交互追溯；委派评审；处理 findings；向用户提出产品决策问题。不得编写应用代码或修改已批准 PRD/Technical Design。

### UI/UX Design Reviewer — 独立只读评审
仅在 Design Review Gate 调用。检查正式文档和证据，只返回 findings。不得编辑文件、访谈用户、作产品决策或编写代码。平台支持时使用工具级只读限制；仅靠提示词不构成沙箱。

不新增设计 Agent。UI/UX 阶段不激活 Implementation Planner。

## 4. System-First 设计原则

设计系统是有约束力的设计契约，不是可选风格指南。

1. 先确认仓库约束和已批准产品结构，再作视觉决策。
2. 最终 Token 值必须在用户批准 Visual Direction 后提出。
3. 批量高保真页面设计前，必须由用户批准 Design Token 基线和核心组件模式。
4. 页面必须使用语义 Token 和已批准组件规范，避免任意页面数值和一次性组件。
5. 所有视觉/交互选择都要追溯到已批准 PRD 行为和 Technical Design 契约。
6. 参考图片只表达视觉特征，不能替代可编辑规格、Token 数据、组件契约或用户批准。
7. 若技术栈已有设计系统或组件库，应先调研并在适当时复用；设计阶段不得安装或替换依赖。

## 5. 阶段与用户审批 Gate

### Stage 0 — 就绪分析
检查 UI 框架/renderer、导航、可复用组件、样式、字体/图标/资源、桌面窗口约束、无障碍模式、UI 测试和实施任务依赖。输出 Readiness Report、候选 IA 和页面清单、AC 到流程/页面/交互的初步映射、可复用资源、约束、风险和待确认问题。本阶段只分析：不决定视觉方向、不画线框、不写代码、不安装依赖、不修改计划。完成后等待用户审阅。

### Stage 1 — 信息架构、用户流程和页面清单
定义导航、角色入口、用户旅程、进入/退出条件、适用 PRD 流程和候选页面。每个流程/页面映射需求和 AC 编号。产品行为不确定时记录问题，不得通过编造 UI 自行解决。视觉系统工作开始前，先取得用户对结构基线的认可。

### Stage 2 — Visual Direction（用户审批 Gate 1）
基于仓库约束和用户偏好，提出少量有明显差异的视觉方向：参考特征、信息密度、层级、布局倾向、字体方向、色彩策略、图标、表面和交互气质。推荐方向为 Linear-inspired，而不是复制品。提供可用的参考图片及来源/归属、建议借鉴/避免的特征和理由。不得把临时颜色当成已批准 Token。等待用户明确批准后再继续。

### Stage 3 — Design Tokens 与核心组件系统（用户审批 Gate 2）
Gate 1 通过后，提出 Primitive、Semantic、Component 三层 Token。按需覆盖颜色、字体、间距、尺寸/布局、圆角、边框、层级、图标、动效/减少动态效果。结构化 Token 存储于 `docs/ui-ux/tokens/design-tokens.json`；在 `10-design-tokens.md` 记录理由和使用方式。于 `11-component-specifications.md` 定义核心组件结构、变体、状态、无障碍、键盘行为和使用规则。提供可审阅的 Component Gallery/样例。先调研现有技术栈，再决定 Token 输出格式和映射策略。不得增加运行时依赖或应用代码。等待用户批准 Token 基线和核心组件系统。

### Stage 4 — 线框和页面规格
使用已批准 IA 和组件契约，创建可编辑、可审阅的低保真线框及页面规格。定义布局区域、信息层级、控件、窗口缩放行为、键盘/焦点顺序和相关状态。每个页面映射 PRD AC 和用户流程。高保真设计前先解决结构问题。

### Stage 5 — 高保真视觉设计和交互规格
将已批准 Token/组件应用于所有范围内页面。定义适用状态和交互，包括 PRD 要求的校验、成功/失败/取消、权限拒绝、破坏性操作确认、加载/空/错误和本地时间边界情况。记录页面级偏差及理由，不增加未经支持的产品行为。

### Stage 6 — 设计系统和视觉验证
依据已批准 Token、组件规范、页面规格、无障碍和需求追溯验证设计包。检查 Token 覆盖、任意值例外、组件复用、字体/间距层级、视觉状态覆盖、窗口尺寸行为和跨页面一致性。将结果和证据记录在 `13-visual-validation.md`。这是设计产物验证，不是对已实现应用进行运行时截图验证。实际实现截图对比属于另行授权后的 Coding & Testing 阶段。

### Stage 7 — 独立设计评审 Gate
Stage 1–6 形成完整一致的设计包后，委派独立 Reviewer。报告保存至 `08-design-review.md`。每项 finding 记录严重程度、证据、场景、影响、建议和是否需要产品决策。主设计者处理设计问题；产品决策交由用户。重大修改后重新评审。

### Stage 8 — 实施就绪和用户批准
检查每个适用 PRD AC 是否映射到流程/页面/组件/交互或有合理的非 UI 说明；UI 契约是否符合 Technical Design；Token/组件/页面/状态/无障碍覆盖是否完整；findings 是否解决或明确跟踪；UI 任务是否与 Implementation Plan 对齐。计划变更必须先提交用户批准，不得静默应用。用户明确批准前状态保持 READY FOR USER REVIEW。

### Stage 9 — 交接
UI/UX 获批后准备设计交接及已批准的计划变更。交接不等于编码授权；必须等待用户单独明确授权才能开始实现。

## 6. Token 和组件治理

- Token JSON 是已批准设计值的机器可读取来源；Markdown 说明语义、理由、约束和示例。
- 英文设计文档为规范版本；对应 `-zh.md` 为翻译，必须保持语义一致。
- 使用三层 Token：Primitive（原始值）、Semantic（用途别名）、Component（组件专属别名）。页面规格存在 Semantic Token 时不得直接引用 Primitive。
- Stage 2 用户批准和 Stage 3 提案前不得编造最终 Token 值；临时值必须明确标注。
- 页面必须使用已批准的 Semantic/Component Token。例外必须记录理由并由设计系统负责人/用户处理。
- 组件规范应定义用途、结构、变体、状态、键盘/无障碍行为、缩放、使用方式和反例。
- 影响多个页面的 Token/组件变更必须分析影响并更新相关规格，不得暗中分叉设计系统。

## 7. 正式文档

位于 `docs/ui-ux/`：

| 文件 | 用途 |
|---|---|
| `00-design-requirements.md` | 范围、设计约束、产出和 Gate |
| `01-information-architecture.md` | 导航和信息结构 |
| `02-user-flows.md` | 可追溯需求的用户旅程 |
| `03-screen-inventory.md` | 页面/界面清单 |
| `04-wireframes.md` | 低保真结构和布局 |
| `05-visual-design.md` | 已批准视觉方向和高保真规格 |
| `06-interaction-specifications.md` | 交互和状态契约 |
| `07-design-system.md` | 设计系统总览和治理 |
| `08-design-review.md` | 独立评审 findings 和处理结果 |
| `09-visual-references.md` | 参考分析和已批准视觉方向 |
| `10-design-tokens.md` | Token 分类、定义和使用规则 |
| `11-component-specifications.md` | 可复用组件契约 |
| `12-page-specifications.md` | 页面组合和行为 |
| `13-visual-validation.md` | 设计产物一致性和验证证据 |
| `tokens/design-tokens.json` | 机器可读取的 Token 基线 |

每份 Markdown 文档都有对应的 `-zh.md` 翻译。英文文件为规范版本，中文需保持语义一致。本工作流不创建应用实现代码或安装依赖。
