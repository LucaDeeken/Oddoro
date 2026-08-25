import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: leagues, error } = await supabase
    .from("Leagues")
    .select("id, name")
    .order("name");

  if (error) {
    throw error;
  }

  return (
    <main>
      <h1>Admin</h1>

      <h2>H2H Odds aktualisieren</h2>

      <select>
        <option value="">Liga auswählen</option>

        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>

      <button>H2H aktualisieren</button>
    </main>
  );
}