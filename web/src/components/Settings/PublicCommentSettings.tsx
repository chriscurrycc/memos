import { Switch, Select, Option } from "@mui/joy";
import { isEqual } from "lodash-es";
import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { workspaceSettingNamePrefix, useWorkspaceSettingStore } from "@/store/v1";
import { WorkspacePublicCommentSetting } from "@/types/proto/api/v1/workspace_setting_service";
import { WorkspaceSettingKey } from "@/types/proto/store/workspace_setting";
import { useTranslate } from "@/utils/i18n";

const PublicCommentSettings = () => {
  const t = useTranslate();
  const workspaceSettingStore = useWorkspaceSettingStore();
  const originalSetting = WorkspacePublicCommentSetting.fromPartial(
    workspaceSettingStore.getWorkspaceSettingByKey(WorkspaceSettingKey.PUBLIC_COMMENT)?.publicCommentSetting || {},
  );
  const [setting, setSetting] = useState<WorkspacePublicCommentSetting>(originalSetting);

  const updatePartialSetting = (partial: Partial<WorkspacePublicCommentSetting>) => {
    setSetting(WorkspacePublicCommentSetting.fromPartial({ ...setting, ...partial }));
  };

  const updateSetting = async () => {
    try {
      await workspaceSettingStore.setWorkspaceSetting({
        name: `${workspaceSettingNamePrefix}${WorkspaceSettingKey.PUBLIC_COMMENT}`,
        publicCommentSetting: setting,
      });
    } catch (error: any) {
      toast.error(error.details);
      console.error(error);
      return;
    }
    toast.success(t("message.update-succeed"));
  };

  return (
    <div className="w-full flex flex-col gap-2 pt-2 pb-4">
      <p className="font-medium text-gray-700 dark:text-gray-500">{t("setting.public-comment-settings.title")}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("setting.public-comment-settings.guide")}{" "}
        <a
          href="https://giscus.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline"
        >
          giscus.app
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </p>
      <div className="w-full flex flex-row justify-between items-center">
        <span>{t("setting.public-comment-settings.enable")}</span>
        <Switch checked={setting.enabled} onChange={(event) => updatePartialSetting({ enabled: event.target.checked })} />
      </div>
      {setting.enabled && (
        <div className="w-full flex flex-col gap-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
          <div className="w-full flex flex-row justify-between items-center">
            <span>{t("setting.public-comment-settings.giscus-repo")}</span>
            <Input
              className="w-64"
              placeholder="owner/repo"
              value={setting.repo}
              onChange={(event) => updatePartialSetting({ repo: event.target.value })}
            />
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span>{t("setting.public-comment-settings.giscus-repo-id")}</span>
            <Input
              className="w-64"
              placeholder="R_xxxxxxxxxx"
              value={setting.repoId}
              onChange={(event) => updatePartialSetting({ repoId: event.target.value })}
            />
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span>{t("setting.public-comment-settings.giscus-category")}</span>
            <Input
              className="w-64"
              placeholder="Announcements"
              value={setting.category}
              onChange={(event) => updatePartialSetting({ category: event.target.value })}
            />
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span>{t("setting.public-comment-settings.giscus-category-id")}</span>
            <Input
              className="w-64"
              placeholder="DIC_xxxxxxxxxx"
              value={setting.categoryId}
              onChange={(event) => updatePartialSetting({ categoryId: event.target.value })}
            />
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span>{t("setting.public-comment-settings.giscus-theme")}</span>
            <Select
              className="!min-w-fit"
              value={setting.theme || "preferred_color_scheme"}
              onChange={(_, value) => updatePartialSetting({ theme: value || "preferred_color_scheme" })}
            >
              <Option value="preferred_color_scheme">System</Option>
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
              <Option value="dark_dimmed">Dark Dimmed</Option>
              <Option value="transparent_dark">Transparent Dark</Option>
            </Select>
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span>{t("setting.public-comment-settings.giscus-lang")}</span>
            <Select
              className="!min-w-fit"
              value={setting.lang || "en"}
              onChange={(_, value) => updatePartialSetting({ lang: value || "en" })}
            >
              <Option value="en">English</Option>
              <Option value="zh-CN">简体中文</Option>
              <Option value="zh-TW">繁體中文</Option>
              <Option value="ja">日本語</Option>
              <Option value="ko">한국어</Option>
              <Option value="fr">Français</Option>
              <Option value="de">Deutsch</Option>
              <Option value="es">Español</Option>
            </Select>
          </div>
        </div>
      )}
      <div className="mt-2 w-full flex justify-end">
        <Button color="primary" disabled={isEqual(setting, originalSetting)} onClick={updateSetting}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
};

export default PublicCommentSettings;
