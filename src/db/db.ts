import { Database } from "bun:sqlite";
import { type Stasjon } from "./frost";
import { type Kommune } from "./geonorge";

export const defaultDb = new Database("tmp/db.sqlite");

export function dbInit(db = defaultDb) {
  const tables = {
    stasjoner:
      "CREATE TABLE stasjoner (id TEXT PRIMARY KEY, name TEXT, shortName TEXT, kommunenavn TEXT, favoritt BOOLEAN)",
    kommuner:
      "CREATE TABLE kommuner (kommunenummer TEXT PRIMARY KEY, kommunenavn TEXT, favoritt BOOLEAN)",
  };
  for (const [name, createQuery] of Object.entries(tables)) {
    const hasTable = db
      .query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`,
      )
      .get();
    if (!hasTable) {
      db.run(createQuery);
    }
  }
  return db;
}

export function insertStasjoner(data: Stasjon[], db = defaultDb) {
  const insert = db.transaction((data) => {
    const query = db.query(
      "INSERT OR IGNORE INTO stasjoner (id, name, shortName, kommunenavn, favoritt) VALUES ($id, $name, $shortName, $kommunenavn, $favoritt)",
    );
    for (const { id, name, shortName, kommunenavn, favoritt } of data) {
      query.run({
        $id: id,
        $name: name,
        $shortName: shortName,
        $kommunenavn: kommunenavn,
        $favoritt: favoritt,
      });
    }
  });
  try {
    insert(data);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

export function selectStasjoner(
  kommunenavn: string,
  db = defaultDb,
): Stasjon[] {
  const query = db.query<Stasjon, string>(
    "SELECT * FROM stasjoner WHERE kommunenavn = ?",
  );
  try {
    const stasjoner = query.all(kommunenavn);
    // convert sqlite 1 to true
    return stasjoner.map((stasjon) => ({
      ...stasjon,
      favoritt: !!stasjon.favoritt,
    }));
  } catch (error) {
    console.error("Error selecting stasjoner:", error);
    return [];
  }
}

export function updateSourceFavoritt(
  stasjon: Required<Pick<Stasjon, "id" | "favoritt">>,
  db = defaultDb,
) {
  const query = db.query(
    "UPDATE stasjoner SET favoritt = $favoritt WHERE id = $id",
  );
  try {
    query.run({ $favoritt: stasjon.favoritt, $id: stasjon.id });
  } catch (error) {
    console.error("Error updating stasjon:", error);
  }
}

export function insertKommuner(data: Kommune[], db = defaultDb) {
  const query = db.query(
    "INSERT INTO kommuner (kommunenummer, kommunenavn, favoritt) VALUES ($nr, $navn, $favoritt)",
  );
  data.forEach(({ kommunenummer, kommunenavn, favoritt }) => {
    try {
      query.run({
        $nr: kommunenummer,
        $navn: kommunenavn,
        $favoritt: favoritt,
      });
    } catch (error) {
      console.error("Error inserting kommuner data:", error);
    }
  });
}

export function selectKommuner(db = defaultDb): Kommune[] {
  const kommuner = db.query<Kommune, []>("SELECT * FROM kommuner").all();
  // convert sqlite 1 to true
  return kommuner.map((kommune) => ({
    ...kommune,
    favoritt: !!kommune.favoritt, // Convert 1 to true
  }));
}

export function selectFavorittKommuner(db = defaultDb): Kommune[] {
  return db
    .query<Kommune, []>("SELECT * FROM kommuner WHERE favoritt = 1")
    .all();
}

export function updateKommuneFavoritt(
  kommune: Required<Pick<Kommune, "kommunenummer" | "favoritt">>,
  db = defaultDb,
) {
  const query = db.query(
    "UPDATE kommuner SET favoritt = $favoritt WHERE kommunenummer = $nr",
  );
  try {
    query.run({ $favoritt: kommune.favoritt, $nr: kommune.kommunenummer });
  } catch (error) {
    console.error("Error updating kommune:", error);
  }
}
