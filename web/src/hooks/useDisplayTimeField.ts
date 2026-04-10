import { useMemo } from "react";
import { useWorkspaceSettingStore } from "@/store/v1";
import { Memo } from "@/types/proto/api/v1/memo_service";
import { WorkspaceMemoRelatedSetting } from "@/types/proto/api/v1/workspace_setting_service";
import { WorkspaceSettingKey } from "@/types/proto/store/workspace_setting";

const useDisplayTimeField = () => {
  const workspaceSettingStore = useWorkspaceSettingStore();
  const memoRelatedSetting = WorkspaceMemoRelatedSetting.fromPartial(
    workspaceSettingStore.getWorkspaceSettingByKey(WorkspaceSettingKey.MEMO_RELATED)?.memoRelatedSetting || {},
  );
  const isUpdateTime = memoRelatedSetting.displayWithUpdateTime;

  return useMemo(
    () => ({
      isUpdateTime,
      orderByField: isUpdateTime ? "update_time" : "create_time",
      getDisplayTime: (memo: Memo) => (isUpdateTime ? memo.updateTime : memo.createTime),
    }),
    [isUpdateTime],
  );
};

export default useDisplayTimeField;
