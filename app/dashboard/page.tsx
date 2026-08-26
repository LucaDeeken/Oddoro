import { getOddsApi } from "@/lib/api/oddsApi";
import { getMatchesBySeasonId } from "@/lib/db/getMatchesBySeason";
import TippingDashboard from "@/components/TippingDashboard";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Dashboard() {
  const wholeSeasonGames = await getMatchesBySeasonId(supabaseAdmin, 2);

  //console.log(matchesCup);

  return (
    <>
      <TippingDashboard wholeSeasonGames={wholeSeasonGames}></TippingDashboard>
    </>
  );
}
