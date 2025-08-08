import TextInput from "ink-text-input";
import { Box, Text, useFocus } from "ink";
import { TabFrame } from "./tab-frame";

export default function FilterInput({
  setFilter,
  filter,
}: {
  setFilter: (_value: string) => void;
  filter: string;
}) {
  const { isFocused } = useFocus();
  return (
    <TabFrame isFocused={isFocused} helpText="Filtrer på navn" height={3}>
      <Box flexDirection="row" paddingY={0} paddingLeft={1}>
        <Box width={24}>
          {isFocused && <Text color="green">Skriv for å filtrere &gt;</Text>}
        </Box>
        <TextInput
          value={filter}
          focus={isFocused}
          onChange={setFilter}
          placeholder="Filtrer"
        />
      </Box>
    </TabFrame>
  );
}
