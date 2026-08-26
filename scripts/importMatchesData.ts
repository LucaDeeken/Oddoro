import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSeasonStats } from "@/lib/api/matchesApi";
import {
  leagueCountryMap,
  leagueNameMap,
  leagueTypeMap,
} from "@/lib/mapping/countryNameBuilder";
import {
  Match,
  League,
  Season,
  SeasonJson,
} from "@/types/importMatchesDataType";
import { runImport } from "@/lib/db/runImport";
import "dotenv/config";

//Nutzt den API Call, um die gesamte Saison zu fetchen und baut aus ihr die drei Objekte League, Season und Matches zusammen.
//Hier werden nun dem Vorbild der Datenbank entsprechend die benötigten Felder gefüllt.
//Der Returnwert entspricht allen benötigten Feldern in einer gesammelten JSON.
async function buildJsonFromSeasonStats(): Promise<SeasonJson> {
  const data = await getSeasonStats();
  const leagueNameShortcut = data[0]?.leagueShortcut ?? "";

  //LEAGUE DATA

  const league: League = {
    name: leagueNameMap[leagueNameShortcut] ?? "",
    type: leagueTypeMap[leagueNameShortcut] ?? "",
    country: leagueCountryMap[leagueNameShortcut] ?? "",
  };

  //SEASON DATA
  const leagueAndSeasonVar = data[0]?.leagueName ?? "";
  const seasonYear = leagueAndSeasonVar.match(/\d{4}(?:\/\d{4})?/)?.[0] ?? "";

  const season: Season = {
    year: seasonYear,
  };

  //MATCH DATA
  const matchesFiltered: Match[] = [];

  const matches = data ?? [];
  for (let i = 0; i < matches.length; i++) {
    const result = matches[i].matchResults?.[1];
    const singleMatch: Match = {
      matchday: matches[i].group?.groupName ?? "",
      home_team: matches[i].team1?.teamName ?? "",
      away_team: matches[i].team2?.teamName ?? "",
      home_goals: result?.pointsTeam1 ?? null,
      away_goals: result?.pointsTeam2 ?? null,
      kickoff: matches[i].matchDateTimeUTC ?? null,
      is_finished: matches[i].matchIsFinished ?? null,
    };
    matchesFiltered.push(singleMatch);
  }

  const finalJson: SeasonJson = {
    league: league,
    season: season,
    matches: matchesFiltered,
  };

  return finalJson;
}

async function fetchBuildAndSeed() {
  const finalJson = await buildJsonFromSeasonStats();

  await runImport(finalJson, supabaseAdmin);
}

fetchBuildAndSeed().catch(console.error);
