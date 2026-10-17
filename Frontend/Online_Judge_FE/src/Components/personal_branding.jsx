import { Mail, Github } from "lucide-react";

const PersonalBrandingComponent = () => {
  return (
    <footer className="border-t border-hairline bg-canvas px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[0.8125rem] text-label-3 sm:flex-row">
        <p>© {new Date().getFullYear()} Ganga Singh · Built for coders</p>

        <div className="flex items-center gap-5">
          <a
            href="mailto:gangasingh7058@gmail.com"
            className="focus-ring flex items-center gap-1.5 rounded transition-colors hover:text-label"
          >
            <Mail size={14} />
            <span>gangasingh7058@gmail.com</span>
          </a>
          <a
            href="https://github.com/gangasingh7058"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring flex items-center gap-1.5 rounded transition-colors hover:text-label"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PersonalBrandingComponent;
