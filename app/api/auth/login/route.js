import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../../../lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log("=== API Login ===");
    console.log("Email:", email);
    console.log("Mot de passe fourni:", password ? "Présent" : "Manquant");

    // Validation des données
    if (!email || !password) {
      console.error("Données manquantes:", { email: !!email, password: !!password });
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur par son email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      console.error("Code d'erreur:", error.code);
      console.error("Message d'erreur:", error.message);
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (!user) {
      console.error("Aucun utilisateur trouvé pour l'email:", email);
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("Utilisateur trouvé, ID:", user.id);
    console.log("Email utilisateur:", user.email);
    console.log("Mot de passe en base:", user.password ? "Présent" : "Manquant");
    console.log("Longueur du mot de passe en base:", user.password ? user.password.length : 0);

    if (!user.password) {
      console.error("Mot de passe manquant pour l'utilisateur:", user.id);
      return NextResponse.json(
        { error: "Erreur de données utilisateur - mot de passe manquant" },
        { status: 500 }
      );
    }

    // Vérifier si le mot de passe est hashé
    const isHashed =
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$") ||
      user.password.startsWith("$2y$");

    console.log("Mot de passe hashé:", isHashed);
    console.log("Début du mot de passe en base:", user.password.substring(0, 10) + "...");

    let isValidPassword = false;

    if (isHashed) {
      // Mot de passe hashé, utiliser bcrypt.compare
      console.log("Utilisation de bcrypt.compare");
      try {
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log("Résultat bcrypt.compare:", isValidPassword);
      } catch (bcryptError) {
        console.error("Erreur lors de la comparaison bcrypt:", bcryptError);
        return NextResponse.json(
          { error: "Erreur lors de la vérification du mot de passe" },
          { status: 500 }
        );
      }
    } else {
      // Mot de passe non hashé, comparaison directe
      console.log("Comparaison directe (mot de passe non hashé)");
      isValidPassword = password === user.password;
      console.log("Résultat comparaison directe:", isValidPassword);

      // Si la connexion réussit avec un mot de passe non hashé, le hasher
      if (isValidPassword) {
        console.log("Mise à jour du mot de passe vers hashé...");
        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          const { error: updateError } = await supabase
            .from("users")
            .update({ password: hashedPassword })
            .eq("id", user.id);

          if (updateError) {
            console.error(
              "Erreur lors de la mise à jour du mot de passe:",
              updateError
            );
          } else {
            console.log("Mot de passe mis à jour avec succès");
          }
        } catch (hashError) {
          console.error("Erreur lors du hashage:", hashError);
        }
      }
    }

    console.log("Résultat final de la vérification:", isValidPassword);

    if (!isValidPassword) {
      console.error("Mot de passe incorrect pour l'utilisateur:", user.id);
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    console.log("Mot de passe correct, génération du token...");

    // Génération du token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Token généré avec succès");

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        premium: user.premium,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur complète dans l'API login:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
