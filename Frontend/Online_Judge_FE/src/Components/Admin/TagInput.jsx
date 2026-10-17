import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { snappy } from "../../Helping Functions/motion";

// Token field: Enter or comma adds, Backspace on empty removes the last tag,
// and existing tags are suggested so the same topic isn't created twice.
const TagInput = ({ value, onChange, suggestions = [], id }) => {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listId = useId();

  const has = (t) => value.some((v) => v.toLowerCase() === t.toLowerCase());

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    return suggestions
      .filter((s) => !has(s.name) && (!q || s.name.toLowerCase().includes(q)))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, suggestions, value]);

  const add = (t) => {
    const tag = t.trim().replace(/,$/, "");
    if (tag && !has(tag)) onChange([...value, tag]);
    setText("");
    setHighlight(0);
  };

  const exact = matches.find((m) => m.name.toLowerCase() === text.trim().toLowerCase());
  const showCreate = text.trim() && !exact && !has(text.trim());
  const options = [...matches.map((m) => ({ name: m.name, count: m.problems })), ...(showCreate ? [{ name: text.trim(), create: true }] : [])];
  const open = focused && options.length > 0;

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (open && options[highlight]) add(options[highlight].name);
      else if (text.trim()) add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    } else if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border bg-fill px-2 py-1.5 transition-[border-color,box-shadow] ${
          focused ? "border-accent shadow-[0_0_0_4px_rgb(10_132_255/0.22)]" : "border-transparent"
        }`}
        onClick={() => document.getElementById(id)?.focus()}
      >
        <AnimatePresence initial={false}>
          {value.map((t) => (
            <motion.span
              key={t}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={snappy}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-fill-2 pl-2.5 pr-1 text-[0.8125rem] font-medium"
            >
              {t}
              <button
                type="button"
                aria-label={`Remove ${t}`}
                onClick={(e) => { e.stopPropagation(); onChange(value.filter((v) => v !== t)); }}
                className="focus-ring grid h-5 w-5 place-items-center rounded-full text-label-2 hover:bg-fill-2 hover:text-label"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={text}
          onChange={(e) => { setText(e.target.value); setHighlight(0); }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder={value.length ? "" : "Add a topic, e.g. Arrays"}
          className="h-7 min-w-[8rem] flex-1 bg-transparent px-1 text-[0.9375rem] placeholder:text-label-3 focus:outline-none"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={snappy}
            style={{ transformOrigin: "top left" }}
            className="glass absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-hairline p-1 shadow-2xl shadow-black/60"
          >
            {options.map((o, i) => (
              <li
                key={`${o.name}-${o.create ? "new" : "existing"}`}
                role="option"
                aria-selected={i === highlight}
                onPointerDown={(e) => { e.preventDefault(); add(o.name); }}
                onPointerEnter={() => setHighlight(i)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm ${i === highlight ? "bg-fill-2" : ""}`}
              >
                {o.create ? (
                  <span className="flex items-center gap-1.5"><Plus size={14} className="text-accent" /> Create “{o.name}”</span>
                ) : (
                  <>
                    <span>{o.name}</span>
                    <span className="text-xs text-label-3">{o.count} {o.count === 1 ? "problem" : "problems"}</span>
                  </>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagInput;
