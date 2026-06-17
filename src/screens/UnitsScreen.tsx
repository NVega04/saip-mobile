import { useEffect, useState } from "react";
import { VStack, HStack, Heading, Box, Text } from "@gluestack-ui/themed";
import { FlatList } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import TextInput from "../components/TextInput";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { apiFetch } from "../api/client";

interface Unit {
  id: number;
  token: string;
  name: string;
  abbreviation: string;
  description: string | null;
}

export default function UnitsScreen() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState({ name: "", abbreviation: "", description: "" });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/units/");
      if (res.ok) setUnits(await res.json());
    } catch { showAlert("error", "Error al cargar unidades"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = units.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm({ name: "", abbreviation: "", description: "" }); setModalOpen(true); };
  const openEdit = (u: Unit) => { setEditing(u); setForm({ name: u.name, abbreviation: u.abbreviation, description: u.description ?? "" }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/units/${editing.id}` : "/units/";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al guardar"); return; }
      showAlert("success", editing ? "Unidad actualizada" : "Unidad creada");
      setModalOpen(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (u: Unit) => {
    showConfirm({
      message: `¿Eliminar "${u.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/units/${u.id}`, { method: "DELETE" });
        if (!res.ok) { showAlert("error", "Error al eliminar"); return; }
        showAlert("success", "Unidad eliminada");
        fetchData();
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="$textLight900">Unidades de Medida</Heading>
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
                  <Text bold>{item.name} <Text size="xs" color="$textLight500">({item.abbreviation})</Text></Text>
                  {item.description ? <Text size="xs">{item.description}</Text> : null}
                </VStack>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Unidad" : "Nueva Unidad"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextInput label="Abreviatura" value={form.abbreviation} onChangeText={(v) => setForm({ ...form, abbreviation: v })} />
          <TextInput label="Descripción" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
