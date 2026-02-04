import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from "@mui/joy";
import { Button, Input } from "@usememos/mui";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { memoServiceClient } from "@/grpcweb";
import useCurrentUser from "@/hooks/useCurrentUser";
import useLoading from "@/hooks/useLoading";
import { useMemoMetadataStore } from "@/store/v1";
import { useTranslate } from "@/utils/i18n";

interface Props {
  open: boolean;
  tag: string;
  onClose: () => void;
}

const RenameTagDialog = ({ open, tag, onClose }: Props) => {
  const t = useTranslate();
  const memoMetadataStore = useMemoMetadataStore();
  const [newName, setNewName] = useState(tag);
  const requestState = useLoading(false);
  const user = useCurrentUser();

  const handleTagNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value.trim());
  };

  const handleConfirm = async () => {
    if (!newName || newName.includes(" ")) {
      toast.error("Tag name cannot be empty or contain spaces");
      return;
    }
    if (newName === tag) {
      toast.error("New name cannot be the same as the old name");
      return;
    }

    try {
      await memoServiceClient.renameMemoTag({
        parent: "memos/-",
        oldTag: tag,
        newTag: newName,
      });
      toast.success("Rename tag successfully");
      memoMetadataStore.fetchMemoMetadata({ user });
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ top: "15vh", transform: "translateX(-50%)" }}>
        <ModalClose />
        <DialogTitle>Rename tag</DialogTitle>
        <DialogContent>
          <div className="w-full flex flex-col justify-start items-start gap-3 pt-2">
            <div className="relative w-full flex flex-row justify-start items-center gap-2">
              <span className="w-20 text-sm whitespace-nowrap shrink-0 text-right">Old Name</span>
              <Input className="w-full" readOnly disabled type="text" value={tag} />
            </div>
            <div className="relative w-full flex flex-row justify-start items-center gap-2">
              <span className="w-20 text-sm whitespace-nowrap shrink-0 text-right">New Name</span>
              <Input className="w-full" type="text" placeholder="A new tag name" value={newName} onChange={handleTagNameInputChange} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-2">All your memos with this tag will be updated.</p>
          </div>
          <div className="w-full flex flex-row justify-end items-center gap-2 mt-4">
            <Button variant="plain" disabled={requestState.isLoading} onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button color="primary" disabled={requestState.isLoading} onClick={handleConfirm}>
              {t("common.confirm")}
            </Button>
          </div>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default RenameTagDialog;
