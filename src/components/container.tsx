import { Box } from "ink";

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <Box
      flexDirection="column"
      borderTop={false}
      borderStyle="round"
      padding={1}
      paddingBottom={0}
    >
      {children}
    </Box>
  );
}
