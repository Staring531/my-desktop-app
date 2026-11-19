# Agent 开发生命周期

> 本文件仅提供开发流程图概览。具有约束力的仓库级生命周期、阶段顺序、审批门槛和 Agent 行为规则见 [DEVELOPMENT_WORKFLOW-zh.md](DEVELOPMENT_WORKFLOW-zh.md)。所有 Agent 在开始仓库任务前必须阅读该文件。英文权威版本：[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)。

各阶段详细操作见 PRODUCT_DISCOVERY.md、TECHNICAL_DESIGN.md 和 UI_UX_DESIGN-zh.md。

~~~mermaid
flowchart TD
 A["产品发现<br/>Product Interviewer"] --> B["需求基线门槛<br/>Requirements Reviewer"]
 B --> C["PRD 草案门槛<br/>PRD Quality Auditor"]
 C --> D["用户批准 PRD"]
 D --> E["技术设计<br/>Technical Designer"]
 E --> F["架构基线评审<br/>Technical Design Reviewer"]
 F --> G["详细设计评审<br/>Technical Design Reviewer"]
 G --> H["用户批准 Technical Design"]
 H --> I["实施规划<br/>Implementation Planner"]
 I --> J["UI/UX 设计就绪分析<br/>UI/UX Designer"]
 J --> K["信息架构与用户流程"]
 K --> L["页面清单与线框"]
 L --> M["交互与视觉设计"]
 M --> N["UI/UX 设计评审门槛<br/>UI/UX Design Reviewer"]
 N --> O["实施就绪报告"]
 O --> P["用户批准 UI/UX Design"]
 P --> Q["实施计划对齐 / 设计交接"]
 Q --> R{"是否单独授权编码？"}
 R -- "否" --> S["停止：不得编写应用代码"]
 R -- "是" --> T["编码与测试"]
 T --> U["实现验证 / PR 评审"]
~~~

## 治理
- Reviewer 是独立只读角色，只返回 findings；正式文档修改和用户沟通由主 Agent 负责。
- Findings 和阶段完成均不等于用户批准。
- 平台不支持原生 subagent 委派时必须披露，不得将自检称为独立评审。
- 提示词限制不等于工具级安全；平台支持时启用并验证沙箱/只读控制。
- 所有后续阶段保持已批准 PRD 范围。
- UI/UX Design 负责呈现和交互，不得改变业务规则或技术架构。
- 规划和 UI/UX 获批均不授权编码；只有用户单独明确授权后才能 Coding。
- 未经单独授权，不得提交、推送、合并或发布。
