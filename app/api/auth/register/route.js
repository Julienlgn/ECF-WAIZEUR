import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../../../lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export async function POST(request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    console.log("=== API Register ===");
    console.log("Email:", email);

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
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
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("Mot de passe hashé avec succès");

    // Préparer les données utilisateur
    const userData = {
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      premium: false,
    };

    console.log("Données utilisateur préparées:", {
      email,
      firstName,
      lastName,
    });

    // Insertion dans la table users
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error("Erreur détaillée lors de l'insertion:", error);
      return NextResponse.json(
        { error: `Erreur lors de l'insertion: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      console.error("Aucune donnée retournée après insertion");
      return NextResponse.json(
        { error: "Erreur: Aucun ID généré pour l'utilisateur" },
        { status: 500 }
      );
    }

    console.log("Utilisateur créé avec succès, ID:", data.id);

    // Génération du token
    const token = jwt.sign({ userId: data.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return NextResponse.json({
      user: {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        premium: data.premium,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur complète dans l'API register:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
