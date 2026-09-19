import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Github,
  Loader2,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithEmail, loginWithGoogle, registerWithEmail, sendOtp, verifyOtp } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import { appRoutes } from "@/shared/routes";

export type AuthMode = "login" | "signup";

export function AuthShell({ mode }: { mode: AuthMode }) {
  const [showPw, setShowPw] = useState(false);
  const [dark, setDark] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const isLogin = mode === "login";

  const redirectByRole = async () => {
    try {
      const currentUser = await getCurrentUser();
      await navigate({ to: currentUser.role === "Super Admin" ? appRoutes.admin : appRoutes.dashboard });
    } catch {
      await navigate({ to: appRoutes.dashboard });
    }
  };

  const resetOtpState = () => {
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError("");
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (authError) {
      setAuthError("");
    }

    if (!isLogin && name === "email") {
      resetOtpState();
    }

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSendOtp = async () => {
    if (!values.email) {
      setOtpError("Enter your email first.");
      return;
    }

    setOtpError("");
    setIsSendingOtp(true);

    try {
      const result = await sendOtp(values.email);

      if (result.error) {
        setOtpError(result.error);
        return;
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtp("");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("Enter the OTP sent to your email.");
      return;
    }

    setOtpError("");
    setIsVerifyingOtp(true);

    try {
      const result = await verifyOtp(values.email, otp);

      if (result.error) {
        setOtpError(result.error);
        return;
      }

      setOtpVerified(true);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    if (isLogin) {
      setIsSubmitting(true);

      try {
        const result = await loginWithEmail(values.email, values.password);

        if (result.error) {
          setAuthError(result.error);
          return;
        }

        await redirectByRole();
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!otpVerified) {
      setOtpError("Verify your email with OTP before creating an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerWithEmail({
        name: values.name,
        email: values.email,
        password: values.password,
        otp,
      });

      if (result.error) {
        setAuthError(result.error);
        return;
      }

      await navigate({ to: appRoutes.login });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      setAuthError("Google sign-in did not return a token.");
      return;
    }

    setGoogleLoading(true);
    setAuthError("");

    try {
      const result = await loginWithGoogle(idToken);

      if (result.error) {
        setAuthError(result.error);
        return;
      }

      await redirectByRole();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute -left-24 top-1/3 h-72 w-72 animate-blob rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-10 bottom-10 h-80 w-80 animate-blob rounded-full bg-cyan-accent/40 blur-3xl"
        />
        <div aria-hidden className="absolute inset-0 grid-bg opacity-20" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">StudyVault</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            {isLogin
              ? "Welcome back to your vault."
              : "Build the vault your future self will thank you for."}
          </h2>
          <p className="mt-4 text-primary-foreground/85">
            {isLogin
              ? "Pick up exactly where you left off your notes, schedule, and streak are waiting."
              : "Sign up free and let StudyVault organize, search, and revise your knowledge intelligently."}
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Smart vault with auto-organization",
              "Spaced-repetition revision schedule",
              "AI-grade semantic search",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur"
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} StudyVault — A Vault for Learning.
        </div>
      </div>

      <div className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <button
            onClick={toggle}
            aria-label="Theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-muted"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold">StudyVault</span>
            </div>

            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              {isLogin ? "Sign in" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Welcome back. Let's get you to your vault."
                : "Free forever. No credit card required."}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 gap-2" type="button" disabled>
                <Github className="h-4 w-4" /> GitHub
              </Button>
              {googleClientId ? (
                <GoogleOAuthProvider clientId={googleClientId}>
                  <div className="h-11 overflow-hidden rounded-md">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setAuthError("Google sign-in failed to start.")}
                      theme="outline"
                      text="continue_with"
                      shape="rectangular"
                      size="large"
                      width={240}
                      useOneTap={false}
                    />
                  </div>
                </GoogleOAuthProvider>
              ) : (
                <Button variant="outline" className="h-11 gap-2" disabled>
                  <Mail className="h-4 w-4" /> Google
                </Button>
              )}
            </div>

            {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}

            {googleLoading && (
              <p className="mt-2 text-xs text-muted-foreground">Signing you in with Google...</p>
            )}

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Aanya Sharma"
                    className="mt-1.5 h-11"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@university.edu"
                  className="mt-1.5 h-11"
                  value={values.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp">Email verification</Label>
                    {otpVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter OTP"
                      className="h-11"
                      value={otp}
                      onChange={(event) => {
                        setOtp(event.target.value);
                        if (otpError) {
                          setOtpError("");
                        }
                      }}
                      disabled={!otpSent}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 min-w-28 shrink-0"
                      onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                      disabled={isSendingOtp || isVerifyingOtp || !values.email || otpVerified}
                    >
                      {isSendingOtp || isVerifyingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : otpVerified ? (
                        "Verified"
                      ) : otpSent ? (
                        "Verify OTP"
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                  {otpError && <p className="mt-1.5 text-xs text-destructive">{otpError}</p>}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pr-10"
                    value={values.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((current) => !current)}
                    className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-brand text-primary-foreground shadow-glow"
                disabled={isSubmitting || (!isLogin && !otpVerified)}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  New to StudyVault?{" "}
                  <Link to="/signup" className="font-semibold text-foreground hover:text-primary">
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <Link to="/login" className="font-semibold text-foreground hover:text-primary">
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
