import { dbInit } from "./db";
import { expect, test } from "bun:test";
import { Database } from "bun:sqlite";

const dbFile = "tmp/db-test.sqlite";
await Bun.file(dbFile)
  .delete()
  .catch(() => {
    console.log("No file to delete, continuing with test.");
  });

export const db = new Database(dbFile);
test("DB can init", async () => {
  dbInit(db);
  expect(await Bun.file(dbFile).exists()).toBe(true);
});

test("DB init can run init multiple times", async () => {
  dbInit(db);
});
