import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Manager = ({ currentUser }) => {
  const storageKey = currentUser
    ? `pm_passwords_${currentUser.name.trim().toLowerCase().replace(/\s+/g, "_")}`
    : "passwords";

  const [form, setForm] = useState({
    site: "",
    username: "",
    password: "",
  });

  const [passwordArray, setPasswordArray] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      const legacy = localStorage.getItem("passwords");
      if (legacy && currentUser) {
        return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState(() => new Date().toLocaleTimeString());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Alert before closing browser if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges || form.site || form.password) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, form]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Calculate password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "", color: "", text: "", width: "0%" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-400", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "bg-amber-500", text: "text-amber-400", width: "66%" };
    return { label: "Strong", color: "bg-[#2A835F]", text: "text-[#34d399]", width: "100%" };
  };

  const strength = getPasswordStrength(form.password);

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let pwd = "";
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
    toast.info("Strong 16-character password generated!");
  };

  // Save or Update password entry
  const handleSubmitPassword = (e) => {
    if (e) e.preventDefault();

    if (!form.site.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields (Website URL, Username, and Password)!");
      return;
    }

    let updatedPasswords;

    if (editingIndex !== null) {
      updatedPasswords = passwordArray.map((item, idx) =>
        idx === editingIndex ? { ...form } : item
      );
      setEditingIndex(null);
      toast.success("Password updated successfully!");
    } else {
      updatedPasswords = [...passwordArray, { ...form }];
      toast.success("Password added to vault!");
    }

    setPasswordArray(updatedPasswords);
    localStorage.setItem(storageKey, JSON.stringify(updatedPasswords));
    setLastSavedTime(new Date().toLocaleTimeString());
    setHasUnsavedChanges(false);

    setForm({
      site: "",
      username: "",
      password: "",
    });
    setShowPassword(false);
  };

  // Cancel Edit mode
  const cancelEdit = () => {
    setEditingIndex(null);
    setForm({
      site: "",
      username: "",
      password: "",
    });
    setShowPassword(false);
    toast.info("Edit cancelled.");
  };

  // Start Editing an existing entry
  const startEdit = (index) => {
    const itemToEdit = passwordArray[index];
    setEditingIndex(index);
    setForm({
      site: itemToEdit.site,
      username: itemToEdit.username,
      password: itemToEdit.password,
    });
    setShowPassword(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Editing entry. Make your modifications and click 'Update Password'.");
  };

  // Trigger Delete Confirmation Modal
  const requestDelete = (index) => {
    setDeleteCandidate({
      index,
      item: passwordArray[index],
    });
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!deleteCandidate) return;

    const { index, item } = deleteCandidate;
    const updatedPasswords = passwordArray.filter((_, i) => i !== index);

    setPasswordArray(updatedPasswords);
    localStorage.setItem(storageKey, JSON.stringify(updatedPasswords));
    setLastSavedTime(new Date().toLocaleTimeString());

    if (editingIndex === index) {
      cancelEdit();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }

    setDeleteCandidate(null);
    toast.success(`Password for ${item.site} removed from storage!`);
  };

  // Final Save / Manual Sync Button
  const handleFinalSave = () => {
    if (form.site.trim() && form.username.trim() && form.password.trim()) {
      handleSubmitPassword();
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(passwordArray));
    setHasUnsavedChanges(false);
    setLastSavedTime(new Date().toLocaleTimeString());
    toast.success("All credentials safely saved and synced to storage!");
  };

  // Copy text to clipboard
  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to Clipboard!`, {
      autoClose: 2000,
    });
  };

  // Toggle password visibility in table row
  const toggleRowPasswordVisibility = (index) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filter passwords based on search query
  const filteredPasswords = passwordArray.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.site.toLowerCase().includes(query) ||
      item.username.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative min-h-[85vh] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Delete Confirmation Warning Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0c2b31] border-2 border-red-500/60 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(239,68,68,0.4)] text-white transform transition-all">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0 text-red-400 shadow-lg shadow-red-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Delete Password?</h3>
                <p className="text-xs text-red-400 font-medium">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-200 text-sm mb-6 leading-relaxed bg-[#072025] p-3.5 rounded-2xl border border-red-500/20">
              Are you sure you want to delete stored credentials for{" "}
              <strong className="text-[#34d399] font-semibold">{deleteCandidate.item.site}</strong>{" "}
              (<span className="text-emerald-200">{deleteCandidate.item.username}</span>)?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-5 py-2.5 bg-[#12544F]/50 hover:bg-[#12544F] text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-900/50 flex items-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5" />
                </svg>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Vault Stats & Header */}
        <div className="bg-[#0a292f]/90 border border-[#12544F] rounded-3xl p-6 md:p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
          {/* Top ambient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#12544F] via-[#2A835F] to-[#34d399]"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0e353c] text-[#34d399] border border-[#2A835F]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-ping"></span>
                  Active Client Vault
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Client: <strong className="text-white">{currentUser ? currentUser.name : "Guest"}</strong>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                <span className="text-[#2A835F]">&lt;</span>
                <span className="bg-gradient-to-r from-white via-emerald-100 to-[#34d399] bg-clip-text text-transparent">
                  Password
                </span>
                <span className="text-[#2A835F]">Manager/&gt;</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Zero-knowledge encrypted password vault stored securely on your device.
              </p>
            </div>

            {/* Stats Badges & Final Save Button */}
            <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="bg-[#0e353c] border border-[#12544F] px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
                <div className="text-left">
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Saved Passwords</div>
                  <div className="text-lg font-extrabold text-[#34d399]">{passwordArray.length}</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#12544F] border border-[#2A835F]/40 flex items-center justify-center text-[#34d399]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 0-2 2v4H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2M7 3a1 1 0 0 1 2 0v4H7z"/>
                  </svg>
                </div>
              </div>

              {/* Sync Timestamp Pill */}
              <div className="bg-[#0e353c] border border-[#12544F] px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs text-slate-300 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
                <span className="text-slate-300 text-[11px]">Synced:</span>
                <span className="font-semibold text-white text-xs">{lastSavedTime}</span>
              </div>

              {/* Final Save Button */}
              <button
                onClick={handleFinalSave}
                title="Save all changes to storage before leaving"
                className="bg-gradient-to-r from-[#12544F] via-[#2A835F] to-[#34d399] hover:from-[#15615b] hover:via-[#31976e] hover:to-[#4ade80] text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-[0_10px_25px_-5px_rgba(42,131,95,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(42,131,95,0.6)] transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v4.5h2a.5.5 0 0 1 .354.854l-2.5 2.5a.5.5 0 0 1-.708 0l-2.5-2.5A.5.5 0 0 1 5.5 6.5h2V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                </svg>
                <span>Final Save & Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Alert Indicator */}
        {editingIndex !== null && (
          <div className="bg-amber-950/60 border border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 animate-fade-in shadow-lg shadow-amber-950/30">
            <div className="flex items-center gap-3 text-amber-300 text-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-900/80 flex items-center justify-center shrink-0 text-amber-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001"/>
                </svg>
              </div>
              <span>
                <strong>Modifying Entry #{editingIndex + 1}:</strong> Updating will replace old credentials with your latest changes.
              </span>
            </div>
            <button
              onClick={cancelEdit}
              className="px-4 py-1.5 bg-amber-800/80 hover:bg-amber-700 text-amber-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
          </div>
        )}

        {/* Add/Edit Password Input Card */}
        <div className="bg-[#0b2b31]/90 border border-[#12544F] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
            <span className="w-2 h-6 bg-gradient-to-b from-[#12544F] via-[#2A835F] to-[#34d399] rounded-full"></span>
            <span>{editingIndex !== null ? "Edit Password Details" : "Store New Password"}</span>
          </h2>

          <form onSubmit={handleSubmitPassword} className="space-y-6">
            {/* Website URL */}
            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-2 uppercase tracking-wider">
                Website URL / Service Name <span className="text-[#34d399]">*</span>
              </label>
              <div className="relative group">
                <input
                  value={form.site}
                  onChange={handleChange}
                  placeholder="e.g. https://google.com or GitHub"
                  className="w-full bg-[#0e363e]/90 border border-[#12544F] group-hover:border-[#2A835F] rounded-2xl text-white px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399] text-sm shadow-inner transition-all"
                  type="text"
                  name="site"
                  required
                />
                <span className="absolute right-4 top-3.5 text-[#34d399]/80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Username & Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-slate-200 text-xs font-semibold mb-2 uppercase tracking-wider">
                  Username / Email <span className="text-[#34d399]">*</span>
                </label>
                <div className="relative group">
                  <input
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. user@gmail.com or aditya"
                    className="w-full bg-[#0e363e]/90 border border-[#12544F] group-hover:border-[#2A835F] rounded-2xl text-white px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399] text-sm shadow-inner transition-all"
                    type="text"
                    name="username"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-[#34d399]/80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password with Strength & Generator */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-200 text-xs font-semibold uppercase tracking-wider">
                    Password <span className="text-[#34d399]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-xs text-[#34d399] hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <span>⚡ Generate Strong</span>
                  </button>
                </div>
                <div className="relative group">
                  <input
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full bg-[#0e363e]/90 border border-[#12544F] group-hover:border-[#2A835F] rounded-2xl text-white px-4 py-3.5 pr-12 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399] text-sm shadow-inner transition-all"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                  />
                  <button
                    type="button"
                    title={showPassword ? "Hide Password" : "Show Password"}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-[#34d399] hover:text-white cursor-pointer p-1 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
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

                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-[#092328] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                        style={{ width: strength.width }}
                      ></div>
                    </div>
                    <span className={`text-[11px] font-bold ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              <button
                type="submit"
                className={`flex items-center justify-center gap-2.5 font-bold px-8 py-3.5 rounded-2xl text-white shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                  editingIndex !== null
                    ? "bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500 shadow-amber-900/40 hover:shadow-amber-900/60"
                    : "bg-gradient-to-r from-[#12544F] via-[#2A835F] to-[#34d399] shadow-[#2A835F]/40 hover:shadow-[#2A835F]/60"
                }`}
              >
                {editingIndex !== null ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Password</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Password to Vault</span>
                  </>
                )}
              </button>

              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3.5 bg-[#12544F]/60 hover:bg-[#12544F] text-slate-200 font-semibold rounded-2xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Stored Passwords Section */}
        <div className="bg-[#0b2b31]/90 border border-[#12544F] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>Stored Credentials</span>
                <span className="text-xs bg-[#0e353c] border border-[#2A835F]/50 text-[#34d399] px-3 py-1 rounded-full font-bold">
                  {passwordArray.length} {passwordArray.length === 1 ? "Record" : "Records"}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your encrypted entries stored in browser storage
              </p>
            </div>

            {/* Search Input */}
            {passwordArray.length > 0 && (
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search websites or usernames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0e363e] border border-[#12544F] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2A835F]/50 focus:border-[#34d399]"
                />
                <span className="absolute left-3.5 top-3 text-[#34d399]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </span>
              </div>
            )}
          </div>

          {/* Empty State */}
          {passwordArray.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-[#12544F] rounded-3xl bg-[#082227]/50">
              <div className="w-16 h-16 mx-auto mb-4 text-[#34d399] flex items-center justify-center rounded-2xl bg-[#0e353c] border border-[#12544F] shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Passwords Saved Yet</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Add your first password using the form above to securely save and access your credentials anytime.
              </p>
            </div>
          ) : filteredPasswords.length === 0 ? (
            <div className="text-center py-12 text-slate-300 text-sm bg-[#082227]/40 rounded-2xl">
              No matching records found for "{searchQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#12544F] shadow-2xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#0e353c] text-emerald-100 border-b border-[#12544F] text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-4 px-5">Website / Service</th>
                    <th className="py-4 px-5">Username / Email</th>
                    <th className="py-4 px-5">Password</th>
                    <th className="py-4 px-5 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#12544F]/40 bg-[#09262b]/95">
                  {filteredPasswords.map((item, index) => {
                    const originalIndex = passwordArray.findIndex(
                      (p) =>
                        p.site === item.site &&
                        p.username === item.username &&
                        p.password === item.password
                    );
                    const isBeingEdited = editingIndex === originalIndex;
                    const isPasswordRevealed = visiblePasswords[originalIndex];

                    const cleanSite = item.site.replace(/^https?:\/\//, "");
                    const initialLetter = (cleanSite[0] || "W").toUpperCase();

                    return (
                      <tr
                        key={originalIndex >= 0 ? originalIndex : index}
                        className={`transition-colors duration-200 ${
                          isBeingEdited
                            ? "bg-[#12544F]/70 border-l-4 border-amber-400"
                            : "hover:bg-[#0e3841]/70"
                        }`}
                      >
                        {/* Site */}
                        <td className="py-4 px-5 text-white">
                          <div className="flex items-center gap-3 max-w-[240px]">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#12544F] to-[#2A835F] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                              {initialLetter}
                            </div>
                            <div className="truncate">
                              <a
                                href={
                                  item.site.startsWith("http://") || item.site.startsWith("https://")
                                    ? item.site
                                    : `https://${item.site}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-100 hover:text-[#34d399] font-semibold text-xs truncate block transition-colors"
                                title={item.site}
                              >
                                {item.site}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyText(item.site, "Website URL")}
                              title="Copy URL"
                              className="text-[#34d399] hover:text-white cursor-pointer shrink-0 p-1 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-4 px-5 text-slate-200">
                          <div className="flex items-center gap-2 max-w-[220px]">
                            <span className="truncate text-xs font-medium text-slate-200">{item.username}</span>
                            <button
                              type="button"
                              onClick={() => copyText(item.username, "Username")}
                              title="Copy Username"
                              className="text-[#34d399] hover:text-white cursor-pointer shrink-0 p-1 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-4 px-5 text-slate-200">
                          <div className="flex items-center gap-2 max-w-[220px]">
                            <span className="font-mono text-xs text-white bg-[#0e353c] border border-[#12544F] px-2.5 py-1 rounded-lg truncate">
                              {isPasswordRevealed ? item.password : "••••••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRowPasswordVisibility(originalIndex)}
                              title={isPasswordRevealed ? "Hide Password" : "Show Password"}
                              className="text-[#34d399] hover:text-white cursor-pointer shrink-0 p-1 transition-colors"
                            >
                              {isPasswordRevealed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M13.359 11.238C14.37 10.162 15 9 15 9s-3-5-7-5a7.5 7.5 0 0 0-2.25.346l.708.708A6.4 6.4 0 0 1 8 4.75c2.5 0 4.5 2.5 5.25 4.25-.3.7-.75 1.35-1.35 1.95z" />
                                  <path d="M11.297 9.297a3.5 3.5 0 0 1-4.594-4.594l.708.708A2.5 2.5 0 0 0 10.59 8.59z" />
                                  <path d="M3.354 2.646a.5.5 0 0 0-.708.708l10 10a.5.5 0 0 0 .708-.708z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M8 12.5A4.5 4.5 0 1 1 8 3.5a4.5 4.5 0 0 1 0 9" />
                                  <path d="M8 10.5A2.5 2.5 0 1 0 8 5.5a2.5 2.5 0 0 0 0 5" />
                                </svg>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyText(item.password, "Password")}
                              title="Copy Password"
                              className="text-[#34d399] hover:text-white cursor-pointer shrink-0 p-1 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-center">
                          <div className="flex justify-center items-center gap-2.5">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => startEdit(originalIndex)}
                              title="Edit this entry"
                              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => requestDelete(originalIndex)}
                              title="Delete this entry"
                              className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 hover:border-red-400 transition-all cursor-pointer shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Manager;
