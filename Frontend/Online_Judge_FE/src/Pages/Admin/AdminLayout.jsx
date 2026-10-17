import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, ListChecks, Lock, Plus, Tags } from "lucide-react";
import { Page, Segmented, Skeleton } from "../../Components/ui";
import { checkAdmin } from "../../Helping Functions/admin";
import getusertoken from "../../Helping Functions/getusertoken";

// Guards every /admin route and provides the shared header + section switcher
const AdminLayout = () => {
  const [state, setState] = useState("loading"); // loading | ok | signedout | forbidden
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!getusertoken()) return setState("signedout");
    checkAdmin().then((ok) => setState(ok ? "ok" : "forbidden"));
  }, []);

  if (state === "loading") {
    return (
      <Page className="pb-16 pt-14">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-12 w-64" />
        <Skeleton className="mt-10 h-64 w-full rounded-2xl" />
      </Page>
    );
  }

  if (state !== "ok") {
    return (
      <Page className="pb-16">
        <div className="card mx-auto mt-16 flex max-w-md flex-col items-center gap-2 px-6 py-14 text-center">
          <Lock size={28} className="text-label-3" />
          <p className="title mt-1 text-lg">{state === "signedout" ? "Sign in to continue" : "Admins only"}</p>
          <p className="text-[0.9375rem] text-label-2">
            {state === "signedout"
              ? "The admin console is available to administrators after signing in."
              : "Your account doesn't have access to the admin console."}
          </p>
          <Link to={state === "signedout" ? "/user/signin" : "/home"} className="btn btn-primary mt-4">
            {state === "signedout" ? "Sign in" : "Back to problems"}
          </Link>
        </div>
      </Page>
    );
  }

  const section = pathname.startsWith("/admin/problems") ? "problems" : pathname.startsWith("/admin/tags") ? "tags" : "overview";
  const TITLES = { overview: "Overview", problems: "Problems", tags: "Tags" };
  const editing = /^\/admin\/problems\/.+/.test(pathname);

  return (
    <Page className="pb-16">
      {!editing && (
        <header className="flex flex-col gap-5 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
          <div>
            <p className="eyebrow mb-2">Admin</p>
            <h1 className="display text-4xl sm:text-5xl">{TITLES[section]}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Admin section"
              value={section}
              onChange={(v) => navigate(v === "overview" ? "/admin" : `/admin/${v}`)}
              options={[
                { value: "overview", label: "Overview", Icon: BarChart3 },
                { value: "problems", label: "Problems", Icon: ListChecks },
                { value: "tags", label: "Tags", Icon: Tags },
              ]}
            />
            <Link to="/admin/problems/new" className="btn btn-primary btn-sm">
              <Plus size={15} /> New problem
            </Link>
          </div>
        </header>
      )}
      <Outlet />
    </Page>
  );
};

export default AdminLayout;
