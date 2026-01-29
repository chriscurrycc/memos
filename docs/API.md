# Memos API Documentation

This document provides comprehensive documentation for the Memos REST API. The API is built on gRPC with a REST gateway, providing both gRPC and RESTful HTTP endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Services](#api-services)
  - [AuthService](#1-authservice)
  - [UserService](#2-userservice)
  - [MemoService](#3-memoservice)
  - [ResourceService](#4-resourceservice)
  - [TagService](#5-tagservice)
  - [WorkspaceService](#6-workspaceservice)
  - [WorkspaceSettingService](#7-workspacesettingservice)
  - [InboxService](#8-inboxservice)
  - [ActivityService](#9-activityservice)
  - [WebhookService](#10-webhookservice)
  - [IdentityProviderService](#11-identityproviderservice)
  - [MarkdownService](#12-markdownservice)
- [Common Types](#common-types)
- [Error Handling](#error-handling)

---

## Overview

**Base URL:** `https://your-memos-instance.com`

**API Version:** v1

**Content-Type:** `application/json`

All API endpoints are prefixed with `/api/v1/` unless otherwise noted. File download endpoints use `/file/` prefix.

---

## Authentication

Memos supports two authentication methods:

### 1. Session Cookie

After signing in via `/api/v1/auth/signin`, a session cookie is set automatically.

### 2. Access Token

Create an access token via the User API and include it in requests:

```
Authorization: Bearer <access_token>
```

---

## API Services

### 1. AuthService

Authentication and session management.

#### Get Auth Status

Check current authentication status.

```
POST /api/v1/auth/status
```

**Response:**
```json
{
  "name": "users/1",
  "id": 1,
  "role": "HOST",
  "username": "admin",
  "email": "admin@example.com",
  "nickname": "Admin",
  "avatarUrl": "",
  "description": "",
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z"
}
```

#### Sign In

Authenticate with username and password.

```
POST /api/v1/auth/signin
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "neverExpire": false
}
```

**Response:** Returns `User` object.

#### Sign In with SSO

Authenticate via OAuth2 identity provider.

```
POST /api/v1/auth/signin/sso
```

**Request Body:**
```json
{
  "idpId": 1,
  "code": "string",
  "redirectUri": "string"
}
```

**Response:** Returns `User` object.

#### Sign Up

Register a new user account.

```
POST /api/v1/auth/signup
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** Returns `User` object.

#### Sign Out

End the current session.

```
POST /api/v1/auth/signout
```

**Response:** Empty object `{}`

---

### 2. UserService

User management including profiles, settings, and access tokens.

#### List Users

Get all users.

```
GET /api/v1/users
```

**Response:**
```json
{
  "users": [
    {
      "name": "users/1",
      "id": 1,
      "role": "HOST",
      "username": "admin",
      "email": "admin@example.com",
      "nickname": "Admin",
      "avatarUrl": "",
      "description": "",
      "rowStatus": "ACTIVE",
      "createTime": "2024-01-01T00:00:00Z",
      "updateTime": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Search Users

Search users by filter.

```
GET /api/v1/users:search?filter={filter}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filter` | string | Filter expression |

**Response:** Returns `SearchUsersResponse` with list of users.

#### Get User

Get a specific user by ID.

```
GET /api/v1/users/{id}
```

**Response:** Returns `User` object.

#### Get User Avatar

Get user avatar binary.

```
GET /file/users/{id}/avatar
```

**Response:** Binary image data.

#### Create User

Create a new user (admin only).

```
POST /api/v1/users
```

**Request Body:**
```json
{
  "user": {
    "username": "string",
    "password": "string",
    "role": "USER",
    "email": "string",
    "nickname": "string"
  }
}
```

**Response:** Returns created `User` object.

#### Update User

Update user information.

```
PATCH /api/v1/users/{id}
```

**Request Body:**
```json
{
  "user": {
    "name": "users/1",
    "nickname": "New Nickname",
    "email": "new@example.com"
  },
  "updateMask": "nickname,email"
}
```

**Response:** Returns updated `User` object.

#### Delete User

Delete a user (admin only).

```
DELETE /api/v1/users/{id}
```

**Response:** Empty object `{}`

#### Get User Setting

Get user-specific settings.

```
GET /api/v1/users/{id}/setting
```

**Response:**
```json
{
  "name": "users/1/setting",
  "locale": "en",
  "appearance": "system",
  "memoVisibility": "PRIVATE"
}
```

#### Update User Setting

Update user settings.

```
PATCH /api/v1/users/{id}/setting
```

**Request Body:**
```json
{
  "setting": {
    "name": "users/1/setting",
    "locale": "zh-Hans",
    "appearance": "dark",
    "memoVisibility": "PRIVATE"
  },
  "updateMask": "locale,appearance"
}
```

#### List User Access Tokens

Get all access tokens for a user.

```
GET /api/v1/users/{id}/access_tokens
```

**Response:**
```json
{
  "accessTokens": [
    {
      "accessToken": "token_string",
      "description": "API Access",
      "issuedAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Create User Access Token

Create a new access token.

```
POST /api/v1/users/{id}/access_tokens
```

**Request Body:**
```json
{
  "description": "API Access",
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

**Response:** Returns created `UserAccessToken`.

#### Delete User Access Token

Delete an access token.

```
DELETE /api/v1/users/{id}/access_tokens/{access_token}
```

**Response:** Empty object `{}`

---

### 3. MemoService

Core memo/note management with CRUD operations, comments, reactions, and relations.

#### Create Memo

Create a new memo.

```
POST /api/v1/memos
```

**Request Body:**
```json
{
  "content": "Hello, World! #greeting",
  "visibility": "PRIVATE",
  "resources": [
    {"name": "resources/1"}
  ],
  "relations": [
    {
      "relatedMemo": {"name": "memos/2"},
      "type": "REFERENCE"
    }
  ],
  "location": {
    "placeholder": "New York",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Visibility Options:**
- `PRIVATE` - Only visible to creator
- `PROTECTED` - Visible to authenticated users
- `PUBLIC` - Visible to everyone

**Response:** Returns created `Memo` object.

#### List Memos

Get memos with filtering and pagination.

```
GET /api/v1/memos?pageSize={pageSize}&pageToken={pageToken}&filter={filter}&view={view}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pageSize` | int | Number of memos per page (default: 10) |
| `pageToken` | string | Pagination token |
| `filter` | string | Filter expression |
| `view` | string | `MEMO_VIEW_FULL` or `MEMO_VIEW_METADATA_ONLY` |

**Filter Examples:**
```
creator == 'users/1'
visibilities == ['PUBLIC', 'PROTECTED']
creator == 'users/1' && visibilities == ['PUBLIC']
tag == 'work'
content_search == ['keyword1', 'keyword2']
display_time_before == '2024-12-31T23:59:59Z'
display_time_after == '2024-01-01T00:00:00Z'
has_link == true
has_task_list == true
has_code == true
has_incomplete_tasks == true
```

**Response:**
```json
{
  "memos": [
    {
      "name": "memos/1",
      "uid": "abc123",
      "rowStatus": "ACTIVE",
      "creator": "users/1",
      "createTime": "2024-01-01T00:00:00Z",
      "updateTime": "2024-01-01T00:00:00Z",
      "displayTime": "2024-01-01T00:00:00Z",
      "content": "Hello, World! #greeting",
      "visibility": "PRIVATE",
      "tags": ["greeting"],
      "pinned": false,
      "resources": [],
      "relations": [],
      "reactions": [],
      "property": {
        "hasLink": false,
        "hasTaskList": false,
        "hasCode": false,
        "hasIncompleteTasks": false
      },
      "snippet": "Hello, World!"
    }
  ],
  "nextPageToken": "token_string"
}
```

#### Get Memo

Get a specific memo by ID.

```
GET /api/v1/memos/{id}
```

**Response:** Returns `Memo` object.

#### Get Memo by UID

Get a memo by its UID.

```
GET /api/v1/memos:by-uid/{uid}
```

**Response:** Returns `Memo` object.

#### Update Memo

Update an existing memo.

```
PATCH /api/v1/memos/{id}
```

**Request Body:**
```json
{
  "memo": {
    "name": "memos/1",
    "content": "Updated content",
    "visibility": "PUBLIC",
    "pinned": true
  },
  "updateMask": "content,visibility,pinned"
}
```

**Response:** Returns updated `Memo` object.

#### Delete Memo

Delete a memo.

```
DELETE /api/v1/memos/{id}
```

**Response:** Empty object `{}`

#### Rename Memo Tag

Rename a tag across memos.

```
PATCH /api/v1/memos/{id}/tags:rename
```

**Request Body:**
```json
{
  "oldTag": "old-tag",
  "newTag": "new-tag"
}
```

**Response:** Empty object `{}`

#### Delete Memo Tag

Delete a tag from memos.

```
DELETE /api/v1/memos/{id}/tags/{tag}?deleteRelatedMemos={bool}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `deleteRelatedMemos` | bool | Also delete memos with this tag |

**Response:** Empty object `{}`

#### Set Memo Resources

Set resources attached to a memo.

```
PATCH /api/v1/memos/{id}/resources
```

**Request Body:**
```json
{
  "resources": [
    {"name": "resources/1"},
    {"name": "resources/2"}
  ]
}
```

**Response:** Empty object `{}`

#### List Memo Resources

Get resources attached to a memo.

```
GET /api/v1/memos/{id}/resources
```

**Response:**
```json
{
  "resources": [
    {
      "name": "resources/1",
      "uid": "abc123",
      "createTime": "2024-01-01T00:00:00Z",
      "filename": "image.png",
      "type": "image/png",
      "size": 12345
    }
  ]
}
```

#### Set Memo Relations

Set relations between memos.

```
PATCH /api/v1/memos/{id}/relations
```

**Request Body:**
```json
{
  "relations": [
    {
      "relatedMemo": {"name": "memos/2"},
      "type": "REFERENCE"
    }
  ]
}
```

**Relation Types:**
- `REFERENCE` - References another memo
- `COMMENT` - Is a comment on another memo

**Response:** Empty object `{}`

#### List Memo Relations

Get relations for a memo.

```
GET /api/v1/memos/{id}/relations
```

**Response:**
```json
{
  "relations": [
    {
      "memo": {"name": "memos/1", "uid": "abc123", "snippet": "..."},
      "relatedMemo": {"name": "memos/2", "uid": "def456", "snippet": "..."},
      "type": "REFERENCE"
    }
  ]
}
```

#### Create Memo Comment

Add a comment to a memo.

```
POST /api/v1/memos/{id}/comments
```

**Request Body:**
```json
{
  "comment": {
    "content": "This is a comment"
  }
}
```

**Response:** Returns created comment as `Memo` object.

#### List Memo Comments

Get comments for a memo.

```
GET /api/v1/memos/{id}/comments
```

**Response:**
```json
{
  "memos": [
    {
      "name": "memos/3",
      "content": "This is a comment",
      "parent": "memos/1"
    }
  ]
}
```

#### List Memo Reactions

Get reactions for a memo.

```
GET /api/v1/memos/{id}/reactions
```

**Response:**
```json
{
  "reactions": [
    {
      "id": 1,
      "creator": "users/1",
      "contentId": "memos/1",
      "reactionType": "👍"
    }
  ]
}
```

#### Upsert Memo Reaction

Add or update a reaction.

```
POST /api/v1/memos/{id}/reactions
```

**Request Body:**
```json
{
  "reaction": {
    "reactionType": "👍"
  }
}
```

**Response:** Returns `Reaction` object.

#### Delete Memo Reaction

Remove a reaction.

```
DELETE /api/v1/reactions/{reaction_id}
```

**Response:** Empty object `{}`

---

### 4. ResourceService

File and resource management with upload and download capabilities.

#### Create Resource

Upload a new resource.

```
POST /api/v1/resources
```

**Request Body:**
```json
{
  "resource": {
    "filename": "image.png",
    "type": "image/png",
    "content": "<base64_encoded_data>",
    "externalLink": ""
  }
}
```

**Note:** Provide either `content` (base64) or `externalLink`, not both.

**Response:** Returns created `Resource` object.

#### List Resources

Get all resources for current user.

```
GET /api/v1/resources
```

**Response:**
```json
{
  "resources": [
    {
      "name": "resources/1",
      "uid": "abc123",
      "createTime": "2024-01-01T00:00:00Z",
      "filename": "image.png",
      "type": "image/png",
      "size": 12345,
      "memo": "memos/1"
    }
  ]
}
```

#### Get Resource

Get resource metadata by ID.

```
GET /api/v1/resources/{id}
```

**Response:** Returns `Resource` object.

#### Get Resource by UID

Get resource by UID.

```
GET /api/v1/resources:by-uid/{uid}
```

**Response:** Returns `Resource` object.

#### Get Resource Binary

Download resource file.

```
GET /file/resources/{id}/{filename}?thumbnail={bool}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `thumbnail` | bool | Return thumbnail for images |

**Response:** Binary file data with appropriate Content-Type header.

#### Update Resource

Update resource metadata.

```
PATCH /api/v1/resources/{id}
```

**Request Body:**
```json
{
  "resource": {
    "name": "resources/1",
    "filename": "new-name.png"
  },
  "updateMask": "filename"
}
```

**Response:** Returns updated `Resource` object.

#### Delete Resource

Delete a resource.

```
DELETE /api/v1/resources/{id}
```

**Response:** Empty object `{}`

---

### 5. TagService

Tag management with pinning and emoji support.

#### List Pinned Tags

Get all pinned tags.

```
GET /api/v1/tags:pinned
```

**Response:**
```json
{
  "tags": [
    {
      "id": 1,
      "tagName": "important",
      "emoji": "⭐",
      "pinnedTime": "2024-01-01T00:00:00Z",
      "createTime": "2024-01-01T00:00:00Z",
      "updateTime": "2024-01-01T00:00:00Z",
      "creator": "users/1",
      "tagHash": "abc123"
    }
  ]
}
```

#### List Tags with Emoji

Get all tags that have emojis assigned.

```
GET /api/v1/tags:emoji
```

**Response:** Returns `ListTagsWithEmojiResponse` with tag list.

#### Update Tag

Update tag properties (emoji, pinned status).

```
PATCH /api/v1/tags/{tag_name}
```

**Request Body:**
```json
{
  "emoji": "🔥",
  "pinned": true
}
```

**Response:** Returns updated `Tag` object.

---

### 6. WorkspaceService

Workspace-level information.

#### Get Workspace Profile

Get workspace profile (public endpoint).

```
GET /api/v1/workspace/profile
```

**Response:**
```json
{
  "owner": "users/1",
  "version": "0.24.0",
  "mode": "prod",
  "instanceUrl": "https://memos.example.com"
}
```

---

### 7. WorkspaceSettingService

Workspace-level settings management (admin only).

#### Get Workspace Setting

Get a specific workspace setting.

```
GET /api/v1/workspace/settings/{setting}
```

**Setting Names:**
- `general` - General workspace settings
- `storage` - Storage configuration
- `memo-related` - Memo behavior settings

**Response for `general`:**
```json
{
  "name": "settings/general",
  "generalSetting": {
    "disallowUserRegistration": false,
    "disallowPasswordAuth": false,
    "additionalScript": "",
    "additionalStyle": "",
    "customProfile": {
      "title": "Memos",
      "description": "A privacy-first note-taking service",
      "logoUrl": "",
      "locale": "en",
      "appearance": "system"
    },
    "weekStartDayOffset": 0,
    "disallowChangeUsername": false,
    "disallowChangeNickname": false
  }
}
```

**Response for `storage`:**
```json
{
  "name": "settings/storage",
  "storageSetting": {
    "storageType": "DATABASE",
    "filepathTemplate": "assets/{timestamp}_{filename}",
    "uploadSizeLimitMb": 32,
    "s3Config": {
      "accessKeyId": "",
      "accessKeySecret": "",
      "endpoint": "",
      "region": "",
      "bucket": ""
    }
  }
}
```

**Storage Types:**
- `DATABASE` - Store files in database
- `LOCAL` - Store files on local filesystem
- `S3` - Store files in S3-compatible storage

**Response for `memo-related`:**
```json
{
  "name": "settings/memo-related",
  "memoRelatedSetting": {
    "disallowPublicVisibility": false,
    "displayWithUpdateTime": false,
    "contentLengthLimit": 262144,
    "enableAutoCompact": false,
    "enableDoubleClickEdit": true,
    "enableLinkPreview": true,
    "enableComment": true,
    "enableLocation": false,
    "defaultVisibility": "PRIVATE",
    "reactions": ["👍", "👎", "❤️", "🎉", "🚀"],
    "disableMarkdownShortcuts": false
  }
}
```

#### Set Workspace Setting

Update a workspace setting.

```
PATCH /api/v1/workspace/settings/{setting}
```

**Request Body (example for general):**
```json
{
  "setting": {
    "name": "settings/general",
    "generalSetting": {
      "disallowUserRegistration": true,
      "customProfile": {
        "title": "My Memos"
      }
    }
  }
}
```

**Response:** Returns updated `WorkspaceSetting`.

---

### 8. InboxService

Notification inbox management.

#### List Inboxes

Get inbox notifications.

```
GET /api/v1/inboxes?user={user}&pageSize={pageSize}&pageToken={pageToken}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user` | string | User filter (e.g., `users/1`) |
| `pageSize` | int | Items per page |
| `pageToken` | string | Pagination token |

**Response:**
```json
{
  "inboxes": [
    {
      "name": "inboxes/1",
      "sender": "users/2",
      "receiver": "users/1",
      "status": "UNREAD",
      "createTime": "2024-01-01T00:00:00Z",
      "type": "MEMO_COMMENT",
      "activityId": 1
    }
  ],
  "nextPageToken": "token_string"
}
```

**Inbox Types:**
- `MEMO_COMMENT` - Someone commented on your memo
- `VERSION_UPDATE` - New version available

**Status Values:**
- `UNREAD`
- `ARCHIVED`

#### Update Inbox

Update inbox item status.

```
PATCH /api/v1/inboxes/{id}
```

**Request Body:**
```json
{
  "inbox": {
    "name": "inboxes/1",
    "status": "ARCHIVED"
  },
  "updateMask": "status"
}
```

**Response:** Returns updated `Inbox`.

#### Delete Inbox

Delete an inbox item.

```
DELETE /api/v1/inboxes/{id}
```

**Response:** Empty object `{}`

---

### 9. ActivityService

Activity log and event tracking.

#### Get Activity

Get activity details.

```
GET /api/v1/activities/{id}
```

**Response:**
```json
{
  "name": "activities/1",
  "creatorId": 1,
  "type": "MEMO_COMMENT",
  "level": "INFO",
  "createTime": "2024-01-01T00:00:00Z",
  "payload": {
    "memoComment": {
      "memoId": 1,
      "relatedMemoId": 2
    }
  }
}
```

**Activity Types:**
- `MEMO_COMMENT` - Comment activity
- `VERSION_UPDATE` - Version update notification

---

### 10. WebhookService

Webhook management for event notifications.

#### Create Webhook

Create a new webhook.

```
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "name": "My Webhook",
  "url": "https://example.com/webhook"
}
```

**Response:**
```json
{
  "id": 1,
  "creatorId": 1,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "rowStatus": "ACTIVE",
  "name": "My Webhook",
  "url": "https://example.com/webhook"
}
```

#### Get Webhook

Get a specific webhook.

```
GET /api/v1/webhooks/{id}
```

**Response:** Returns `Webhook` object.

#### List Webhooks

Get all webhooks.

```
GET /api/v1/webhooks?creatorId={creatorId}
```

**Response:**
```json
{
  "webhooks": [...]
}
```

#### Update Webhook

Update a webhook.

```
PATCH /api/v1/webhooks/{id}
```

**Request Body:**
```json
{
  "webhook": {
    "id": 1,
    "name": "Updated Name",
    "url": "https://new-url.com/webhook"
  },
  "updateMask": "name,url"
}
```

**Response:** Returns updated `Webhook`.

#### Delete Webhook

Delete a webhook.

```
DELETE /api/v1/webhooks/{id}
```

**Response:** Empty object `{}`

**Webhook Payload Format:**

When events occur, webhooks receive POST requests with:
```json
{
  "url": "https://your-webhook-url.com",
  "activityType": "MEMO_CREATED",
  "creatorId": 1,
  "createTime": "2024-01-01T00:00:00Z",
  "memo": {
    "name": "memos/1",
    "content": "...",
    "visibility": "PUBLIC"
  }
}
```

---

### 11. IdentityProviderService

SSO and OAuth2 identity provider management (admin only).

#### List Identity Providers

Get all configured identity providers.

```
GET /api/v1/identityProviders
```

**Response:**
```json
{
  "identityProviders": [
    {
      "name": "identityProviders/1",
      "type": "OAUTH2",
      "title": "Google",
      "identifierFilter": "",
      "config": {
        "oauth2Config": {
          "clientId": "...",
          "authUrl": "https://accounts.google.com/o/oauth2/auth",
          "tokenUrl": "https://oauth2.googleapis.com/token",
          "userInfoUrl": "https://www.googleapis.com/oauth2/v2/userinfo",
          "scopes": ["email", "profile"],
          "fieldMapping": {
            "identifier": "email",
            "displayName": "name",
            "email": "email"
          }
        }
      }
    }
  ]
}
```

#### Get Identity Provider

Get a specific identity provider.

```
GET /api/v1/identityProviders/{id}
```

**Response:** Returns `IdentityProvider` object.

#### Create Identity Provider

Create a new identity provider.

```
POST /api/v1/identityProviders
```

**Request Body:**
```json
{
  "identityProvider": {
    "type": "OAUTH2",
    "title": "GitHub",
    "config": {
      "oauth2Config": {
        "clientId": "your-client-id",
        "clientSecret": "your-client-secret",
        "authUrl": "https://github.com/login/oauth/authorize",
        "tokenUrl": "https://github.com/login/oauth/access_token",
        "userInfoUrl": "https://api.github.com/user",
        "scopes": ["user:email"],
        "fieldMapping": {
          "identifier": "login",
          "displayName": "name",
          "email": "email"
        }
      }
    }
  }
}
```

**Response:** Returns created `IdentityProvider`.

#### Update Identity Provider

Update an identity provider.

```
PATCH /api/v1/identityProviders/{id}
```

**Request Body:**
```json
{
  "identityProvider": {
    "name": "identityProviders/1",
    "title": "Updated Title"
  },
  "updateMask": "title"
}
```

**Response:** Returns updated `IdentityProvider`.

#### Delete Identity Provider

Delete an identity provider.

```
DELETE /api/v1/identityProviders/{id}
```

**Response:** Empty object `{}`

---

### 12. MarkdownService

Markdown parsing and processing utilities.

#### Parse Markdown

Parse markdown content into AST nodes.

```
POST /api/v1/markdown:parse
```

**Request Body:**
```json
{
  "markdown": "# Hello\n\nThis is **bold** text."
}
```

**Response:**
```json
{
  "nodes": [
    {
      "type": "HEADING",
      "headingNode": {
        "level": 1,
        "children": [{"type": "TEXT", "textNode": {"content": "Hello"}}]
      }
    },
    {
      "type": "PARAGRAPH",
      "paragraphNode": {
        "children": [
          {"type": "TEXT", "textNode": {"content": "This is "}},
          {"type": "BOLD", "boldNode": {"children": [{"type": "TEXT", "textNode": {"content": "bold"}}]}},
          {"type": "TEXT", "textNode": {"content": " text."}}
        ]
      }
    }
  ]
}
```

#### Restore Markdown Nodes

Convert AST nodes back to markdown.

```
POST /api/v1/markdown/node:restore
```

**Request Body:**
```json
{
  "nodes": [...]
}
```

**Response:**
```json
{
  "markdown": "# Hello\n\nThis is **bold** text."
}
```

#### Stringify Markdown Nodes

Convert AST nodes to plain text.

```
POST /api/v1/markdown/node:stringify
```

**Request Body:**
```json
{
  "nodes": [...]
}
```

**Response:**
```json
{
  "plainText": "Hello This is bold text."
}
```

#### Get Link Metadata

Fetch metadata for a URL.

```
GET /api/v1/markdown/link:metadata?link={url}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `link` | string | URL to fetch metadata for |

**Response:**
```json
{
  "title": "Page Title",
  "description": "Page description",
  "image": "https://example.com/og-image.png"
}
```

---

## Common Types

### User

```json
{
  "name": "users/{id}",
  "id": 1,
  "role": "HOST|ADMIN|USER",
  "username": "string",
  "email": "string",
  "nickname": "string",
  "avatarUrl": "string",
  "description": "string",
  "rowStatus": "ACTIVE|ARCHIVED",
  "createTime": "timestamp",
  "updateTime": "timestamp"
}
```

### Memo

```json
{
  "name": "memos/{id}",
  "uid": "string",
  "rowStatus": "ACTIVE|ARCHIVED",
  "creator": "users/{id}",
  "createTime": "timestamp",
  "updateTime": "timestamp",
  "displayTime": "timestamp",
  "content": "string",
  "visibility": "PRIVATE|PROTECTED|PUBLIC",
  "tags": ["string"],
  "pinned": false,
  "resources": [],
  "relations": [],
  "reactions": [],
  "property": {
    "hasLink": false,
    "hasTaskList": false,
    "hasCode": false,
    "hasIncompleteTasks": false
  },
  "parent": "memos/{id}",
  "snippet": "string",
  "location": {
    "placeholder": "string",
    "latitude": 0.0,
    "longitude": 0.0
  }
}
```

### Resource

```json
{
  "name": "resources/{id}",
  "uid": "string",
  "createTime": "timestamp",
  "filename": "string",
  "externalLink": "string",
  "type": "string",
  "size": 0,
  "memo": "memos/{id}"
}
```

### RowStatus

| Value | Description |
|-------|-------------|
| `ACTIVE` | Active/normal state |
| `ARCHIVED` | Archived/soft-deleted |

### Visibility

| Value | Description |
|-------|-------------|
| `PRIVATE` | Only visible to creator |
| `PROTECTED` | Visible to authenticated users |
| `PUBLIC` | Visible to everyone |

### User Role

| Value | Description |
|-------|-------------|
| `HOST` | Instance owner with full permissions |
| `ADMIN` | Administrator |
| `USER` | Regular user |

---

## Error Handling

The API returns standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

Error responses include details:

```json
{
  "code": 3,
  "message": "invalid argument: username is required",
  "details": []
}
```

---

## Rate Limiting

Rate limiting may be implemented at the server level. Check response headers for rate limit information.

---

## Changelog

For API changes between versions, refer to the project's release notes.
