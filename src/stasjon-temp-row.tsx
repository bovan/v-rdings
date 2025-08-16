import { Box, Text } from "ink";
import type { StasjonTemp } from "./temperatur";
import Spinner from "ink-spinner";
import { formatDate } from "./date-utils";

function getDateColor(
  dateString: string | null | undefined,
): "green" | "yellow" | "orange" | "red" | "grey" {
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
    return "orange";
  } else {
    return "red";
  }
}

export default function StasjonTempRow({
  item,
  isLoading,
}: {
  item: StasjonTemp;
  isLoading: boolean;
}) {
  const observation = item.temp?.observations[0]?.value ?? "--";
  const referenceTime = formatDate(item.temp?.referenceTime);
  const dateColor = getDateColor(item.temp?.referenceTime);
  const isOld = dateColor === "grey";

  return (
    <Box key={item.source.id} gap={2}>
      <Box width={24}>
        <Text color={isOld ? "grey" : "white"}>{item.source.shortName}</Text>
      </Box>
      <Box width={5}>
        <Text color={isOld ? "grey" : "cyan"}>{observation}</Text>
      </Box>
      <Box width={22}>
        {isLoading ? (
          <Spinner type="aesthetic" />
        ) : (
          <Text color={getDateColor(item.temp?.referenceTime)}>
            {referenceTime}
          </Text>
        )}
      </Box>
    </Box>
  );
}
