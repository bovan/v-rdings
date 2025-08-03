import {
  type ObservationResponse,
  type ObservationsAtRefTime,
  type Source,
  type SourceResponse,
} from "../frost-types";

const username = process.env["CLIENT_ID"];
const password = process.env["CLIENT_SECRET"];
const headers = { Authorization: "Basic " + btoa(username + ":" + password) };

export type Stasjon = Pick<Required<Source>, "id" | "name" | "shortName"> & {
  kommunenavn: string;
  favoritt: boolean;
};
function isStasjonCompatible<
  T extends { id?: unknown; name?: unknown; shortName?: unknown },
>(obj: Partial<T> | undefined | null): obj is Required<T> {
  return (
    !!obj &&
    obj.id !== undefined &&
    obj.name !== undefined &&
    obj.shortName !== undefined
  );
}

export async function fetchSources(kommunenavn: string): Promise<Stasjon[]> {
  return fetch(
    `https://frost.met.no/sources/v0.jsonld?municipality=${kommunenavn}`,
    {
      method: "GET",
      headers,
    },
  )
    .then((response) => response.json() as Promise<Required<SourceResponse>>)
    .then((sources) => {
      const data: Omit<Stasjon, "favoritt" | "kommunenavn">[] =
        sources.data.filter(isStasjonCompatible);
      return data.map((source) => {
        return {
          id: source.id,
          name: source.name,
          shortName: source.shortName,
          kommunenavn: kommunenavn,
          favoritt: false,
        } satisfies Stasjon;
      });
    });
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
