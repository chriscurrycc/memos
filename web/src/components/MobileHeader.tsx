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
  children?: React.ReactNode;
}

const MobileHeader = (props: Props) => {
  const { className, title, subTitle, children } = props;
  const { sm } = useResponsiveWidth();
  const { y: offsetTop } = useWindowScroll();
  const workspaceSettingStore = useWorkspaceSettingStore();
  const workspaceGeneralSetting =
    workspaceSettingStore.getWorkspaceSettingByKey(WorkspaceSettingKey.GENERAL).generalSetting || WorkspaceGeneralSetting.fromPartial({});

  return (
    <div
      className={clsx(
        "sticky top-0 pt-3 pb-2 sm:pt-2 px-4 sm:px-6 sm:mb-1 bg-zinc-100 dark:bg-zinc-900 bg-opacity-80 backdrop-blur-lg flex md:hidden flex-row justify-between items-center w-full h-auto flex-nowrap shrink-0 z-1",
        offsetTop > 0 && "shadow-md",
        className,
      )}
    >
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
      <div className="flex flex-row justify-end items-center">{children}</div>
    </div>
  );
};

export default MobileHeader;
