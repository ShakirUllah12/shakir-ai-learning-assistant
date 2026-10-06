import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import authService from "../../services/authService";
import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  Chrome,
  UserCheck,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Google Auth States
  const [isGoogleSimulated, setIsGoogleSimulated] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (googleCredential) => {
    setLoading(true);
    setError("");
    try {
      const data = await authService.googleLogin(googleCredential);
      login(data.user, data.token);
      toast.success("Account created! Signed in with Google.");
      navigate("/dashboard");
    } catch (err) {
      const message = err.message || "Google Sign-In failed.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setIsGoogleSimulated(true);
      return;
    }

    const initializeGoogle = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => handleGoogleSuccess(response.credential),
          });
          window.google.accounts.id.renderButton(
            document.getElementById("google-signup-btn"),
            { 
              theme: "outline", 
              size: "large", 
              width: "100%", 
              text: "signup_with",
              shape: "rectangular"
            }
          );
        } catch (e) {
          console.error("Google GIS initialization error:", e);
          setIsGoogleSimulated(true);
        }
      } else {
        setTimeout(initializeGoogle, 500);
      }
    };

    initializeGoogle();
  }, []);

  const handleSimulatedGoogleSelect = (acc) => {
    setShowSimModal(false);
    const mockToken = `mock_token_${acc.email}_${encodeURIComponent(acc.name)}_${encodeURIComponent(acc.avatar)}`;
    handleGoogleSuccess(mockToken);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.register(username, email, password);
      if (response && response.data) {
        const { user, token } = response.data;
        login(user, token);
        toast.success("Account created successfully! Welcome to dashboard.");
        navigate("/dashboard");
      } else {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      const message = err.message || "Failed to register. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const simulatedAccounts = [
    {
      name: "Shakir Ullah",
      email: "shakir.ullah@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shakir"
    },
    {
      name: "Sarah Connor",
      email: "sarah.connor@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Alex Mercer",
      email: "alex.mercer@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-display">
      {/* Left Panel - Hero Graphics (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 p-12 flex-col justify-between overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Branding Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BrainCircuit className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
            AI Learning Assistant
          </span>
        </div>

        {/* Middle Feature Highlights */}
        <div className="max-w-md my-auto relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              Elevate Your Learning
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Create your <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-teal-300">
                free account.
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Upload your documents and let AI generate study material, answer concepts, and test your knowledge interactively.
            </p>
          </div>

          <div className="space-y-5 border-t border-slate-800/80 pt-6">
            <div className="flex gap-4">
              <div className="flex-none w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-emerald-400">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Smart PDF Parsing</h4>
                <p className="text-slate-400 text-xs mt-0.5">Instant document analysis & concept summary generator.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-teal-400">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Interactive Quizzes</h4>
                <p className="text-slate-400 text-xs mt-0.5">Generate custom practice quizzes from your study contents.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-emerald-400">
                <Clock className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">Spaced Repetition Flashcards</h4>
                <p className="text-slate-400 text-xs mt-0.5">Retain concepts longer with dynamic, targeted cards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-slate-500 text-xs relative z-10">
          © {new Date().getFullYear()} AI Learning Assistant. Powered by Gemini Pro.
        </p>
      </div>

      {/* Right Panel - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative bg-slate-950">
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
        
        <div className="w-full max-w-[420px] space-y-8 relative z-10">
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 mb-4">
              <BrainCircuit className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Learning Assistant
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Create an account to start learning
            </p>
          </div>

          {/* Desktop Title Header */}
          <div className="hidden lg:block space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Create an account
            </h1>
            <p className="text-slate-400 text-sm">
              Join to start your AI-powered learning journey
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Signup Component */}
            {isGoogleSimulated ? (
              <button
                type="button"
                onClick={() => setShowSimModal(true)}
                className="w-full h-11 flex items-center justify-center gap-3 border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-900/80 text-slate-200 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                <Chrome className="size-4 text-emerald-400 animate-pulse" />
                Continue with Google
              </button>
            ) : (
              <div id="google-signup-btn" className="w-full min-h-[44px]" />
            )}

            {/* Form Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                or register with email
              </span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            {/* Local Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Username
                </label>

                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200"
                    strokeWidth={2}
                  />

                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="w-full h-11 pl-11 pr-4 border border-slate-800 rounded-xl bg-slate-900/60 text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Email Address
                </label>

                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200"
                    strokeWidth={2}
                  />

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 pl-11 pr-4 border border-slate-800 rounded-xl bg-slate-900/60 text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Password
                </label>

                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200"
                    strokeWidth={2}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-11 pr-11 border border-slate-800 rounded-xl bg-slate-900/60 text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                  {/* Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-6"
              >
                {loading ? (
                  <>
                    <div className="size-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-4.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="pt-2 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Simulated Google Accounts Selector Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSimModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <UserCheck className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Google Registration</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Choose a simulated Google Account to register for testing.
              </p>
            </div>

            <div className="space-y-3">
              {simulatedAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulatedGoogleSelect(acc)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/80 transition-all duration-200 group text-left cursor-pointer"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                      {acc.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="size-3 text-emerald-400" strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[10px] text-slate-500 leading-normal">
                To connect real Google accounts, set <code className="text-emerald-400">VITE_GOOGLE_CLIENT_ID</code> in your frontend .env file.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
