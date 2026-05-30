import { useEffect, useState } from "react";
import { VStack, HStack, Heading, Box, Text } from "@gluestack-ui/themed";
import { FlatList } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import TextInput from "../components/TextInput";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { apiFetch } from "../api/client";

interface Recipe {
  id: number;
  token: string;
  name: string;
  description: string | null;
  yield_quantity: number;
  yield_unit: { id: number; name: string } | null;
  status: string;
  ingredients: RecipeIngredient[];
}

interface RecipeIngredient {
  id: number;
  supply: { id: number; name: string };
  quantity: number;
  unit: { id: number; name: string };
  notes: string | null;
}

interface SelectOption {
  id: number;
  name: string;
}

const PAGE_SIZE = 15;

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [form, setForm] = useState({ name: "", description: "", yield_quantity: 1 });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/recipes/");
      if (res.ok) setRecipes(await res.json());
    } catch { showAlert("error", "Error al cargar recetas"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", yield_quantity: 1 }); setModalOpen(true); };
  const openEdit = (r: Recipe) => { setEditing(r); setForm({ name: r.name, description: r.description ?? "", yield_quantity: r.yield_quantity }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/recipes/${editing.id}` : "/recipes/";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al guardar"); return; }
      showAlert("success", editing ? "Receta actualizada" : "Receta creada");
      setModalOpen(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (r: Recipe) => {
    showConfirm({
      message: `¿Eliminar receta "${r.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/recipes/${r.id}`, { method: "DELETE" });
        if (!res.ok) { showAlert("error", "Error al eliminar"); return; }
        showAlert("success", "Receta eliminada");
        fetchData();
      },
    });
  };

  const getStatusAction = (status: string) => {
    if (status === "active") return "success" as const;
    if (status === "inactive") return "error" as const;
    return "info" as const;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="#5C3D1E">Recetas</Heading>
        <Button title="Nueva" onPress={openCreate} />
      </HStack>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={paginated}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card>
            <VStack space="xs">
              <HStack justifyContent="space-between">
                <VStack>
                  <Text bold>{item.name}</Text>
                  <Text size="xs">Rinde: {item.yield_quantity} {item.yield_unit?.name ?? ""}</Text>
                </VStack>
                <Badge text={item.status} action={getStatusAction(item.status)} />
              </HStack>
              {item.ingredients.length > 0 && (
                <Text size="xs" color="$textLight500">
                  Ingredientes: {item.ingredients.map((i) => `${i.supply.name} (${i.quantity} ${i.unit.name})`).join(", ")}
                </Text>
              )}
              <HStack space="sm" mt="$1">
                <Button title="Editar" onPress={() => openEdit(item)} variant="outline" />
                <Button title="Eliminar" onPress={() => handleDelete(item)} action="negative" />
              </HStack>
            </VStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState />}
      />
      <Pagination page={page} hasMore={page < totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Receta" : "Nueva Receta"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextInput label="Descripción" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <TextInput label="Cantidad Producida" value={String(form.yield_quantity)} onChangeText={(v) => setForm({ ...form, yield_quantity: Number(v) || 0 })} keyboardType="numeric" />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
