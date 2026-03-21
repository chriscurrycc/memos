# Chris Curry's Memos

[English](README.md) | [繁體中文](README_zh-Hant.md) | [日本語](README_ja.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

一个轻量级、可自托管的备忘录中心，用于记录和整理你的想法。

本项目是 [usememos/memos](https://github.com/usememos/memos) 的定制分支，从 [v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0) 版本 fork 而来。

## 版本说明

本项目使用两个独立的版本号：

- **应用版本**（如 `v0.30.0`）— 发布版本，每次新增功能或改进时递增。对应 Docker 标签和 GitHub Releases。
- **数据库版本**（如 `0.25.2`）— 数据库迁移版本，仅在数据库结构变更时递增。定义在 [`store/migration/SCHEMA_VERSION`](store/migration/SCHEMA_VERSION)。

应用版本可能在数据库版本不变的情况下多次递增。例如，多个功能发布可能共享同一个数据库版本（如仅涉及前端或 API 变更）。

> **说明：** 日常使用无需关注数据库版本，仅在从原版 usememos/memos 迁移时需要了解。原版的数据库版本与应用版本绑定——即使数据库没有任何变化，数据库版本号也会随每次 minor 版本发布而递增（如 v0.26 → v0.27）。因此下文兼容性范围中提到的「v0.24.0 ~ v0.26.2」指的是原版的**应用版本**，并非实际的数据库变更版本。

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

### 使用 Watchtower（推荐）

单次更新：

```bash
docker run --rm \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --run-once \
  memos
```

定时自动更新（例如：每天凌晨 3:00 UTC+8 自动检查更新）：

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

### 不使用 Watchtower

```bash
docker pull chriscurrycc/memos:latest
docker stop memos && docker rm memos
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

## 从 usememos/memos 迁移

如果你是从原版 [usememos/memos](https://github.com/usememos/memos) 项目迁移：

**兼容性说明：**
- 从 v0.23.0 ~ v0.23.1 迁移：完全兼容
- 从 v0.24.0 ~ v0.26.2 迁移：运行下方的迁移修复脚本后兼容

关于数据库层面的具体差异和修复脚本的工作原理，请参阅[迁移指南](docs/migration-guide_zh.md)。

> **警告：迁移前必须备份数据，此步骤不可跳过。**
>
> 如果迁移失败或产生意外结果，备份是恢复数据的唯一途径。请先停止服务，然后复制数据目录（默认：`~/.memos/`）。MySQL/PostgreSQL 用户的数据库在外部服务器上，还需额外执行 `mysqldump`/`pg_dump` 来备份数据库。详细备份步骤请参阅[迁移指南](docs/migration-guide_zh.md)。

**迁移修复：**

从上游 v0.24.0 ~ v0.26.2 迁移时，**在启动本 fork 服务之前**运行[迁移修复脚本](scripts/migration-repair.sh)来修复数据库结构差异并创建缺失的表。脚本需要对应数据库的命令行工具（`sqlite3`、`mysql` 或 `psql`）：

```bash
# SQLite（默认路径：~/.memos/memos_prod.db）
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver sqlite --dsn ~/.memos/memos_prod.db

# MySQL
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver mysql --dsn "user:password@tcp(host:3306)/memos"

# PostgreSQL
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver postgres --dsn "postgresql://user:password@host:5432/memos"
```

该脚本是幂等的，可以安全地多次运行。

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
