import { Tooltip as MuiTooltip, TooltipProps } from "@mui/joy";

const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const Tooltip = (props: TooltipProps) => {
  const isTouch = isTouchDevice();
  return <MuiTooltip disableTouchListener disableHoverListener={isTouch} {...props} />;
};

export default Tooltip;
