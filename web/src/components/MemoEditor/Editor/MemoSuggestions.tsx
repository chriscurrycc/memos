import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useDebounce from "react-use/lib/useDebounce";
import getCaretCoordinates from "textarea-caret";
import { memoServiceClient } from "@/grpcweb";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Memo, MemoView } from "@/types/proto/api/v1/memo_service";
import { EditorRefActions } from ".";

type Props = {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  editorActions: React.ForwardedRef<EditorRefActions>;
};

type Position = { left: number; top: number; height: number };

const MemoSuggestions = ({ editorRef, editorActions }: Props) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [selected, select] = useState(0);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const [searchText, setSearchText] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const memosRef = useRef<Memo[]>([]);
  memosRef.current = memos;
  const user = useCurrentUser();
  const positionRef = useRef(position);
  positionRef.current = position;

  const hide = () => setPosition(null);

  const isVisibleRef = useRef(false);
  isVisibleRef.current = !!(position && memos.length > 0);

  useDebounce(
    async () => {
      if (!positionRef.current || !user) return;
      try {
        const filters = [`creator == "${user.name}"`, `row_status == "NORMAL"`];
        if (searchText) {
          filters.push(`content_search == [${JSON.stringify(searchText)}]`);
        }
        const { memos: fetchedMemos } = await memoServiceClient.listMemos({
          pageSize: 8,
          filter: filters.join(" && "),
          view: MemoView.MEMO_VIEW_FULL,
        });
        setMemos(fetchedMemos);
      } catch {
        setMemos([]);
      }
    },
    300,
    [searchText, position !== null],
  );

  const getCurrentWord = (): [word: string, startIndex: number] => {
    const editor = editorRef.current;
    if (!editor) return ["", 0];
    const cursorPos = editor.selectionEnd;
    const before = editor.value.slice(0, cursorPos).match(/\S*$/) || { 0: "", index: cursorPos };
    const after = editor.value.slice(cursorPos).match(/^\S*/) || { 0: "" };
    return [before[0] + after[0], before.index ?? cursorPos];
  };

  const autocomplete = (memo: Memo) => {
    if (!editorActions || !("current" in editorActions) || !editorActions.current) return;
    const [word, index] = getCurrentWord();
    editorActions.current.removeText(index, word.length);
    editorActions.current.insertText(`![[memos/${memo.uid}]]`);
    hide();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isVisibleRef.current) return;
    const suggestions = memosRef.current;
    const sel = selectedRef.current;
    if (["Escape", "ArrowLeft", "ArrowRight"].includes(e.code)) hide();
    if ("ArrowDown" === e.code) {
      select((sel + 1) % suggestions.length);
      e.preventDefault();
      e.stopPropagation();
    }
    if ("ArrowUp" === e.code) {
      select((sel - 1 + suggestions.length) % suggestions.length);
      e.preventDefault();
      e.stopPropagation();
    }
    if (["Enter", "Tab"].includes(e.code)) {
      autocomplete(suggestions[sel]);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;

    select(0);
    const [word, index] = getCurrentWord();
    const currentChar = editor.value[editor.selectionEnd];
    const isActive = word.startsWith("@") && currentChar !== "@";

    if (isActive) {
      setSearchText(word.slice(1));
      const caretCoords = getCaretCoordinates(editor, index);
      const rect = editor.getBoundingClientRect();
      setPosition({
        left: rect.left + caretCoords.left,
        top: rect.top + caretCoords.top - editor.scrollTop,
        height: caretCoords.height,
      });
    } else {
      hide();
    }
  };

  const listenersAreRegisteredRef = useRef(false);
  const registerListeners = () => {
    const editor = editorRef.current;
    if (!editor || listenersAreRegisteredRef.current) return;
    editor.addEventListener("click", hide);
    editor.addEventListener("blur", hide);
    editor.addEventListener("keydown", handleKeyDown);
    editor.addEventListener("input", handleInput);
    listenersAreRegisteredRef.current = true;
  };
  useEffect(registerListeners, [!!editorRef.current]);

  if (!isVisibleRef.current || !position) return null;
  return createPortal(
    <div
      className="z-[9999] p-1 mt-1 -ml-2 fixed max-w-[18rem] max-h-56 gap-px rounded flex flex-col justify-start items-start overflow-y-auto shadow bg-zinc-100 dark:bg-zinc-700"
      style={{ left: position.left, top: position.top + position.height }}
    >
      {memos.map((memo, i) => (
        <div
          key={memo.name}
          onMouseDown={() => autocomplete(memo)}
          className={clsx(
            "rounded p-1 px-2 w-full text-sm dark:text-gray-300 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 shrink-0",
            i === selected ? "bg-zinc-300 dark:bg-zinc-600" : "",
          )}
        >
          <p className="text-xs text-gray-400 select-none">{memo.createTime?.toLocaleString()}</p>
          <p className="text-sm leading-4 line-clamp-2">{memo.snippet || memo.content.slice(0, 80)}</p>
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default MemoSuggestions;
