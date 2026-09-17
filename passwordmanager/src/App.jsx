import { useState } from 'react';
import Navbar from './components/Navbar';
import Manager from './components/Manager';
import Login from './components/Login';
import Footer from './components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("pm_current_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("pm_current_user");
    setCurrentUser(null);
    toast.info("You have been logged out of your vault.");
  };

  return (
    <div className="relative min-h-screen bg-[#092328] text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Cyber Ambient Glow Background using #092328, #12544F, #2A835F */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top-center Emerald Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#2A835F]/20 rounded-full blur-[140px] animate-pulse-glow"></div>
        {/* Left Deep Teal Glow */}
        <div className="absolute top-1/3 -left-48 w-[550px] h-[550px] bg-[#12544F]/35 rounded-full blur-[130px]"></div>
        {/* Right Jade Glow */}
        <div className="absolute bottom-10 -right-48 w-[600px] h-[600px] bg-[#2A835F]/25 rounded-full blur-[150px]"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#12544f15_1px,transparent_1px),linear-gradient(to_bottom,#12544f15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Navigation Bar */}
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentUser ? (
          <Manager key={currentUser.name} currentUser={currentUser} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
