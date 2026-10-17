import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, SlidersHorizontal, Check } from 'lucide-react';
import RetroNavbar from './Navbar';
import { rise, snappy } from '../Helping Functions/motion';
import { EDITOR_THEMES, FONT_SIZES } from '../Helping Functions/editor';

// Page shell: translucent nav + content that rises in on mount
export const Page = ({ children, className = '', wide = false }) => (
  <div className="ambient min-h-dvh">
    <RetroNavbar />
    <motion.main {...rise} className={`mx-auto w-full px-4 sm:px-6 ${wide ? 'max-w-[1680px]' : 'max-w-7xl'} ${className}`}>
      {children}
    </motion.main>
  </div>
);

export const PageHeader = ({ eyebrow, title, subtitle, children }) => (
  <header className="flex flex-col gap-4 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
    <div>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="display text-4xl sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-label-2">{subtitle}</p>}
    </div>
    {children}
  </header>
);

export const Spinner = ({ className = 'h-4 w-4' }) => (
  <span
    aria-hidden="true"
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
  />
);

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} />;

const DIFFICULTY = {
  Easy: 'text-success bg-success/12',
  Medium: 'text-warning bg-warning/12',
  Hard: 'text-danger bg-danger/12',
};

export const DifficultyBadge = ({ level }) => (
  <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${DIFFICULTY[level] || 'bg-fill text-label-2'}`}>
    {level}
  </span>
);

export const Tag = ({ children }) => (
  <span className="inline-flex h-6 items-center rounded-full bg-fill px-2.5 text-xs font-medium text-label-2">
    {children}
  </span>
);

// iOS-style segmented control with a sliding selection pill
export const Segmented = ({ options, value, onChange, size = 'md', label }) => {
  const id = useId();
  const h = size === 'sm' ? 'h-7 text-[0.8125rem]' : 'h-8 text-sm';
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-[0.6rem] bg-fill p-0.5">
      {options.map(({ value: v, label: l, Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={`focus-ring relative flex items-center gap-1.5 rounded-lg px-3.5 font-medium transition-colors ${h} ${
              active ? 'text-label' : 'text-label-2 hover:text-label'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={snappy}
                className="absolute inset-0 rounded-lg bg-surface-3 shadow-[0_1px_2px_rgb(0_0_0/0.4)]"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon size={14} />}
              {l}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Popover for advanced editor options — kept one level deeper than the main controls
export const EditorSettings = ({ fontSize, setFontSize, theme, setTheme }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const idx = FONT_SIZES.indexOf(fontSize);
  const step = (d) => setFontSize(FONT_SIZES[Math.min(FONT_SIZES.length - 1, Math.max(0, idx + d))]);

  return (
    <div ref={ref} className="relative">
      <button
        className="btn btn-ghost btn-icon"
        aria-label="Editor settings"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <SlidersHorizontal size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={snappy}
            style={{ transformOrigin: 'top right' }}
            className="glass absolute right-0 top-full z-30 mt-2 w-60 rounded-2xl border border-hairline p-3 shadow-2xl shadow-black/60"
          >
            <p className="eyebrow px-1 pb-2">Font size</p>
            <div className="flex items-center justify-between rounded-xl bg-fill p-1">
              <button className="btn btn-ghost btn-icon h-8 w-8" aria-label="Smaller" disabled={idx <= 0} onClick={() => step(-1)}>
                <Minus size={14} />
              </button>
              <span className="text-sm font-medium tabular-nums">{fontSize}px</span>
              <button className="btn btn-ghost btn-icon h-8 w-8" aria-label="Larger" disabled={idx >= FONT_SIZES.length - 1} onClick={() => step(1)}>
                <Plus size={14} />
              </button>
            </div>
            <p className="eyebrow px-1 pb-1 pt-4">Theme</p>
            <div role="radiogroup" aria-label="Editor theme">
              {EDITOR_THEMES.map((t) => (
                <button
                  key={t.value}
                  role="radio"
                  aria-checked={theme === t.value}
                  onClick={() => setTheme(t.value)}
                  className="focus-ring flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-label hover:bg-fill"
                >
                  {t.label}
                  {theme === t.value && <Check size={15} className="text-accent" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const ModKey = () => <span className="kbd">{isMac ? '⌘' : 'Ctrl'} ↵</span>;
