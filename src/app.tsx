import { Box, Text, useInput } from "ink";
import Temperatur from "./temperatur";
import { useState } from "react";
import Kommunevalg from "./kommunevalg";
import Stasjoner from "./stasjoner";

const pages = ["Kommuner", "Målestasjoner", "Temperatur"] as const;
type Page = (typeof pages)[number];

export default function App() {
  const [activePage, setActivePage] = useState<Page>("Temperatur");

  useInput((input) => {
    switch (input) {
      case "1": {
        setActivePage("Temperatur");
        break;
      }
      case "2": {
        setActivePage("Kommuner");
        break;
      }
      case "3": {
        setActivePage("Målestasjoner");
        break;
      }
    }
  });
  return (
    <Box flexDirection="column">
      <Box
        flexDirection="row"
        justifyContent="space-between"
        borderLeft={true}
        borderRight={true}
        borderBottom={false}
        borderStyle="round"
        paddingLeft={1}
        paddingRight={1}
      >
        <Box>
          <Text>bovans værdings</Text>
        </Box>
        <Box gap={2}>
          <Text>
            <Text color="whiteBright">1)</Text> Temperatur
          </Text>
          <Text>
            <Text color="whiteBright">2)</Text> Kommuner
          </Text>
          <Text>
            <Text color="whiteBright">3)</Text> Målestasjoner
          </Text>
          <Text>
            <Text color="whiteBright">Ctrl-C)</Text> Avslutt
          </Text>
        </Box>
      </Box>
      {activePage === "Kommuner" && <Kommunevalg />}
      {activePage === "Målestasjoner" && <Stasjoner />}
      {activePage === "Temperatur" && <Temperatur />}
    </Box>
  );
}
