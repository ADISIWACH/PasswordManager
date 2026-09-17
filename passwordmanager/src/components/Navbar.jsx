const Navbar = ({ currentUser, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#092328]/85 backdrop-blur-xl border-b border-[#12544F]/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-4 sm:px-6 lg:px-8 py-3.5 gap-3">
        {/* Brand Logo */}
        <div className="logo font-extrabold text-xl sm:text-2xl flex items-center gap-2.5 tracking-tight group cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#12544F] via-[#2A835F] to-[#34d399] p-[1.5px] shadow-lg shadow-[#2A835F]/30 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#092328] rounded-[10px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#34d399] group-hover:text-emerald-300 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <span className="text-white font-bold">
            <span className="text-[#2A835F]">&lt;</span>
            <span className="bg-gradient-to-r from-emerald-100 via-teal-200 to-[#34d399] bg-clip-text text-transparent">
              Password
            </span>
            <span className="text-[#2A835F]">Manager/&gt;</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0e3037]/70 border border-[#12544F]/70 rounded-full px-3 py-1 text-xs font-semibold text-slate-300">
          <a
            href="#"
            className="px-3.5 py-1.5 rounded-full text-white bg-[#12544F]/80 border border-[#2A835F]/50 shadow-inner"
          >
            Vault Dashboard
          </a>
          <a
            href="#"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors"
          >
            Security Hub
          </a>
          <a
            href="#"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-colors"
          >
            Generator
          </a>
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-2.5 bg-[#0e3037] border border-[#12544F] py-1.5 px-3 rounded-full text-xs shadow-md">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#12544F] to-[#2A835F] flex items-center justify-center font-bold text-white uppercase text-[11px] shadow-sm">
                {(currentUser.name || "U")[0]}
              </div>
              <span className="font-semibold text-slate-100 max-w-[130px] truncate">
                {currentUser.name}
              </span>
              <button
                onClick={onLogout}
                title="Log out of vault"
                className="ml-1 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
                Logout
              </button>
            </div>
          )}

          {/* GitHub Button */}
          <a
            href="https://github.com/ADISIWACH"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-[#092328] to-[#12544F] hover:from-[#12544F] hover:to-[#2A835F] border border-[#2A835F]/40 hover:border-[#2A835F]/80 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-[#2A835F]/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" className="bi bi-github text-[#34d399]" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
