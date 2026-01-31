# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memos is an open source, self-hosted note-taking service. This is a fork of [usememos/memos](https://github.com/usememos/memos) maintained by chriscurrycc.

## Development Commands

### Backend (Go)

```bash
# Run backend with hot reload (requires air: go install github.com/air-verse/air@latest)
cd scripts && air -c .air.toml

# Build backend manually
go build -o .air/memos ./bin/memos/main.go

# Run tests
go test ./...

# Run specific test file
go test ./test/store/...
```

### Frontend (React/TypeScript)

```bash
cd web

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production (outputs to server/router/frontend/dist)
pnpm release

# Generate protobuf types (runs automatically on pnpm install)
cd ../proto && buf generate
```

### Docker

```bash
docker build -t memos .
docker run -d --init --name memos --publish 5230:5230 --volume ~/.memos/:/var/opt/memos memos
```

## Architecture

### Backend Structure

- `bin/memos/main.go` - Entry point, CLI argument parsing with cobra/viper
- `server/` - HTTP (Echo) and gRPC server setup, multiplexed on single port
  - `router/api/v1/` - gRPC API services with REST gateway
  - `router/frontend/` - Static frontend serving
  - `router/rss/` - RSS feed routes
  - `runner/` - Background tasks (S3 presign, version check, memo payload)
- `store/` - Data layer abstractions
  - `db/` - Database drivers (SQLite, MySQL, PostgreSQL)
  - `migration/` - Schema migrations per database type
- `plugin/` - Standalone plugins (cron, HTTP getter, IDP, storage, webhook)
- `proto/` - Protocol buffer definitions
  - `api/` - gRPC service definitions
  - `store/` - Internal storage models
  - `gen/` - Generated Go and TypeScript code

### Frontend Structure

- `web/src/` - React 18 application
  - `components/` - UI components
  - `pages/` - Route pages
  - `store/` - Redux + Zustand state management
  - `grpcweb.ts` - gRPC-web client setup
  - `locales/` - i18n translations

### Key Patterns

- **API**: gRPC services with grpc-gateway for REST endpoints. API definitions in `proto/api/v1/`
- **Database**: Multi-driver support via `store/db/` interfaces. Default is SQLite
- **Config**: Environment variables prefixed with `MEMOS_` (e.g., `MEMOS_PORT`, `MEMOS_DRIVER`, `MEMOS_DSN`)
- **Frontend Build**: `pnpm release` embeds built assets into `server/router/frontend/dist` for Go binary

## Project-Specific Notes

1. This project does not require typecheck and prettier operations
2. All GitHub operations (issues, PRs, etc.) should target the repository chriscurrycc/memos, not the upstream fork
3. When updating README.md, always update all language versions: README.md (English), README_zh.md (简体中文), README_zh-Hant.md (繁體中文), README_ja.md (日本語)
4. When adding i18n translations, update these 4 locales: en.json, zh-Hans.json, zh-Hant.json, ja.json
