import React from "react";


const sources = [
  {
    name: "MyAnimeList",
    icon: "/source-icons/MyAnimeList.svg",
    match: /myanimelist\.net\/anime\//,
  },
  {
    name: "AniList",
    icon: "/source-icons/AniList.svg",
    match: /anilist\.co\/anime\//,
  },
  {
    name: "Kitsu",
    icon: "/source-icons/Kitsu.svg",
    match: /kitsu\.io\/anime\//,
  },
  {
    name: "AniDB",
    icon: "/source-icons/AniDB.svg",
    match: /anidb\.net\/anime\//,
  },
  {
    name: "VNDB",
    icon: "/source-icons/VNDB.svg",
    match: /vndb\.org\//,
  },
  // VGMDB artist
  {
    name: "VGMDB (Artist)",
    icon: "/source-icons/VGMDB.svg",
    match: /vgmdb\.net\/artist\//,
    type: "artist",
  },
  // VGMDB album
  {
    name: "VGMDB (Album)",
    icon: "/source-icons/VGMDB.svg",
    match: /vgmdb\.net\/album\//,
    type: "album",
  },
  // VGMDB generic
  {
    name: "VGMDB",
    icon: "/source-icons/VGMDB.svg",
    match: /vgmdb\.net\//,
  },
  // YouTube video
  {
    name: "YouTube (Video)",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/watch\?v=|youtu\.be\//,
    type: "video",
  },
  // YouTube playlist
  {
    name: "YouTube (Playlist)",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/playlist\?list=/,
    type: "playlist",
  },
  // YouTube user/channel
  {
    name: "YouTube (User/Channel)",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/(user|channel|@)[^/]+/,
    type: "user",
  },
  {
    name: "Spotify",
    icon: "/source-icons/Spotify.svg",
    match: /open\.spotify\.com\//,
  },
];

export function detectSource(url: string) {
  for (const source of sources) {
    if (source.match.test(url)) {
      return source;
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return {
      name: "URL",
      icon: "/source-icons/URL.svg",
      match: /.*/,
    };
  }
  return null;
}

export const SourceIndicator: React.FC<{ url: string }> = ({ url }) => {
  const source = detectSource(url);
  if (!url) return null;
  if (!source) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
        <span>Unknown source</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm mt-2">
      <img src={source.icon} alt={source.name} width={24} height={24} />
      <span>
        {source.name}
        {source.type ? (
          <span className="ml-1 text-xs text-gray-400">[{source.type}]</span>
        ) : null}
      </span>
    </div>
  );
};
