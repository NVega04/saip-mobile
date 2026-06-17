import { useEffect, useState } from "react";
import { VStack, HStack, Heading, Box, Text } from "@gluestack-ui/themed";
import { FlatList } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { apiFetch } from "../api/client";

interface ProductionOrder {
  id: number;
  token: string;
  recipe: { id: number; name: string };
  quantity_multiplier: number;
  total_yield: number;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
}

const PAGE_SIZE = 15;

export default function ProductionScreen() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/production-orders/");
      if (res.ok) setOrders(await res.json());
    } catch { showAlert("error", "Error al cargar órdenes de producción"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = orders.filter((o) => o.recipe?.name?.toLowerCase().includes(search.toLowerCase()) ?? false);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusAction = (status: string) => {
    switch (status) {
      case "completed": return "success" as const;
      case "cancelled": return "error" as const;
      case "in_progress": return "warning" as const;
      default: return "info" as const;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="$textLight900">Producción</Heading>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={paginated}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card>
            <VStack space="xs">
              <HStack justifyContent="space-between">
                <VStack>
                  <Text bold>{item.recipe?.name ?? "Sin receta"}</Text>
                  <Text size="xs">Multiplicador: {item.quantity_multiplier}x</Text>
                  <Text size="xs">Rendimiento total: {item.total_yield}</Text>
                  {item.scheduled_at && <Text size="xs">Programado: {item.scheduled_at}</Text>}
                  {item.completed_at && <Text size="xs">Completado: {item.completed_at}</Text>}
                </VStack>
                <Badge text={item.status} action={getStatusAction(item.status)} />
              </HStack>
            </VStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState />}
      />
      <Pagination page={page} hasMore={page < totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />
    </VStack>
  );
}
