import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar({ title }: { title: React.ReactNode }) {
  return (
    <nav className="flex items-center justify-between p-4 border-b h-16">
      <h1 className="text-xl font-semibold">{title}</h1>
      <ThemeToggle />
    </nav>
  );
}
