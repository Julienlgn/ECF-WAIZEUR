// Script de test pour vérifier la connexion à Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL Supabase:", supabaseUrl);
console.log("Clé anonyme:", supabaseAnonKey ? "Présente" : "Manquante");

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function testConnection() {
  try {
    console.log("=== Test de connexion à Supabase ===");

    // Test de connexion basique
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name")
      .limit(5);

    if (error) {
      console.error("Erreur de connexion:", error);
      return;
    }

    console.log("Connexion réussie !");
    console.log("Utilisateurs trouvés:", data.length);
    console.log("Données:", data);
  } catch (error) {
    console.error("Erreur lors du test:", error);
  }
}

testConnection();
