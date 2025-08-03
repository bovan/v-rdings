import { Text } from "ink";

export default function ShortcutText({
  input,
  description,
}: {
  input: string;
  description: string;
}) {
  return (
    <Text>
      <Text color="whiteBright">{input})</Text> {description}
    </Text>
  );
}
