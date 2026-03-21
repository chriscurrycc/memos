# 迁移指南：从 usememos/memos 迁移到本 Fork

本文档说明上游 [usememos/memos](https://github.com/usememos/memos) 与本 fork 在数据库层面的兼容性差异，以及[迁移修复脚本](../scripts/migration-repair.sh)的具体修复内容。

## 兼容性概览

| 上游版本 | 兼容性 | 所需操作 |
|---|---|---|
| v0.23.0 ~ v0.23.1 | 完全兼容 | 无 |
| v0.24.0 ~ v0.26.2 | 修复后兼容 | 运行迁移修复脚本 |

## 迁移前必读：数据备份

> **警告：迁移前必须备份数据，此步骤不可跳过。**
>
> 如果迁移失败或产生意外结果，备份是恢复数据的唯一途径。没有备份，你的备忘录、附件和设置可能会永久丢失。

**备份步骤：**

1. **停止正在运行的服务** — 切勿在服务运行时进行迁移
2. **复制整个数据目录**（默认：`~/.memos/`）：
   ```bash
   # Docker 用户
   docker stop memos
   cp -r ~/.memos/ ~/.memos-backup-$(date +%Y%m%d)/

   # 二进制部署用户
   # 先停止 memos 进程，然后：
   cp -r ~/.memos/ ~/.memos-backup-$(date +%Y%m%d)/
   ```
3. **MySQL/PostgreSQL 用户**还需导出数据库：
   ```bash
   # MySQL
   mysqldump -u user -p memos > memos-backup-$(date +%Y%m%d).sql

   # PostgreSQL
   pg_dump -U user memos > memos-backup-$(date +%Y%m%d).sql
   ```
4. **验证备份** — 确认备份文件非空且大小合理

确认备份完成后再继续迁移。

---

## 修复脚本的具体内容

修复脚本分为两个阶段执行。以下逐项说明每个改动的原因和修复方式。

### 第一阶段：回退上游的破坏性变更

这些是上游 usememos/memos 做出但本 fork 未采纳的数据库结构变更，脚本会检测并回退它们。

#### 上游 v0.26：`resource` 表被重命名为 `attachment`

- **上游迁移文件**：`0.26/00__rename_resource_to_attachment.sql`
- **上游做了什么**：将 `resource` 表重命名为 `attachment`，重建索引并使用新名称，随后在后续迁移中删除了所有索引。
- **为什么会出问题**：本 fork 使用 `resource` 表处理所有文件附件操作。表被重命名后，所有资源查询都会失败。
- **脚本的修复方式**：检测是否存在 `attachment` 表而不存在 `resource` 表，如果是则重命名回来。重建必要的索引（仅 SQLite——MySQL 和 PostgreSQL 在本 fork 中不使用显式的 resource 索引）。

#### 上游 v0.26：`memo_organizer` 表被删除

- **上游迁移文件**：`0.26/01__drop_memo_organizer.sql`
- **上游做了什么**：在 v0.24 中，上游将备忘录置顶状态从 `memo_organizer` 表迁移到 `memo` 表的新增 `pinned` 列。然后在 v0.26 中彻底删除了 `memo_organizer` 表。
- **为什么会出问题**：本 fork 使用 `memo_organizer` 实现按用户的备忘录置顶功能。没有该表，置顶功能将无法使用。
- **脚本的修复方式**：如果缺失则重建 `memo_organizer` 表。如果该表是刚被创建的（说明之前被上游删除了）且 `memo` 表存在 `pinned` 列（来自上游 v0.24），脚本会将置顶数据恢复到 `memo_organizer` 中。

#### 上游 v0.26：`HOST` 角色被改为 `ADMIN`

- **上游迁移文件**：`0.26/03__alter_user_role.sql` + `0.26/04__migrate_host_to_admin.sql`
- **上游做了什么**：从用户角色系统中移除了 `HOST` 角色，重建用户表并去除了 HOST 约束，将所有 HOST 用户转换为 ADMIN。
- **为什么会出问题**：本 fork 在整个权限系统中使用 `HOST` 作为主管理员角色。没有 HOST 用户，工作空间设置、IDP 配置等管理员操作将无法执行。
- **脚本的修复方式**：检查是否有用户拥有 HOST 角色。如果没有，将 ID 最小的 ADMIN 用户（通常是实例的原始创建者）设为 HOST。

#### 上游 v0.25：`webhook` 表被删除

- **上游迁移文件**：`0.25/00__remove_webhook.sql`
- **上游做了什么**：彻底删除了 `webhook` 表，移除了 Webhook 功能。
- **为什么会出问题**：本 fork 保留了 Webhook 支持。没有该表，Webhook 相关的 API 调用将失败。
- **脚本的修复方式**：如果缺失则重建 `webhook` 表。注意：上游实例中之前配置的 Webhook 数据在上游删除该表时已丢失，需要重新手动配置。

### 第二阶段：创建 Fork 特有的表

这些是本 fork 新增的、上游从未有过的表。由于 fork 的迁移系统在检测到更高版本号已存在于迁移历史中时会跳过创建，因此可能缺失。

#### Fork v0.24：`tag` 表

- **Fork 迁移文件**：`0.24/01__tag.sql`
- **功能说明**：提供标签管理功能，支持 emoji 图标和标签置顶。
- **为什么可能缺失**：Fork 的 0.24 迁移内容与上游的 0.24 不同。如果上游的 0.24 已经执行过，fork 的迁移器会跳过，导致 `tag` 表未被创建。
- **脚本的修复方式**：如果不存在则创建 `tag` 表及其索引。

#### Fork v0.25：备忘录复习相关表

- **Fork 迁移文件**：`0.25/00__review.sql` + `0.25/01__memo_review_session_cache.sql`
- **功能说明**：提供备忘录间隔复习系统，支持会话追踪和缓存。
- **创建的表**：
  - `memo_review_session` — 按用户追踪复习会话
  - `memo_review` — 会话内的单条备忘录复习记录
  - `memo_review_session_cache` — 缓存进行中的复习会话状态
- **为什么可能缺失**：与 tag 表相同的版本号冲突问题。上游的 0.25 迁移（删除 webhook）与 fork 的 0.25（创建复习表）内容完全不同。
- **脚本的修复方式**：如果不存在则创建以上三个表及其索引。

---

## 迁移完成后

运行修复脚本后：

1. **启动服务**并确认没有报错
2. **检查备忘录** — 确认内容完整可见
3. **检查置顶备忘录** — 如果之前有置顶的备忘录，确认仍然处于置顶状态
4. **重新配置 Webhook** — 如果你在上游 v0.25+ 上使用过 Webhook，需要重新设置（上游删除该表时数据已丢失）
5. **验证管理员权限** — 确保管理员用户拥有正确的权限
