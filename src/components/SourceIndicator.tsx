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
    name: "VGMDB",
    icon: "/source-icons/VGMDB.svg",
    match: /vgmdb\.net\/artist\//,
    type: "Artist",
  },
  // VGMDB album
  {
    name: "VGMDB",
    icon: "/source-icons/VGMDB.svg",
    match: /vgmdb\.net\/album\//,
    type: "Album",
  },
  // VGMDB generic
  {
    name: "VGMDB",
    icon: "/source-icons/VGMDB.svg",
    match: /vgmdb\.net\//,
    type: "Generic",
  },
  // YouTube video
  {
    name: "YouTube",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/watch\?v=|youtu\.be\//,
    type: "Video",
  },
  // YouTube playlist
  {
    name: "YouTube",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/playlist\?list=/,
    type: "Playlist",
  },
  // YouTube user/channel
  {
    name: "YouTube",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/(user|channel|@)[^/]+/,
    type: "User",
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
  return (
    <div
      className={`transition-all duration-200 ${url ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'}`}
      aria-hidden={!url}
    >
      {source ? (
        <div className="flex items-center gap-2 text-sm mt-2">
          <img src={source.icon} alt={source.name} width={24} height={24} />
          <span>
            {source.name}
            {source.type ? (
              <span className="ml-1 text-xs text-gray-400">({source.type})</span>
            ) : null}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <span>Unknown source</span>
        </div>
      )}
    </div>
  );
};
