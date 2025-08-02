import { insertSources, selectSources } from "./db";
import { fetchSources } from "./frost";

export async function getSources() {
  const dbSources = selectSources();
  if (dbSources.length > 0) {
    return dbSources;
  }
  const data = await fetchSources();
  const sources = data.map(({ id, shortName }) => ({
    id,
    name: shortName,
  }));
  insertSources(data);

  return sources;
}
