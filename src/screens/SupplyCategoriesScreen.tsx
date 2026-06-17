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
import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { apiFetch } from "../api/client";

interface SupplyCategory {
  id: number;
  token: string;
  name: string;
  description: string | null;
  status: string;
}

export default function SupplyCategoriesScreen() {
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplyCategory | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/supply-categories/");
      if (res.ok) setCategories(await res.json());
    } catch { showAlert("error", "Error al cargar categorías"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (c: SupplyCategory) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/supply-categories/${editing.id}` : "/supply-categories/";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json();
        showAlert("error", data.detail ?? "Error al guardar");
        return;
      }
      showAlert("success", editing ? "Categoría actualizada" : "Categoría creada");
      setModalOpen(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (c: SupplyCategory) => {
    showConfirm({
      message: `¿Eliminar "${c.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/supply-categories/${c.id}`, { method: "DELETE" });
        if (!res.ok) { showAlert("error", "Error al eliminar"); return; }
        showAlert("success", "Categoría eliminada");
        fetchData();
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="$textLight900">Categorías de Insumos</Heading>
        <Button title="Nueva" onPress={openCreate} />
      </HStack>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card>
            <VStack space="xs">
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text bold>{item.name}</Text>
                  {item.description ? <Text size="xs" color="$textLight500">{item.description}</Text> : null}
                </VStack>
                <Badge text={item.status} action={item.status === "active" ? "success" : "error"} />
              </HStack>
              <HStack space="sm">
                <Button title="Editar" onPress={() => openEdit(item)} variant="outline" />
                <Button title="Eliminar" onPress={() => handleDelete(item)} action="negative" />
              </HStack>
            </VStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState />}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Categoría" : "Nueva Categoría"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextInput label="Descripción" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
