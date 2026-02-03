import { useEffect } from "react";
import MemoEditor, { Props as MemoEditorProps } from "./MemoEditor";
import "@/less/zen-mode-dialog.less";

interface ZenModeDialogPortalProps {
  editorProps: MemoEditorProps;
  onClose?: () => void;
  onDestroy: () => void;
}

const ZenModeDialogPortal: React.FC<ZenModeDialogPortalProps> = ({ editorProps, onClose, onDestroy }) => {
  useEffect(() => {
    return () => onClose?.();
  }, [onClose]);

  const handleConfirm = (memoName: string) => {
    editorProps.onConfirm?.(memoName);
    onDestroy();
  };

  const handleCancel = () => {
    editorProps.onCancel?.();
    onDestroy();
  };

  return (
    <MemoEditor
      {...editorProps}
      className="zen-mode-editor"
      autoFocus
      isZenMode
      onConfirm={handleConfirm}
      onCancel={editorProps.onCancel ? handleCancel : undefined}
      onZenModeClose={onDestroy}
    />
  );
};

export default ZenModeDialogPortal;
