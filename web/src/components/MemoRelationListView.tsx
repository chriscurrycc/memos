import clsx from "clsx";
import { LinkIcon, MilestoneIcon } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { MemoRelation } from "@/types/proto/api/v1/memo_relation_service";
import { Memo } from "@/types/proto/api/v1/memo_service";

interface Props {
  memo: Memo;
  relations: MemoRelation[];
  parentPage?: string;
}

const MemoRelationListView = (props: Props) => {
  const { memo, relations: relationList, parentPage } = props;
  const referencingMemoList = relationList
    .filter((relation) => relation.memo?.name === memo.name && relation.relatedMemo?.name !== memo.name)
    .map((relation) => relation.relatedMemo!);
  const referencedMemoList = relationList
    .filter((relation) => relation.memo?.name !== memo.name && relation.relatedMemo?.name === memo.name)
    .map((relation) => relation.memo!);
  const [selectedTab, setSelectedTab] = useState<"referencing" | "referenced">(
    referencingMemoList.length === 0 ? "referenced" : "referencing",
  );

  if (referencingMemoList.length + referencedMemoList.length === 0) {
    return null;
  }

  return (
    <div className="relative flex flex-col justify-start items-start w-full px-2 pt-2 pb-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
      <div className="w-full flex flex-row justify-start items-center mb-1 gap-3">
        {referencingMemoList.length > 0 && (
          <button
            className={clsx(
              "w-auto flex flex-row justify-start items-center text-xs gap-0.5",
              selectedTab === "referencing" ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600",
            )}
            onClick={() => setSelectedTab("referencing")}
          >
            <LinkIcon className="w-3 h-auto shrink-0" />
            <span>Referencing</span>
            <span>({referencingMemoList.length})</span>
          </button>
        )}
        {referencedMemoList.length > 0 && (
          <button
            className={clsx(
              "w-auto flex flex-row justify-start items-center text-xs gap-0.5",
              selectedTab === "referenced" ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600",
            )}
            onClick={() => setSelectedTab("referenced")}
          >
            <MilestoneIcon className="w-3 h-auto shrink-0" />
            <span>Referenced by</span>
            <span>({referencedMemoList.length})</span>
          </button>
        )}
      </div>
      {selectedTab === "referencing" && referencingMemoList.length > 0 && (
        <div className="w-full flex flex-col justify-start items-start">
          {referencingMemoList.map((memo, index) => {
            return (
              <Link
                key={memo.name}
                className="w-auto max-w-full flex flex-row justify-start items-center text-xs leading-5 text-gray-600 dark:text-gray-400 dark:border-zinc-700 dark:bg-zinc-900 hover:text-gray-900 dark:hover:text-gray-200"
                to={`/m/${memo.uid}`}
                viewTransition
                state={{
                  from: parentPage,
                }}
              >
                {referencingMemoList.length > 1 && <span className="opacity-60 mr-1 shrink-0">{index + 1}.</span>}
                <span className="truncate">{memo.snippet}</span>
              </Link>
            );
          })}
        </div>
      )}
      {selectedTab === "referenced" && referencedMemoList.length > 0 && (
        <div className="w-full flex flex-col justify-start items-start">
          {referencedMemoList.map((memo, index) => {
            return (
              <Link
                key={memo.name}
                className="w-auto max-w-full flex flex-row justify-start items-center text-xs leading-5 text-gray-600 dark:text-gray-400 dark:border-zinc-700 dark:bg-zinc-900 hover:text-gray-900 dark:hover:text-gray-200"
                to={`/m/${memo.uid}`}
                viewTransition
                state={{
                  from: parentPage,
                }}
              >
                {referencedMemoList.length > 1 && <span className="opacity-60 mr-1 shrink-0">{index + 1}.</span>}
                <span className="truncate">{memo.snippet}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default memo(MemoRelationListView);
