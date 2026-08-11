export async function getSeasonStats() {
  const url = `https://api.openligadb.de/getmatchdata/bl2/2026/`;

  const res = await fetch(url, {
    next: { revalidate: 300 }, // 5 Minuten Cache
  });

  if (!res.ok) {
    throw new Error("OpenLigaDB API Fehler");
  }
  return res.json();
}
