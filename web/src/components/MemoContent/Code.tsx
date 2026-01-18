interface Props {
  content: string;
}

const Code: React.FC<Props> = ({ content }: Props) => {
  return (
    <code className="inline break-all px-1 py-0.5 font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
      {content}
    </code>
  );
};

export default Code;
