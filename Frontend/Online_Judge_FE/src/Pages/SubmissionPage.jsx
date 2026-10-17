import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, WifiOff } from "lucide-react";
import axios from "axios";
import getusertoken from "../Helping Functions/getusertoken";
import { Page, PageHeader, Skeleton } from "../Components/ui";
import SubmissionRow from "../Components/SubmissionRow";

const Empty = ({ Icon, title, body, action }) => (
  <div className="card flex flex-col items-center gap-2 px-6 py-20 text-center">
    <Icon size={28} className="text-label-3" />
    <p className="title mt-1 text-lg">{title}</p>
    <p className="max-w-sm text-[0.9375rem] text-label-2">{body}</p>
    {action}
  </div>
);

const SubmissionsPage = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | signedout | error
  const [token] = useState(() => getusertoken());

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  useEffect(() => {
    const getSubmissions = async () => {
      if (!token) {
        setState("signedout");
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_PORT}/user/submission`, {
          headers: { usertoken: token },
        });
        if (response.data.success) {
          setPastSubmissions(response.data.solved || []);
          setState("ready");
        } else {
          setState("error");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setState("error");
      }
    };

    getSubmissions();
  }, [token]);

  return (
    <Page className="pb-16">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          eyebrow="Your work"
          title="Submissions"
          subtitle="Every accepted solution you've submitted, with the code you wrote."
        />

        {state === "loading" && (
          <div className="card divide-y divide-hairline overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {state === "signedout" && (
          <Empty
            Icon={History}
            title="Sign in to see your submissions"
            body="Your accepted solutions are saved to your account so you can revisit them any time."
            action={<Link to="/user/signin" className="btn btn-primary mt-4">Sign in</Link>}
          />
        )}

        {state === "error" && (
          <Empty
            Icon={WifiOff}
            title="Couldn't load submissions"
            body="Something went wrong reaching the server. Check your connection and try again."
            action={<button onClick={() => window.location.reload()} className="btn btn-secondary mt-4">Try again</button>}
          />
        )}

        {state === "ready" && pastSubmissions.length === 0 && (
          <Empty
            Icon={History}
            title="No submissions yet"
            body="Solve a problem and submit it — it will show up here."
            action={<Link to="/home" className="btn btn-primary mt-4">Browse problems</Link>}
          />
        )}

        {state === "ready" && pastSubmissions.length > 0 && (
          <ul className="card overflow-hidden">
            {pastSubmissions.map((sub, index) => (
              <SubmissionRow
                key={index}
                title={sub.problem?.title || `Problem ${index + 1}`}
                date={sub.date}
                language={sub.language}
                code={sub.code}
                expanded={expandedIndex === index}
                onToggle={() => toggleExpand(index)}
              />
            ))}
          </ul>
        )}
      </div>
    </Page>
  );
};

export default SubmissionsPage;
