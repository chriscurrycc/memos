import { Drawer } from "@mui/joy";
import { Button } from "@usememos/mui";
import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useSwipeGesture from "@/hooks/useSwipeGesture";
import Navigation from "./Navigation";

const NavigationDrawer = () => {
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

  // Add swipe gesture support - swipe right from left edge to open
  useSwipeGesture({
    onSwipeRight: () => {
      if (!open) {
        setOpen(true);
      }
    },
    trackFromEdge: "left",
  });

  return (
    <>
      <Button variant="plain" className="!bg-transparent px-2" onClick={toggleDrawer(true)}>
        <MenuIcon className="w-5 h-auto dark:text-gray-400" />
      </Button>
      <Drawer anchor="left" size="sm" open={open} onClose={toggleDrawer(false)}>
        <div className="w-full h-full overflow-auto px-4 bg-zinc-100 dark:bg-zinc-900">
          <Navigation />
        </div>
      </Drawer>
    </>
  );
};

export default NavigationDrawer;
