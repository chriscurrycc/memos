import dayjs from "dayjs";
import { uniqueId } from "lodash-es";
import { Location } from "react-router-dom";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { memoServiceClient } from "@/grpcweb";
import { Routes } from "@/router";
import { Memo, MemoView } from "@/types/proto/api/v1/memo_service";
import { User } from "@/types/proto/api/v1/user_service";

// Set the maximum number of memos to fetch.
const DEFAULT_MEMO_PAGE_SIZE = 1000000;

interface MemoStats {
  link: number;
  taskList: number;
  code: number;
  incompleteTasks: number;
}

export interface TagTreeNode {
  key: string;
  text: string;
  amount: number;
  subTags: TagTreeNode[];
}

interface State {
  // stateId is used to identify the store instance state.
  // It should be update when any state change.
  stateId: string;
  initialized: boolean;
  dataMapByName: Record<string, Memo>;

  // Pre-calculated values
  tagCounts: Record<string, number>;
  sortedTags: [string, number][];
  tagTree: TagTreeNode[];
  stats: MemoStats;
  activityStats: Record<string, number>;
  memoCount: number;
  days: number;
}

const getDefaultState = (): State => ({
  stateId: uniqueId(),
  initialized: false,
  dataMapByName: {},
  tagCounts: {},
  sortedTags: [],
  tagTree: [],
  stats: { link: 0, taskList: 0, code: 0, incompleteTasks: 0 },
  activityStats: {},
  memoCount: 0,
  days: 0,
});

// Build tag tree structure from sorted tag amounts
const buildTagTree = (sortedTagAmounts: [string, number][]): TagTreeNode[] => {
  const tagAmountMap = new Map(sortedTagAmounts);
  const root: TagTreeNode = { key: "", text: "", amount: 0, subTags: [] };

  for (const [tagName] of sortedTagAmounts) {
    const subtags = tagName.split("/");
    let currentNode = root;
    let tagText = "";

    for (let i = 0; i < subtags.length; i++) {
      const key = subtags[i];
      tagText = i === 0 ? key : tagText + "/" + key;

      let childNode = currentNode.subTags.find((t) => t.text === tagText);
      if (!childNode) {
        const nodeAmount = tagAmountMap.get(tagText) || 0;
        childNode = { key, text: tagText, amount: nodeAmount > 1 ? nodeAmount : 0, subTags: [] };
        currentNode.subTags.push(childNode);
      }
      currentNode = childNode;
    }
  }

  return root.subTags;
};

export const useMemoMetadataStore = create(
  combine(getDefaultState(), (set, get) => ({
    setState: (state: State) => set(state),
    getState: () => get(),
    fetchMemoMetadata: async (params: { user?: User; location?: Location<any> }) => {
      const filters = [`row_status == "NORMAL"`];
      if (params.user) {
        if (params.location?.pathname === Routes.EXPLORE) {
          filters.push(`visibilities == ["PUBLIC", "PROTECTED"]`);
        }
        filters.push(`creator == "${params.user.name}"`);
      } else {
        filters.push(`visibilities == ["PUBLIC"]`);
      }
      const { memos, nextPageToken } = await memoServiceClient.listMemos({
        filter: filters.join(" && "),
        view: MemoView.MEMO_VIEW_METADATA_ONLY,
        pageSize: DEFAULT_MEMO_PAGE_SIZE,
      });

      // Pre-calculate all derived values in a single pass
      const memoMap: Record<string, Memo> = {};
      const tagCounts: Record<string, number> = {};
      const activityStats: Record<string, number> = {};
      const stats: MemoStats = { link: 0, taskList: 0, code: 0, incompleteTasks: 0 };
      let earliestTime = Date.now();

      for (const memo of memos) {
        memoMap[memo.name] = memo;

        // Tag counts
        for (const tag of memo.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }

        // Activity stats
        const dateKey = dayjs(memo.displayTime).format("YYYY-MM-DD");
        activityStats[dateKey] = (activityStats[dateKey] || 0) + 1;

        // Memo stats
        const { property, createTime } = memo;
        if (createTime && createTime.getTime() < earliestTime) {
          earliestTime = createTime.getTime();
        }
        if (property?.hasLink) stats.link += 1;
        if (property?.hasTaskList) stats.taskList += 1;
        if (property?.hasCode) stats.code += 1;
        if (property?.hasIncompleteTasks) stats.incompleteTasks += 1;
      }

      const days = memos.length > 0 ? Math.ceil((Date.now() - earliestTime) / 86400000) : 0;

      // Pre-calculate sorted tags (by amount desc, then name asc)
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .sort((a, b) => b[1] - a[1]) as [string, number][];

      // Pre-calculate tag tree (alphabetically sorted for tree view)
      const alphabeticallySortedTags = Object.entries(tagCounts).sort((a, b) => a[0].localeCompare(b[0])) as [string, number][];
      const tagTree = buildTagTree(alphabeticallySortedTags);

      set({
        stateId: uniqueId(),
        initialized: true,
        dataMapByName: memoMap,
        tagCounts,
        sortedTags,
        tagTree,
        stats,
        activityStats,
        memoCount: memos.length,
        days,
      });
      return { memos, nextPageToken };
    },
  })),
);

export const useMemoTagList = () => {
  const memoStore = useMemoMetadataStore();
  return memoStore.getState().tagCounts;
};

export const useSortedTags = () => {
  const memoStore = useMemoMetadataStore();
  return memoStore.getState().sortedTags;
};

export const useTagTree = () => {
  const memoStore = useMemoMetadataStore();
  return memoStore.getState().tagTree;
};

export const useMemoMetadataInitialized = () => {
  return useMemoMetadataStore((state) => state.initialized);
};
