import { Box, Text } from "ink";
import { type ComponentProps } from "react";

export function TabFrame({
  isFocused,
  height,
  children,
  helpText = "Aktiv Tab",
  themeColor = "green",
  justifyContent,
  title,
}: {
  isFocused: boolean;
  height: number;
  children: React.ReactNode;
  helpText?: string;
  themeColor?: string;
  justifyContent?: ComponentProps<typeof Box>["justifyContent"];
  title?: string;
}) {
  const tabTitle =
    title !== undefined ? title : isFocused ? "Aktiv Tab" : "Inaktiv Tab";
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderBottom={true}
      borderTop={true}
      borderColor={isFocused ? themeColor : "gray"}
      height={height}
    >
      <Box marginTop={-1} marginLeft={1}>
        <Text color={isFocused ? themeColor : "gray"}>{tabTitle}</Text>
      </Box>
      <Box justifyContent={justifyContent} marginBottom={1} height={height - 2}>
        {children}
      </Box>
      <Box alignSelf="flex-end" marginBottom={-1}>
        <Text color={isFocused ? themeColor : "gray"}>
          {isFocused ? helpText : "Trykk Tab for å aktivere"}
        </Text>
      </Box>
    </Box>
  );
}
