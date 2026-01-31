import { useEffect } from "react";
import { generateDialog } from "./Dialog";
import MemoEditor, { Props as MemoEditorProps } from "./MemoEditor";
import "@/less/zen-mode-dialog.less";

interface Props extends DialogProps {
  editorProps: MemoEditorProps;
  onClose?: () => void;
}

const ZenModeDialog: React.FC<Props> = ({ destroy, editorProps, onClose }: Props) => {
  useEffect(() => {
    return () => onClose?.();
  }, []);

  const handleConfirm = (memoName: string) => {
    editorProps.onConfirm?.(memoName);
    destroy();
  };

  const handleCancel = () => {
    editorProps.onCancel?.();
    destroy();
  };

  return (
    <MemoEditor
      {...editorProps}
      className="zen-mode-editor"
      autoFocus
      isZenMode
      onConfirm={handleConfirm}
      onCancel={editorProps.onCancel ? handleCancel : undefined}
      onZenModeClose={destroy}
    />
  );
};

export default function showZenModeDialog(editorProps: MemoEditorProps, onClose?: () => void): DialogCallback {
  return generateDialog(
    {
      className: "zen-mode-dialog",
      dialogName: "zen-mode-dialog",
      clickSpaceDestroy: false,
    },
    ZenModeDialog,
    { editorProps, onClose },
  );
}
