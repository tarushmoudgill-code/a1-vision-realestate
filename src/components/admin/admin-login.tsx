"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, Lock, Mail, Loader2, Eye, EyeOff, AlertCircle, Shield, Clock } from "lucide-react";
import { useRouter } from "@/store/router";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BUSINESS } from "@/lib/constants";

export function AdminLogin() {
  const navigate = useRouter((s) => s.navigate);
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("admin@a1vision.com.au");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockdownSeconds, setLockdownSeconds] = useState(0);

  // Countdown for rate-limit lockdown
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setLockdownSeconds(0);
        setAttempts(0);
      } else {
        setLockdownSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  // Caps lock detection
  function checkCapsLock(e: React.KeyboardEvent) {
    const capsLock = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(!!capsLock);
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (lockedUntil) return;
    if (!validate()) return;

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.ok) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Rate limit after 5 failed attempts
      if (newAttempts >= 5) {
        const until = Date.now() + 30000; // 30 second lockout
        setLockedUntil(until);
        toast.error("Too many failed attempts. Please wait 30 seconds.");
      } else {
        toast.error(res.error || "Login failed", {
          description: `${5 - newAttempts} attempts remaining`,
        });
      }
      return;
    }

    // Success
    setAttempts(0);
    toast.success("Welcome back!", {
      description: "You're now signed in to the staff portal.",
    });
    navigate("admin/dashboard");
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left — premium brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt="A1 Vision Real Estate luxury property"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="inline-block w-fit rounded-lg bg-white px-3.5 py-2 shadow-md">
            <Image src="/logo.png" alt="A1 Vision Real Estate" width={170} height={58} className="h-12 w-auto shrink-0 object-contain sm:h-14" />
          </div>

          <div className="max-w-md">
            <h2 className="font-serif text-4xl leading-tight">
              The staff portal for managing your property business.
            </h2>
            <p className="mt-4 text-sm text-white/80">
              Listings, leads, inspections, agents, blog and analytics — all in
              one place. Authorised staff only.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-gold" /> Secure access
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={14} className="text-gold" /> Encrypted session
              </span>
            </div>
          </div>

          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center bg-cream p-6 sm:p-12">
        <Card className="w-full max-w-md border-none shadow-luxe">
          <CardHeader className="space-y-4 text-center">
            {/* Mobile logo */}
            <div className="mx-auto rounded-lg bg-white px-3.5 py-2 shadow-sm lg:hidden">
              <Image src="/logo.png" alt="A1 Vision Real Estate" width={160} height={54} className="h-12 w-auto object-contain" />
            </div>
            <div>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10">
                <Lock className="size-5 text-primary" />
              </div>
              <h1 className="font-serif text-2xl">Staff Portal</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to access the administration dashboard.
              </p>
            </div>
          </CardHeader>

          <form onSubmit={onSubmit} noValidate>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@a1vision.com.au"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    onKeyDown={checkCapsLock}
                    className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    disabled={!!lockedUntil || loading}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-primary"
                    onClick={() => toast.info("Contact your administrator to reset your password.")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    onKeyDown={checkCapsLock}
                    className={`pl-9 pr-9 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    disabled={!!lockedUntil || loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
                {capsLockOn && !errors.password && (
                  <p className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle size={12} /> Caps Lock is on
                  </p>
                )}
              </div>

              {/* Rate limit warning */}
              {lockedUntil && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  <Clock size={16} className="shrink-0" />
                  <span>
                    Too many failed attempts. Please wait{" "}
                    <span className="font-semibold">{lockdownSeconds}s</span>{" "}
                    before trying again.
                  </span>
                </div>
              )}

              {/* Attempt counter */}
              {attempts > 0 && !lockedUntil && (
                <div className="flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-50 p-2.5 text-xs text-amber-700 dark:bg-amber-950/30">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{5 - attempts} attempts remaining before temporary lockout</span>
                </div>
              )}

              {/* Demo credentials */}
              <div className="rounded-md border border-gold/40 bg-gold/10 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Shield size={13} className="text-gold" /> Demo credentials
                </p>
                <div className="mt-1.5 space-y-0.5">
                  <p>
                    Email: <span className="font-mono text-foreground">{BUSINESS.email === "hello@a1vision.com.au" ? "admin@a1vision.com.au" : BUSINESS.email}</span>
                  </p>
                  <p>
                    Password: <span className="font-mono text-foreground">admin123</span>
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || !!lockedUntil}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : lockedUntil ? (
                  `Locked — wait ${lockdownSeconds}s`
                ) : (
                  <>
                    <Lock size={15} className="mr-1" />
                    Sign in securely
                  </>
                )}
              </Button>
            </CardFooter>
          </form>

          <Separator className="my-2" />
          <CardFooter className="justify-center">
            <Link
              href="#/home"
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to website
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
