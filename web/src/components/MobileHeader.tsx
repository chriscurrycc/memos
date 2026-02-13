import clsx from "clsx";
import useWindowScroll from "react-use/lib/useWindowScroll";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useWorkspaceSettingStore } from "@/store/v1";
import { WorkspaceGeneralSetting } from "@/types/proto/api/v1/workspace_setting_service";
import { WorkspaceSettingKey } from "@/types/proto/store/workspace_setting";
import NavigationDrawer from "./NavigationDrawer";

interface Props {
  className?: string;
  title?: string;
  subTitle?: string;
  // Right-side action buttons in the title bar.
  actions?: React.ReactNode;
  // Below-title content. When provided, the entire header (title + children) becomes one sticky block.
  children?: React.ReactNode;
}

const MobileHeader = (props: Props) => {
  const { className, title, subTitle, actions, children } = props;
  const { sm } = useResponsiveWidth();
  const { y: offsetTop } = useWindowScroll();
  const workspaceSettingStore = useWorkspaceSettingStore();
  const workspaceGeneralSetting =
    workspaceSettingStore.getWorkspaceSettingByKey(WorkspaceSettingKey.GENERAL).generalSetting || WorkspaceGeneralSetting.fromPartial({});

  const titleBar = (
    <div className="pt-3 pb-2 sm:pt-2 px-4 sm:px-6 sm:mb-1 flex flex-row justify-between items-center w-full h-auto flex-nowrap shrink-0">
      <div className="flex flex-row justify-start items-center mr-2 shrink-0 overflow-hidden">
        {!sm && <NavigationDrawer />}
        <div className="flex items-baseline">
          <span
            className="font-bold text-lg leading-10 text-ellipsis shrink-0 cursor-pointer overflow-hidden text-gray-700 dark:text-gray-300"
            onDoubleClick={() => location.reload()}
          >
            {title || workspaceGeneralSetting.customProfile?.title || "Memos"}
          </span>
          {subTitle && <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500 shrink-0">{subTitle}</span>}
        </div>
      </div>
      <div className="flex flex-row justify-end items-center">{actions}</div>
    </div>
  );

  return (
    <div
      className={clsx(
        "sticky top-0 w-full md:hidden bg-zinc-100 dark:bg-zinc-900 bg-opacity-80 backdrop-blur-lg shrink-0 z-10",
        offsetTop > 0 && "shadow-md",
        className,
      )}
    >
      {titleBar}
      {children}
    </div>
  );
};

export default MobileHeader;
