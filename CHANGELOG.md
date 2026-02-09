# Changelog

[中文版](CHANGELOG_zh.md)

All notable changes to this fork compared to the original [usememos/memos v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0).

## [v0.28.1](https://github.com/chriscurrycc/memos/releases/tag/v0.28.1) - 2026-02-10

### Features
- Added toggle to preserve update time when editing memos
- Added edit button to memo cards with silent refresh support

### Fixes
- Fixed card collapse conflicting with internal code block expansion
- Added disabled state and loading spinners to review buttons
- Used locale-aware date format and kept header visible during loading

## [v0.28.0](https://github.com/chriscurrycc/memos/releases/tag/v0.28.0) - 2026-02-09

### Features
- Added memo review feature with swipe-card UI and four modules: filtered review with tag selection, on this day in previous years, random time travel to a past period, and surprise mode for a single random memo
- Added migration repair script (`scripts/migration-repair.sh`) for all database drivers

## [v0.27.2](https://github.com/chriscurrycc/memos/releases/tag/v0.27.2) - 2026-02-04

### Features
- Enabled zen mode for inline memo and comment editors
- Improved tag management UX for mobile and desktop

### Improvements
- Improved zen mode mobile experience with virtual keyboard handling
- Show MemoView action buttons by default on mobile
- Created custom Tooltip component for mobile optimization

### Fixes
- Fixed text overlap with zen mode button by adding padding
- Fixed pinned memo state sync when fetching memo
- Fixed memo reordering issue by preserving displayTime on update
- Removed deleted memo from pinned memo map
- Added z-index to MemoActionMenu for mobile pinned drawer
- Updated content-syntax documentation link in editor
- Enabled emoji picker and expand buttons in mobile pinned drawer
- Improved mobile performance with tooltip and dialog optimizations

## [v0.27.1](https://github.com/chriscurrycc/memos/releases/tag/v0.27.1) - 2026-02-02

### Improvements
- Added multi-architecture Docker build support (linux/amd64, linux/arm64)

## [v0.27.0](https://github.com/chriscurrycc/memos/releases/tag/v0.27.0) - 2026-02-02

### Features
- Added Zen mode for immersive memo editing
- Added resizable splitter for Timeline/Pinned layout
- Added month picker drawer with quick navigation in calendar
- Enabled MarkdownMenu in memo editor toolbar

### Improvements
- Improved memo content collapse with external control and better UX
- Simplified collapse logic with localStorage persistence
- Close sidebar drawer on date selection in mobile view
- Added rounded corners to resizable splitter
- Improved resizable splitter with semantic naming and theme colors

## [v0.26.5](https://github.com/chriscurrycc/memos/releases/tag/v0.26.5) - 2026-01-29

### Removed
- Removed raw-data-view feature

## [v0.26.4](https://github.com/chriscurrycc/memos/releases/tag/v0.26.4) - 2026-01-29

### Features
- Added pinned memos drawer for mobile and tablet screens

### Improvements
- Simplified calendar heatmap to 3 levels with improved today indicator
- Optimized homepage performance with skeleton loading states
- Replaced opacity-based heatmap with custom color scale

### Fixes
- Applied strikethrough to links in checked task list items

## [v0.26.3](https://github.com/chriscurrycc/memos/releases/tag/v0.26.3) - 2026-01-18

### Improvements
- Refined MemoContent component styles for better readability

## [v0.26.2](https://github.com/chriscurrycc/memos/releases/tag/v0.26.2) - 2026-01-17

### Improvements
- Refined blockquote styling for better readability

### Fixes
- Fixed disabled state styling for next month button

## [v0.26.1](https://github.com/chriscurrycc/memos/releases/tag/v0.26.1) - 2026-01-15

### Improvements
- Adjusted activity calendar heatmap colors
- Disabled navigating to future months

### Fixes
- Fixed pinned memo not updating in real-time when edited
- Fixed emoji picker click not working on mouse devices
- Fixed days calculation to use earliest memo instead of user creation time

## [v0.26.0](https://github.com/chriscurrycc/memos/releases/tag/v0.26.0) - 2026-01-14

### Features
- Added collapse functionality to code block component
- Compact memo editor UI with improved spacing and layout

## [v0.25.2](https://github.com/chriscurrycc/memos/releases/tag/v0.25.2) - 2025-12-30

### Fixes
- Fixed multiple checkbox state issues

## [v0.25.1](https://github.com/chriscurrycc/memos/releases/tag/v0.25.1) - 2025-12-29

### Features
- Added raw data management (later removed in v0.26.5)

## [v0.24.2](https://github.com/chriscurrycc/memos/releases/tag/v0.24.2) - 2025-07-02

### Features
- **Tag Management**
  - Pin/unpin tags to keep important tags at the top
  - Add emoji icons to tags for visual distinction
  - Full CRUD operations for tag management with dedicated database table

- **Pinned Memos Column** - Display pinned memos in a separate column on desktop

- **Export Memo as Image**
  - Export memos as beautiful images with customizable templates
  - Multiple export templates including X.com style

- **Navigation & Filtering**
  - Persist memo filters in URL query parameters
  - Bi-directional filter sync between UI state and URL
  - Scroll to top button

- **Image Viewing** - Enhanced image preview with react-photo-view

- **Editor Enhancements**
  - Browser redo/undo support for text editing
  - Enhanced hyperlink handling in markdown shortcuts

### Improvements
- Optimized photo view experience
- Optimized markdown rendering
- Updated tag styling
- Updated memo card base styles
- Adjusted line break height

### Fixes
- Fixed tag deletion not working properly
- Fixed tag redirection from memo detail page
- Fixed code block syntax highlighting color issues
- Fixed image style issues
