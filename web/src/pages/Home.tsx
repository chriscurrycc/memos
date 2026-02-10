import dayjs from "dayjs";
import { SquarePenIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { HomeSidebar, HomeSidebarDrawer } from "@/components/HomeSidebar";
import MemoEditor from "@/components/MemoEditor";
import ZenModeEditorDialog from "@/components/MemoEditor/ZenModeEditorDialog";
import MemoFilters from "@/components/MemoFilters";
import MemoView from "@/components/MemoView";
import MobileHeader from "@/components/MobileHeader";
import PagedMemoList from "@/components/PagedMemoList";
import PinnedMemoList from "@/components/PinnedMemoList";
import PinnedMemosDrawer from "@/components/PinnedMemosDrawer";
import ResizableSplitter from "@/components/ResizableSplitter";
import useCurrentUser from "@/hooks/useCurrentUser";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useMemoFilterStore } from "@/store/v1";
import { RowStatus } from "@/types/proto/api/v1/common";
import { Memo } from "@/types/proto/api/v1/memo_service";

const Home = () => {
  const { md } = useResponsiveWidth();
  const user = useCurrentUser();
  const memoFilterStore = useMemoFilterStore();
  const mobileScrollContainerRef = useRef<HTMLElement>(null);
  const [mobileFabZenMode, setMobileFabZenMode] = useState(false);

  const memoRenderer = useCallback(
    (memo: Memo) => <MemoView key={`${memo.name}-${memo.displayTime}`} memo={memo} showVisibility showPinned showExport enableCollapse />,
    [],
  );

  const editorSection = useMemo(
    () => (
      <>
        <MemoEditor className="mb-2" cacheKey="home-memo-editor" enableZenMode />
        <MemoFilters />
      </>
    ),
    [],
  );

  const listSort = useCallback(
    (memos: Memo[]) =>
      memos
        .filter((memo) => memo.rowStatus === RowStatus.ACTIVE && !memo.pinned)
        .sort((a, b) =>
          memoFilterStore.orderByTimeAsc
            ? dayjs(a.displayTime).unix() - dayjs(b.displayTime).unix()
            : dayjs(b.displayTime).unix() - dayjs(a.displayTime).unix(),
        ),
    [memoFilterStore.orderByTimeAsc],
  );

  const memoListFilter = useMemo(() => {
    const filters = [`creator == "${user.name}"`, `row_status == "NORMAL"`, `order_by_pinned == true`];
    const contentSearch: string[] = [];
    const tagSearch: string[] = [];
    for (const filter of memoFilterStore.filters) {
      if (filter.factor === "contentSearch") {
        contentSearch.push(`"${filter.value}"`);
      } else if (filter.factor === "tagSearch") {
        tagSearch.push(`"${filter.value}"`);
      } else if (filter.factor === "property.hasLink") {
        filters.push(`has_link == true`);
      } else if (filter.factor === "property.hasTaskList") {
        filters.push(`has_task_list == true`);
      } else if (filter.factor === "property.hasCode") {
        filters.push(`has_code == true`);
      } else if (filter.factor === "displayTime") {
        const filterDate = new Date(filter.value);
        const filterUtcTimestamp = filterDate.getTime() + filterDate.getTimezoneOffset() * 60 * 1000;
        const timestampAfter = filterUtcTimestamp / 1000;
        filters.push(`display_time_after == ${timestampAfter}`);
        filters.push(`display_time_before == ${timestampAfter + 60 * 60 * 24}`);
      }
    }
    if (memoFilterStore.orderByTimeAsc) {
      filters.push(`order_by_time_asc == true`);
    }
    if (contentSearch.length > 0) {
      filters.push(`content_search == [${contentSearch.join(", ")}]`);
    }
    if (tagSearch.length > 0) {
      filters.push(`tag_search == [${tagSearch.join(", ")}]`);
    }
    return filters.join(" && ");
  }, [user, memoFilterStore.filters, memoFilterStore.orderByTimeAsc]);

  return (
    <section ref={mobileScrollContainerRef} className="@container w-full h-screen overflow-y-auto md:overflow-visible md:flex md:flex-col">
      {!md && (
        <div className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900">
          <MobileHeader>
            <PinnedMemosDrawer renderer={memoRenderer} />
            <HomeSidebarDrawer />
          </MobileHeader>
          <div className="px-4 pb-1">
            <MemoFilters />
          </div>
        </div>
      )}
      <div className="w-full flex flex-row justify-start items-start md:flex-1 md:min-h-0">
        <div className="hidden md:flex flex-shrink-0 w-64 h-full px-4 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <HomeSidebar className="py-6" />
        </div>
        <div className="flex-1 flex px-4 md:px-6 pb-4 md:pb-0 md:pt-3 md:h-full lg:pt-6 overflow-x-hidden">
          <div id="timeline-panel" className="lg:w-1/2 flex-grow flex flex-col min-w-0 md:h-full md:overflow-y-auto">
            {md && <div className="shrink-0">{editorSection}</div>}
            <PagedMemoList
              renderer={memoRenderer}
              listSort={listSort}
              filter={memoListFilter}
              scrollContainerRef={!md ? mobileScrollContainerRef : undefined}
            />
          </div>
          <ResizableSplitter />
          <div id="pinned-panel" className="hidden lg:flex lg:w-1/2 flex-col h-full overflow-y-auto">
            <PinnedMemoList renderer={memoRenderer} />
          </div>
        </div>
      </div>
      <div className="hidden md:block lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-20">
        <PinnedMemosDrawer anchor="right" renderer={memoRenderer} />
      </div>
      {!md && (
        <>
          <ZenModeEditorDialog
            open={mobileFabZenMode}
            onOpenChange={setMobileFabZenMode}
            editorProps={{
              cacheKey: "home-memo-editor",
              enableZenMode: true,
            }}
          />
          <button
            onClick={() => setMobileFabZenMode(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 p-3 bg-primary rounded-full shadow-lg active:scale-95 transition-transform"
            aria-label="New memo"
          >
            <SquarePenIcon className="w-5 h-5 text-white" />
          </button>
        </>
      )}
    </section>
  );
};

export default Home;
