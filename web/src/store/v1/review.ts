import { create } from "zustand";
import { combine } from "zustand/middleware";
import { reviewServiceClient } from "@/grpcweb";
import { Memo } from "@/types/proto/api/v1/memo_service";
import {
  GetReviewStatsResponse,
  ListOnThisDayMemosResponse,
  ListReviewMemosRequest,
  ReviewSource,
} from "@/types/proto/api/v1/review_service";

export type ReviewTab = "review" | "on-this-day" | "time-travel" | "surprise";

interface ReviewSettings {
  includeTags: string[];
  excludeTags: string[];
  pageSize: number;
}

interface State {
  activeTab: ReviewTab;
  memos: Memo[];
  currentIndex: number;
  isLoading: boolean;
  isCompleted: boolean;
  totalCount: number;
  stats: GetReviewStatsResponse | null;
  settings: ReviewSettings;
  onThisDayData: ListOnThisDayMemosResponse | null;
  timeTravelMemos: Memo[];
  timeTravelPeriod: { start: Date | null; end: Date | null };
  surpriseMemo: Memo | null;
}

const getDefaultState = (): State => ({
  activeTab: "review",
  memos: [],
  currentIndex: 0,
  isLoading: false,
  isCompleted: false,
  totalCount: 0,
  stats: null,
  settings: {
    includeTags: [],
    excludeTags: [],
    pageSize: 5,
  },
  onThisDayData: null,
  timeTravelMemos: [],
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
      set({ isLoading: true, isCompleted: false, currentIndex: 0 });

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
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch review memos:", error);
        set({ isLoading: false, memos: [] });
      }
    },

    fetchOnThisDayMemos: async () => {
      set({ isLoading: true });
      try {
        const now = new Date();
        const response = await reviewServiceClient.listOnThisDayMemos({
          month: now.getMonth() + 1,
          day: now.getDate(),
        });
        set({ onThisDayData: response, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch on this day memos:", error);
        set({ isLoading: false, onThisDayData: null });
      }
    },

    fetchTimeTravelMemos: async () => {
      set({ isLoading: true });
      try {
        const response = await reviewServiceClient.getTimeTravelMemos({ pageSize: 10 });
        set({
          timeTravelMemos: response.memos,
          timeTravelPeriod: {
            start: response.periodStart || null,
            end: response.periodEnd || null,
          },
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch time travel memos:", error);
        set({ isLoading: false, timeTravelMemos: [] });
      }
    },

    fetchSurpriseMemo: async () => {
      set({ isLoading: true });
      try {
        const response = await reviewServiceClient.getRandomMemo({});
        set({ surpriseMemo: response, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch surprise memo:", error);
        set({ isLoading: false, surpriseMemo: null });
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

    reset: () => set(getDefaultState()),
  })),
);
