import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "../../../../lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(request) {
  try {
    console.log("=== API Update User ===");

    // Vérifier l'autorisation
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token d'autorisation manquant" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { firstName, lastName, email } = await request.json();

    console.log("Données reçues:", { firstName, lastName, email });
    console.log("User ID:", decoded.userId);

    // Validation des données
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", decoded.userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erreur lors de la vérification:", checkError);
      return NextResponse.json(
        { error: "Erreur lors de la vérification de l'email" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé par un autre utilisateur" },
        { status: 409 }
      );
    }

    // Mettre à jour l'utilisateur
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", decoded.userId)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour:", error);
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Utilisateur mis à jour avec succès");

    return NextResponse.json({
      user: {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        premium: data.premium,
      },
      message: "Profil mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur complète dans l'API update user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
