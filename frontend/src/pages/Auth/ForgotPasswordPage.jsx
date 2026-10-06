import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import {
  BrainCircuit,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success("Reset link generated successfully!");
      
      // If the backend simulated sending and returned devResetUrl, store it
      if (response.devResetUrl) {
        setDevResetUrl(response.devResetUrl);
      }
    } catch (err) {
      const message = err.message || "Failed to submit request. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 font-display">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg shadow-emerald-500/10">
              <BrainCircuit className="size-6 text-white" strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm text-slate-400">
              No worries! Enter your email and we'll help you reset it.
            </p>
          </div>

          {!submitted ? (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
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
                    className="w-full h-11 pl-11 pr-4 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="size-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="size-4.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <CheckCircle className="size-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Check your email</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We've sent password reset instructions to <strong className="text-slate-200">{email}</strong>.
                </p>
              </div>

              {/* Developer simulated reset link display */}
              {devResetUrl && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <AlertTriangle className="size-4" />
                    Developer Mode simulation link:
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed word-break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {devResetUrl}
                  </p>
                  <Link
                    to={devResetUrl.replace("http://localhost:5173", "")}
                    className="w-full h-9 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Open Reset Form
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              Back to Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
