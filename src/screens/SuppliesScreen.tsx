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

interface Supply {
  id: number;
  token: string;
  name: string;
  description: string | null;
  available_quantity: number;
  min_stock: number;
  max_stock: number;
  status: string;
  category: { id: number; name: string };
  unit: { id: number; name: string };
  expiration_date: string | null;
}

interface SelectOption {
  id: number;
  name: string;
}

const PAGE_SIZE = 20;

export default function SuppliesScreen() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category_id: 0, unit_id: 0, min_stock: 0, max_stock: 0, expiration_date: "" });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, catRes, unitRes] = await Promise.all([
        apiFetch("/supplies/"),
        apiFetch("/supply-categories/"),
        apiFetch("/units/"),
      ]);
      if (supRes.ok) setSupplies(await supRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (unitRes.ok) setUnits(await unitRes.json());
    } catch { showAlert("error", "Error al cargar datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = supplies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", category_id: categories[0]?.id ?? 0, unit_id: units[0]?.id ?? 0, min_stock: 0, max_stock: 0, expiration_date: "" });
    setModalOpen(true);
  };

  const openEdit = (s: Supply) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description ?? "", category_id: s.category?.id ?? 0, unit_id: s.unit?.id ?? 0, min_stock: s.min_stock, max_stock: s.max_stock, expiration_date: s.expiration_date ?? "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/supplies/${editing.id}` : "/supplies/";
      const method = editing ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json();
        showAlert("error", data.detail ?? "Error al guardar");
        return;
      }
      showAlert("success", editing ? "Insumo actualizado" : "Insumo creado");
      setModalOpen(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (s: Supply) => {
    showConfirm({
      message: `¿Eliminar "${s.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/supplies/${s.id}`, { method: "DELETE" });
        if (!res.ok) { showAlert("error", "Error al eliminar"); return; }
        showAlert("success", "Insumo eliminado");
        fetchData();
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="#5C3D1E">Insumos</Heading>
        <Button title="Nuevo" onPress={openCreate} />
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
                  <Text size="xs">Cat: {item.category?.name} | Unidad: {item.unit?.name}</Text>
                  <Text size="xs">Stock: {item.available_quantity} | Mín: {item.min_stock}</Text>
                  {item.expiration_date && <Text size="xs">Vence: {item.expiration_date}</Text>}
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
      <Pagination page={page} hasMore={page < totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Insumo" : "Nuevo Insumo"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextInput label="Descripción" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <TextInput label="Stock Mínimo" value={String(form.min_stock)} onChangeText={(v) => setForm({ ...form, min_stock: Number(v) || 0 })} keyboardType="numeric" />
          <TextInput label="Stock Máximo" value={String(form.max_stock)} onChangeText={(v) => setForm({ ...form, max_stock: Number(v) || 0 })} keyboardType="numeric" />
          <TextInput label="Fecha de Vencimiento" value={form.expiration_date} onChangeText={(v) => setForm({ ...form, expiration_date: v })} placeholder="YYYY-MM-DD" />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
