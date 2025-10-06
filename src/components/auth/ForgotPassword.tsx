import { useState, FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError("Failed to send reset email. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
          aria-label="Back to login"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-800">
              Password reset email sent! Check your inbox.
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                placeholder="admin@pixelpunk.studio"
                required
                aria-label="Email address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send reset email"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
