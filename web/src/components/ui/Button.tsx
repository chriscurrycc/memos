import clsx from "clsx";
import { forwardRef } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  variant?: "plain" | "outlined" | "contained";
  fullWidth?: boolean;
}

const colorStyles = {
  default: {
    contained: "bg-zinc-300 text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-200",
    outlined: "border border-zinc-200 text-zinc-900 shadow-sm dark:border-zinc-700 dark:text-zinc-200",
    plain: "bg-transparent text-zinc-900 dark:text-zinc-200",
  },
  primary: {
    contained: "bg-primary text-zinc-50 shadow-sm dark:bg-primary-darker dark:text-zinc-200",
    outlined: "border border-primary text-primary shadow-sm dark:border-primary-darker dark:text-primary-darker",
    plain: "bg-transparent text-primary dark:text-primary-darker",
  },
  success: {
    contained: "bg-success text-zinc-50 shadow-sm dark:bg-success-darker dark:text-zinc-200",
    outlined: "border border-success text-success shadow-sm dark:border-success-darker dark:text-success-darker",
    plain: "bg-transparent text-success dark:text-success-darker",
  },
  warning: {
    contained: "bg-warning text-zinc-50 shadow-sm dark:bg-warning-darker dark:text-zinc-200",
    outlined: "border border-warning text-warning shadow-sm dark:border-warning-darker dark:text-warning-darker",
    plain: "bg-transparent text-warning dark:text-warning-darker",
  },
  error: {
    contained: "bg-error text-zinc-50 shadow-sm dark:bg-error-darker dark:text-zinc-200",
    outlined: "border border-error text-error shadow-sm dark:border-error-darker dark:text-error-darker",
    plain: "bg-transparent text-error dark:text-error-darker",
  },
};

const sizeStyles = {
  sm: "text-sm px-2 py-1 h-8",
  md: "text-sm px-3 py-2 h-9",
  lg: "text-base px-4 py-2 h-11",
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, color = "default", size = "md", variant = "contained", disabled = false, fullWidth = false, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "box-border inline-flex items-center justify-center rounded-md",
          colorStyles[color][variant],
          sizeStyles[size],
          disabled ? "opacity-60 cursor-not-allowed shadow-none" : "cursor-pointer hover:opacity-80",
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
