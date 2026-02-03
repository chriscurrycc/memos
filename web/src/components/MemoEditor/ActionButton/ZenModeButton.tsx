import Tooltip from "@/components/kit/Tooltip";
import { Button } from "@usememos/mui";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useTranslate } from "@/utils/i18n";

interface Props {
  isZenMode?: boolean;
  onClick: () => void;
}

const ZenModeButton = ({ isZenMode, onClick }: Props) => {
  const t = useTranslate();
  const { sm } = useResponsiveWidth();
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcut = isMac ? "⌘⇧↵" : "Ctrl+Shift+Enter";

  const button = (
    <Button
      variant="plain"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="opacity-60 hover:opacity-100 transition-opacity"
    >
      {isZenMode ? (
        <Minimize2Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      ) : (
        <Maximize2Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      )}
    </Button>
  );

  return (
    <div className="absolute top-1.5 right-1.5 z-10">
      {sm ? (
        <Tooltip title={t("editor.zen-mode-tooltip", { shortcut })} placement="bottom">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </div>
  );
};

export default ZenModeButton;
