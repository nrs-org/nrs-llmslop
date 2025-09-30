import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 border-b h-16">
      <h1 className="text-xl font-semibold">NRS LLMSLOP</h1>
      <ThemeToggle />
    </nav>
  );
}
