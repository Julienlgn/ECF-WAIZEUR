import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("=== API Logout ===");

    // Créer une réponse avec les cookies supprimés
    const response = NextResponse.json({
      message: "Déconnexion réussie",
    });

    // Supprimer les cookies d'authentification
    response.cookies.delete("token");
    response.cookies.delete("userData");

    console.log("Cookies supprimés avec succès");

    return response;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
