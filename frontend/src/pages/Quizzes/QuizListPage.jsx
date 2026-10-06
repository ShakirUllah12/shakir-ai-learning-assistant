import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import documentService from "../../services/documentService";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import QuizCard from "../../components/quizzes/QuizCard";
import toast from "react-hot-toast";
import { Award, BrainCircuit, CheckCircle2, FileText, Search } from "lucide-react";

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'completed', 'pending'

  const fetchAllQuizzes = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs || []);

      if (!docs || docs.length === 0) {
        setQuizzes([]);
        return;
      }

      // Fetch quizzes for each document in parallel
      const quizPromises = docs.map(async (doc) => {
        try {
          const res = await quizService.getQuizzesForDocument(doc._id);
          const list = res?.data || [];
          return list.map((q) => ({
            ...q,
            documentTitle: doc.title,
            documentId: doc._id,
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(quizPromises);
      const flattened = results.flat();
      setQuizzes(flattened);
    } catch (error) {
      console.error("Failed to fetch quizzes list:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizToDelete) => {
    try {
      await quizService.deleteQuiz(quizToDelete._id || quizToDelete.id);
      toast.success("Quiz deleted successfully");
      setQuizzes((prev) =>
        prev.filter((q) => (q._id || q.id) !== (quizToDelete._id || quizToDelete.id))
      );
    } catch (err) {
      toast.error(err.message || "Failed to delete quiz");
    }
  };

  const completedQuizzes = quizzes.filter(
    (q) => q.userAnswers && q.userAnswers.length > 0
  );
  const avgScore =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) /
            completedQuizzes.length
        )
      : 0;

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      (quiz.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.documentTitle || "").toLowerCase().includes(searchQuery.toLowerCase());

    const isCompleted = quiz.userAnswers && quiz.userAnswers.length > 0;
    if (filterStatus === "completed") return matchesSearch && isCompleted;
    if (filterStatus === "pending") return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Quiz Hub">
          <p className="text-sm text-slate-500 mt-1">
            Test and reinforce your knowledge across all uploaded study documents.
          </p>
        </PageHeader>
        <Link
          to="/documents"
          className="inline-flex items-center justify-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
        >
          <FileText size={18} /> View Documents
        </Link>
      </div>

      {/* Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Quizzes
            </span>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BrainCircuit size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {quizzes.length}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Completed
            </span>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {completedQuizzes.length}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Average Score
            </span>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Award size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {avgScore}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes or documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "completed", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                filterStatus === tab
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching quizzes" : "No Quizzes Yet"}
          description={
            searchQuery
              ? "Try adjusting your search terms or filter."
              : "Upload documents to generate AI practice quizzes tailored to your study materials."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz._id || quiz.id}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizListPage;
