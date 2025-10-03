
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function SSOButton({ provider, name, logo, darkLogo, onClick }: { provider: string; name: string; logo: string; darkLogo?: string; onClick: () => void }) {
    return (
        <Button
            type="button"
            variant="outline"
            className={cn("flex flex-col items-center p-3 gap-1 border rounded-lg hover:bg-gray-50 transition min-h-[80px]")}
            onClick={onClick}
        >
            <span className="relative w-8 h-8 flex items-center justify-center">
                <img
                    src={logo}
                    alt={name}
                    className={cn("absolute w-8 h-8", darkLogo ? "dark:hidden" : "")}
                />
                {darkLogo && (
                    <img
                        src={darkLogo}
                        alt={name}
                        className="absolute w-8 h-8 hidden dark:block"
                    />
                )}
            </span>
            <span className="text-sm font-medium">{name}</span>
        </Button>
    );
}