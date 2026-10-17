import { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import getusertoken from "../Helping Functions/getusertoken";
import SubmissionRow from "./SubmissionRow";

const PastsubmissionModule = ({ pastSubmissions }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [token] = useState(() => getusertoken());

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!pastSubmissions || pastSubmissions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <History size={26} className="text-label-3" />
        <p className="font-medium">{token ? "No submissions yet" : "Sign in to see your submissions"}</p>
        <p className="text-sm text-label-2">
          {token ? "Pass all test cases and submit to see your solution here." : "Your accepted solutions are saved to your account."}
        </p>
        {!token && <Link to="/user/signin" className="btn btn-primary btn-sm mt-3">Sign in</Link>}
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-hairline">
      {pastSubmissions.map((submission, index) => (
        <SubmissionRow
          key={index}
          title={`Submission ${index + 1}`}
          date={submission.date}
          language={submission.language}
          code={submission.code}
          expanded={expandedIndex === index}
          onToggle={() => toggleExpand(index)}
          compact
        />
      ))}
    </ul>
  );
};

export default PastsubmissionModule;
