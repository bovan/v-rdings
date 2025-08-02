import {
  type ObservationResponse,
  type ObservationsAtRefTime,
  type Source,
  type SourceResponse,
} from "../frost-types";

const username = process.env["CLIENT_ID"];
const password = process.env["CLIENT_SECRET"];
const headers = { Authorization: "Basic " + btoa(username + ":" + password) };

export type YrSource = Required<Source>;

export async function fetchSources(): Promise<YrSource[]> {
  return fetch(
    "https://frost.met.no/sources/v0.jsonld?municipality=Trondheim",
    {
      method: "GET",
      headers,
    },
  )
    .then((response) => response.json() as Promise<SourceResponse>)
    .then((sources) => (sources.data ?? []) as Required<Source>[]);
}

export type AirTemperature = Required<ObservationsAtRefTime>;

export async function fetchAirTemperatures(
  ids: string[],
): Promise<AirTemperature[]> {
  return fetch(
    `https://frost.met.no/observations/v0.jsonld?referencetime=latest&elements=air_temperature&sources=${ids.join(",")}`,
    { method: "GET", headers },
  )
    .then((response) => response.json() as Promise<ObservationResponse>)
    .then((response) => {
      const data = (response.data ?? []) as Required<ObservationsAtRefTime>[];
      return data.map((observation) => ({
        ...observation,
        sourceId: observation.sourceId.split(":")[0] ?? "foo",
      }));
    });
}
