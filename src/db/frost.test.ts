import { expect, test } from "bun:test";
import { fetchAirTemperatures, fetchSources } from "./frost";

const testStation = "SN68860"; // Voll

test("frost can get by municipality", async () => {
  const data = await fetchSources("Trondheim");
  const voll = data.find((s) => s.id === testStation);
  expect(data.length).toBeGreaterThan(0);
  expect(voll).toBeDefined();
});

test("frost can get air_temperatures", async () => {
  const temps = await fetchAirTemperatures([testStation]);
  expect(temps.length).toBeGreaterThan(0);
});
