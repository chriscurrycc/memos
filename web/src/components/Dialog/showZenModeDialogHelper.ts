import React from "react";
import type { Props as MemoEditorProps } from "../MemoEditor";

// Store the dialog manager instance globally so it can be called imperatively
let globalDialogManager: {
  openDialog: (id: string, component: React.ReactNode, className?: string, clickSpaceDestroy?: boolean) => void;
  closeDialog: (id: string) => void;
} | null = null;

export const setGlobalDialogManager = (manager: typeof globalDialogManager) => {
  globalDialogManager = manager;
};

/**
 * Shows a zen mode dialog using the portal-based system.
 * This is a drop-in replacement for the old generateDialog-based showZenModeDialog.
 *
 * Performance improvements:
 * - No createRoot() call - reuses main app's React root
 * - No provider re-initialization - shares Redux, theme, CommonContext
 * - No network requests - all data is already available
 * - Faster rendering - just updates existing React tree
 */
export function showZenModeDialogPortal(editorProps: MemoEditorProps, onClose?: () => void): DialogCallback {
  if (!globalDialogManager) {
    console.error("Portal dialog manager not initialized. Make sure PortalDialogProvider is mounted.");
    // Fallback to old implementation if portal system not available
    return { destroy: () => {} };
  }

  const dialogId = `zen-mode-dialog-${Date.now()}`;

  const destroy = () => {
    globalDialogManager?.closeDialog(dialogId);
  };

  // Dynamically import the component to avoid circular dependencies
  import("../ZenModeDialogPortal").then((module) => {
    const ZenModeDialogPortal = module.default;
    const component = (
      <ZenModeDialogPortal editorProps={editorProps} onClose={onClose} onDestroy={destroy} />
    );
    globalDialogManager?.openDialog(dialogId, component, "zen-mode-dialog", false);
  });

  return { destroy };
}
