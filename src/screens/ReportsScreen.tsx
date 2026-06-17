import { useState } from "react";
import { VStack, Heading, Text, ScrollView } from "@gluestack-ui/themed";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAlert } from "../context/AlertContext";
import { useReportDownload } from "../hooks/useReportDownload";

const ENTITIES = [
  { value: "users", label: "Usuarios" },
  { value: "roles", label: "Roles" },
  { value: "sessions", label: "Sesiones" },
  { value: "products", label: "Productos" },
  { value: "supplies", label: "Insumos" },
  { value: "supply-categories", label: "Categorías de Insumos" },
  { value: "units", label: "Unidades de Medida" },
  { value: "recipes", label: "Recetas" },
  { value: "production", label: "Producción" },
];

export default function ReportsScreen() {
  const [dloading, setDloading] = useState<string | null>(null);
  const { download, loading } = useReportDownload();
  const { showAlert } = useAlert();

  const handleDownload = async (entity: string) => {
    setDloading(entity);
    try {
      await download(entity);
    } finally {
      setDloading(null);
    }
  };

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="$textLight900">Reportes</Heading>
      <Card>
        <VStack space="md">
          <Text size="sm">Selecciona el tipo de reporte a descargar:</Text>
          <ScrollView>
            <VStack space="sm">
              {ENTITIES.map((e) => (
                <Button
                  key={e.value}
                  title={e.label}
                  onPress={() => handleDownload(e.value)}
                  loading={dloading === e.value || loading}
                  variant="outline"
                />
              ))}
            </VStack>
          </ScrollView>
        </VStack>
      </Card>
    </VStack>
  );
}
