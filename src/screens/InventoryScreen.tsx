import { useEffect, useState } from "react";
import { VStack, HStack, Text, Heading, Box } from "@gluestack-ui/themed";
import { FlatList } from "react-native";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useAlert } from "../context/AlertContext";
import { apiFetch } from "../api/client";

interface InventoryItem {
  id: number;
  name: string;
  available_quantity: number;
  min_stock: number;
  status: string;
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  const fetchData = async () => {
    try {
      const [prodRes, suppRes] = await Promise.all([
        apiFetch("/products/"),
        apiFetch("/supplies/"),
      ]);
      const products = prodRes.ok ? await prodRes.json() : [];
      const supplies = suppRes.ok ? await suppRes.json() : [];
      setItems([...products, ...supplies].filter((i: InventoryItem) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      ));
    } catch {
      showAlert("error", "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const getStockStatus = (qty: number, min: number) => {
    if (qty <= 0) return { text: "Agotado", action: "error" as const };
    if (qty <= min) return { text: "Bajo", action: "warning" as const };
    return { text: "Disponible", action: "success" as const };
  };

   const renderItem = ({ item }: { item: InventoryItem }) => {
    const status = getStockStatus(item.available_quantity, item.min_stock);
    return (
      <Card>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text bold>{item.name}</Text>
            <Text size="sm" color="$textLight500">Stock: {item.available_quantity}</Text>
            <Text size="xs" color="$textLight400">Mín: {item.min_stock}</Text>
          </VStack>
          <Badge text={status.text} action={status.action} />
        </HStack>
      </Card>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="$textLight900">Inventario</Heading>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar en inventario..." />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState message="No se encontraron items" />}
      />
    </VStack>
  );
}

