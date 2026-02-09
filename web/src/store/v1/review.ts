import { create } from "zustand";
import { combine } from "zustand/middleware";
import { reviewServiceClient } from "@/grpcweb";
import { Memo } from "@/types/proto/api/v1/memo_service";
import {
  GetReviewStatsResponse,
  ListReviewMemosRequest,
  ReviewSource,
} from "@/types/proto/api/v1/review_service";

export type ReviewTab = "review" | "on-this-day" | "time-travel" | "surprise";

interface ReviewSettings {
  includeTags: string[];
  excludeTags: string[];
  pageSize: number;
}

interface OnThisDayData {
  groups: { year: number; memos: Memo[] }[];
  totalCount: number;
}

interface State {
  activeTab: ReviewTab;
  memos: Memo[];
  currentIndex: number;
  isReviewLoading: boolean;
  isOnThisDayLoading: boolean;
  isTimeTravelLoading: boolean;
  isSurpriseLoading: boolean;
  isCompleted: boolean;
  totalCount: number;
  stats: GetReviewStatsResponse | null;
  settings: ReviewSettings;
  onThisDayData: OnThisDayData | null;
  isOnThisDayLoadingMore: boolean;
  timeTravelMemos: Memo[];
  timeTravelTotalCount: number;
  isTimeTravelLoadingMore: boolean;
  timeTravelPeriod: { start: Date | null; end: Date | null };
  surpriseMemo: Memo | null;
}

const getDefaultState = (): State => ({
  activeTab: "review",
  memos: [],
  currentIndex: 0,
  isReviewLoading: false,
  isOnThisDayLoading: false,
  isTimeTravelLoading: false,
  isSurpriseLoading: false,
  isCompleted: false,
  totalCount: 0,
  stats: null,
  settings: {
    includeTags: [],
    excludeTags: [],
    pageSize: 5,
  },
  onThisDayData: null,
  isOnThisDayLoadingMore: false,
  timeTravelMemos: [],
  timeTravelTotalCount: 0,
  isTimeTravelLoadingMore: false,
  timeTravelPeriod: { start: null, end: null },
  surpriseMemo: null,
});

