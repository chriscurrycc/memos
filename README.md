# Chris Curry's Memos

[简体中文](README_zh.md) | [繁體中文](README_zh-Hant.md) | [日本語](README_ja.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

A lightweight, self-hosted memo hub for capturing and organizing your thoughts.

This is a customized fork of [usememos/memos](https://github.com/usememos/memos), forked from [v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0).

**Compatibility:**
- Migrating from usememos/memos v0.23.0 ~ v0.23.1: Fully compatible
- Migrating from usememos/memos v0.24.0+: Compatible if you haven't used pinned memos or webhooks; otherwise these features need to be reconfigured after migration. Please stop the service and backup your data directory before migrating (default: `~/.memos/`).

**Migration Troubleshooting:**

If you encounter `no such table: tag` error after migrating from usememos/memos v0.24.0+, manually create the tag table:

```bash
# Docker users
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | docker exec -i memos sqlite3 /var/opt/memos/memos_prod.db

# Non-Docker users
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/store/migration/sqlite/prod/0.24/01__tag.sql | sqlite3 ~/.memos/memos_prod.db
```

## What's Different

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of features and improvements compared to the original Memos.

**Highlights:**
- Tag management with pinning and emoji support
- Export memos as beautiful images
- Pinned memos displayed in separate column/drawer
- Code block collapse/expand
- Improved calendar heatmap
- URL-based filter persistence
- And more...

## Features

- **Privacy First** - Self-hosted, your data stays with you
- **Markdown Support** - Write with familiar markdown syntax, including task lists, code blocks, and more
- **Tag Organization** - Organize memos with tags, pin important tags, add emoji icons
- **Timeline View** - Browse your memos chronologically with activity heatmap
- **Multi-platform** - Access from any device via web browser, responsive design for mobile
- **Lightweight** - Minimal resource usage with SQLite as default database
- **RESTful API** - Full API support for integration and automation
- **SSO Support** - OAuth2 identity provider integration
- **Webhook** - Event notifications for automation workflows
- **Multi-language** - i18n support for multiple languages

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React | Go |
| TypeScript | SQLite / MySQL / PostgreSQL |
| Tailwind CSS | gRPC + REST API |
| Vite | |

## Quick Start

### Docker (Recommended)

```bash
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

Then visit `http://localhost:5230` in your browser.

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

### Build from Source

See [Development Guide](docs/development.md) for detailed instructions.

## Configuration

Memos can be configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MEMOS_PORT` | Server port | `5230` |
| `MEMOS_MODE` | Running mode (`prod`, `dev`, `demo`) | `prod` |
| `MEMOS_DRIVER` | Database driver (`sqlite`, `mysql`, `postgres`) | `sqlite` |
| `MEMOS_DSN` | Database connection string | `~/.memos/memos_prod.db` |

Example with MySQL:

```bash
docker run -d \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  -e MEMOS_DRIVER=mysql \
  -e MEMOS_DSN="user:password@tcp(host:3306)/memos" \
  chriscurrycc/memos:latest
```

## Update

### Manual Update

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

### Auto Update with Watchtower

Automatically update the container when a new version is available (e.g., at 3:00 AM UTC+8 daily):

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

## Documentation

- [Development Guide](docs/development.md) - Set up local development environment
- [Development on Windows](docs/development-windows.md) - Windows-specific setup
- [API Documentation](docs/API.md) - REST API reference
- [How I develop this project](https://github.com/chriscurrycc/memos/issues/8) - Development blog

## Contributing

Contributions are welcome! Feel free to:

- Report bugs or request features via [Issues](https://github.com/chriscurrycc/memos/issues)
- Submit [Pull Requests](https://github.com/chriscurrycc/memos/pulls)

## Acknowledgements

- [usememos/memos](https://github.com/usememos/memos) - The original project this fork is based on

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, feel free to [contact me](mailto:hichriscurry@gmail.com).
