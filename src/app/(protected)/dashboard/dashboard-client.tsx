"use client";

import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface DashboardClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    createdAt: Date;
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarMenuOpen]);

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", active: true },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-outline transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex items-center gap-2.5 h-16 px-6 border-b border-outline">
          <svg className="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
          </svg>
          <span className="text-[var(--title-medium-font-size)] leading-[var(--title-medium-line-height)] tracking-[-0.3px] font-[var(--title-medium-font-weight)] text-on-surface">
            SecureGate
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 h-10 text-sm rounded-sm transition-colors ${
                item.active
                  ? "bg-primary-container text-on-primary-container font-medium"
                  : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center h-16 px-4 lg:px-8 border-b border-outline bg-surface">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div ref={avatarMenuRef} className="ml-auto flex items-center gap-3 text-sm text-on-surface-variant relative">
            <span className="hidden sm:inline">{user.email}</span>
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <span className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-xs font-medium text-on-surface">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <svg className="w-3.5 h-3.5 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {avatarMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline rounded-sm shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-outline">
                  <p className="text-sm font-medium text-on-surface truncate">{user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setAvatarMenuOpen(false); setShowLogoutModal(true); }}
                  className="flex items-center gap-2 w-full px-4 h-9 text-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-8">
          <div>
            <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
              Welcome back{user.name ? `, ${user.name}` : ""}
            </h1>
            <p className="mt-1 text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
              Here is an overview of your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-outline rounded-sm p-5 bg-surface space-y-2">
              <p className="text-xs font-medium tracking-wide uppercase text-on-surface-variant">
                Account Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.emailVerified ? "bg-tertiary" : "bg-outline"
                  }`}
                />
                <span className="text-sm font-medium text-on-surface">
                  {user.emailVerified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>

            <div className="border border-outline rounded-sm p-5 bg-surface space-y-2">
              <p className="text-xs font-medium tracking-wide uppercase text-on-surface-variant">
                Member Since
              </p>
              <p className="text-sm font-medium text-on-surface">
                {formatDate(user.createdAt)}
              </p>
            </div>

            <div className="border border-outline rounded-sm p-5 bg-surface space-y-2">
              <p className="text-xs font-medium tracking-wide uppercase text-on-surface-variant">
                Email
              </p>
              <p className="text-sm font-medium text-on-surface truncate">
                {user.email}
              </p>
            </div>
          </div>

        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-surface border border-outline rounded-sm p-6 space-y-4">
            <h2 className="text-[var(--title-small-font-size)] leading-[var(--title-small-line-height)] font-[var(--title-small-font-weight)] text-on-surface">
              Sign Out
            </h2>
            <p className="text-sm text-on-surface-variant">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isSigningOut}
                className="flex-1 h-11 border border-outline text-on-surface font-medium text-sm hover:bg-surface-variant transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isSigningOut}
                className="flex-1 h-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
              >
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
