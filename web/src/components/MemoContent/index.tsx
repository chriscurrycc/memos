import clsx from "clsx";
import { memo, useEffect, useRef, useState } from "react";
import { PhotoProvider } from "react-photo-view";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMemoStore } from "@/store/v1";
import { Node, NodeType } from "@/types/proto/api/v1/markdown_service";
import { useTranslate } from "@/utils/i18n";
import { isSuperUser } from "@/utils/user";
import Renderer from "./Renderer";
import { RendererContext } from "./types";

// MAX_DISPLAY_HEIGHT is the maximum height of the memo content to display in compact mode.
const MAX_DISPLAY_HEIGHT = 256;

interface Props {
  nodes: Node[];
  memoName?: string;
  compact?: boolean;
  readonly?: boolean;
  disableFilter?: boolean;
  // embeddedMemos is a set of memo resource names that are embedded in the current memo.
  // This is used to prevent infinite loops when a memo embeds itself.
  embeddedMemos?: Set<string>;
  className?: string;
  contentClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  parentPage?: string;
}

type ContentCompactView = "ALL" | "SNIPPET";

const MemoContent: React.FC<Props> = (props: Props) => {
  const { className, contentClassName, nodes, memoName, embeddedMemos, onClick, onDoubleClick } = props;
  const t = useTranslate();
  const currentUser = useCurrentUser();
  const memoStore = useMemoStore();
  const memoContentContainerRef = useRef<HTMLDivElement>(null);
  const [showCompactMode, setShowCompactMode] = useState<ContentCompactView | undefined>(undefined);
  const memo = memoName ? memoStore.getMemoByName(memoName) : null;
  const allowEdit = !props.readonly && memo && (currentUser?.name === memo.creator || isSuperUser(currentUser));

  // Initial compact mode.
  useEffect(() => {
    if (!props.compact) {
      return;
    }
    if (!memoContentContainerRef.current) {
      return;
    }

    if ((memoContentContainerRef.current as HTMLDivElement).getBoundingClientRect().height > MAX_DISPLAY_HEIGHT) {
      setShowCompactMode("ALL");
    }
  }, []);

  const handleMemoContentClick = async (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleMemoContentDoubleClick = async (e: React.MouseEvent) => {
    if (onDoubleClick) {
      onDoubleClick(e);
    }
  };

  let prevNode: Node | null = null;
  let skipNextLineBreakFlag = false;
  const compactStates = {
    ALL: { text: t("memo.show-more"), nextState: "SNIPPET" },
    SNIPPET: { text: t("memo.show-less"), nextState: "ALL" },
  };

  return (
    <RendererContext.Provider
      value={{
        nodes,
        memoName: memoName,
        readonly: !allowEdit,
        disableFilter: props.disableFilter,
        embeddedMemos: embeddedMemos || new Set(),
        parentPage: props.parentPage,
      }}
    >
      <PhotoProvider>
        <div
          className={`prose prose-base prose-neutral max-w-none dark:prose-invert 
          prose-p:my-0 prose-blockquote:my-1.5 prose-pre:my-1.5 
          prose-ol:my-1.5 prose-ol:ps-0 prose-ul:my-1.5 prose-ul:ps-0 prose-li:my-1 
          prose-h1:mb-2 prose-h1:mt-3 
          prose-h2:mb-2 prose-h2:mt-2.5 
          prose-h3:mb-1.5 prose-h3:mt-2 
          prose-h4:mb-1 prose-h4:mt-1.5 
          prose-img:m-0 
          [&_li_p]:my-0 
          [&_dl]:my-1.5 
          [&_pre_code]:text-[#24292e] dark:[&_pre_code]:text-[#abb2bf]
          w-full flex flex-col justify-start items-start ${className || ""}`}
        >
          <div
            ref={memoContentContainerRef}
            className={clsx(
              "relative w-full max-w-full word-break whitespace-pre-wrap",
              showCompactMode == "ALL" && "line-clamp-6 max-h-60",
              contentClassName,
            )}
            onClick={handleMemoContentClick}
            onDoubleClick={handleMemoContentDoubleClick}
          >
            {nodes.map((node, index) => {
              if (prevNode?.type !== NodeType.LINE_BREAK && node.type === NodeType.LINE_BREAK && skipNextLineBreakFlag) {
                skipNextLineBreakFlag = false;
                return null;
              }
              prevNode = node;
              skipNextLineBreakFlag = true;
              return <Renderer key={`${node.type}-${index}`} index={String(index)} node={node} />;
            })}
            {showCompactMode == "ALL" && (
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-b from-transparent dark:to-zinc-800 to-white pointer-events-none"></div>
            )}
          </div>
          {showCompactMode != undefined && (
            <div className="w-full mt-1">
              <span
                className="w-auto flex flex-row justify-start items-center cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:opacity-80"
                onClick={() => {
                  setShowCompactMode(compactStates[showCompactMode].nextState as ContentCompactView);
                }}
              >
                {compactStates[showCompactMode].text}
              </span>
            </div>
          )}
        </div>
      </PhotoProvider>
    </RendererContext.Provider>
  );
};

export default memo(MemoContent);
