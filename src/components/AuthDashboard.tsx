"use client";
import React from "react";

const providers = [
  {
    id: "myanimelist",
    name: "MyAnimeList",
    logo: "/public/source-icons/MyAnimeList.svg",
  },
  {
    id: "anilist",
    name: "AniList",
    logo: "/public/source-icons/AniList.svg",
  },
  {
    id: "youtube",
    name: "YouTube",
    logo: "/public/source-icons/YouTube.svg",
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "/public/source-icons/Spotify.svg",
  },
];

function handleAuth(providerId: string) {
  window.location.href = `/api/auth?provider=${providerId}`;
}

export default function AuthDashboard() {
  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect Your Accounts</h2>
      <div className="grid grid-cols-2 gap-6">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            onClick={() => handleAuth(provider.id)}
          >
            <img src={provider.logo} alt={provider.name} className="h-12 w-12 mb-2" />
            <span className="font-medium">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
