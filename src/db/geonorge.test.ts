import { fetchKommuner } from "./geonorge";
import { expect, test } from "bun:test";

test("geonorge test", async () => {
  const result = await fetchKommuner();
  expect(result).toBeDefined();
});
