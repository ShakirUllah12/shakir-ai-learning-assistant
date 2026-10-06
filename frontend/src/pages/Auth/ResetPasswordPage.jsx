import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import {
  BrainCircuit,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      toast.success("Password reset successfully! Redirecting...");
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const message = err.message || "Failed to reset password. The link may have expired.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 font-display">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/2 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg shadow-emerald-500/10">
              <BrainCircuit className="size-6 text-white" strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-slate-400">
              Enter your new password below.
            </p>
          </div>

          {!success ? (
            /* Reset password form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  New Password
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
                    className="w-full h-11 pl-11 pr-11 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Confirm New Password
                </label>

                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200"
                    strokeWidth={2}
                  />

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-11 pr-11 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs text-red-400 text-center font-medium flex items-center justify-center gap-1.5">
                    <AlertCircle className="size-4 flex-none" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pt-2"
              >
                {loading ? (
                  <>
                    <div className="size-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="size-4.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success state message */
            <div className="space-y-6 text-center">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <CheckCircle className="size-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Password updated!</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your password has been successfully reset. Redirecting you to login...
                </p>
              </div>

              <Link
                to="/login"
                className="w-full h-11 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Login Now
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
