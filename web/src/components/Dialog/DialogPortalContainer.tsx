import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useDialogStore } from "@/store/module";

interface DialogPortalProps {
  dialogName: string;
  className?: string;
  clickSpaceDestroy?: boolean;
  onDestroy: () => void;
  children: React.ReactNode;
}

/**
 * Portal-based dialog component that renders into a shared container
 * instead of creating new React roots. This improves performance by:
 * - Avoiding expensive createRoot() calls on every dialog open
 * - Sharing providers from the main app (Redux, theme, CommonContext)
 * - Reducing memory allocations and garbage collection
 */
export const DialogPortal: React.FC<DialogPortalProps> = ({
  dialogName,
  className,
  clickSpaceDestroy = true,
  onDestroy,
  children,
}) => {
  const dialogStore = useDialogStore();
  const dialogContainerRef = useRef<HTMLDivElement>(null);
  const dialogIndex = dialogStore.state.dialogStack.findIndex((item) => item === dialogName);

  useEffect(() => {
    dialogStore.pushDialogStack(dialogName);
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        if (dialogName === dialogStore.topDialogStack()) {
          onDestroy();
        }
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
      dialogStore.removeDialog(dialogName);
      document.body.style.removeProperty("overflow");
    };
  }, [dialogName, onDestroy]);

  useEffect(() => {
    if (dialogIndex > 0 && dialogContainerRef.current) {
      dialogContainerRef.current.style.marginTop = `${dialogIndex * 16}px`;
    }
  }, [dialogIndex]);

  const handleSpaceClicked = () => {
    if (clickSpaceDestroy) {
      onDestroy();
    }
  };

  // Get or create the portal container
  let portalContainer = document.getElementById("dialog-portal-root");
  if (!portalContainer) {
    portalContainer = document.createElement("div");
    portalContainer.id = "dialog-portal-root";
    document.body.appendChild(portalContainer);
  }

  return createPortal(
    <div className={clsx("dialog-wrapper", className)} onMouseDown={handleSpaceClicked}>
      <div ref={dialogContainerRef} className="dialog-container" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    portalContainer,
  );
};
