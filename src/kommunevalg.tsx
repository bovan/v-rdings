import { Box, Text, useInput } from "ink";
import Container from "./components/container";
import useKommuner from "./hooks/use-kommuner";
import { Kommune } from "./db/geonorge";
import TextInput from "ink-text-input";
import { useState } from "react";
import { insertStasjoner } from "./db/db";
import { fetchAndAddSources } from "./db";
import Spinner from "ink-spinner";

export default function Kommunevalg() {
  const { favoriteKommune, kommuner } = useKommuner();
  const [filter, setFilter] = useState("");
  const [inputHasFocus, setInputHasFocus] = useState(true);

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
      setInputHasFocus(!inputHasFocus);
    }

    // TODO: move this to AddKommune component
    if (inputHasFocus) {
      if (key.return) {
        if (filteredKommuner.length === 1 && favorittKommuner.length <= 3) {
          // Add to favorites
          const kommune = filteredKommuner[0];
          if (!kommune) {
            return;
          }
          favoriteKommune(true, kommune);
          const data = await fetchAndAddSources(kommune.kommunenavn);
          insertStasjoner(data);

          setFilter("");
        }
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
        isActive={!inputHasFocus}
        handleRemove={(kommune) => favoriteKommune(false, kommune)}
      />
      <AddKommune
        canAdd={favorittKommuner.length < 3}
        isActive={inputHasFocus}
        setFilter={setFilter}
        filter={filter}
        kommuner={visibleKommuner}
      />
    </Container>
  );
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
    if (input === "x") {
      const kommune = kommuner[activeIndex];
      handleRemove(kommune);
    }
  });
  // TODO: Add navigation so i.e. Stad can be selected

  return (
    <Tab isActive={isActive}>
      <Text>Valgte kommuner (Opptil 3 max):</Text>
      <Box flexDirection="row" paddingY={1}>
        {kommuner.map((kommune, index) => (
          <KommuneRow
            key={kommune.kommunenummer}
            kommune={kommune}
            isSelected={activeIndex === index}
          />
        ))}
      </Box>
      <Box height={1}>
        {isActive && <Text>&larr; / &rarr;) Naviger, x) Fjern favoritt</Text>}
      </Box>
    </Tab>
  );
}

function AddKommune({
  canAdd,
  isActive,
  setFilter,
  filter,
  kommuner,
}: {
  canAdd: boolean;
  isActive: boolean;
  setFilter: (_value: string) => void;
  filter: string;
  kommuner: Kommune[];
}) {
  if (!canAdd) {
    return (
      <Tab isActive={isActive}>
        <Text>Kan ikke legge til flere enn 3 kommuner foreløpig.</Text>
      </Tab>
    );
  }
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
      {kommuner.map((kommune) => (
        <KommuneRow
          key={kommune.kommunenummer}
          kommune={kommune}
          isHovering={kommuner.length === 1}
        />
      ))}
      {kommuner.length === 0 && (
        <Text color="red">Ingen kommuner funnet med filteret "{filter}"</Text>
      )}
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
