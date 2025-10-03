"use client";
import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { SSOButton } from "@/components/SSOButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: loginError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });
  if (loginError) setError(loginError.message ?? "Login failed");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card className="w-[420px]">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          <form className="grid gap-5" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-8">
            <div className="text-center text-gray-500 mb-3">Or sign in with</div>
            <div className="grid grid-cols-2 gap-4">
              <SSOButton provider="github" name="GitHub" logo="/source-icons/GitHub.svg" darkLogo="/source-icons/GitHub-White.svg" onClick={() => authClient.signIn.social({ provider: "github" })} />
              <SSOButton provider="google" name="Google" logo="/source-icons/Google.svg" onClick={() => authClient.signIn.social({ provider: "google" })} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-2 flex flex-col gap-2">
          <Link href="/register" className="text-blue-600 hover:underline text-center">Don't have an account? Register</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
