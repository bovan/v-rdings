import { Box, Text, useInput } from "ink";
import Temperatur from "./temperatur";
import { JSX, useState } from "react";
import Kommunevalg from "./kommunevalg";
import Stasjoner from "./stasjoner";
import ShortcutText from "./components/shortcut-text";

const _pageKeys = ["Kommuner", "Målestasjoner", "Temperatur"] as const;
type PageKey = (typeof _pageKeys)[number];

type Page = { shortcut: string; page: PageKey; component: JSX.Element };
const pages: Page[] = [
  { shortcut: "1", page: "Temperatur", component: <Temperatur /> },
  { shortcut: "2", page: "Kommuner", component: <Kommunevalg /> },
  { shortcut: "3", page: "Målestasjoner", component: <Stasjoner /> },
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>(pages[0]!);

  useInput((input) => {
    const page = pages.find((p) => p.shortcut === input);
    if (page) {
      setActivePage(page);
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
          {pages.map((page) => (
            <ShortcutText
              key={page.shortcut}
              input={page.shortcut}
              description={page.page}
            />
          ))}
          <ShortcutText input="Ctrl-C" description="Avslutt" />
        </Box>
      </Box>
      {activePage.component}
    </Box>
  );
}
