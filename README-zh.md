# 我的桌面应用

一个跨平台桌面应用项目，仓库还包含公共网站、管理控制台和后端 API 的基础结构。

## 项目状态
仓库已记录获批的 Version 1 PRD、Technical Design 和 Implementation Plan。下一阶段为 UI/UX Design，采用 System-First、Linear-inspired 方向，并设置用户批准的视觉方向和设计系统 Gate。当前尚未获得应用代码开发授权。

## 开发生命周期
- Agent 必须遵循的主流程：[DEVELOPMENT_WORKFLOW-zh.md](DEVELOPMENT_WORKFLOW-zh.md)
- 开发流程图：[agent-zh.md](agent-zh.md)
- English workflow：[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)

1. Product Discovery（产品发现）——形成并由用户批准 PRD。
2. Technical Design（技术设计）——形成并由用户批准技术架构和技术契约。
3. Implementation Planning（实施规划）——拆解实施任务；规划不等于编码授权。
4. UI/UX Design（界面与体验设计）——就绪分析、结构设计、批准视觉方向、Design Tokens/组件系统、线框、高保真/交互规格、验证和独立评审。
5. Implementation Readiness（实施就绪）——检查需求追溯和计划对齐，等待用户明确批准。
6. Coding & Testing（编码与测试）——只有获得单独明确授权后才能开始。

## 正式工作流文档
- [Product Discovery（产品发现）](PRODUCT_DISCOVERY.md)
- [Technical Design（技术设计）](TECHNICAL_DESIGN.md)
- [UI/UX Design（界面与体验设计）](UI_UX_DESIGN-zh.md)
- [Agent 开发生命周期](agent-zh.md)
- [English README](README.md)
- [English lifecycle diagram](agent.md)

英文源文档及对应中文翻译位于 [docs/ui-ux/](docs/ui-ux/)。可从 [中文设计需求](docs/ui-ux/00-design-requirements-zh.md) 或 [英文设计需求](docs/ui-ux/00-design-requirements.md) 开始。

## 范围与授权
已批准 PRD 始终是产品范围的唯一权威。UI/UX Design 不得增加身份验证、多团队、跨设备同步、提醒、重复/全天事件、主题偏好或其他已排除行为。UI/UX 获批不代表允许编写应用代码；编码必须另行取得用户明确授权。
