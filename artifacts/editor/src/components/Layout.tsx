// artifacts/editor/src/components/Layout.tsx
import { Languages, Moon, Sun, Users } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  I18nProvider,
  getLocaleLabel,
  getLocalePath,
  locales,
  useI18n,
  type Locale,
} from "@/i18n";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useTheme } from "../hooks/useTheme";

function pathWithoutLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (locales.includes(parts[0] as Locale)) {
    return `/${parts.slice(1).join("/")}`;
  }

  return pathname;
}

export function Layout({ locale }: { locale: Locale }) {
  const { theme, toggleTheme } = useTheme();
  const onlineUsers = useOnlineUsers();
  const location = useLocation();

  return (
    <I18nProvider locale={locale}>
      <LayoutContent
        locale={locale}
        onlineUsers={onlineUsers}
        theme={theme}
        toggleTheme={toggleTheme}
        pathname={location.pathname}
      />
    </I18nProvider>
  );
}

function LayoutContent({
  locale,
  onlineUsers,
  theme,
  toggleTheme,
  pathname,
}: {
  locale: Locale;
  onlineUsers: number | null;
  theme: string;
  toggleTheme: () => void;
  pathname: string;
}) {
  const { t } = useI18n();
  const currentPath = pathWithoutLocale(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link
            to={getLocalePath(locale)}
            className="flex items-center space-x-2"
          >
            <span className="font-bold text-lg text-primary">TabPad</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-3">
            <Link
              to={getLocalePath(locale)}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t.nav.editor}
            </Link>
            <Link
              to={getLocalePath(locale, "/contact")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t.nav.contact}
            </Link>
            <div
              className="hidden h-8 items-center gap-1.5 rounded-sm border border-border bg-muted/40 px-2 text-xs text-muted-foreground sm:flex"
              title={t.nav.onlineLabel}
              aria-label={`${t.nav.onlineLabel}: ${
                onlineUsers ?? t.nav.onlineLoading
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <Users size={14} aria-hidden="true" />
              <span>{onlineUsers ?? "--"} online</span>
            </div>
            <label className="flex h-8 items-center gap-1.5 rounded-sm border border-border bg-background px-2 text-xs text-muted-foreground">
              <Languages size={14} aria-hidden="true" />
              <span className="sr-only">{t.nav.language}</span>
              <select
                className="bg-transparent text-xs outline-none"
                value={locale}
                onChange={(event) => {
                  window.location.href = getLocalePath(
                    event.target.value as Locale,
                    currentPath,
                  );
                }}
                aria-label={t.nav.language}
              >
                {locales.map((availableLocale) => (
                  <option key={availableLocale} value={availableLocale}>
                    {getLocaleLabel(availableLocale)}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title={t.nav.theme}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            © {new Date().getFullYear()} TabPad. {t.footer.rights}
          </p>
          <p>
            {t.footer.contact}:{" "}
            <a
              href="mailto:contato@tabpad.online"
              className="hover:text-primary"
            >
              contato@tabpad.online
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
