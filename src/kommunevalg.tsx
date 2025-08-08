import Container from "./components/container";
import useKommuner from "./hooks/use-kommuner";
import { useState } from "react";
import Spinner from "ink-spinner";
import SelectScrollBox from "./components/select-scroll-box";
import FilterInput from "./components/filter-input";

export default function Kommunevalg() {
  const { favoriteKommune, kommuner } = useKommuner();
  const [filter, setFilter] = useState("");

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
        title="Velg kommune"
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
