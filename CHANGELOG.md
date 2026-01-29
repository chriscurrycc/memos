# Changelog

[中文版](CHANGELOG_zh.md)

All notable changes to this fork compared to the original [usememos/memos v0.23.0](https://github.com/usememos/memos/releases/tag/v0.23.0).

## [v0.26.5] - 2025-01-29

### Removed
- Removed raw-data-view feature

## [v0.26.4] - 2025-01-29

### Features
- Added pinned memos drawer for mobile and tablet screens

### Improvements
- Simplified calendar heatmap to 3 levels with improved today indicator
- Optimized homepage performance with skeleton loading states
- Replaced opacity-based heatmap with custom color scale

### Fixes
- Applied strikethrough to links in checked task list items

## [v0.26.3] - 2025-01-18

### Improvements
- Refined MemoContent component styles for better readability

## [v0.26.2] - 2025-01-17

### Improvements
- Refined blockquote styling for better readability

### Fixes
- Fixed disabled state styling for next month button

## [v0.26.1] - 2025-01-15

### Improvements
- Adjusted activity calendar heatmap colors
- Disabled navigating to future months

### Fixes
- Fixed pinned memo not updating in real-time when edited
- Fixed emoji picker click not working on mouse devices
- Fixed days calculation to use earliest memo instead of user creation time

## [v0.26.0] - 2025-01-14

### Features
- Added collapse functionality to code block component
- Compact memo editor UI with improved spacing and layout

## [v0.25.2] - 2024-12-30

### Fixes
- Fixed multiple checkbox state issues

## [v0.25.1] - 2024-12-29

### Features
- Added raw data management (later removed in v0.26.5)

## [v0.24.2] - 2025-07-02

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
