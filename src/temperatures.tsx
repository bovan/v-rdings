import { fetchAirTemperatures, type AirTemperature } from "./db/frost";
import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import { ShortSource } from "./db/db";
import { getSources } from "./db";

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "--";
  }
  const recentDate = new Date(dateString);
  const distance = formatDistance(recentDate, new Date(), { addSuffix: true });
  return distance;
}

function getDateColor(
  dateString: string | null | undefined,
): "green" | "yellow" | "red" | "grey" {
  if (!dateString) {
    return "grey";
  }
  const recentDate = new Date(dateString).getTime();
  const currentDate = new Date().getTime();
  if (recentDate > currentDate - 1000 * 60 * 60 * 0.5) {
    return "green";
  } else if (recentDate > currentDate - 1000 * 60 * 60 * 1) {
    return "yellow";
  } else if (recentDate > currentDate - 1000 * 60 * 60 * 2) {
    return "red";
  } else {
    return "grey";
  }
}
function useSources() {
  const [sources, setSources] = useState<ShortSource[] | null>(null);

  useEffect(() => {
    if (sources === null) {
      getSources().then((data) => {
        setSources(data);
      });
    }
  }, []);

  return { sources: sources ?? [] };
}

const sortType = ["Sted", "Temperatur", "Oppdatert"] as const;
type SortType = (typeof sortType)[number];

function combineList(
  sources: ShortSource[],
  temperatures: AirTemperature[],
  sortedBy: SortType,
): { source: ShortSource; temp?: AirTemperature }[] {
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

export default function Temperatures() {
  const { exit } = useApp();
  const [airTemperatures, setAirTemperatures] = useState<AirTemperature[]>([]);
  const [sortedBy, setSortedBy] = useState<SortType>("Sted");
  const { sources } = useSources();
  const [, setRerender] = useState(0);

  useEffect(() => {
    // update the view every minute so the updated times are refreshed
    const reRenderView = () => setRerender((prev) => prev + 1);
    const timer = setInterval(reRenderView, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  useInput((input) => {
    if (input === "q") {
      exit();
    } else if (input === "r") {
      const ids = sources.map((source) => source.id);
      fetchAirTemperatures(ids).then((newTemps) => {
        setAirTemperatures(newTemps);
      });
    } else if (input === "s") {
      if (sortedBy === "Sted") {
        setSortedBy("Temperatur");
      } else if (sortedBy === "Temperatur") {
        setSortedBy("Oppdatert");
      } else {
        setSortedBy("Sted");
      }
    }
  });

  const data = combineList(sources, airTemperatures, sortedBy);

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box gap={2} paddingBottom={1}>
        <Box width={24}>
          <Text color={sortedBy === "Sted" ? "green" : "white"} bold={true}>
            Steder
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
      {data.map((item) => {
        const observation = item.temp?.observations[0]?.value ?? "--";
        const referenceTime = formatDate(item.temp?.referenceTime);
        const dateColor = getDateColor(item.temp?.referenceTime);
        const isOld = dateColor === "grey";
        return (
          <Box key={item.source.id} gap={2}>
            <Box width={24}>
              <Text color={isOld ? "grey" : "white"}>{item.source.name}</Text>
            </Box>
            <Box width={5}>
              <Text color={isOld ? "grey" : "cyan"}>{observation}</Text>
            </Box>
            <Box width={22}>
              <Text color={getDateColor(item.temp?.referenceTime)}>
                {referenceTime}
              </Text>
            </Box>
          </Box>
        );
      })}
      <Text>--------------------</Text>
      <Box gap={2}>
        <Text>q)uit</Text>
        {sources.length > 0 && <Text>r)efresh</Text>}
        {sources.length > 0 && <Text>s)ort</Text>}
      </Box>
    </Box>
  );
}
