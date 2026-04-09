import clsx from "clsx";
import { CheckIcon } from "lucide-react";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const boxSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const Checkbox = ({ size = "md", checked = false, className, disabled = false, onChange, label, ...rest }: Props) => {
  const enabled = !disabled;

  return (
    <label className={clsx("flex items-center gap-2", enabled && "cursor-pointer hover:opacity-80")}>
      <div
        className={clsx(
          "relative flex items-center justify-center border rounded",
          boxSizes[size],
          checked
            ? "bg-primary border-primary dark:bg-primary-darker dark:border-primary-darker"
            : "bg-white border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600",
          className,
        )}
      >
        {checked && <CheckIcon className="text-zinc-50 dark:text-zinc-200" />}
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => enabled && onChange?.(e)}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer"
          {...rest}
        />
      </div>
      {label && <span className={clsx("text-zinc-900 dark:text-zinc-200 select-none", `text-${size}`)}>{label}</span>}
    </label>
  );
};

export default Checkbox;
