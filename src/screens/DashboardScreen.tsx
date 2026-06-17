import { VStack, Text, Heading, HStack, Box } from "@gluestack-ui/themed";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function DashboardScreen() {
  const { currentUser } = useAuth();

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="$textLight900">
        Bienvenido{currentUser ? `, ${currentUser.first_name}` : ""}
      </Heading>
      <HStack space="md" flexWrap="wrap">
        <Box flex={1} minWidth="$40">
          <Card>
            <VStack space="sm">
              <Heading size="sm">Inventario</Heading>
              <Text size="sm" color="$textLight500">Gestiona productos, insumos y unidades</Text>
            </VStack>
          </Card>
        </Box>
        <Box flex={1} minWidth="$40">
          <Card>
            <VStack space="sm">
              <Heading size="sm">Producción</Heading>
              <Text size="sm" color="$textLight500">Administra recetas y órdenes de producción</Text>
            </VStack>
          </Card>
        </Box>
      </HStack>
      <HStack space="md" flexWrap="wrap">
        <Box flex={1} minWidth="$40">
          <Card>
            <VStack space="sm">
              <Heading size="sm">Ventas</Heading>
              <Text size="sm" color="$textLight500">Registra y consulta ventas</Text>
            </VStack>
          </Card>
        </Box>
        <Box flex={1} minWidth="$40">
          <Card>
            <VStack space="sm">
              <Heading size="sm">Usuarios</Heading>
              <Text size="sm" color="$textLight500">Administra usuarios y roles</Text>
            </VStack>
          </Card>
        </Box>
      </HStack>
    </VStack>
  );
}
