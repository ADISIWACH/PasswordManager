const Footer = () => {
  return (
    <footer className="mt-12 bg-[#06191c]/90 border-t border-[#12544F]/60 backdrop-blur-xl py-6 px-4 text-center">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Crafted with</span>
          <span className="text-red-400 animate-pulse">❤️</span>
          <span>by</span>
          <strong className="text-[#34d399] font-extrabold hover:text-emerald-200 transition-colors cursor-pointer">
            Aditya Siwach
          </strong>
        </div>

        <div className="text-slate-400 text-[11px] flex items-center gap-3">
          <span>Private Local Encryption</span>
          <span>•</span>
          <span>Zero Knowledge</span>
          <span>•</span>
          <span>{new Date().getFullYear()} PassVault</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
