import { Box, Text, useInput } from "ink";
import Container from "./components/container";
import useKommuner from "./hooks/use-kommuner";
import { Kommune } from "./db/geonorge";
import TextInput from "ink-text-input";
import { useEffect, useState } from "react";
import { insertStasjoner } from "./db/db";
import { fetchAndAddSources } from "./db";
import Spinner from "ink-spinner";

const tabs = ["Selected", "Add", "List"] as const;

export default function Kommunevalg() {
  const { favoriteKommune, kommuner } = useKommuner();
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Add");

  const favorittKommuner =
    kommuner?.filter((kommune) => kommune.favoritt) ?? [];
  const filteredKommuner =
    kommuner?.filter((kommune) => {
      if (filter === "") {
        return true;
      }
      if (!Number.isNaN(Number(filter))) {
        return kommune.kommunenummer.includes(filter);
      }
      return kommune.kommunenavn.toLowerCase().includes(filter.toLowerCase());
    }) ?? [];

  useInput(async (input, key) => {
    if (key.tab) {
      const nextIndex = (tabs.indexOf(activeTab) + 1) % tabs.length;
      setActiveTab(tabs[nextIndex] ?? "Add");
    }

    if (activeTab === "Add") {
      if (key.return) {
        setActiveTab("List");
      }

      if (key.escape) {
        setFilter("");
      }
    }
  });

  // show only first 15 items
  const visibleKommuner = filteredKommuner.slice(0, 15);
  if (kommuner === null) {
    <Container>
      <Spinner type="aesthetic" />
    </Container>;
  }
  return (
    <Container>
      <SelectedKommuner
        kommuner={favorittKommuner}
        isActive={activeTab === "Selected"}
        handleRemove={(kommune) => favoriteKommune(false, kommune)}
      />
      <AddKommune
        isActive={activeTab === "Add"}
        setFilter={setFilter}
        filter={filter}
        kommuner={visibleKommuner}
      />
      <KommuneList
        kommuner={visibleKommuner}
        isActive={activeTab === "List"}
        onToggleKommune={async (kommune) => {
          // TODO: cleanup stasjoner when removing
          await favoriteKommune(!kommune.favoritt, kommune);
        }}
      />
    </Container>
  );
}

function chunkArray(arr: Kommune[], size: number) {
  const chunkedArr = [];
  for (let i = 0; i < arr.length; i += size) {
    chunkedArr.push(arr.slice(i, i + size));
  }
  return chunkedArr;
}
function SelectedKommuner({
  kommuner,
  isActive,
  handleRemove,
}: {
  kommuner: Kommune[];
  isActive: boolean;
  handleRemove: (_kommune?: Kommune) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeYIndex, setActiveYIndex] = useState(0);

  const rows = chunkArray(
    kommuner.toSorted((a, b) => (a.kommunenummer > b.kommunenummer ? 1 : -1)),
    3,
  );
  useEffect(() => {
    if (rows[activeYIndex] && activeIndex >= rows[activeYIndex].length) {
      setActiveIndex((prev) => {
        if (!rows[activeYIndex]) {
          // silly typescript guard
          return prev;
        }
        const maxIndex = rows[activeYIndex].length - 1;
        return Math.min(prev, maxIndex);
      });
    }
  }, [kommuner, activeIndex, activeYIndex]);
  useInput((input, key) => {
    if (!isActive) {
      return;
    }
    if (key.leftArrow) {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (key.rightArrow) {
      setActiveIndex((prev) => (prev < kommuner.length - 1 ? prev + 1 : prev));
    }
    if (key.downArrow) {
      setActiveYIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex < kommuner.length ? nextIndex : prev;
      });
    }
    if (key.upArrow) {
      setActiveYIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (input === "x") {
      const kommune = kommuner[activeIndex];
      handleRemove(kommune);
    }
  });
  return (
    <Tab isActive={isActive}>
      <Text>Valgte kommuner:</Text>
      {rows.map((kommuner, rowIndex) => (
        <Box key={rowIndex} flexDirection="row">
          {kommuner.map((kommune, index) => (
            <KommuneRow
              key={kommune.kommunenummer}
              kommune={kommune}
              isSelected={activeIndex === index && activeYIndex === rowIndex}
            />
          ))}
        </Box>
      ))}
      <Box height={1}>
        {isActive && <Text>&larr; / &rarr;) Naviger, x) Fjern favoritt</Text>}
      </Box>
    </Tab>
  );
}

function AddKommune({
  isActive,
  setFilter,
  filter,
  kommuner,
}: {
  isActive: boolean;
  setFilter: (_value: string) => void;
  filter: string;
  kommuner: Kommune[];
}) {
  return (
    <Tab isActive={isActive}>
      <Text>Legg til kommune:</Text>
      <Box flexDirection="row" paddingY={1}>
        <Box width={8}>{isActive && <Text color="green">Skriv &gt;</Text>}</Box>
        <TextInput
          value={filter}
          focus={isActive}
          onChange={setFilter}
          placeholder="kommune"
        />
      </Box>
      {kommuner.length === 0 && (
        <Text color="red">Ingen kommuner funnet med filteret "{filter}"</Text>
      )}
    </Tab>
  );
}

function KommuneList({
  kommuner,
  isActive,
  onToggleKommune,
}: {
  kommuner: Kommune[];
  isActive: boolean;
  onToggleKommune: (kommune: Kommune) => Promise<void>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  useInput(async (input, key) => {
    if (kommuner.length === 0 || !isActive) {
      // let input component do its thing
      return;
    }
    if (key.downArrow) {
      setActiveIndex((prev) => Math.min(prev + 1, kommuner.length - 1));
    }
    if (key.upArrow) {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (key.return || input === " ") {
      const kommune = kommuner[activeIndex];
      if (kommune) {
        // Add to favorites
        await onToggleKommune(kommune);
        const data = await fetchAndAddSources(kommune.kommunenavn);
        insertStasjoner(data);
      }
    }
  });

  return (
    <Tab isActive={isActive}>
      {kommuner.map((kommune, index) => (
        <KommuneRow
          key={kommune.kommunenummer}
          kommune={kommune}
          isHovering={isActive && activeIndex === index}
        />
      ))}
    </Tab>
  );
}
function KommuneRow({
  kommune,
  isHovering,
  isSelected,
}: {
  kommune: Kommune;
  isHovering?: boolean;
  isSelected?: boolean;
}) {
  return (
    <Box gap={2}>
      <Box width={10}>
        <Box width={8}>
          {isHovering && <Text color="green">Enter &gt;</Text>}
        </Box>
        <Box width={2}>{isSelected && <Text color="green">*</Text>}</Box>
      </Box>
      <Text>{kommune.kommunenummer}</Text>
      <Text color={isSelected || isHovering ? "green" : "white"}>
        {kommune.kommunenavn}
      </Text>
    </Box>
  );
}

function Tab({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isActive ? "green" : "gray"}
    >
      {children}
      <Box marginBottom={-1} alignSelf="flex-end">
        <Text color={isActive ? "green" : "gray"}>
          {isActive ? "Aktiv Tab" : "Trykk Tab for å aktivere"}
        </Text>
      </Box>
    </Box>
  );
}
