import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { Skeleton, Spinner } from "../../Components/ui";
import { adminApi, apiError } from "../../Helping Functions/admin";
import { snappy, spring } from "../../Helping Functions/motion";
import toast from "../../Helping Functions/toast";

const TagRow = ({ tag, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  // Delete is two-step: the first press arms it, and it disarms itself after a few seconds
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  const save = async () => {
    const next = name.trim();
    if (!next || next === tag.name) { setEditing(false); setName(tag.name); return; }
    setBusy(true);
    const ok = await onRename(tag, next);
    setBusy(false);
    if (ok) setEditing(false);
  };

  const used = tag.problems > 0;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={spring}
      className="overflow-hidden"
    >
      <div className="flex min-h-14 items-center gap-3 border-b border-hairline px-5 py-2 sm:px-6">
        {editing ? (
          <>
            <label htmlFor={`tag-${tag.id}`} className="sr-only">Tag name</label>
            <input
              id={`tag-${tag.id}`}
              ref={inputRef}
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") { setEditing(false); setName(tag.name); }
              }}
              className="field h-9 flex-1 text-[0.9375rem]"
            />
            <button className="btn btn-primary btn-icon h-9 w-9" aria-label="Save name" onClick={save} disabled={busy}>
              {busy ? <Spinner className="h-3.5 w-3.5" /> : <Check size={16} />}
            </button>
            <button className="btn btn-ghost btn-icon h-9 w-9" aria-label="Cancel" onClick={() => { setEditing(false); setName(tag.name); }}>
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">{tag.name}</span>
            <span className={`text-[0.8125rem] tabular-nums ${used ? "text-label-2" : "text-label-3"}`}>
              {used ? `${tag.problems} ${tag.problems === 1 ? "problem" : "problems"}` : "Unused"}
            </span>
            <button className="btn btn-ghost btn-icon h-8 w-8" aria-label={`Rename ${tag.name}`} onClick={() => setEditing(true)}>
              <Pencil size={14} />
            </button>
            {confirming ? (
              <button className="btn btn-sm h-8 bg-danger/15 text-danger hover:bg-danger/25" onClick={() => onDelete(tag)}>
                Delete?
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-icon h-8 w-8 hover:!text-danger"
                aria-label={used ? `${tag.name} is used by problems and can't be deleted` : `Delete ${tag.name}`}
                title={used ? "Remove it from its problems first" : "Delete"}
                disabled={used}
                onClick={() => setConfirming(true)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </motion.li>
  );
};

const AdminTags = () => {
  const [tags, setTags] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    adminApi()
      .get("/tags")
      .then((r) => { setTags(r.data.tags); setError(""); })
      .catch((e) => setError(apiError(e, "Couldn't load tags")));
  }, [reloadKey]);

  const sorted = (list) => [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tags || []).filter((t) => !q || t.name.toLowerCase().includes(q));
  }, [tags, query]);

  const create = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError("");
    try {
      const r = await adminApi().post("/tags", { name });
      setTags((t) => sorted([...(t || []), r.data.tag]));
      setNewName("");
      toast.success(`Added "${r.data.tag.name}"`);
    } catch (err) {
      setCreateError(apiError(err, "Couldn't add the tag"));
    } finally {
      setCreating(false);
    }
  };

  const rename = async (tag, name) => {
    try {
      await adminApi().patch(`/tags/${tag.id}`, { name });
      setTags((t) => sorted(t.map((x) => (x.id === tag.id ? { ...x, name } : x))));
      toast.success(`Renamed to "${name}"`);
      return true;
    } catch (err) {
      toast.error(apiError(err, "Couldn't rename the tag"));
      return false;
    }
  };

  const remove = async (tag) => {
    try {
      await adminApi().delete(`/tags/${tag.id}`);
      setTags((t) => t.filter((x) => x.id !== tag.id));
      toast.success(`Deleted "${tag.name}"`);
    } catch (err) {
      toast.error(apiError(err, "Couldn't delete the tag"));
    }
  };

  if (error && !tags) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
        <p className="title text-lg">Couldn't load tags</p>
        <p className="text-sm text-label-2">{error}</p>
        <button className="btn btn-secondary btn-sm mt-3" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="card overflow-hidden lg:order-1">
        <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-5 py-3.5 sm:px-6">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-label-3" />
            <label htmlFor="tag-search" className="sr-only">Search tags</label>
            <input
              id="tag-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tags"
              className="field h-9 pl-9 text-[0.9375rem]"
            />
          </div>
          {tags && <p className="text-[0.8125rem] text-label-3 sm:ml-auto">{tags.length} tags</p>}
        </div>

        {!tags ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-hairline px-6 py-4">
                <Skeleton className="h-4 w-40" /><Skeleton className="ml-auto h-3 w-16" />
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-label-3">{tags.length ? "No tags match" : "No tags yet — add the first one."}</p>
        ) : (
          <ul className="-mb-px">
            <AnimatePresence initial={false}>
              {shown.map((t) => <TagRow key={t.id} tag={t} onRename={rename} onDelete={remove} />)}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <aside className="lg:order-2">
        <form onSubmit={create} className="card p-5 sm:p-6 lg:sticky lg:top-20">
          <h2 className="title text-lg">New tag</h2>
          <p className="mt-1 text-[0.8125rem] text-label-2">
            Tags group problems by topic. You can also create one straight from the problem editor.
          </p>
          <label htmlFor="new-tag" className="label mt-5">Name</label>
          <input
            id="new-tag"
            value={newName}
            maxLength={40}
            onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
            placeholder="e.g. Sliding Window"
            aria-invalid={!!createError}
            className={`field ${createError ? "!border-danger" : ""}`}
          />
          <AnimatePresence initial={false}>
            {createError && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={snappy}
                className="overflow-hidden pt-1.5 text-[0.8125rem] text-danger"
              >
                {createError}
              </motion.p>
            )}
          </AnimatePresence>
          <button type="submit" className="btn btn-primary mt-4 w-full" disabled={creating || !newName.trim()}>
            {creating ? <Spinner /> : <Plus size={16} />} Add tag
          </button>
          <p className="mt-4 text-xs leading-relaxed text-label-3">
            Tags in use can be renamed but not deleted — remove them from their problems first.
          </p>
        </form>
      </aside>
    </div>
  );
};

export default AdminTags;
