"use client";

import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4">
        {/* Logo ou Titre */}
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition"
        >
          WAIZEUR
        </Link>

        {/* Liens de navigation */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Météo
              </Link>
              <Link
                href="/dashboard/favorite"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Favoris
              </Link>
              <Link
                href="/dashboard/account"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Compte
              </Link>
              <LogoutButton className="text-sm" />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
