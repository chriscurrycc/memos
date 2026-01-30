# Chris Curry's Memos

[English](README.md) | [简体中文](README_zh.md) | [繁體中文](README_zh-Hant.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

軽量でセルフホスト可能なメモハブ。あなたの考えを記録・整理するためのツールです。

このプロジェクトは [usememos/memos](https://github.com/usememos/memos) のカスタマイズ版フォークで、[v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0) からフォークされています。

**互換性について：**
- usememos/memos v0.23.0 ~ v0.23.1 からの移行：完全互換
- usememos/memos v0.24.0+ からの移行：ピン留めメモや Webhook 機能を使用していない場合は互換性あり。使用していた場合は、移行後に再設定が必要です。移行前にサービスを停止し、データディレクトリをバックアップしてください（デフォルト：`~/.memos/`）。

**移行トラブルシューティング：**

usememos/memos v0.24.0+ から移行後に `no such table: tag` エラーが発生した場合は、手動で tag テーブルを作成してください：

```bash
# Docker ユーザー
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | docker exec -i memos sqlite3 /var/opt/memos/memos_prod.db

# 非 Docker ユーザー
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | sqlite3 ~/.memos/memos_prod.db
```

## 変更点

オリジナル Memos との詳細な機能と改善点は [CHANGELOG.md](CHANGELOG.md) をご覧ください。

**主な機能：**
- タグ管理：ピン留めと絵文字アイコンのサポート
- メモを美しい画像としてエクスポート
- ピン留めメモを別カラム/ドロワーに表示
- コードブロックの折りたたみ/展開
- 改善されたカレンダーヒートマップ
- URL フィルターパラメータの永続化
- その他多数...

## 特徴

- **プライバシー重視** - セルフホストで、データは完全にあなたの管理下に
- **Markdown 対応** - タスクリスト、コードブロックなど、使い慣れた Markdown 記法で記述
- **タグ整理** - タグでメモを整理、重要なタグをピン留め、絵文字アイコンを追加
- **タイムライン表示** - アクティビティヒートマップ付きで時系列にメモを閲覧
- **マルチプラットフォーム** - ブラウザからどのデバイスでもアクセス可能、モバイル対応レスポンシブデザイン
- **軽量** - SQLite をデフォルトで使用し、リソース消費を最小限に
- **RESTful API** - 統合と自動化のための完全な API サポート
- **SSO サポート** - OAuth2 ID プロバイダー統合
- **Webhook** - 自動化ワークフローのためのイベント通知
- **多言語対応** - i18n 国際化サポート

## 技術スタック

| フロントエンド | バックエンド |
|----------------|--------------|
| React | Go |
| TypeScript | SQLite / MySQL / PostgreSQL |
| Tailwind CSS | gRPC + REST API |
| Vite | |

## クイックスタート

### Docker（推奨）

```bash
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

ブラウザで `http://localhost:5230` にアクセスしてください。

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

### ソースからビルド

詳細な手順は[開発ガイド](docs/development.md)をご覧ください。

## 設定

Memos は環境変数で設定できます：

| 変数 | 説明 | デフォルト |
|------|------|------------|
| `MEMOS_PORT` | サーバーポート | `5230` |
| `MEMOS_MODE` | 実行モード（`prod`、`dev`、`demo`） | `prod` |
| `MEMOS_DRIVER` | データベースドライバー（`sqlite`、`mysql`、`postgres`） | `sqlite` |
| `MEMOS_DSN` | データベース接続文字列 | `~/.memos/memos_prod.db` |

MySQL を使用する例：

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

### 手動更新

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

### Watchtower で自動更新

新しいバージョンがリリースされた際に自動更新（例：毎日 UTC+8 の午前3時に確認）：

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

## ドキュメント

- [開発ガイド](docs/development.md) - ローカル開発環境のセットアップ
- [Windows 開発ガイド](docs/development-windows.md) - Windows 固有の設定
- [API ドキュメント](docs/API.md) - REST API リファレンス
- [このプロジェクトの開発について](https://github.com/chriscurrycc/memos/issues/8) - 開発ブログ

## コントリビューション

コントリビューションを歓迎します！

- [Issues](https://github.com/chriscurrycc/memos/issues) でバグ報告や機能リクエスト
- [Pull Requests](https://github.com/chriscurrycc/memos/pulls) の送信

## 謝辞

- [usememos/memos](https://github.com/usememos/memos) - このフォークの元となったオリジナルプロジェクト

## ライセンス

このプロジェクトは MIT ライセンスの下でオープンソースです - 詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## お問い合わせ

ご質問がありましたら、お気軽に[ご連絡ください](mailto:hichriscurry@gmail.com)。