export const useReviewStore = create(
  combine(getDefaultState(), (set, get) => ({
    setActiveTab: (tab: ReviewTab) => set({ activeTab: tab }),

    setSettings: (settings: Partial<ReviewSettings>) =>
      set((state) => ({ settings: { ...state.settings, ...settings } })),

    fetchReviewMemos: async () => {
      const { settings } = get();
      set({ isReviewLoading: true, isCompleted: false, currentIndex: 0 });

      try {
        const request: ListReviewMemosRequest = {
          pageSize: settings.pageSize,
          includeTags: settings.includeTags,
          excludeTags: settings.excludeTags,
        };
        const response = await reviewServiceClient.listReviewMemos(request);
        set({
          memos: response.memos,
          totalCount: response.totalCount,
          isReviewLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch review memos:", error);
        set({ isReviewLoading: false, memos: [] });
      }
    },

    fetchOnThisDayMemos: async () => {
      set({ isOnThisDayLoading: true });
      try {
        const now = new Date();
        const response = await reviewServiceClient.listOnThisDayMemos({
          month: now.getMonth() + 1,
          day: now.getDate(),
          offset: 0,
          pageSize: 10,
        });
        const groups = (response.groups || []).map((g) => ({ year: g.year, memos: g.memos }));
        set({ onThisDayData: { groups, totalCount: response.totalCount }, isOnThisDayLoading: false });
      } catch (error) {
        console.error("Failed to fetch on this day memos:", error);
        set({ isOnThisDayLoading: false, onThisDayData: null });
      }
    },

    loadMoreOnThisDayMemos: async () => {
      const { onThisDayData } = get();
      if (!onThisDayData) return;
      const currentCount = onThisDayData.groups.reduce((sum, g) => sum + g.memos.length, 0);
      if (currentCount >= onThisDayData.totalCount) return;

      set({ isOnThisDayLoadingMore: true });
      try {
        const now = new Date();
        const response = await reviewServiceClient.listOnThisDayMemos({
          month: now.getMonth() + 1,
          day: now.getDate(),
          offset: currentCount,
          pageSize: 10,
        });
        // Merge new groups into existing data
        const existingGroups = [...onThisDayData.groups];
        for (const newGroup of response.groups || []) {
          const existing = existingGroups.find((g) => g.year === newGroup.year);
          if (existing) {
            existing.memos = [...existing.memos, ...newGroup.memos];
          } else {
            existingGroups.push({ year: newGroup.year, memos: newGroup.memos });
          }
        }
        set({
          onThisDayData: { groups: existingGroups, totalCount: response.totalCount },
          isOnThisDayLoadingMore: false,
        });
      } catch (error) {
        console.error("Failed to load more on this day memos:", error);
        set({ isOnThisDayLoadingMore: false });
      }
    },

    setTimeTravelPeriod: (period: { start: Date | null; end: Date | null }) => set({ timeTravelPeriod: period }),

    fetchTimeTravelMemos: async (periodStart?: Date, periodEnd?: Date) => {
      set({ isTimeTravelLoading: true });
      try {
        const response = await reviewServiceClient.getTimeTravelMemos({
          pageSize: 10,
          periodStart: periodStart ?? undefined,
          periodEnd: periodEnd ?? undefined,
          offset: 0,
        });
        set({
          timeTravelMemos: response.memos,
          timeTravelTotalCount: response.totalCount,
          timeTravelPeriod: {
            start: response.periodStart || null,
            end: response.periodEnd || null,
          },
          isTimeTravelLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch time travel memos:", error);
        set({ isTimeTravelLoading: false, timeTravelMemos: [], timeTravelTotalCount: 0 });
      }
    },

    loadMoreTimeTravelMemos: async () => {
      const { timeTravelMemos, timeTravelTotalCount, timeTravelPeriod } = get();
      if (timeTravelMemos.length >= timeTravelTotalCount) return;

      set({ isTimeTravelLoadingMore: true });
      try {
        const response = await reviewServiceClient.getTimeTravelMemos({
          pageSize: 10,
          periodStart: timeTravelPeriod.start ?? undefined,
          periodEnd: timeTravelPeriod.end ?? undefined,
          offset: timeTravelMemos.length,
        });
        set({
          timeTravelMemos: [...timeTravelMemos, ...response.memos],
          timeTravelTotalCount: response.totalCount,
          isTimeTravelLoadingMore: false,
        });
      } catch (error) {
        console.error("Failed to load more time travel memos:", error);
        set({ isTimeTravelLoadingMore: false });
      }
    },

    fetchSurpriseMemo: async () => {
      set({ isSurpriseLoading: true });
      try {
        const response = await reviewServiceClient.getRandomMemo({});
        set({ surpriseMemo: response, isSurpriseLoading: false });
      } catch (error) {
        console.error("Failed to fetch surprise memo:", error);
        set({ isSurpriseLoading: false, surpriseMemo: null });
      }
    },

    fetchStats: async () => {
      try {
        const response = await reviewServiceClient.getReviewStats({});
        set({ stats: response });
      } catch (error) {
        console.error("Failed to fetch review stats:", error);
      }
    },

    nextMemo: () => {
      const { currentIndex, memos } = get();
      if (currentIndex < memos.length - 1) {
        set({ currentIndex: currentIndex + 1 });
      } else {
        set({ isCompleted: true });
      }
    },

    prevMemo: () => {
      const { currentIndex } = get();
      if (currentIndex > 0) {
        set({ currentIndex: currentIndex - 1 });
      }
    },

    recordReview: async (source: ReviewSource = ReviewSource.REVIEW_SOURCE_REVIEW) => {
      const { memos } = get();
      if (memos.length === 0) return;

      try {
        await reviewServiceClient.recordReview({
          memoNames: memos.map((m) => m.name),
          source,
        });
      } catch (error) {
        console.error("Failed to record review:", error);
      }
    },

    completeSession: () => set({ isCompleted: true }),

    reset: () => set(getDefaultState()),
  })),
);
