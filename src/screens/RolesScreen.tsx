import { useEffect, useState } from "react";
import { VStack, HStack, Heading, Box, Text, Checkbox, CheckboxIndicator, CheckboxIcon, CheckIcon, CheckboxLabel } from "@gluestack-ui/themed";
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

interface Role {
  id: number;
  token: string;
  name: string;
  description: string | null;
  status: string;
}

interface Module {
  id: number;
  name: string;
  label: string;
}

const PAGE_SIZE = 15;

export default function RolesScreen() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [modulesModalOpen, setModulesModalOpen] = useState(false);
  const [roleForModules, setRoleForModules] = useState<Role | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/roles/");
      if (res.ok) setRoles(await res.json());
    } catch { showAlert("error", "Error al cargar roles"); }
    finally { setLoading(false); }
  };

  const fetchModules = async () => {
    try {
      const res = await apiFetch("/role-modules/modules");
      if (res.ok) setModules(await res.json());
    } catch {}
  };

  useEffect(() => { fetchRoles(); fetchModules(); }, []);

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "" }); setModalOpen(true); };
  const openEdit = (r: Role) => { setEditing(r); setForm({ name: r.name, description: r.description ?? "" }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/roles/${editing.id}` : "/roles/";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al guardar"); return; }
      showAlert("success", editing ? "Rol actualizado" : "Rol creado");
      setModalOpen(false);
      fetchRoles();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (r: Role) => {
    showConfirm({
      message: `¿Eliminar rol "${r.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/roles/${r.id}`, { method: "DELETE" });
        if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al eliminar"); return; }
        showAlert("success", "Rol eliminado");
        fetchRoles();
      },
    });
  };

  const openModulesModal = async (r: Role) => {
    setRoleForModules(r);
    try {
      const res = await apiFetch(`/role-modules/${r.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedModules(data.map((m: { module_id: number }) => m.module_id));
      }
    } catch {}
    setModulesModalOpen(true);
  };

  const handleModulesSave = async () => {
    if (!roleForModules) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/role-modules/${roleForModules.id}`, {
        method: "POST",
        body: JSON.stringify({ module_ids: selectedModules }),
      });
      if (!res.ok) { showAlert("error", "Error al guardar módulos"); return; }
      showAlert("success", "Módulos asignados");
      setModulesModalOpen(false);
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const toggleModule = (moduleId: number) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="#5C3D1E">Roles</Heading>
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
                  {item.description ? <Text size="xs">{item.description}</Text> : null}
                </VStack>
                <Badge text={item.status} action={item.status === "active" ? "success" : "error"} />
              </HStack>
              <HStack space="sm" mt="$1">
                <Button title="Editar" onPress={() => openEdit(item)} variant="outline" />
                <Button title="Módulos" onPress={() => openModulesModal(item)} variant="outline" />
                <Button title="Eliminar" onPress={() => handleDelete(item)} action="negative" />
              </HStack>
            </VStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState />}
      />
      <Pagination page={page} hasMore={page < totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Rol" : "Nuevo Rol"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextInput label="Descripción" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>

      <Modal isOpen={modulesModalOpen} onClose={() => setModulesModalOpen(false)} title={`Módulos: ${roleForModules?.name ?? ""}`}>
        <VStack space="md">
          {modules.map((m) => (
            <Checkbox key={m.id} value={String(m.id)} isChecked={selectedModules.includes(m.id)} onChange={() => toggleModule(m.id)}>
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>{m.label}</CheckboxLabel>
            </Checkbox>
          ))}
          <Button title="Guardar Módulos" onPress={handleModulesSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
