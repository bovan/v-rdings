import {
  insertKommuner,
  insertStasjoner,
  selectKommuner,
  selectStasjoner,
} from "./db";
import { fetchSources, Stasjon } from "./frost";
import { fetchKommuner, Kommune } from "./geonorge";

export async function getStasjoner(kommunenavn: string): Promise<Stasjon[]> {
  return selectStasjoner(kommunenavn);
}

export async function fetchAndAddSources(
  kommunenavn: string,
): Promise<Stasjon[]> {
  const data = await fetchSources(kommunenavn);
  const stasjoner = data.map(({ id, name, shortName }) => ({
    id,
    name,
    shortName,
    kommunenavn,
    favoritt: false,
  }));
  insertStasjoner(data);

  return stasjoner;
}

// Consider municipalities to be constant and always cache them.
// Since changes also cause problems with measuring stations its
// probably best to wipe database and re-fetch them if it ever
// become a problem.
export async function getKommuner(): Promise<Kommune[]> {
  const dbKommuner = selectKommuner();
  if (dbKommuner.length > 0) {
    return dbKommuner;
  }
  const data = await fetchKommuner();
  insertKommuner(data);
  return data;
}
