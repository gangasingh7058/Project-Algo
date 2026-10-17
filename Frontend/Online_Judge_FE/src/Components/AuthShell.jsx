import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Navbar";
import { rise, snappy } from "../Helping Functions/motion";

// Shared layout for sign-in / register: centered card on the ambient canvas
export const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="ambient flex min-h-dvh flex-col items-center justify-center px-4 py-12">
    <motion.div {...rise} className="w-full max-w-[25rem]">
      <Link to="/home" className="focus-ring mx-auto mb-8 flex w-fit rounded-xl" aria-label="CodeArcade home">
        <Logo size="lg" />
      </Link>
      <div className="card p-7 shadow-2xl shadow-black/50 sm:p-8">
        <h1 className="display text-center text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-[0.9375rem] text-label-2">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-[0.9375rem] text-label-2">{footer}</p>}
    </motion.div>
  </div>
);

export const FormError = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={snappy}
        className="overflow-hidden"
      >
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger/12 px-3.5 py-2.5 text-sm text-danger">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {message}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

export const Field = ({ label, id, hint, ...props }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    <input id={id} name={id} className="field" {...props} />
    {hint && <p className="mt-1.5 text-xs text-label-3">{hint}</p>}
  </div>
);
