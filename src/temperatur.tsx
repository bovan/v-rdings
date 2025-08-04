import { fetchAirTemperatures, Stasjon, type AirTemperature } from "./db/frost";
import { Box, Text, useInput } from "ink";
import { useEffect, useRef, useState } from "react";
import Container from "./components/container";
import useSources from "./hooks/use-stasjoner";
import Spinner from "ink-spinner";
import StasjonTempRow from "./stasjon-temp-row";

const sortType = ["Sted", "Temperatur", "Oppdatert"] as const;
type SortType = (typeof sortType)[number];

export type StasjonTemp = { source: Stasjon; temp?: AirTemperature };

function combineList(
  sources: Stasjon[],
  temperatures: AirTemperature[],
  sortedBy: SortType,
): StasjonTemp[] {
  const data = sources.map((source) => {
    return {
      source: source,
      temp: temperatures.find((temp) => temp.sourceId === source.id),
    };
  });
  if (sortedBy === "Sted") {
    return data.sort((a, b) => a.source.name.localeCompare(b.source.name));
  } else if (sortedBy === "Temperatur") {
    return data.sort((a, b) => {
      const aVal = a.temp?.observations[0]?.value;
      const bVal = b.temp?.observations[0]?.value;
      if (!aVal) {
        return 1;
      }
      if (!bVal) {
        return -1;
      }
      return parseFloat(bVal) - parseFloat(aVal);
    });
  } else if (sortedBy === "Oppdatert") {
    return data.sort((a, b) => {
      const aTime = a.temp?.referenceTime ?? "";
      const bTime = b.temp?.referenceTime ?? "";
      return bTime.localeCompare(aTime);
    });
  }
  return [];
}

export default function Temperatur() {
  const [airTemperatures, setAirTemperatures] = useState<AirTemperature[]>([]);
  const [sortedBy, setSortedBy] = useState<SortType>("Sted");
  const { favorittStasjoner, stasjoner } = useSources();
  const [rerender, setRerender] = useState(0);
  const [initial, setInitial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // update the view every minute so the updated times are refreshed
    const reRenderView = () => {
      setRerender((prev) => prev + 1);
    };
    const timer = setInterval(reRenderView, 1000 * 60);
    return () => {
      abortControllerRef.current?.abort();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!initial && favorittStasjoner.length > 0) {
      updateTemperatures();
      setInitial(true);
    } else if (initial && rerender > 0 && rerender % 5 === 0) {
      updateTemperatures();
    }
  }, [favorittStasjoner, initial]);

  const updateTemperatures = () => {
    setIsLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    const ids = favorittStasjoner.map((source) => source.id);
    const signal = abortControllerRef.current.signal;
    fetchAirTemperatures(ids, { signal })
      .then((newTemps) => {
        setAirTemperatures(newTemps);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching temperatures:", error);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useInput((input) => {
    switch (input) {
      case "r": {
        updateTemperatures();
        break;
      }
      case "s": {
        if (sortedBy === "Sted") {
          setSortedBy("Temperatur");
        } else if (sortedBy === "Temperatur") {
          setSortedBy("Oppdatert");
        } else {
          setSortedBy("Sted");
        }
        break;
      }
    }
  });

  const data = combineList(favorittStasjoner, airTemperatures, sortedBy);

  return (
    <Container>
      <Box gap={2} paddingBottom={1}>
        <Box width={24}>
          <Text color={sortedBy === "Sted" ? "green" : "white"} bold={true}>
            Sted
          </Text>
        </Box>
        <Box width={5}>
          <Text color={sortedBy === "Temperatur" ? "green" : "white"}>
            Temp
          </Text>
        </Box>
        <Box width={20}>
          <Text color={sortedBy === "Oppdatert" ? "green" : "white"}>
            Oppdatert
          </Text>
        </Box>
      </Box>
      {data.map((item) => (
        <StasjonTempRow
          key={item.source.id}
          item={item}
          isLoading={isLoading}
        />
      ))}
      {stasjoner === null && <Spinner type="aesthetic" />}
      {stasjoner?.length === 0 && (
        <Text color="redBright">
          Ingen målestasjoner. Legg til via 2) Kommune først, så 3)
          Målestasjoner
        </Text>
      )}
      <Box
        borderTop={true}
        borderLeft={false}
        borderRight={false}
        borderBottom={false}
        borderStyle="single"
        justifyContent="space-between"
      >
        <Box gap={2}>
          {favorittStasjoner.length > 0 && (
            <>
              <Text>
                <Text color="whiteBright">r)</Text>efresh
              </Text>
              <Text>
                <Text color="whiteBright">s)</Text>ort
              </Text>
            </>
          )}
        </Box>
        <Box>
          <Text>Oppdateres automatisk om {5 - (rerender % 5)} min</Text>
        </Box>
      </Box>
    </Container>
  );
}
