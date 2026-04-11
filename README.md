# Chris Curry's Memos

[简体中文](README_zh.md) | [繁體中文](README_zh-Hant.md) | [日本語](README_ja.md)

![Chris Curry's Memos](https://webp.chriscurry.cc/864shots_so.png)

A lightweight, self-hosted memo hub for capturing and organizing your thoughts.

This is a customized fork of [usememos/memos](https://github.com/usememos/memos), forked from [v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0).

## Versioning

This project uses two independent version numbers:

- **Application version** (e.g., `v0.30.0`) — the release version, incremented when new features or improvements are added. This is what you see in Docker tags and GitHub releases.
- **Database schema version** (e.g., `0.25.2`) — the database migration version, only incremented when the database structure changes. Defined in [`store/migration/SCHEMA_VERSION`](store/migration/SCHEMA_VERSION).

The application version may increase without any database schema change. For example, multiple feature releases can share the same schema version if they only involve frontend or API changes.

> **Note:** You don't need to worry about the database schema version in daily use. It only matters when migrating from the original usememos/memos. The original project ties its database version to the application version — even if the database hasn't changed, the version number still increases with each minor release (e.g., v0.26 → v0.27). So the compatibility range "v0.24.0 ~ v0.26.2" below refers to the original project's **application version**, not actual database changes.

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

### Docker Image Tags

| Tag | Description | Who should use |
|-----|-------------|----------------|
| `latest` | Updated on **every** release (including beta) | Early adopters who want the newest features |
| `stable` | Updated only on **stable** releases | Users who prefer reliability over new features |
| `vX.Y.Z` | Pinned to a specific version | Users who want full control over updates |

### With Watchtower (Recommended)

Use [Watchtower](https://containrrr.dev/watchtower/) for automatic updates. Choose the image tag based on your preference:

```yaml
# docker-compose.yml
services:
  memos:
    image: chriscurrycc/memos:latest  # or :stable for stable-only updates
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
    command: --schedule "0 0 3 * * *" memos  # Check daily at 3:00 AM
```

Or run a one-time update:

```bash
docker run --rm \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --run-once \
  memos
```

### Without Watchtower

```bash
docker pull chriscurrycc/memos:latest  # or :stable
docker stop memos && docker rm memos
docker run -d \
  --init \
  --name memos \
  --restart unless-stopped \
  --publish 5230:5230 \
  --volume ~/.memos/:/var/opt/memos \
  chriscurrycc/memos:latest
```

## Migration from usememos/memos

If you are migrating from the original [usememos/memos](https://github.com/usememos/memos) project:

**Compatibility:**
- From v0.23.0 ~ v0.23.1: Fully compatible
- From v0.24.0 ~ v0.26.2: Compatible after running the migration repair script below

For detailed information about what changed at the database level and what the repair script does, see the [Migration Guide](docs/migration-guide.md).

> **WARNING: Back up your data BEFORE migrating. This step is NOT optional.**
>
> If the migration fails or produces unexpected results, having a backup is the ONLY way to recover your data. Stop the service first, then copy your data directory (default: `~/.memos/`). For MySQL/PostgreSQL users, your database is on an external server, so you also need to run `mysqldump`/`pg_dump`. See the [Migration Guide](docs/migration-guide.md) for detailed backup instructions.

**Migration Repair:**

If migrating from upstream v0.24.0 ~ v0.26.2, run the [migration repair script](scripts/migration-repair.sh) **before starting this fork's service**, to fix database schema differences and create missing tables. The script requires `sqlite3`, `mysql`, or `psql` CLI tools depending on your database driver:

```bash
# SQLite (default path: ~/.memos/memos_prod.db)
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver sqlite --dsn ~/.memos/memos_prod.db

# MySQL
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver mysql --dsn "user:password@tcp(host:3306)/memos"

# PostgreSQL
curl -sL https://raw.githubusercontent.com/chriscurrycc/memos/main/scripts/migration-repair.sh | bash -s -- --driver postgres --dsn "postgresql://user:password@host:5432/memos"
```

The script is idempotent and safe to run multiple times.

## MCP Server

Use the [MCP server](https://github.com/chriscurrycc/memos-mcp) to connect AI assistants (Claude Code, Claude Desktop, Cursor, etc.) to your Memos instance:

```bash
npx @chriscurrycc/memos-mcp
```

17 tools for memo CRUD & search, tags, resources, relations, and review — plus 6 workflow prompts (digest, review, relation graph, etc.). See the [memos-mcp](https://github.com/chriscurrycc/memos-mcp) repo for setup instructions.

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
