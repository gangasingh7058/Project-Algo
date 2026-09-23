// Tiny toast store, usable from anywhere (components, helpers, axios handlers).
//   toast.success("Saved")  toast.error("Oops")  toast.warning("Careful")  toast.info("FYI")
// Rendering is done by <Toaster /> (mounted once in App.jsx).

const DEFAULT_DURATION = { success: 3000, info: 3000, warning: 3500, error: 4500 };
const MAX_TOASTS = 4;

let toasts = [];
let nextId = 1;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l(toasts));

export const subscribe = (listener) => {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
};

export const dismiss = (id) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

const show = (type, message, options = {}) => {
  const text = typeof message === 'string' ? message : String(message?.message ?? message ?? '');
  if (!text) return null;

  const id = nextId++;
  const duration = options.duration ?? DEFAULT_DURATION[type];
  toasts = [...toasts, { id, type, message: text, duration }].slice(-MAX_TOASTS);
  emit();
  return id;
};

const toast = (message, options) => show('info', message, options);
toast.success = (m, o) => show('success', m, o);
toast.error = (m, o) => show('error', m, o);
toast.warning = (m, o) => show('warning', m, o);
toast.info = (m, o) => show('info', m, o);
toast.dismiss = dismiss;

export default toast;
