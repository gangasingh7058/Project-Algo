import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { subscribe, dismiss } from '../Helping Functions/toast';

const STYLES = {
  success: { color: '#22c55e', Icon: CheckCircle2 },
  error: { color: '#ef4444', Icon: XCircle },
  warning: { color: '#f59e0b', Icon: AlertTriangle },
  info: { color: '#22d3ee', Icon: Info },
};

const ToastItem = ({ id, type, message, duration }) => {
  const { color, Icon } = STYLES[type] || STYLES.info;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const startedAt = useRef(0);

  // Auto-dismiss timer; pauses while hovered and resumes with the time that was left
  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => dismiss(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => dismiss(id)}
      role={type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto relative w-80 max-w-[calc(100vw-2rem)] cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 text-zinc-100 shadow-xl backdrop-blur"
      style={{ boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 12px ${color}33` }}
    >
      <div className="flex items-start gap-3 p-3 pr-8">
        <Icon size={20} style={{ color }} className="mt-0.5 shrink-0" />
        <p className="text-sm leading-snug break-words">{message}</p>
      </div>
      <button
        aria-label="Dismiss"
        className="absolute right-2 top-2 text-zinc-400 hover:text-white"
        onClick={(e) => { e.stopPropagation(); dismiss(id); }}
      >
        <X size={14} />
      </button>
      {/* countdown bar */}
      <div className="h-0.5 w-full bg-white/5">
        <div
          className="toast-progress h-full"
          style={{
            background: color,
            animationDuration: `${duration}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </motion.div>
  );
};

const Toaster = () => {
  const [items, setItems] = useState([]);
  useEffect(() => subscribe(setItems), []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
