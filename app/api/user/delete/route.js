import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "../../../../lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function DELETE(request) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Supprimer l'utilisateur de la base de données
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du compte" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur dans l'API de suppression:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
