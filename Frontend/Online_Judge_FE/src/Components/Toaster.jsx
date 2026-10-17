import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { subscribe, dismiss } from '../Helping Functions/toast';
import { spring } from '../Helping Functions/motion';

const STYLES = {
  success: { color: '#30d158', Icon: CheckCircle2 },
  error: { color: '#ff453a', Icon: XCircle },
  warning: { color: '#ff9f0a', Icon: AlertTriangle },
  info: { color: '#0a84ff', Icon: Info },
};

const ToastItem = ({ id, type, message, duration }) => {
  const { color, Icon } = STYLES[type] || STYLES.info;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const startedAt = useRef(0);

  // Auto-dismiss timer; pauses while hovered or dragged and resumes with the time that was left
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
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.96 }}
      transition={spring}
      // Swipe right to dismiss: tracks 1:1, rubber-bands to the left, decides on velocity
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.08, right: 0.9 }}
      onDragStart={() => setPaused(true)}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80 || info.velocity.x > 500) dismiss(id);
        else setPaused(false);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role={type === 'error' ? 'alert' : 'status'}
      className="glass pointer-events-auto relative w-[22rem] max-w-[calc(100vw-2rem)] cursor-grab touch-pan-y overflow-hidden rounded-2xl border border-hairline text-label shadow-2xl shadow-black/60 active:cursor-grabbing"
    >
      <div className="flex items-start gap-3 py-3.5 pl-4 pr-11">
        <Icon size={20} style={{ color }} className="mt-px shrink-0" />
        <p className="text-[0.9375rem] leading-snug break-words">{message}</p>
      </div>
      <button
        aria-label="Dismiss"
        className="btn btn-ghost btn-icon absolute right-1.5 top-1.5 h-8 w-8"
        onClick={() => dismiss(id)}
      >
        <X size={15} />
      </button>
      <div className="h-0.5 w-full">
        <div
          className="toast-progress h-full opacity-70"
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
