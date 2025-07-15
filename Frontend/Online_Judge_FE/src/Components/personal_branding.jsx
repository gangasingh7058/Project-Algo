import { Mail, Github } from "lucide-react";

const PersonalBrandingComponent = () => {
  return (
    <footer
      className="w-full text-purple-400 font-mono border-t-2 border-[#9d4edd] bg-[#240046] px-4 py-4"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        {/* Branding */}
        <div className="text-center sm:text-left text-sm sm:text-base">
          © GANGA SINGH — Built with ❤️ for Coders
        </div>

        {/* Contact Links */}
        <div className="flex items-center space-x-6">
          {/* Email */}
          <a
            href="mailto:gangasingh7058@gmail.com"
            className="flex items-center space-x-1 hover:text-[#9d4edd] transition-colors duration-200"
          >
            <Mail size={18} />
            <span className="underline">gangasingh7058@gmail.com</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/gangasingh7058"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-[#9d4edd] transition-colors duration-200"
          >
            <Github size={18} />
            <span className="underline">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PersonalBrandingComponent;
