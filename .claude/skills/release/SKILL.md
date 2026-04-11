---
name: release
description: Create and publish a new version release by creating a git tag and pushing it. Use when the user asks to release a version, create a release, publish a new version, or says "发版" or "发布版本".
allowed-tools: Bash, Read, Edit
---

# Release Skill

Automatically create and publish a new version release for this project.

## Important: Branch Check

**CRITICAL**: This skill MUST only run on the `main` branch.

1. First, check the current branch:
   ```bash
   git branch --show-current
   ```

2. If the result is NOT `main`:
   - STOP immediately
   - Show this warning: "Cannot release: Currently on branch `{branch_name}`. Please switch to `main` branch first."
   - DO NOT proceed with any other steps

3. Only continue if on `main` branch

## Release Process

### Step 1: Get Version Information

Get the latest version tag:
```bash
git tag --sort=-version:refname | head -1
```

Get commits since last release:
```bash
git log {last_tag}..HEAD --oneline
```

If there are no new commits, inform the user there's nothing new to release.

### Step 2: Determine New Version

Version format: `v{major}.{minor}.{patch}` or `v{major}.{minor}.{patch}-beta.{n}`

Release types:
- **Stable** (default): `v0.27.0` — production-ready releases
- **Beta**: `v0.27.0-beta.1` — pre-release for testing and early adopters

Increment rules:
- **Patch**: Bug fixes, minor improvements (e.g., v0.26.1 → v0.26.2)
- **Minor** (default): New features, non-breaking changes (e.g., v0.26.1 → v0.27.0)
- **Major**: Breaking changes (e.g., v0.26.1 → v1.0.0)
- **Beta**: Append `-beta.N` for pre-release (e.g., v0.27.0-beta.1 → v0.27.0-beta.2)

If the user says "发 beta" or "beta release", use beta versioning. If the latest tag is already a beta (e.g., `v0.27.0-beta.1`):
- Next beta: increment beta number (e.g., `v0.27.0-beta.2`)
- Promote to stable: remove the beta suffix (e.g., `v0.27.0`)

Use minor increment by default unless the commits clearly indicate otherwise.

**CRITICAL**: After determining the new version number, you MUST present the proposed version to the user and wait for explicit confirmation before proceeding. Show the version number, the commits included, and ask the user to confirm. Do NOT continue until the user approves.

### Step 3: Create Release Notes

Analyze the commits and categorize them:
- **Features**: New functionality
- **Improvements**: Enhancements to existing features
- **Bug Fixes**: Fixed issues
- **Refactor**: Code restructuring
- **Docs**: Documentation changes

### Step 4: Update Changelog Files

**NOTE**: Skip this step for beta releases. Changelog is only updated for stable releases.

**CRITICAL**: Before creating the tag, update both changelog files with the new version's changes.

1. Read the current `CHANGELOG.md` and `CHANGELOG_zh.md` files
2. Add a new version section at the top (below the header), following the existing format:

**CHANGELOG.md** (English):
```markdown
## [v{new_version}](https://github.com/chriscurrycc/memos/releases/tag/v{new_version}) - {YYYY-MM-DD}

### Features
- {feature 1}

### Improvements
- {improvement 1}

### Fixes
- {fix 1}
```

**CHANGELOG_zh.md** (Chinese):
```markdown
## [v{new_version}](https://github.com/chriscurrycc/memos/releases/tag/v{new_version}) - {YYYY-MM-DD}

### 新功能
- {feature 1}

### 优化
- {improvement 1}

### 修复
- {fix 1}
```

Category mapping (English → Chinese):
- Features → 新功能
- Improvements → 优化
- Fixes / Bug Fixes → 修复
- Removed → 移除
- Refactor → 重构

3. Commit the changelog updates:
```bash
git add CHANGELOG.md CHANGELOG_zh.md
git commit -m "docs: update changelog for v{new_version}"
```

### Step 5: Create and Push Tag

Create an annotated tag with release notes:
```bash
git tag -a v{new_version} -m "v{new_version}

## {Category}
- {change 1}
- {change 2}
..."
```

Push the tag and changelog commit to remote:
```bash
git push origin main
git push origin v{new_version}
```

### Step 6: Confirm Completion

Inform the user:
- Tag `v{new_version}` has been created and pushed
- GitHub Actions will automatically build and push Docker image
- Docker rolling tags:
  - `latest` is updated on every release (beta + stable)
  - `stable` is updated only on stable releases

## Project-Specific Notes

- This project uses GitHub Actions for automatic release creation
- Only the git tag needs to be pushed
- Do not create GitHub releases manually
- Beta releases skip changelog updates
