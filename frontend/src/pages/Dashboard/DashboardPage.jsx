import React, { useState, useEffect } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Headphones,
  Sparkles,
  Plus,
  Award
} from "lucide-react";
import VoiceTutorModal from "../../components/voice/VoiceTutorModal";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Only fetch dashboard data if user is authenticated
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data_____getDashboardData", data.data);

        setDashboardData(data.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        const errorMessage = error.message || "Failed to fetch dashboard data.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAuthenticated, user]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4">
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 text-sm font-medium mb-2">
            Error Loading Dashboard
          </p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Total Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Total Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="absolute  inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto">
        {/* Header & Hero Voice Tutor Card */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 border border-slate-800 shadow-2xl">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Sparkles size={13} />
                  AI Study Assistant v2.0
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-teal-300">{user?.username || "Learner"}</span>!
                </h1>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Ready to study? Ask questions hands-free with the new AI Voice Tutor, review flashcards, or test your mastery with generated quizzes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="inline-flex items-center gap-2.5 px-5 h-12 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Headphones size={18} />
                  <span>Start Voice Tutor</span>
                </button>
                <Link
                  to="/documents"
                  className="inline-flex items-center gap-2 px-4 h-12 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Upload PDF</span>
                </Link>
                <Link
                  to="/quizzes"
                  className="inline-flex items-center gap-2 px-4 h-12 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
                >
                  <Award size={16} />
                  <span>Quiz Hub</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          {stats.map((stat, index) => {
            return (
              <div
                key={index}
                className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <div
                    className={`w-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon
                      className="w-5 h-10 text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <div className="text-3xl font-semibold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex itemcs-center justify-center">
              <Clock className=" text-slate-600 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
              Recent Activity
            </h3>
          </div>

          {dashboardData.recentActivity &&
          (dashboardData.recentActivity.documents.length > 0 ||
            dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className="space-y-3">
              {[
                ...(dashboardData.recentActivity.documents || []).map(
                  (doc) => ({
                    id: doc._id,
                    description: doc.title,
                    timestamp: doc.lastAccessed || doc.createdAt,
                    link: `/documents/${doc._id}`,
                    type: "document",
                  }),
                ),
                ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.lastAccessed || quiz.completedAt,
                  link: `/quizzes/${quiz._id}`,
                  type: "quiz",
                })),
              ]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "document"
                              ? "bg-linear-to-r from-blue-400 to-cyan-500"
                              : "bg-linear-to-r from-emerald-400 to-teal-500"
                          }`}
                        ></div>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.type === "document"
                            ? "Accessed Document: "
                            : "Attempted Quiz: "}
                          <span className="text-slate-700">
                            {activity.description}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 pl-4">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.link && (
                      <>
                        {activity.type === "quiz" ? (
                          <a
                            href={`/quizzes/${activity.id}/results`}
                            className="ml-4 px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 whitespace-nowrap"
                          >
                            View
                          </a>
                        ) : (
                          <a
                            href={activity.link}
                            className="ml-4 px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 whitespace-nowrap"
                          >
                            View
                          </a>
                        )}
                      </>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 ">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <Clock className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600">
                No recent activity to yet.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Start learning to see your activity here.
              </p>
            </div>
          )}
        </div>
      </div>

      <VoiceTutorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        documentTitle="Dashboard Study Session"
      />
    </div>
  );
};

export default DashboardPage;
