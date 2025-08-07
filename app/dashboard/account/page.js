"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // Fonction pour activer le mode édition
  const handleEditClick = useCallback(() => {
    console.log(
      "Activation du mode édition - isEditing avant:",
      isEditingRef.current
    );
    isEditingRef.current = true;
    setIsEditing(true);
    console.log("Activation du mode édition - isEditing après:", true);
  }, []);

  // Fonction pour annuler l'édition
  const handleCancelEdit = useCallback(() => {
    console.log("Annulation du mode édition");
    isEditingRef.current = false;
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || user?.first_name || "",
      lastName: user?.lastName || user?.last_name || "",
      email: user?.email || "",
    });
  }, [user]);

  useEffect(() => {
    console.log("useEffect triggered");
    // Récupérer les données utilisateur depuis localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const userInfo = JSON.parse(userData);
      console.log("User data loaded:", userInfo);

      // Éviter de mettre à jour si les données sont identiques
      setUser((prevUser) => {
        if (JSON.stringify(prevUser) === JSON.stringify(userInfo)) {
          return prevUser;
        }
        return userInfo;
      });

      setFormData((prevFormData) => {
        const newFormData = {
          firstName: userInfo.firstName || userInfo.first_name || "",
          lastName: userInfo.lastName || userInfo.last_name || "",
          email: userInfo.email || "",
        };

        if (JSON.stringify(prevFormData) === JSON.stringify(newFormData)) {
          return prevFormData;
        }
        return newFormData;
      });
    } else {
      // Rediriger vers la connexion si pas d'utilisateur
      router.push("/auth/login");
    }
    setIsLoading(false);
  }, [router]);

  // Log quand isEditing change
  useEffect(() => {
    console.log("isEditing changed to:", isEditing);
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Changement de champ:", name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Profil mis à jour avec succès !",
        });
        setIsEditing(false);

        // Mettre à jour les données locales
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Nettoyer le localStorage et les cookies
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        setMessage({
          type: "success",
          text: "Compte supprimé avec succès. Redirection...",
        });

        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la suppression du compte",
        });
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la suppression du compte",
      });
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setMessage({ type: "", text: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  console.log("État actuel - isEditing:", isEditing, "isLoading:", isLoading);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* En-tête */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
              <p className="text-gray-600">
                Gérez vos informations personnelles
              </p>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations du profil */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations personnelles
                  </h2>

                  {message.text && (
                    <div
                      className={`mb-4 p-4 rounded-md ${
                        message.type === "success"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!isEditingRef.current}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!isEditingRef.current}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditingRef.current}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="mt-6 flex space-x-3">
                      {!isEditingRef.current ? (
                        <button
                          type="button"
                          onClick={handleEditClick}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Modifier
                        </button>
                      ) : (
                        <>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>

                {/* Section suppression de compte */}
                <div className="bg-red-50 rounded-lg p-6 mt-6">
                  <h2 className="text-lg font-semibold text-red-900 mb-4">
                    Zone dangereuse
                  </h2>
                  <p className="text-red-700 mb-4">
                    La suppression de votre compte est irréversible. Toutes vos
                    données seront définitivement supprimées.
                  </p>

                  {showDeleteConfirm ? (
                    <div className="bg-red-100 border border-red-300 rounded-md p-4 mb-4">
                      <p className="text-red-800 font-medium mb-3">
                        Êtes-vous sûr de vouloir supprimer votre compte ? Cette
                        action est irréversible.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {isLoading
                            ? "Suppression..."
                            : "Oui, supprimer mon compte"}
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Supprimer mon compte
                    </button>
                  )}
                </div>
              </div>

              {/* Informations du compte */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations du compte
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        ID Utilisateur
                      </p>
                      <p className="text-sm text-gray-900">{user.id}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Statut Premium
                      </p>
                      <div className="flex items-center mt-1">
                        {user.premium ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Gratuit
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Membre depuis
                      </p>
                      <p className="text-sm text-gray-900">
                        {new Date().toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {!user.premium && (
                    <div className="mt-6">
                      <a
                        href="/premium"
                        className="block w-full text-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Passer Premium
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
