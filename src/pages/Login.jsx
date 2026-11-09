import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Sparkles } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginViaDemo } = useAuth();
  const returnTo = safeReturnTo();
  const destination = returnTo && returnTo !== "/" && returnTo !== "/login" ? returnTo : "/library";

  const handleDemoLogin = () => {
    if (import.meta.env.DEV) {
      loginViaDemo();
      navigate(destination);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = destination;
    } catch (err) {
      if (import.meta.env.DEV) {
        // In local development without Base44 cloud backend, allow demo bypass
        console.warn("Base44 cloud auth not reached in DEV, entering local prototype session:", err);
        loginViaDemo(email);
        window.location.href = destination;
        return;
      }
      // Production: never fall back to demo. Show real error, remain unauthenticated.
      setError(err?.message || "Invalid email or password. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    try {
      base44.auth.loginWithProvider("google", destination);
    } catch {
      if (import.meta.env.DEV) {
        loginViaDemo();
        navigate(destination);
        return;
      }
      setError("Unable to connect to Google authentication provider. Please try email login or check your connection.");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your Yueora music space"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={"/register" + (destination !== "/library" ? "?returnTo=" + encodeURIComponent(destination) : "")}
            className="text-brand font-medium hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      {/* Local Preview / Demo Bypass Banner (DEV only) */}
      {import.meta.env.DEV && (
        <div className="mb-6 rounded-container border border-line-subtle bg-neutral-muted p-4 text-left shadow-xs">
          <div className="flex items-center gap-1.5 type-caption font-semibold text-brand">
            <Sparkles className="icon-sm shrink-0" aria-hidden="true" />
            <span>本地开发与重构效果预览</span>
          </div>
          <p className="mt-1 type-caption text-ink-secondary leading-relaxed">
            本地未连接云端 Base44 账户时，可直接一键免登录进入完整曲库，体验本次重构的乐谱纸张质感、演奏工作区与记忆留存。
          </p>
          <Button
            intent="primary"
            size="md"
            className="mt-3 w-full"
            onClick={handleDemoLogin}
          >
            <span>进入本地演示曲库 (直接预览) →</span>
          </Button>
        </div>
      )}

      <Button
        intent="secondary"
        size="lg"
        className="w-full mb-5"
        onClick={handleGoogle}
      >
        <GoogleIcon className="icon-sm mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line-subtle" />
        </div>
        <div className="relative flex justify-center type-caption font-semibold uppercase tracking-wider">
          <span className="bg-surface-canvas px-3 text-ink-secondary/70">or email</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-control bg-danger/10 text-danger type-caption">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="type-label text-ink-primary">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-ink-tertiary" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="type-label text-ink-primary">Password</Label>
            <Link to="/forgot-password" className="type-caption text-brand hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-ink-tertiary" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          intent="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="icon-sm mr-2 animate-spin" />
              Logging in…
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
