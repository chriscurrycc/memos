# 更新日志

[English](CHANGELOG.md)

本文档记录了此分支相对于原版 [usememos/memos v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0) 的所有重要更改。

## [v0.28.0](https://github.com/chriscurrycc/memos/releases/tag/v0.28.0) - 2026-02-09

### 新功能
- 新增备忘录回顾功能，支持滑动卡片交互，包含四个模块：按标签筛选回顾、历史上的今天、随机穿越到过去某段时间、惊喜模式随机展示一条备忘录
- 新增迁移修复脚本（`scripts/migration-repair.sh`），支持所有数据库驱动

## [v0.27.2](https://github.com/chriscurrycc/memos/releases/tag/v0.27.2) - 2026-02-04

### 新功能
- 为内联备忘录和评论编辑器启用禅模式
- 改进移动端和桌面端的标签管理体验

### 优化
- 改进禅模式在移动端的虚拟键盘处理体验
- 移动端默认显示备忘录操作按钮
- 创建自定义 Tooltip 组件以优化移动端体验

### 修复
- 修复禅模式按钮与文本重叠问题
- 修复获取备忘录时置顶状态同步问题
- 修复更新时保留 displayTime 以防止备忘录重排序
- 修复已删除备忘录未从置顶列表移除的问题
- 修复移动端置顶抽屉中操作菜单层级问题
- 更新编辑器中内容语法文档链接
- 启用移动端置顶抽屉中的表情选择器和展开按钮
- 改进移动端提示框和对话框性能

## [v0.27.1](https://github.com/chriscurrycc/memos/releases/tag/v0.27.1) - 2026-02-02

### 优化
- 新增多架构 Docker 镜像构建支持（linux/amd64、linux/arm64）

## [v0.27.0](https://github.com/chriscurrycc/memos/releases/tag/v0.27.0) - 2026-02-02

### 新功能
- 新增禅模式，提供沉浸式备忘录编辑体验
- 新增可调整分割面板，支持时间线/置顶布局宽度调整
- 新增日历月份选择器抽屉，支持快速导航
- 在备忘录编辑器工具栏中启用 Markdown 菜单

### 优化
- 改进备忘录内容折叠功能，支持外部控制和更好的用户体验
- 简化折叠逻辑，使用 localStorage 持久化状态
- 移动端日历侧边栏选择日期后自动关闭抽屉
- 为可调整分割面板添加圆角样式
- 使用语义化命名和主题色改进分割面板代码

## [v0.26.5](https://github.com/chriscurrycc/memos/releases/tag/v0.26.5) - 2026-01-29

### 移除
- 移除了原始数据查看功能

## [v0.26.4](https://github.com/chriscurrycc/memos/releases/tag/v0.26.4) - 2026-01-29

### 新功能
- 移动端和平板设备新增置顶备忘录抽屉

### 优化
- 简化日历热力图为 3 级，改进今日指示器
- 优化首页性能，添加骨架屏加载状态
- 使用自定义颜色替代透明度热力图

### 修复
- 已完成任务项中的链接也应用删除线样式

## [v0.26.3](https://github.com/chriscurrycc/memos/releases/tag/v0.26.3) - 2026-01-18

### 优化
- 优化备忘录内容组件样式，提升可读性

## [v0.26.2](https://github.com/chriscurrycc/memos/releases/tag/v0.26.2) - 2026-01-17

### 优化
- 优化引用块样式，提升可读性

### 修复
- 修复下月按钮禁用状态样式

## [v0.26.1](https://github.com/chriscurrycc/memos/releases/tag/v0.26.1) - 2026-01-15

### 优化
- 调整活动日历热力图颜色
- 禁止导航到未来月份

### 修复
- 修复编辑后置顶备忘录不实时更新的问题
- 修复鼠标设备上表情选择器点击无效的问题
- 修复天数计算改为从最早备忘录开始，而非用户创建时间

## [v0.26.0](https://github.com/chriscurrycc/memos/releases/tag/v0.26.0) - 2026-01-14

### 新功能
- 代码块支持折叠/展开
- 紧凑型编辑器 UI，优化间距和布局

## [v0.25.2](https://github.com/chriscurrycc/memos/releases/tag/v0.25.2) - 2025-12-30

### 修复
- 修复多选框状态异常问题

## [v0.25.1](https://github.com/chriscurrycc/memos/releases/tag/v0.25.1) - 2025-12-29

### 新功能
- 新增原始数据管理功能（后在 v0.26.5 中移除）

## [v0.24.2](https://github.com/chriscurrycc/memos/releases/tag/v0.24.2) - 2025-07-02

### 新功能
- **标签管理**
  - 置顶/取消置顶标签，让重要标签始终显示在顶部
  - 为标签添加 emoji 图标，便于视觉区分
  - 完整的标签 CRUD 操作，使用独立数据库表存储

- **置顶备忘录栏** - 在桌面端以独立列显示置顶备忘录

- **导出为图片**
  - 将备忘录导出为精美图片，支持自定义模板
  - 多种导出模板，包括 X.com 风格

- **导航与筛选**
  - 筛选条件持久化到 URL 参数
  - UI 状态与 URL 参数双向同步
  - 回到顶部按钮

- **图片浏览** - 使用 react-photo-view 增强图片预览

- **编辑器增强**
  - 支持浏览器原生撤销/重做
  - 优化 Markdown 超链接快捷操作

### 优化
- 优化图片查看体验
- 优化 Markdown 渲染
- 更新标签样式
- 更新备忘录卡片基础样式
- 调整换行高度

### 修复
- 修复标签删除功能失效问题
- 修复从备忘录详情页点击标签跳转失效的问题
- 修复代码块语法高亮颜色问题
- 修复图片样式问题
