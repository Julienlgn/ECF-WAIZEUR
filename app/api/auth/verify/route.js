import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "../../../../lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  if (!JWT_SECRET) {
    console.error(
      "JWT_SECRET n'est pas défini dans les variables d'environnement"
    );
    return NextResponse.json(
      { error: "Erreur de configuration du serveur" },
      { status: 500 }
    );
  }
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Vérifier si l'utilisateur existe toujours
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, premium")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        premium: user.premium,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
