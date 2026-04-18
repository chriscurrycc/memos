# Chris Curry's Memos

[English](README.md) | [简体中文](README_zh.md) | [繁體中文](README_zh-Hant.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

軽量でセルフホスト可能なメモハブ。あなたの考えを記録・整理するためのツールです。

このプロジェクトは [usememos/memos](https://github.com/usememos/memos) のカスタマイズ版フォークで、[v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0) からフォークされています。

## デモ

インストール不要でそのまま試せます：**[memo-demo.chriscurry.cc](https://memo-demo.chriscurry.cc)**

| ユーザー名 | パスワード |
|------------|------------|
| `chriscurry` | `memos` |

> 共有デモインスタンスです。機密情報は保存しないでください。データは定期的にリセットされる場合があります。

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
- **多言語対応** - i18n 国際化サポート

## クイックスタート

### Docker Compose（推奨）

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

```bash
docker compose up -d
```

ブラウザで `http://localhost:5230` にアクセスしてください。

### Docker

```bash
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
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

### Docker イメージタグ

| タグ | 説明 | 対象ユーザー |
|------|------|--------------|
| `latest` | すべてのリリースで更新（betaを含む） | 最新機能をいち早く試したいユーザー |
| `stable` | 安定版リリースのみ更新 | 安定性を重視するユーザー |
| `vX.Y.Z` | 特定バージョンに固定 | バージョンを完全にコントロールしたいユーザー |

### Watchtower で自動更新（推奨）

[Watchtower](https://containrrr.dev/watchtower/) を使って自動更新を設定します。お好みに応じてイメージタグを選択してください：

```yaml
# docker-compose.yml
services:
  memos:
    image: chriscurrycc/memos:latest  # または :stable で安定版のみ更新
    container_name: memos
    restart: unless-stopped
    ports:
      - 5230:5230
    volumes:
      - ~/.memos/:/var/opt/memos

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
    command: --schedule "0 0 3 * * *" memos  # 毎日午前3時に更新確認
```

または単発更新：

```bash
docker run --rm \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --run-once \
  memos
```

### 手動更新

```bash
docker pull chriscurrycc/memos:latest  # または :stable
docker stop memos && docker rm memos
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

## usememos/memos からの移行

オリジナルの [usememos/memos](https://github.com/usememos/memos) プロジェクトから移行する場合：

**互換性について：**
- v0.23.0 ~ v0.23.1 からの移行：完全互換
- v0.24.0 ~ v0.26.2 からの移行：下記の移行修復スクリプトを実行後に互換

データベースレベルの具体的な違いと修復スクリプトの動作内容については、[移行ガイド](docs/migration-guide_ja.md)を参照してください。

> **警告：移行前に必ずデータをバックアップしてください。この手順は省略できません。**
>
> 移行が失敗した場合や予期しない結果が生じた場合、バックアップがデータを復旧する唯一の方法です。まずサービスを停止し、データディレクトリをコピーしてください（デフォルト：`~/.memos/`）。MySQL/PostgreSQL ユーザーはデータベースが外部サーバー上にあるため、別途 `mysqldump`/`pg_dump` でデータベースのバックアップも必要です。詳しいバックアップ手順は[移行ガイド](docs/migration-guide_ja.md)を参照してください。

**移行修復：**

上流 v0.24.0 ~ v0.26.2 から移行する場合、**本 fork のサービスを起動する前に**[移行修復スクリプト](scripts/migration-repair.sh)を実行してデータベーススキーマの差異を修正し、不足テーブルを作成してください。スクリプトにはデータベースに応じた CLI ツール（`sqlite3`、`mysql`、または `psql`）が必要です：

```bash
# SQLite（デフォルトパス：~/.memos/memos_prod.db）
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver sqlite --dsn ~/.memos/memos_prod.db

# MySQL
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver mysql --dsn "user:password@tcp(host:3306)/memos"

# PostgreSQL
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver postgres --dsn "postgresql://user:password@host:5432/memos"
```

このスクリプトは冪等性があり、複数回安全に実行できます。

## バージョニング

本プロジェクトでは2つの独立したバージョン番号を使用しています：

- **アプリケーションバージョン**（例：`v0.30.0`）— リリースバージョン。新機能や改善が追加されるたびにインクリメントされます。Docker タグや GitHub Releases に対応します。
- **データベーススキーマバージョン**（例：`0.25.2`）— データベースマイグレーションバージョン。データベース構造が変更された場合のみインクリメントされます。[`store/migration/SCHEMA_VERSION`](store/migration/SCHEMA_VERSION) で定義されています。

アプリケーションバージョンはデータベーススキーマの変更なしに複数回インクリメントされることがあります。例えば、フロントエンドや API の変更のみを含む複数の機能リリースが同じスキーマバージョンを共有することがあります。

> **補足：** 日常の使用ではデータベースバージョンを気にする必要はありません。オリジナルの usememos/memos から移行する場合にのみ関係します。オリジナルではデータベースバージョンがアプリケーションバージョンに連動しており、データベースに変更がなくても minor リリースごとにバージョン番号が上がります（例：v0.26 → v0.27）。そのため、下記の互換性範囲「v0.24.0 ~ v0.26.2」はオリジナルの**アプリケーションバージョン**を指しており、実際のデータベース変更バージョンではありません。

## エコシステム

### MCP サーバー

[MCP サーバー](https://github.com/chriscurrycc/memos-mcp) を使用して、AI アシスタント（Claude Code、Claude Desktop、Cursor など）を Memos インスタンスに接続できます：

```bash
npx @chriscurrycc/memos-mcp
```

17 のツールでメモの CRUD・検索、タグ、リソース、リレーション、レビューに対応。さらに 6 つのワークフロープロンプト（ダイジェスト、レビュー、リレーショングラフなど）を搭載。設定方法は [memos-mcp](https://github.com/chriscurrycc/memos-mcp) リポジトリをご覧ください。

### Pixmo

[Pixmo](https://pixmo.cc) は Memos サーバーに接続できるフォトウォール — メモを閲覧可能な画像ギャラリーに変換します。マソンリーレイアウト、タイムラインナビゲーション、EXIF 情報表示、タグクラウドに対応。

- デモ：[ccmemos.pixmo.cc](https://ccmemos.pixmo.cc)（本 fork に接続）
- 本 fork とオリジナル Memos v0.26.x+ の両方に対応

## ドキュメント

- [開発ガイド](docs/development.md) - ローカル開発環境のセットアップ
- [Windows 開発ガイド](docs/development-windows.md) - Windows 固有の設定
- [API ドキュメント](docs/API.md) - REST API リファレンス
- [このプロジェクトの開発について](https://github.com/chriscurrycc/memos/issues/8) - 開発ブログ
