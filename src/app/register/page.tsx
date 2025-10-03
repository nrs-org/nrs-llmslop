"use client";
import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { SSOButton } from "@/components/SSOButton";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: registerError } = await authClient.signUp.email({
                email,
                password,
                name,
            });
            if (registerError) setError(registerError.message ?? "Registration failed"); else {
                router.push("/");
            }
        } catch (err: any) {
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    const authClient = createAuthClient();

    return (
        <div className="max-w-md mx-auto mt-20">
            <Card className="w-[420px]">
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-2xl font-bold">Register</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                    <form className="grid gap-5" onSubmit={handleRegister}>
                        <Input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            required
                        />
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
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>
                    <div className="mt-8">
                        <div className="text-center text-gray-500 mb-3">Or sign up with</div>
                        <div className="grid grid-cols-2 gap-4">
                            <SSOButton provider="github" name="GitHub" logo="/source-icons/GitHub.svg" darkLogo="/source-icons/GitHub-White.svg" onClick={() => authClient.signIn.social({ provider: "github" })} />
                            <SSOButton provider="google" name="Google" logo="/source-icons/Google.svg" onClick={() => authClient.signIn.social({ provider: "google" })} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-4 pb-2 flex flex-col gap-2">
                    <Link href="/login" className="text-blue-600 hover:underline text-center">Already have an account? Login</Link>
                </CardFooter>
            </Card>
        </div>
    );

}

