import ProblemsPanel from "../Components/ProblemPanel";
import UserStatsPanel from "../Components/UserPanel";
import ContestsPanel from "../Components/ContestPanel";
import { Page, PageHeader } from "../Components/ui";
import axios from "axios";
import getusertoken from "../Helping Functions/getusertoken";
import { useEffect, useState } from "react";
import toast from '../Helping Functions/toast';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const HomePage = () => {
  const [userdetails, setuserdetails] = useState(null);
  const [profileDone, setProfileDone] = useState(false);
  const [signedIn] = useState(() => !!getusertoken());
  const [problems, setProblems] = useState([]);
  const [problemsState, setProblemsState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    const getuserdetails = async () => {
      const token = getusertoken();
      if (!token) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_PORT}/user/profile`, {
          headers: { usertoken: token },
        });
        if (response.data.success === false) {
          throw new Error(response.data.message);
        }
        setuserdetails(response.data);
      } catch (error) {
        toast.error("Error Fetching User Details");
        console.error(error);
      } finally {
        setProfileDone(true);
      }
    };

    const getProblems = async () => {
      try {
        const problemlist = await axios.get(`${import.meta.env.VITE_BACKEND_PORT}/api/problems`);
        if (problemlist.data.success === false) {
          throw new Error("Problem fetch failed");
        }
        setProblems(Array.isArray(problemlist.data.problems) ? problemlist.data.problems : []);
        setProblemsState("ready");
      } catch {
        setProblemsState("error");
        toast.error("Error Fetching Problem List");
      }
    };

    getuserdetails();
    getProblems();
  }, []);

  const user = userdetails?.user;
  const solved = user?.solved || [];

  return (
    <Page className="pb-16">
      <PageHeader
        eyebrow={user?.firstname ? `${greeting()}, ${user.firstname}` : "Problem set"}
        title="Sharpen your skills."
        subtitle="Pick a problem, write a solution, and run it against real test cases in seconds."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ProblemsPanel problems={problems} state={problemsState} problemssolved={solved} />
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
          <UserStatsPanel
            signedIn={signedIn}
            loading={signedIn && !profileDone}
            firstname={user?.firstname || null}
            lastname={user?.lastname || null}
            solved={solved}
            problems={problems}
          />
          <ContestsPanel />
        </aside>
      </div>
    </Page>
  );
};

export default HomePage;
