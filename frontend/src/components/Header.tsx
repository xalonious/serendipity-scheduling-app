import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/Auth.context";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const Header: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const login = () => {
    const returnTo = window.location.href;
    window.location.href = `${BACKEND}/api/auth/roblox?returnTo=${encodeURIComponent(
      returnTo
    )}`;
  };

  const menuItems = [
    { to: "/", label: "Home", end: true },
    { to: "/shifts", label: "Shifts" },
    { to: "/trainings", label: "Trainings" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <header className="bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 md:h-16">
          <NavLink to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold tracking-tight">
              Serendipity
            </span>
            <span className="hidden sm:inline text-lg font-light">
              Support Center
            </span>
          </NavLink>

          <nav className="hidden md:flex space-x-6">
            {menuItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-2 rounded-md bg-white text-pink-600 font-semibold"
                    : "px-3 py-2 rounded-md text-white hover:bg-white hover:text-pink-600 font-medium transition"
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-3">
              {loading ? (
                <div className="text-white opacity-75">Checking…</div>
              ) : !user ? (
                <button
                  onClick={login}
                  className="px-4 py-2 border border-white text-white hover:bg-white hover:text-pink-600 rounded-md text-sm font-medium transition cursor-pointer"
                >
                  Login
                </button>
              ) : (
                <>
                  <img
                    src={user.avatarUrl ?? undefined}
                    alt={user.username}
                    className="w-9 h-9 rounded-full ring-2 ring-white"
                  />
                  <span className="text-sm font-medium">{user.username}</span>
                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 rounded-full text-white hover:bg-white hover:text-pink-600 transition"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              className="
                inline-flex md:hidden items-center justify-center p-2 
                md:hover:bg-white md:hover:text-pink-600 
                focus:outline-none active:bg-transparent rounded-md transition
              "
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav
        className={`md:hidden bg-pink-500 transition-max-h duration-200 overflow-hidden ${
          mobileMenuOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-4">
          {loading ? (
            <div className="text-white opacity-75 px-3">Checking…</div>
          ) : !user ? (
            <button
              onClick={login}
              className="w-full text-left px-3 py-2 border border-white text-white hover:bg-white hover:text-pink-600 rounded-md text-sm font-medium transition cursor-pointer"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center px-3 space-x-3">
              <img
                src={user.avatarUrl ?? undefined}
                alt={user.username}
                className="w-8 h-8 rounded-full ring-2 ring-white"
              />
              <span className="text-white font-medium">{user.username}</span>
              <button
                onClick={logout}
                title="Log out"
                className="ml-auto p-2 rounded-full text-white hover:bg-white hover:text-pink-600 transition"
              >
                <FaSignOutAlt className="h-5 w-5" />
              </button>
            </div>
          )}

          {menuItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-2 rounded-md bg-white text-pink-600 font-semibold"
                  : "block px-3 py-2 rounded-md text-white hover:bg-white hover:text-pink-600 font-medium transition"
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
