import { VStack, Text, Icon } from "@gluestack-ui/themed";
import { InfoIcon } from "@gluestack-ui/themed";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No hay datos disponibles" }: EmptyStateProps) {
  return (
    <VStack flex={1} justifyContent="center" alignItems="center" p="$8" space="md">
      <Icon as={InfoIcon} size="xl" color="$textLight400" />
      <Text size="md" color="$textLight400" textAlign="center">{message}</Text>
    </VStack>
  );
}
