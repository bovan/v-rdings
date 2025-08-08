import { useInput } from "ink";
import Container from "./components/container";
import { useState } from "react";
import useStasjoner from "./hooks/use-stasjoner";
import Spinner from "ink-spinner";
import SelectScrollBox from "./components/select-scroll-box";
import FilterInput from "./components/filter-input";

export default function Stasjoner() {
  const { stasjoner, setFavoriteStasjon } = useStasjoner();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState("");

  useInput((input, key) => {
    if (stasjoner === null) {
      return;
    }
    if (key.downArrow) {
      setActiveIndex((prev) => Math.min(prev + 1, stasjoner.length - 1));
    }
    if (key.upArrow) {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (key.return || input === " ") {
      const stasjon = stasjoner[activeIndex];
      if (stasjon) {
        setFavoriteStasjon(!stasjon.favoritt, stasjon);
      }
    }
  });

  if (stasjoner === null) {
    return <Spinner type="aesthetic" />;
  }
  const data = stasjoner
    .map((s) => ({
      ...s,
      fullName: `${s.kommunenavn} - ${s.shortName}`,
    }))
    .filter((s) => s.fullName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Container>
      <FilterInput setFilter={setFilter} filter={filter} />
      <SelectScrollBox
        height={20}
        items={data}
        itemToString={(item) => item.fullName}
        onChange={(item, isSelected) => {
          setFavoriteStasjon(isSelected, item);
        }}
        isSelected={(item) => item.favoritt}
      />
    </Container>
  );
}
