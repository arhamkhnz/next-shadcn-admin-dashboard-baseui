"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Enter your username.")
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/, "Enter a valid username."),
  password: z.string().min(14, "Password must contain at least 14 characters.").max(200),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = window.setInterval(() => setRetryAfter((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [retryAfter]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your credentials.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string; retryAfterSeconds?: number };
      if (!response.ok) {
        setError(body.message ?? "Unable to sign in with those credentials.");
        setRetryAfter(body.retryAfterSeconds ?? 0);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("The admin service is unavailable. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="username">
          Username
        </label>
        <Input id="username" name="username" autoComplete="username" disabled={pending} required />
      </div>
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={pending}
          required
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm" role="alert">
          {error}
          {retryAfter > 0 ? ` Try again in ${retryAfter} seconds.` : null}
        </p>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={pending || retryAfter > 0}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
