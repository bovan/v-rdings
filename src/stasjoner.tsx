import { Box, Text, useInput } from "ink";
import Container from "./components/container";
import { useState } from "react";
import useStasjoner from "./hooks/use-stasjoner";
import { Stasjon } from "./db/frost";
import Spinner from "ink-spinner";

export default function Stasjoner() {
  const sortedBy = "Sted";
  const { stasjoner, favoriteStasjon } = useStasjoner();
  const [activeIndex, setActiveIndex] = useState(0);

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
        favoriteStasjon(!stasjon.favoritt, stasjon);
      }
    }
  });

  if (stasjoner === null) {
    return <Spinner type="aesthetic" />;
  }

  return (
    <Container>
      <Box gap={2} paddingBottom={1}>
        <Box width={24}>
          <Text color={sortedBy === "Sted" ? "green" : "white"} bold={true}>
            Sted
          </Text>
        </Box>
      </Box>
      <Box gap={4}>
        <Text color="white" bold={true}>
          &uarr;/&darr;) Naviger
        </Text>
        <Text color="white" bold={true}>
          Enter/Space) Velg
        </Text>
      </Box>
      <Box width={42} flexDirection="row" gap={2}>
        <Box width={4}></Box>
        <Box width={8}>
          <Text>Valgt</Text>
        </Box>
        <Box width={30}>
          <Text>Målestasjon</Text>
        </Box>
      </Box>
      {stasjoner.map((item, index) => (
        <MaalestasjonRow
          key={item.id}
          item={item}
          isHover={activeIndex === index}
        />
      ))}
    </Container>
  );
}

function MaalestasjonRow({
  item,
  isHover,
}: {
  item: Stasjon;
  isHover?: boolean;
}) {
  return (
    <Box key={item.id} width={42} flexDirection="row" gap={2}>
      <Box width={4}>{isHover && <Text color="green">&gt;</Text>}</Box>
      <Box width={8}>
        <Text>{item.favoritt ? "Ja" : ""}</Text>
      </Box>
      <Box width={30}>
        <Text color={item.favoritt ? "green" : isHover ? "cyan" : "white"}>
          {item.shortName}
        </Text>
      </Box>
    </Box>
  );
}
