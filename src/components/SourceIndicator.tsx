import { detectSourceType } from "@/lib/sourceProcessing";
import React from "react";

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export const SourceIndicator: React.FC<{ url: string }> = ({ url }) => {
  if (!url) return null;
  const source = detectSourceType(url);
  const icon = source?.type?.icon || "/source-icons/URL.svg";
  const name = source?.type?.name || "URL";
  const upstreamType = source?.upstreamType;
  return (
    <div
      className={`transition-all duration-200 ${url ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'}`}
      aria-hidden={!url}
      style={{ position: 'relative' }}
    >
      {isValidUrl(url) ? (
        <div className="flex items-center gap-2 text-sm mt-2">
          <img src={icon} alt={name} width={24} height={24} />
          <span>
            {name}
            {upstreamType && (
              <span className="ml-1 text-xs text-gray-400">
                ({upstreamType})
              </span>
            )}
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
