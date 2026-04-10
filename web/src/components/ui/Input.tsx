import clsx from "clsx";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}

const sizeStyles = {
  sm: "text-sm px-2 py-1 h-8",
  md: "text-base px-3 py-2 h-9",
  lg: "text-lg px-4 py-2 h-11",
};

const Input = ({ size = "md", className, disabled = false, fullWidth = false, startDecorator, endDecorator, ...rest }: Props) => {
  return (
    <div
      className={clsx(
        "flex items-center box-border border rounded-md shadow-sm",
        "focus-within:ring-1 focus-within:ring-primary focus-within:border-primary",
        "dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700",
        "dark:focus-within:ring-primary-darker dark:focus-within:border-primary-darker",
        sizeStyles[size],
        disabled && "cursor-not-allowed opacity-50",
        fullWidth && "w-full",
        className,
      )}
    >
      {startDecorator && <div className="mr-2 shrink-0">{startDecorator}</div>}
      <input disabled={disabled} className="focus:outline-none w-full h-full grow bg-transparent" {...rest} />
      {endDecorator && <div className="ml-2 shrink-0">{endDecorator}</div>}
    </div>
  );
};

export default Input;
