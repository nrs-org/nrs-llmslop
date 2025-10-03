import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { NavbarUser } from "@/components/NavbarUser";

export function Navbar({ title }: { title: React.ReactNode }) {
  return (
    <nav className="flex items-center justify-between p-4 border-b h-16">
      <Link href="/" className="text-xl font-semibold hover:underline focus:outline-none">
        {title}
      </Link>
      <div className="flex items-center gap-4">
        <NavbarUser />
        <ThemeToggle />
      </div>
    </nav>
  );
}
