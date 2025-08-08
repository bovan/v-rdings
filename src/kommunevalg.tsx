import { useInput } from "ink";
import Container from "./components/container";
import useKommuner from "./hooks/use-kommuner";
import { useState } from "react";
import Spinner from "ink-spinner";
import SelectScrollBox from "./components/select-scroll-box";
import FilterInput from "./components/filter-input";

const tabs = ["Add", "List"] as const;

export default function Kommunevalg() {
  const { favoriteKommune, kommuner } = useKommuner();
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Add");

  useInput(async (_input, key) => {
    if (key.tab) {
      const nextIndex = (tabs.indexOf(activeTab) + 1) % tabs.length;
      setActiveTab(tabs[nextIndex] ?? "Add");
    }
  });

  if (kommuner === null) {
    return (
      <Container>
        <Spinner type="aesthetic" />
      </Container>
    );
  }
  const items = kommuner.filter((k) => {
    return k.kommunenavn.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <Container>
      <FilterInput setFilter={setFilter} filter={filter} />
      <SelectScrollBox
        filter={filter}
        height={20}
        items={items}
        itemToString={(item) => item.kommunenavn}
        isSelected={(item) => item.favoritt}
        onChange={async (item, isSelected) => {
          await favoriteKommune(isSelected, item);
        }}
      />
    </Container>
  );
}
