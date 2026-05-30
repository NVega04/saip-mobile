import { VStack, Heading, Text } from "@gluestack-ui/themed";
import Card from "../components/Card";

export default function AboutScreen() {
  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="#5C3D1E">Acerca de SAIP</Heading>
      <Card>
        <VStack space="md">
          <Text bold>Sistema Administrativo Integral de Productos</Text>
          <Text size="sm">Versión 1.0.0</Text>
          <Text size="sm" color="$textLight500">
            SAIP es un sistema de gestión integral diseñado para panaderías y negocios de alimentos.
            Permite administrar inventarios, producción, ventas, proveedores y usuarios desde una plataforma unificada.
          </Text>
        </VStack>
      </Card>
    </VStack>
  );
}
