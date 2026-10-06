import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Bell, User, Menu, Headphones, Sparkles } from "lucide-react";
import VoiceTutorModal from "../voice/VoiceTutorModal";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Sparkles size={13} className="text-emerald-500" />
              AI Learning Assistant v2.0 • Pro Edition
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Launch Voice Tutor Button */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 h-9 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              title="Launch AI Voice Tutor"
            >
              <Headphones className="size-3.5" />
              <span className="hidden sm:inline">Voice Tutor</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigate("/dashboard")}
              className="relative inline-flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group cursor-pointer"
            >
              <Bell
                size={18}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200/60">
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200 ">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900">
                    {user?.username || "Student"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                    {user?.email || "student@university.edu"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Voice Tutor Modal */}
      <VoiceTutorModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        documentTitle="General Study Session"
      />
    </>
  );
};

export default Header;
