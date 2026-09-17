import { useState } from "react";
import { toast } from "react-toastify";

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanPassword = formData.password.trim();

    if (!cleanName || !cleanPassword) {
      toast.error("Please enter both Full Name and Password!");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("pm_users") || "[]");

    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      if (cleanPassword.length < 4) {
        toast.warn("Password should be at least 4 characters long!");
        return;
      }

      const existingUser = storedUsers.find(
        (u) => u.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (existingUser) {
        toast.error("An account with this Full Name already exists! Please log in.");
        return;
      }

      const newUser = {
        name: cleanName,
        password: cleanPassword,
        createdAt: new Date().toISOString(),
      };

      storedUsers.push(newUser);
      localStorage.setItem("pm_users", JSON.stringify(storedUsers));
      localStorage.setItem("pm_current_user", JSON.stringify(newUser));

      toast.success(`Account created! Welcome, ${newUser.name}`);
      onLogin(newUser);
    } else {
      const user = storedUsers.find(
        (u) =>
          u.name.toLowerCase() === cleanName.toLowerCase() &&
          u.password === cleanPassword
      );

      if (user) {
        localStorage.setItem("pm_current_user", JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        onLogin(user);
      } else {
        if (storedUsers.length === 0) {
          toast.info("No registered users found. Switch to 'Create Account' to register!");
        } else {
          toast.error("Invalid Full Name or Password! Please check your credentials.");
        }
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-12 md:py-20 px-4">
      <div className="w-full max-w-md bg-[#0c2b31]/95 border border-[#12544F] rounded-3xl shadow-[0_20px_60px_-15px_rgba(42,131,95,0.35)] p-8 md:p-10 backdrop-blur-2xl relative overflow-hidden">
        {/* Top accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12544F] via-[#2A835F] to-[#34d399]"></div>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#12544F] via-[#2A835F] to-[#34d399] p-[1.5px] shadow-lg shadow-[#2A835F]/40">
            <div className="w-full h-full bg-[#092328] rounded-[14px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#34d399]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            <span className="text-[#2A835F]">&lt;</span>
            <span className="bg-gradient-to-r from-white via-emerald-100 to-[#34d399] bg-clip-text text-transparent">
              Password
            </span>
            <span className="text-[#2A835F]">Manager/&gt;</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-medium">
            {isRegistering
              ? "Create your private encrypted password vault"
              : "Access and manage your saved client credentials"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#071d21] p-1.5 rounded-2xl mb-7 border border-[#12544F]/80 shadow-inner">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
              !isRegistering
                ? "bg-gradient-to-r from-[#12544F] to-[#2A835F] text-white shadow-lg shadow-[#2A835F]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Client Login
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
              isRegistering
                ? "bg-gradient-to-r from-[#12544F] to-[#2A835F] text-white shadow-lg shadow-[#2A835F]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {/* Full Name Field */}
          <div>
            <label className="block text-slate-200 text-xs font-semibold mb-2 uppercase tracking-wider">
              Full Name <span className="text-[#34d399]">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Aditya Siwach"
                required
                className="w-full bg-[#0e333b]/90 border border-[#12544F] group-hover:border-[#2A835F] rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399] text-sm transition-all shadow-inner"
              />
              <span className="absolute right-3.5 top-3.5 text-[#34d399] pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-slate-200 text-xs font-semibold mb-2 uppercase tracking-wider">
              Password <span className="text-[#34d399]">*</span>
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full bg-[#0e333b]/90 border border-[#12544F] group-hover:border-[#2A835F] rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399] text-sm transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#34d399] hover:text-white cursor-pointer p-0.5 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C14.37 10.162 15 9 15 9s-3-5-7-5a7.5 7.5 0 0 0-2.25.346l.708.708A6.4 6.4 0 0 1 8 4.75c2.5 0 4.5 2.5 5.25 4.25-.3.7-.75 1.35-1.35 1.95z" />
                    <path d="M11.297 9.297a3.5 3.5 0 0 1-4.594-4.594l.708.708A2.5 2.5 0 0 0 10.59 8.59z" />
                    <path d="M3.354 2.646a.5.5 0 0 0-.708.708l10 10a.5.5 0 0 0 .708-.708z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M8 12.5A4.5 4.5 0 1 1 8 3.5a4.5 4.5 0 0 1 0 9" />
                    <path d="M8 10.5A2.5 2.5 0 1 0 8 5.5a2.5 2.5 0 0 0 0 5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Registration only) */}
          {isRegistering && (
            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-2 uppercase tracking-wider">
                Confirm Password <span className="text-[#34d399]">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                className="w-full bg-[#0e333b]/90 border border-[#12544F] rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399] text-sm transition-all shadow-inner"
              />
            </div>
          )}

          {/* Reminder Security Card */}
          <div className="bg-[#0e3137] border border-[#2A835F]/30 rounded-2xl p-3.5 flex gap-3 items-start mt-1 shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-[#12544F]/80 border border-[#2A835F]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#34d399]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
              </svg>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong>Security Notice:</strong> Please remember your <strong>Full Name</strong> and <strong>Password</strong>. They unlock and protect your private client vault.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-[#12544F] via-[#2A835F] to-[#34d399] hover:from-[#15615b] hover:via-[#31976e] hover:to-[#4ade80] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_10px_25px_-5px_rgba(42,131,95,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(42,131,95,0.7)] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="tracking-wide">
              {isRegistering ? "Register Vault Account" : "Unlock Password Vault"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
