import { Drawer } from "@mui/joy";
import { Button } from "@usememos/mui";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useSwipeGesture from "@/hooks/useSwipeGesture";
import HomeSidebar from "./HomeSidebar";

const HomeSidebarDrawer = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const toggleDrawer = (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === "keydown" && ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")) {
      return;
    }

    setOpen(inOpen);
  };

  // Add swipe gesture support - swipe left from right edge to open
  useSwipeGesture({
    onSwipeLeft: () => {
      if (!open) {
        setOpen(true);
      }
    },
    trackFromEdge: "right",
  });

  return (
    <>
      <Button variant="plain" className="!bg-transparent px-2" onClick={toggleDrawer(true)}>
        <SearchIcon className="w-5 h-auto dark:text-gray-400" />
      </Button>
      <Drawer anchor="right" size="sm" open={open} onClose={toggleDrawer(false)}>
        <div className="w-full h-full px-4 bg-zinc-100 dark:bg-zinc-900">
          <HomeSidebar className="py-4" />
        </div>
      </Drawer>
    </>
  );
};

export default HomeSidebarDrawer;
