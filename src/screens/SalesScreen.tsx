import { VStack, Heading } from "@gluestack-ui/themed";
import EmptyState from "../components/EmptyState";

export default function SalesScreen() {
  return (
    <VStack flex={1} p="$4" bg="$backgroundLight50">
      <Heading size="lg" color="#5C3D1E">Ventas</Heading>
      <EmptyState message="Módulo de ventas en desarrollo" />
    </VStack>
  );
}
