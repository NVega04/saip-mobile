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

interface Product {
  id: number;
  token: string;
  name: string;
  description: string | null;
  available_quantity: number;
  min_stock: number;
  max_stock: number;
  is_locked: boolean;
  status: string;
  unit: { id: number; name: string };
}

interface UnitBasic {
  id: number;
  name: string;
}

const PAGE_SIZE = 20;

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<UnitBasic[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", unit_id: 0, min_stock: 0, max_stock: 0 });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/products/");
      if (res.ok) setProducts(await res.json());
    } catch { showAlert("error", "Error al cargar productos"); }
    finally { setLoading(false); }
  };

  const fetchUnits = async () => {
    try {
      const res = await apiFetch("/units/");
      if (res.ok) setUnits(await res.json());
    } catch {}
  };

  useEffect(() => { fetchProducts(); fetchUnits(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", unit_id: units[0]?.id ?? 0, min_stock: 0, max_stock: 0 });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", unit_id: p.unit?.id ?? 0, min_stock: p.min_stock, max_stock: p.max_stock });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/products/${editing.id}` : "/products/";
      const method = editing ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json();
        showAlert("error", data.detail ?? "Error al guardar");
        return;
      }
      showAlert("success", editing ? "Producto actualizado" : "Producto creado");
      setModalOpen(false);
      fetchProducts();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (p: Product) => {
    showConfirm({
      message: `¿Eliminar "${p.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        try {
          const res = await apiFetch(`/products/${p.id}`, { method: "DELETE" });
          if (!res.ok) { showAlert("error", "Error al eliminar"); return; }
          showAlert("success", "Producto eliminado");
          fetchProducts();
        } catch { showAlert("error", "Error de conexión"); }
      },
    });
  };

  const toggleLock = async (p: Product) => {
    try {
      const res = await apiFetch(`/products/${p.id}/lock`, { method: "PATCH" });
      if (!res.ok) { showAlert("error", "Error al cambiar bloqueo"); return; }
      fetchProducts();
    } catch { showAlert("error", "Error de conexión"); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="$textLight900">Productos</Heading>
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
                  {item.description ? <Text size="xs" color="$textLight500">{item.description}</Text> : null}
                  <Text size="xs">Stock: {item.available_quantity} | Mín: {item.min_stock} | Máx: {item.max_stock}</Text>
                </VStack>
                <Badge text={item.status} action={item.status === "active" ? "success" : "error"} />
              </HStack>
              <HStack space="sm">
                <Button title="Editar" onPress={() => openEdit(item)} variant="outline" />
                <Button title={item.is_locked ? "Desbloquear" : "Bloquear"} onPress={() => toggleLock(item)} variant="outline" action="secondary" />
                <Button title="Eliminar" onPress={() => handleDelete(item)} action="negative" />
              </HStack>
            </VStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState />}
      />
      <Pagination page={page} hasMore={page < totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Producto" : "Nuevo Producto"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextInput label="Descripción" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <TextInput label="Stock Mínimo" value={String(form.min_stock)} onChangeText={(v) => setForm({ ...form, min_stock: Number(v) || 0 })} keyboardType="numeric" />
          <TextInput label="Stock Máximo" value={String(form.max_stock)} onChangeText={(v) => setForm({ ...form, max_stock: Number(v) || 0 })} keyboardType="numeric" />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}

