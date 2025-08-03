import { fetchKommuner } from "./geonorge";
import { expect, test } from "bun:test";

test("geonorge test", async () => {
  const result = await fetchKommuner();
  console.log(result);
  expect(result).toBeDefined();
});
