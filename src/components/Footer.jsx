import { FiPhone, FiInstagram, FiGithub, FiHeart } from "react-icons/fi";

function Footer() {
  return (
    <footer className="w-full rounded-2xl border-2 border-slate-900 bg-[#fef08a] dark:bg-slate-900 p-6 shadow-[3px_4px_0px_rgba(15,23,42,1)] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Quote & Brand */}
        <div>
          <p className="text-sm font-black flex items-center justify-center sm:justify-start gap-1.5 text-slate-900 dark:text-slate-100">
            Made with <FiHeart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" /> by Eswar
          </p>
          <p className="mt-1 text-xs font-extrabold text-slate-700 dark:text-slate-400">
            © {new Date().getFullYear()} CHAT-APP E. All rights reserved.
          </p>
        </div>

        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-black">
          {/* Phone Number */}
          <a
            href="tel:7013584577"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            title="Call Eswar"
          >
            <FiPhone className="h-3.5 w-3.5 text-emerald-600" />
            <span>7013584577</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/20_eswar_04"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            title="Instagram: 20_eswar_04"
          >
            <FiInstagram className="h-3.5 w-3.5 text-pink-600" />
            <span>20_eswar_04</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/Eswar-024"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            title="GitHub: Eswar-024"
          >
            <FiGithub className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Eswar-024</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
