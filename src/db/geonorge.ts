export type KartverketKommune = {
  kommunenavn: string;
  kommunenavnNorsk: string | null;
  kommunenummer: string;
};

export type Kommune = {
  kommunenavn: string;
  kommunenummer: string;
  favoritt: boolean;
};

export async function fetchKommuner() {
  const url = `https://api.kartverket.no/kommuneinfo/v1/kommuner`;
  return fetch(url, {
    method: "GET",
  })
    .then((response) => response.json() as Promise<KartverketKommune[]>)
    .then((kommuner) => {
      return kommuner.map((kommune) => {
        // Use Norwegian name if available, otherwise use the default name
        const k: Kommune = {
          kommunenavn: kommune.kommunenavnNorsk || kommune.kommunenavn,
          kommunenummer: kommune.kommunenummer,
          favoritt: false,
        };
        return k;
      });
    });
}
