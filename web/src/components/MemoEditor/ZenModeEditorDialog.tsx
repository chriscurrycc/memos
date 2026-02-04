import { Modal } from "@mui/joy";
import { useEffect } from "react";
import MemoEditor, { Props as MemoEditorProps } from ".";
import "@/less/zen-mode-dialog.less";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorProps: MemoEditorProps;
}

const ZenModeEditorDialog = ({ open, onOpenChange, editorProps }: Props) => {
  const handleConfirm = (memoName: string) => {
    editorProps.onConfirm?.(memoName);
    onOpenChange(false);
  };

  const handleCancel = () => {
    editorProps.onCancel?.();
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      slotProps={{
        backdrop: {
          className: "zen-mode-overlay",
        },
      }}
    >
      <div className="zen-mode-content">
        <MemoEditor
          {...editorProps}
          className="zen-mode-editor"
          autoFocus
          isZenMode
          onConfirm={handleConfirm}
          onCancel={editorProps.onCancel ? handleCancel : undefined}
          onZenModeClose={() => onOpenChange(false)}
        />
      </div>
    </Modal>
  );
};

export default ZenModeEditorDialog;
