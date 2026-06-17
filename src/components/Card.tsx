import { ReactNode } from "react";
import { Box } from "@gluestack-ui/themed";

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <Box bg="$backgroundLight0" borderRadius="$lg" p="$4" borderWidth={1} borderColor="$borderLight200">
      {children}
    </Box>
  );
}
