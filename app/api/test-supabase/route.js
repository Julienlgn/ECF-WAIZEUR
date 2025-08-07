import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    console.log("Test de connexion Supabase...");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "Service Role Key présente:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test de récupération des utilisateurs
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, premium")
      .limit(5);

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Utilisateurs trouvés:", users);
    return NextResponse.json({
      success: true,
      users: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Erreur générale:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
