import Editor from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Skeleton } from "./ui";
import { spring } from "../Helping Functions/motion";
import { defineEditorThemes, editorOptions, toMonacoLanguage } from "../Helping Functions/editor";

const LANGUAGE_LABEL = { python: "Python", javascript: "JavaScript", java: "Java", cpp: "C++" };

const formatDate = (d) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// Disclosure row: a real button header, with the code viewer springing open below it
const SubmissionRow = ({ title, date, language, code, expanded, onToggle, compact = false }) => {
  const lang = toMonacoLanguage(language);
  const lines = String(code || "").split("\n").length;
  const height = Math.min(compact ? 360 : 440, Math.max(140, lines * 22 + 32));

  return (
    <li className="border-b border-hairline last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-4 text-left transition-colors hover:bg-fill focus-visible:bg-fill focus-visible:outline-none active:bg-fill-2 ${
          compact ? "px-4 py-3" : "px-5 py-4 sm:px-6"
        }`}
      >
        <CheckCircle2 size={compact ? 18 : 20} className="shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${compact ? "text-[0.9375rem]" : "text-[1.0625rem] tracking-[-0.012em]"}`}>{title}</p>
          <p className="mt-0.5 text-[0.8125rem] text-label-3">
            {formatDate(date)} · {LANGUAGE_LABEL[lang]}
          </p>
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={spring} className="shrink-0 text-label-3">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className="border-t border-hairline" style={{ height }}>
              <Editor
                height="100%"
                language={lang}
                value={code}
                theme="midnight"
                beforeMount={defineEditorThemes}
                loading={<Skeleton className="m-4 h-[calc(100%-2rem)]" />}
                options={editorOptions(14, { readOnly: true, domReadOnly: true, wordWrap: "on", renderLineHighlight: "none" })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default SubmissionRow;
