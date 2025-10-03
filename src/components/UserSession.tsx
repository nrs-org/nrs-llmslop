"use client";
import React from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UserSession() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();

  if (isPending) return <div>Loading session...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!session?.user) return (
    <div className="text-center">
      <a href="/login" className="text-blue-600 hover:underline">Login</a> or <a href="/register" className="text-blue-600 hover:underline">Register</a>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={session.user.image || "/favicon.ico"} alt="User avatar" className="h-12 w-12 rounded-full" />
      <div className="font-bold">{session.user.name || session.user.email}</div>
      <div className="text-sm text-gray-500">{session.user.email}</div>
      <button
        className="mt-2 px-4 py-1 bg-red-500 text-white rounded"
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/login"),
            },
          });
        }}
      >Sign Out</button>
    </div>
  );
}
