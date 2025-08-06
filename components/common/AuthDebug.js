"use client";
import { useAuth } from "../../hooks/useAuth";

export default function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuth();

  // Vérification côté client pour éviter les erreurs SSR
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userData =
    typeof window !== "undefined" ? localStorage.getItem("userData") : null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Auth</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? "Oui" : "Non"}</div>
        <div>Authenticated: {isAuthenticated ? "Oui" : "Non"}</div>
        <div>User: {user ? "Présent" : "Absent"}</div>
        {user && (
          <>
            <div>ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Premium: {user.premium ? "Oui" : "Non"}</div>
          </>
        )}
        <div className="mt-2">
          <div>localStorage token: {token ? "Présent" : "Absent"}</div>
          <div>localStorage userData: {userData ? "Présent" : "Absent"}</div>
        </div>
      </div>
    </div>
  );
}
