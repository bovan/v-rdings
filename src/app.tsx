import { Box, Text, useInput } from "ink";
import Temperatur from "./temperatur";
import { useState } from "react";
import Kommunevalg from "./kommunevalg";
import Stasjoner from "./stasjoner";
import ShortcutText from "./components/shortcut-text";

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
          <ShortcutText input="1" description="Temperatur" />
          <ShortcutText input="2" description="Kommuner" />
          <ShortcutText input="3" description="Målestasjoner" />
          <ShortcutText input="Ctrl-C" description="Avslutt" />
        </Box>
      </Box>
      {activePage === "Kommuner" && <Kommunevalg />}
      {activePage === "Målestasjoner" && <Stasjoner />}
      {activePage === "Temperatur" && <Temperatur />}
    </Box>
  );
}
