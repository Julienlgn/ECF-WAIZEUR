import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    console.log("Tentative de mise à jour pour userId:", userId);
    console.log("URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "Service Role Key présente:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // D'abord, vérifions si l'utilisateur existe
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur:",
        fetchError
      );
      return NextResponse.json(
        { error: `Erreur lors de la récupération: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log("Utilisateur trouvé:", existingUser);

    // Mettre à jour le statut premium dans Supabase
    const { error } = await supabase
      .from("users")
      .update({
        premium: true,
        premium_start_date: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error(
        "Erreur détaillée lors de la mise à jour du statut premium:",
        error
      );
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Statut premium mis à jour pour l'utilisateur:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur générale:", error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error.message}` },
      { status: 500 }
    );
  }
}
