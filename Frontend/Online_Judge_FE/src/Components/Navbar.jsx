import { useEffect, useState } from "react";
import { Code2, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import getusertoken from "../Helping Functions/getusertoken";
import { snappy } from "../Helping Functions/motion";

const Options = [
  { name: "Problems", route: "/home" },
  { name: "Compiler", route: "/compiler" },
  { name: "Submissions", route: "/user/submissions" },
];

export const Logo = ({ size = "md" }) => (
  <span className={`flex items-center gap-2.5 ${size === "lg" ? "text-xl" : "text-[1.0625rem]"}`}>
    <span
      className={`grid place-items-center rounded-[0.6rem] bg-gradient-to-br from-accent to-ai text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] ${
        size === "lg" ? "h-11 w-11 rounded-xl" : "h-7 w-7"
      }`}
    >
      <Code2 size={size === "lg" ? 22 : 16} strokeWidth={2.5} />
    </span>
    <span className="title">CodeArcade</span>
  </span>
);

const RetroNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [token, settoken] = useState(() => getusertoken());
  const [scrolled, setScrolled] = useState(false);

  // Scroll edge effect: the divider only appears once content slides under the bar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [pathname]);

  const HandleLogOut = () => {
    localStorage.removeItem("token");
    settoken(null);
    navigate("/user/signin");
  };

  const wide = pathname.startsWith("/home/problem");

  const isActive = (route) => (route === "/home" ? pathname === "/home" || pathname.startsWith("/home/") : pathname.startsWith(route));

  return (
    <nav
      className={`glass sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled || isMobileMenuOpen ? "border-hairline" : "border-transparent"
      }`}
    >
      <div className={`mx-auto flex h-14 items-center justify-between px-4 sm:px-6 ${wide ? "max-w-[1680px]" : "max-w-7xl"}`}>
        <Link to="/home" className="focus-ring rounded-lg" aria-label="CodeArcade home">
          <Logo />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {Options.map((option) => {
            const active = isActive(option.route);
            return (
              <NavLink
                key={option.route}
                to={option.route}
                aria-current={active ? "page" : undefined}
                className={`focus-ring relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active ? "text-label" : "text-label-2 hover:text-label"
                }`}
              >
                {active && (
                  <motion.span layoutId="nav-pill" transition={snappy} className="absolute inset-0 rounded-full bg-fill-2" />
                )}
                <span className="relative">{option.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {token ? (
            <button className="btn btn-ghost btn-sm" onClick={HandleLogOut}>
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/user/signin")}>
              Sign in
            </button>
          )}
          <button
            className="btn btn-ghost btn-icon md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((o) => !o)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu: grows down from the bar, collapses back the same way */}
      <AnimatePresence initial={false}>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={snappy}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-0.5 px-3 pb-3">
              {Options.map((option) => (
                <NavLink
                  key={option.route}
                  to={option.route}
                  className={`rounded-xl px-3 py-2.5 text-[1.0625rem] font-medium ${
                    isActive(option.route) ? "bg-fill-2 text-label" : "text-label-2 active:bg-fill"
                  }`}
                >
                  {option.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default RetroNavbar;
