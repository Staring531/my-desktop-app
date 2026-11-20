# 我的桌面应用

一个跨平台桌面应用项目，仓库还包含公共网站、管理控制台和后端 API 的基础结构。

## 项目状态
Version 1 PRD、Technical Design、Implementation Plan 和 UI/UX 设计包均已接受。用户于 2026-11-20 授权应用实现，目前正在实施。当前 main 提交已通过 Typecheck、Lint、Vitest 和 electron-vite 构建。真实 Electron 运行验证、安装包测试、最终独立 UI 复审和运行时截图对比仍未完成。部署尚未获授权。

## 开发生命周期
- Agent 必须遵循的主流程：[DEVELOPMENT_WORKFLOW-zh.md](DEVELOPMENT_WORKFLOW-zh.md)
- 开发流程图：[agent-zh.md](agent-zh.md)
- English workflow：[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)

1. Product Discovery（产品发现）——形成并由用户批准 PRD。
2. Technical Design（技术设计）——形成并由用户批准技术架构和技术契约。
3. Implementation Planning（实施规划）——拆解实施任务；规划不等于编码授权。
4. UI/UX Design（界面与体验设计）——设计包已接受并完成交接。
5. Implementation Readiness（实施就绪）——IMP-022 计划差额和明确编码授权已有记录。
6. Coding & Testing（编码与测试）——实现进行中；桌面运行和视觉验证仍待完成。
7. Implementation Review & Delivery（实施评审与交付）——整理验收证据并完成必要复审；部署/发布需要单独授权。

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
