import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DialogPortal } from "./DialogPortalContainer";

interface DialogState {
  id: string;
  component: ReactNode;
  className?: string;
  clickSpaceDestroy?: boolean;
}

interface PortalDialogContextValue {
  openDialog: (id: string, component: ReactNode, className?: string, clickSpaceDestroy?: boolean) => void;
  closeDialog: (id: string) => void;
}

const PortalDialogContext = createContext<PortalDialogContextValue | null>(null);

/**
 * Provider component that manages portal-based dialogs.
 * Mount this at the app root level to enable portal dialogs throughout the app.
 */
export const PortalDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogs, setDialogs] = useState<Map<string, DialogState>>(new Map());

  const openDialog = useCallback(
    (id: string, component: ReactNode, className?: string, clickSpaceDestroy: boolean = true) => {
      setDialogs((prev) => {
        const newDialogs = new Map(prev);
        newDialogs.set(id, { id, component, className, clickSpaceDestroy });
        return newDialogs;
      });
    },
    [],
  );

  const closeDialog = useCallback((id: string) => {
    setDialogs((prev) => {
      const newDialogs = new Map(prev);
      newDialogs.delete(id);
      return newDialogs;
    });
  }, []);

  return (
    <PortalDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {Array.from(dialogs.values()).map((dialog) => (
        <DialogPortal
          key={dialog.id}
          dialogName={dialog.id}
          className={dialog.className}
          clickSpaceDestroy={dialog.clickSpaceDestroy}
          onDestroy={() => closeDialog(dialog.id)}
        >
          {dialog.component}
        </DialogPortal>
      ))}
    </PortalDialogContext.Provider>
  );
};

/**
 * Hook to access the portal dialog manager.
 * Use this to open and close portal dialogs from anywhere in the component tree.
 */
export const usePortalDialog = (): PortalDialogContextValue => {
  const context = useContext(PortalDialogContext);
  if (!context) {
    throw new Error("usePortalDialog must be used within PortalDialogProvider");
  }
  return context;
};
