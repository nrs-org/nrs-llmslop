"use client";
import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NavbarUser() {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (isPending) return (
    <div className="animate-pulse flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
      <div className="w-20 h-4 rounded bg-gray-300 dark:bg-gray-700" />
      <Button disabled size="sm" className="px-3 py-1">...</Button>
    </div>
  );
  if (error) return null;
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <a href="/login" className="text-base font-medium hover:underline">Login</a>
        <a href="/register" className="text-base font-medium hover:underline">Register</a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <img src={session.user.image || "/favicon.ico"} alt="User avatar" className="h-8 w-8 rounded-full" />
      <a href="/account" className="font-bold hover:underline">{session.user.name || session.user.email}</a>
      <Button
        variant="destructive"
        size="sm"
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/"),
            },
          });
        }}
      >Logout</Button>
    </div>
  );
}
