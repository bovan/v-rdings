import { Database } from "bun:sqlite";
import { YrSource } from "./frost";

export const defaultDb = new Database("tmp/db.sqlite");

export function dbInit(db = defaultDb) {
  const tables = {
    sources: "CREATE TABLE sources (id TEXT PRIMARY KEY, name TEXT)",
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

export function insertSources(data: YrSource[], db = defaultDb) {
  const query = db.query("INSERT INTO sources (id, name) VALUES ($id, $name)");
  data.forEach(({ id, shortName }) => {
    try {
      query.run({ $id: id, $name: shortName });
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  });
}

export type ShortSource = Pick<YrSource, "id" | "name">;

export function selectSources(db = defaultDb): ShortSource[] {
  const query = db.query("SELECT id, name FROM sources");
  const results = query.all() as { id: string; name: string }[];
  return results;
}

export function dbClose() {
  defaultDb.close();
}
