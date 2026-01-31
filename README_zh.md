# Chris Curry's Memos

[English](README.md) | [繁體中文](README_zh-Hant.md) | [日本語](README_ja.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

一个轻量级、可自托管的备忘录中心，用于记录和整理你的想法。

本项目是 [usememos/memos](https://github.com/usememos/memos) 的定制分支，从 [v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0) 版本 fork 而来。

## 版本差异

查看 [CHANGELOG_zh.md](CHANGELOG_zh.md) 了解与原版 Memos 的详细功能和改进。

**亮点功能：**
- 标签管理：支持置顶和 emoji 图标
- 将备忘录导出为精美图片
- 置顶备忘录独立列/抽屉显示
- 代码块折叠/展开
- 改进的日历热力图
- URL 筛选参数持久化
- 更多...

## 功能特点

- **隐私优先** - 自托管部署，数据完全由你掌控
- **Markdown 支持** - 使用熟悉的 Markdown 语法，支持任务列表、代码块等
- **标签整理** - 通过标签组织备忘录，支持置顶重要标签、添加 emoji 图标
- **时间线视图** - 按时间顺序浏览备忘录，配合活动热力图
- **多平台访问** - 通过浏览器在任何设备上访问，响应式移动端设计
- **轻量高效** - 默认使用 SQLite，资源占用极低
- **RESTful API** - 完整的 API 支持，便于集成和自动化
- **SSO 支持** - OAuth2 身份提供商集成
- **Webhook** - 事件通知，支持自动化工作流
- **多语言** - i18n 国际化支持

## 技术栈

| 前端 | 后端 |
|------|------|
| React | Go |
| TypeScript | SQLite / MySQL / PostgreSQL |
| Tailwind CSS | gRPC + REST API |
| Vite | |

## 快速开始

### Docker（推荐）

```bash
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

然后在浏览器中访问 `http://localhost:5230`。

### Docker Compose

```yaml
services:
  memos:
    image: chriscurrycc/memos:latest
    container_name: memos
    restart: unless-stopped
    ports:
      - 5230:5230
    volumes:
      - ~/.memos/:/var/opt/memos
```

### 从源码构建

查看[开发指南](docs/development.md)了解详细步骤。

## 配置

Memos 可以通过环境变量进行配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MEMOS_PORT` | 服务端口 | `5230` |
| `MEMOS_MODE` | 运行模式（`prod`、`dev`、`demo`） | `prod` |
| `MEMOS_DRIVER` | 数据库驱动（`sqlite`、`mysql`、`postgres`） | `sqlite` |
| `MEMOS_DSN` | 数据库连接字符串 | `~/.memos/memos_prod.db` |

使用 MySQL 的示例：

```bash
docker run -d \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  -e MEMOS_DRIVER=mysql \
  -e MEMOS_DSN="user:password@tcp(host:3306)/memos" \
  chriscurrycc/memos:latest
```

## 更新

### 手动更新

```bash
docker pull chriscurrycc/memos:latest
docker stop memos
docker rm memos
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

### 使用 Watchtower 自动更新

自动更新容器到最新版本（例如：每天凌晨 3:00 UTC+8 自动检查更新）：

```bash
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  -e TZ=Asia/Shanghai \
  containrrr/watchtower \
  --schedule "0 0 3 * * *" \
  memos
```

## 从 usememos/memos 迁移

如果你是从原版 [usememos/memos](https://github.com/usememos/memos) 项目迁移：

**兼容性说明：**
- 从 v0.23.0 ~ v0.23.1 迁移：完全兼容
- 从 v0.24.0+ 迁移：如果未使用过置顶备忘录或 Webhook 功能则兼容；否则迁移后需要重新配置这些功能

> **重要提示：** 迁移前请先停止服务并备份数据目录（默认：`~/.memos/`）。

**故障排除（仅限 SQLite）：**

如果从 v0.24.0+ 迁移后遇到 `no such table: tag` 错误，需要手动创建 tag 表：

```bash
docker exec memos sh -c "apk add --no-cache sqlite && curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | sqlite3 /var/opt/memos/memos_prod.db"
```

## 文档

- [开发指南](docs/development.md) - 搭建本地开发环境
- [Windows 开发指南](docs/development-windows.md) - Windows 特定设置
- [API 文档](docs/API.md) - REST API 参考
- [我是如何开发这个项目的](https://github.com/chriscurrycc/memos/issues/8) - 开发博客

## 贡献

欢迎贡献！你可以：

- 通过 [Issues](https://github.com/chriscurrycc/memos/issues) 报告 Bug 或提出功能建议
- 提交 [Pull Requests](https://github.com/chriscurrycc/memos/pulls)

## 致谢

- [usememos/memos](https://github.com/usememos/memos) - 本项目 fork 的原始项目

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有任何问题，欢迎[联系我](mailto:hichriscurry@gmail.com)。
