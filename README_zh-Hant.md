# Chris Curry's Memos

[English](README.md) | [简体中文](README_zh.md) | [日本語](README_ja.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

一個輕量級、可自託管的備忘錄中心，用於記錄和整理你的想法。

本專案是 [usememos/memos](https://github.com/usememos/memos) 的定製分支，從 [v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0) 版本 fork 而來。

**相容性說明：**
- 從 usememos/memos v0.23.0 ~ v0.23.1 遷移：完全相容
- 從 usememos/memos v0.24.0+ 遷移：如果未使用過置頂備忘錄或 Webhook 功能則相容；否則遷移後需要重新配置這些功能。遷移前請先停止服務並備份資料目錄（預設：`~/.memos/`）。

**遷移故障排除：**

如果從 usememos/memos v0.24.0+ 遷移後遇到 `no such table: tag` 錯誤，需要手動建立 tag 表：

```bash
# Docker 使用者
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | docker exec -i memos sqlite3 /var/opt/memos/memos_prod.db

# 非 Docker 使用者
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | sqlite3 ~/.memos/memos_prod.db
```

## 版本差異

查看 [CHANGELOG.md](CHANGELOG.md) 了解與原版 Memos 的詳細功能和改進。

**亮點功能：**
- 標籤管理：支援置頂和 emoji 圖示
- 將備忘錄匯出為精美圖片
- 置頂備忘錄獨立列/抽屜顯示
- 程式碼區塊摺疊/展開
- 改進的日曆熱力圖
- URL 篩選參數持久化
- 更多...

## 功能特點

- **隱私優先** - 自託管部署，資料完全由你掌控
- **Markdown 支援** - 使用熟悉的 Markdown 語法，支援任務列表、程式碼區塊等
- **標籤整理** - 透過標籤組織備忘錄，支援置頂重要標籤、新增 emoji 圖示
- **時間線檢視** - 按時間順序瀏覽備忘錄，配合活動熱力圖
- **多平台存取** - 透過瀏覽器在任何裝置上存取，響應式行動端設計
- **輕量高效** - 預設使用 SQLite，資源佔用極低
- **RESTful API** - 完整的 API 支援，便於整合和自動化
- **SSO 支援** - OAuth2 身分提供商整合
- **Webhook** - 事件通知，支援自動化工作流
- **多語言** - i18n 國際化支援

## 技術棧

| 前端 | 後端 |
|------|------|
| React | Go |
| TypeScript | SQLite / MySQL / PostgreSQL |
| Tailwind CSS | gRPC + REST API |
| Vite | |

## 快速開始

### Docker（推薦）

```bash
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

然後在瀏覽器中存取 `http://localhost:5230`。

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

### 從原始碼建構

查看[開發指南](docs/development.md)了解詳細步驟。

## 配置

Memos 可以透過環境變數進行配置：

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `MEMOS_PORT` | 服務連接埠 | `5230` |
| `MEMOS_MODE` | 執行模式（`prod`、`dev`、`demo`） | `prod` |
| `MEMOS_DRIVER` | 資料庫驅動（`sqlite`、`mysql`、`postgres`） | `sqlite` |
| `MEMOS_DSN` | 資料庫連線字串 | `~/.memos/memos_prod.db` |

使用 MySQL 的範例：

```bash
docker run -d \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  -e MEMOS_DRIVER=mysql \
  -e MEMOS_DSN="user:password@tcp(host:3306)/memos" \
  chriscurrycc/memos:latest
```

## 使用 Watchtower 自動更新

自動更新容器到最新版本（例如：每天凌晨 3:00 UTC+8 自動檢查更新）：

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

## 文件

- [開發指南](docs/development.md) - 建立本地開發環境
- [Windows 開發指南](docs/development-windows.md) - Windows 特定設定
- [API 文件](docs/API.md) - REST API 參考
- [我是如何開發這個專案的](https://github.com/chriscurrycc/memos/issues/8) - 開發部落格

## 貢獻

歡迎貢獻！你可以：

- 透過 [Issues](https://github.com/chriscurrycc/memos/issues) 回報 Bug 或提出功能建議
- 提交 [Pull Requests](https://github.com/chriscurrycc/memos/pulls)

## 致謝

- [usememos/memos](https://github.com/usememos/memos) - 本專案 fork 的原始專案

## 授權條款

本專案基於 MIT 授權條款開源 - 查看 [LICENSE](LICENSE) 檔案了解詳情。

## 聯絡方式

如有任何問題，歡迎[聯絡我](mailto:hichriscurry@gmail.com)。
