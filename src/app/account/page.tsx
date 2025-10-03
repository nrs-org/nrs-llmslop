"use client";
import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const { data: session, isPending, error } = authClient.useSession();
  const [serviceStatus, setServiceStatus] = useState<Record<string, boolean>>({});
  // OAuth linking state
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [editSourcesOpen, setEditSourcesOpen] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchStatus() {
      const res = await fetch("/api/account/status");
      if (res.ok) {
        const data = await res.json();
        setServiceStatus(data.status || {});
      }
    }
    if (session?.user?.id) fetchStatus();
  }, [session?.user?.id]);

  if (isPending) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const services = [
    {
      provider: "myanimelist",
      name: "MyAnimeList",
      icon: "/source-icons/MyAnimeList.svg",
      status: serviceStatus.myanimelist ? "Linked" : "Not linked",
    },
    {
      provider: "anilist",
      name: "AniList",
      icon: "/source-icons/AniList.svg",
      status: serviceStatus.anilist ? "Linked" : "Not linked"
    },
    {
      provider: "youtube",
      name: "YouTube",
      icon: "/source-icons/YouTube.svg",
      status: serviceStatus.youtube ? "Linked" : "Not linked",
    },
    {
      provider: "spotify",
      name: "Spotify",
      icon: "/source-icons/Spotify.svg",
      status: serviceStatus.spotify ? "Linked" : "Not linked"
    },
  ];
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header with user info, full width */}
      <div className="w-full flex items-center gap-6 px-8 py-8 border-b bg-white dark:bg-neutral-900">
        <div className="relative">
          <img
            src={session.user.image || "/favicon.ico"}
            alt="User avatar"
            className="h-24 w-24 rounded-full border object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold">{session.user.name || session.user.email}</div>
          <div className="text-gray-500">{session.user.email}</div>
        </div>
      </div>

      {/* Full-width cards for settings */}
      <div className="w-full flex flex-col gap-8 px-8 py-10">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input type="text" value={session.user.name || ""} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" value={session.user.email || ""} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <form
                className="flex flex-col gap-4"
                onSubmit={async e => {
                  e.preventDefault();
                  setPwLoading(true);
                  setPwError(null);
                  setPwSuccess(false);
                  try {
                    const { error } = await authClient.changePassword({
                      currentPassword: oldPassword,
                      newPassword,
                    });
                    if (error) {
                      setPwError(error.message || "Failed to change password");
                    } else {
                      setPwSuccess(true);
                      setOldPassword("");
                      setNewPassword("");
                    }
                  } catch (err: any) {
                    setPwError(err.message || "Unknown error");
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  disabled={pwLoading}
                />
                <label className="block text-sm font-medium mb-1">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  disabled={pwLoading}
                />
                {pwError && <div className="text-red-500 text-sm">{pwError}</div>}
                {pwSuccess && <div className="text-green-600 text-sm">Password changed successfully!</div>}
                <Button type="submit" disabled={pwLoading || !oldPassword || !newPassword} variant="default">
                  {pwLoading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="destructive"
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/"),
                  },
                });
              }}
            >Logout</Button>
          </CardFooter>
        </Card>
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Linked Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {services.map(svc => (
                <div key={svc.provider} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50 dark:bg-neutral-900">
                  <img src={svc.icon} alt={svc.name} className="w-7 h-7" />
                  <span className="font-medium text-base">{svc.name}</span>
                  <span className={svc.status === "Linked" ? "text-green-600" : "text-gray-500"}>{svc.status}</span>
                  {svc.status === "Linked" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={oauthLoading === svc.provider}
                      onClick={async () => {
                        setOauthLoading(svc.provider);
                        try {
                          const res = await fetch("/api/account/oauth-connect", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ provider: svc.provider }),
                          });
                          if (res.ok) {
                            setServiceStatus(s => ({ ...s, [svc.provider]: false }));
                          }
                        } finally {
                          setOauthLoading(null);
                        }
                      }}
                    >
                      {oauthLoading === svc.provider ? `Unlinking...` : `Unlink`}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={oauthLoading === svc.provider}
                      onClick={async () => {
                        setOauthLoading(svc.provider);
                        try {
                          const res = await fetch("/api/account/oauth-connect", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ provider: svc.provider }),
                          });
                          const { url } = await res.json();
                          document.location.href = url;
                        } finally {
                          setOauthLoading(null);
                        }
                      }}
                    >
                      {oauthLoading === svc.provider ? `Linking...` : `Link`}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Button variant="secondary" onClick={() => setEditSourcesOpen(true)} className="mb-4">Edit Additional Sources</Button>
      </div>
    </div>
  );
}
