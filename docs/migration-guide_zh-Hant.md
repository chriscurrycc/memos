# 遷移指南：從 usememos/memos 遷移到本 Fork

本文件說明上游 [usememos/memos](https://github.com/usememos/memos) 與本 fork 在資料庫層面的相容性差異，以及[遷移修復腳本](../scripts/migration-repair.sh)的具體修復內容。

## 相容性概覽

| 上游版本 | 相容性 | 所需操作 |
|---|---|---|
| v0.23.0 ~ v0.23.1 | 完全相容 | 無 |
| v0.24.0 ~ v0.26.2 | 修復後相容 | 執行遷移修復腳本 |

## 遷移前必讀：資料備份

> **警告：遷移前必須備份資料，此步驟不可跳過。**
>
> 如果遷移失敗或產生意外結果，備份是恢復資料的唯一途徑。沒有備份，你的備忘錄、附件和設定可能會永久遺失。

**備份步驟：**

1. **停止正在執行的服務** — 切勿在服務執行時進行遷移
2. **複製整個資料目錄**（預設：`~/.memos/`）：
   ```bash
   # Docker 使用者
   docker stop memos
   cp -r ~/.memos/ ~/.memos-backup-$(date +%Y%m%d)/

   # 二進位部署使用者
   # 先停止 memos 程序，然後：
   cp -r ~/.memos/ ~/.memos-backup-$(date +%Y%m%d)/
   ```
3. **MySQL/PostgreSQL 使用者**還需匯出資料庫：
   ```bash
   # MySQL
   mysqldump -u user -p memos > memos-backup-$(date +%Y%m%d).sql

   # PostgreSQL
   pg_dump -U user memos > memos-backup-$(date +%Y%m%d).sql
   ```
4. **驗證備份** — 確認備份檔案非空且大小合理

確認備份完成後再繼續遷移。

---

## 修復腳本的具體內容

修復腳本分為兩個階段執行。以下逐項說明每個改動的原因和修復方式。

### 第一階段：回退上游的破壞性變更

這些是上游 usememos/memos 做出但本 fork 未採納的資料庫結構變更，腳本會偵測並回退它們。

#### 上游 v0.26：`resource` 表被重新命名為 `attachment`

- **上游遷移檔案**：`0.26/00__rename_resource_to_attachment.sql`
- **上游做了什麼**：將 `resource` 表重新命名為 `attachment`，重建索引並使用新名稱，隨後在後續遷移中刪除了所有索引。
- **為什麼會出問題**：本 fork 使用 `resource` 表處理所有檔案附件操作。表被重新命名後，所有資源查詢都會失敗。
- **腳本的修復方式**：偵測是否存在 `attachment` 表而不存在 `resource` 表，如果是則重新命名回來。重建必要的索引（僅 SQLite——MySQL 和 PostgreSQL 在本 fork 中不使用顯式的 resource 索引）。

#### 上游 v0.26：`memo_organizer` 表被刪除

- **上游遷移檔案**：`0.26/01__drop_memo_organizer.sql`
- **上游做了什麼**：在 v0.24 中，上游將備忘錄置頂狀態從 `memo_organizer` 表遷移到 `memo` 表的新增 `pinned` 欄位。然後在 v0.26 中徹底刪除了 `memo_organizer` 表。
- **為什麼會出問題**：本 fork 使用 `memo_organizer` 實現按使用者的備忘錄置頂功能。沒有該表，置頂功能將無法使用。
- **腳本的修復方式**：如果缺失則重建 `memo_organizer` 表。如果該表是剛被建立的（說明之前被上游刪除了）且 `memo` 表存在 `pinned` 欄位（來自上游 v0.24），腳本會將置頂資料恢復到 `memo_organizer` 中。

#### 上游 v0.26：`HOST` 角色被改為 `ADMIN`

- **上游遷移檔案**：`0.26/03__alter_user_role.sql` + `0.26/04__migrate_host_to_admin.sql`
- **上游做了什麼**：從使用者角色系統中移除了 `HOST` 角色，重建使用者表並去除了 HOST 約束，將所有 HOST 使用者轉換為 ADMIN。
- **為什麼會出問題**：本 fork 在整個權限系統中使用 `HOST` 作為主管理員角色。沒有 HOST 使用者，工作空間設定、IDP 配置等管理員操作將無法執行。
- **腳本的修復方式**：檢查是否有使用者擁有 HOST 角色。如果沒有，將 ID 最小的 ADMIN 使用者（通常是實例的原始建立者）設為 HOST。

#### 上游 v0.25：`webhook` 表被刪除

- **上游遷移檔案**：`0.25/00__remove_webhook.sql`
- **上游做了什麼**：徹底刪除了 `webhook` 表，移除了 Webhook 功能。
- **為什麼會出問題**：本 fork 保留了 Webhook 支援。沒有該表，Webhook 相關的 API 呼叫將失敗。
- **腳本的修復方式**：如果缺失則重建 `webhook` 表。注意：上游實例中之前配置的 Webhook 資料在上游刪除該表時已遺失，需要重新手動配置。

### 第二階段：建立 Fork 特有的表

這些是本 fork 新增的、上游從未有過的表。由於 fork 的遷移系統在偵測到更高版本號已存在於遷移歷史中時會跳過建立，因此可能缺失。

#### Fork v0.24：`tag` 表

- **Fork 遷移檔案**：`0.24/01__tag.sql`
- **功能說明**：提供標籤管理功能，支援 emoji 圖示和標籤置頂。
- **為什麼可能缺失**：Fork 的 0.24 遷移內容與上游的 0.24 不同。如果上游的 0.24 已經執行過，fork 的遷移器會跳過，導致 `tag` 表未被建立。
- **腳本的修復方式**：如果不存在則建立 `tag` 表及其索引。

#### Fork v0.25：備忘錄複習相關表

- **Fork 遷移檔案**：`0.25/00__review.sql` + `0.25/01__memo_review_session_cache.sql`
- **功能說明**：提供備忘錄間隔複習系統，支援工作階段追蹤和快取。
- **建立的表**：
  - `memo_review_session` — 按使用者追蹤複習工作階段
  - `memo_review` — 工作階段內的單條備忘錄複習記錄
  - `memo_review_session_cache` — 快取進行中的複習工作階段狀態
- **為什麼可能缺失**：與 tag 表相同的版本號衝突問題。上游的 0.25 遷移（刪除 webhook）與 fork 的 0.25（建立複習表）內容完全不同。
- **腳本的修復方式**：如果不存在則建立以上三個表及其索引。

---

## 遷移完成後

執行修復腳本後：

1. **啟動服務**並確認沒有報錯
2. **檢查備忘錄** — 確認內容完整可見
3. **檢查置頂備忘錄** — 如果之前有置頂的備忘錄，確認仍然處於置頂狀態
4. **重新配置 Webhook** — 如果你在上游 v0.25+ 上使用過 Webhook，需要重新設定（上游刪除該表時資料已遺失）
5. **驗證管理員權限** — 確保管理員使用者擁有正確的權限
