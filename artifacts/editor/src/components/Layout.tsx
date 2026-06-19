// artifacts/editor/src/components/Layout.tsx
import { Link, Outlet } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg text-primary">TabPad</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Editor
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} TabPad. All rights reserved.</p>
          <p>Contact: <a href="mailto:contato@tabpad.online" className="hover:text-primary">contato@tabpad.online</a></p>
        </div>
      </footer>
    </div>
  );
}