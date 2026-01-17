import { Node } from "@/types/proto/api/v1/markdown_service";
import Renderer from "./Renderer";
import { BaseProps } from "./types";

interface Props extends BaseProps {
  children: Node[];
}

const Blockquote: React.FC<Props> = ({ children }: Props) => {
  return (
    <blockquote className="not-italic pl-3 border-l-2 border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-serif font-normal [&>p]:before:content-none [&>p]:after:content-none">
      {children.map((child, index) => (
        <Renderer key={`${child.type}-${index}`} index={String(index)} node={child} />
      ))}
    </blockquote>
  );
};

export default Blockquote;
