import clsx from "clsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import UserStatisticsView from "@/components/UserStatisticsView";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMemoMetadataStore, useMemoStore } from "@/store/v1";
import TagsSection from "./TagsSection";

interface Props {
  className?: string;
  onCloseHomeSidebarDrawer?: () => void;
}

const HomeSidebar = (props: Props) => {
  const location = useLocation();
  const user = useCurrentUser();
  const memoMetadataStore = useMemoMetadataStore();
  const mutationVersion = useMemoStore((state) => state.mutationVersion);

  useEffect(() => {
    memoMetadataStore.fetchMemoMetadata({ user, location });
  }, [user, location.pathname, mutationVersion]);

  return (
    <aside
      className={clsx(
        "relative w-full h-auto max-h-screen overflow-auto hide-scrollbar flex flex-col justify-start items-start",
        props.className,
      )}
    >
      <SearchBar />
      <UserStatisticsView onCloseHomeSidebarDrawer={props.onCloseHomeSidebarDrawer} />
      <TagsSection onTagClick={props.onCloseHomeSidebarDrawer} />
    </aside>
  );
};

export default HomeSidebar;
