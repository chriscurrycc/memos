import { useMemo, ReactNode } from "react";

interface StableMasonryProps {
  items: { key: string; node: ReactNode }[];
}

// Splits items into two columns by index (even → left, odd → right).
// Existing items never change columns when new items are appended.
const StableMasonry = ({ items }: StableMasonryProps) => {
  const [left, right] = useMemo(() => {
    const l: typeof items = [];
    const r: typeof items = [];
    items.forEach((item, i) => (i % 2 === 0 ? l : r).push(item));
    return [l, r];
  }, [items]);

  return (
    <>
      {/* Single column on mobile */}
      <div className="flex flex-col gap-3 lg:hidden">
        {items.map((item) => (
          <div key={item.key}>{item.node}</div>
        ))}
      </div>
      {/* Two columns on desktop */}
      <div className="hidden lg:flex gap-3">
        <div className="flex-1 flex flex-col gap-3">
          {left.map((item) => (
            <div key={item.key}>{item.node}</div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {right.map((item) => (
            <div key={item.key}>{item.node}</div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StableMasonry;
