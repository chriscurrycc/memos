import { Memo, Visibility } from "@/types/proto/api/v1/memo_service";

const MAX_TEXT_LENGTH = 250;

const useShareToX = () => {
  const shareToX = (memo: Memo) => {
    const content = memo.content || "";
    const text = content.length > MAX_TEXT_LENGTH ? content.substring(0, MAX_TEXT_LENGTH) + "..." : content;
    const isPublic = memo.visibility === Visibility.PUBLIC;
    const tweetText = isPublic ? `${text}\n\n${window.location.origin}/m/${memo.uid}` : text;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    const width = 550;
    const height = 400;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
    window.open(xUrl, "share-to-x", `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`);
  };

  return shareToX;
};

export default useShareToX;
