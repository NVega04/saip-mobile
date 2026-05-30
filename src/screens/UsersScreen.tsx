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

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  is_admin: boolean;
  role: { id: number; name: string } | null;
}

interface Role {
  id: number;
  name: string;
}

const PAGE_SIZE = 15;

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role_id: 0, is_admin: false });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiFetch("/users/"),
        apiFetch("/roles/"),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    } catch { showAlert("error", "Error al cargar datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = users.filter((u) => {
    const full = `${u.first_name} ${u.last_name}`.toLowerCase();
    return full.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setForm({ first_name: "", last_name: "", email: "", phone: "", role_id: roles[0]?.id ?? 0, is_admin: false }); setModalOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, phone: u.phone ?? "", role_id: u.role?.id ?? 0, is_admin: u.is_admin }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/users/${editing.id}` : "/users/";
      const method = editing ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al guardar"); return; }
      showAlert("success", editing ? "Usuario actualizado" : "Usuario creado");
      setModalOpen(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (u: User) => {
    showConfirm({
      message: `¿Eliminar a "${u.first_name} ${u.last_name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/users/${u.id}`, { method: "DELETE" });
        if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al eliminar"); return; }
        showAlert("success", "Usuario eliminado");
        fetchData();
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="#5C3D1E">Usuarios</Heading>
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
                  <Text bold>{item.first_name} {item.last_name}</Text>
                  <Text size="xs">{item.email}</Text>
                  {item.phone && <Text size="xs">{item.phone}</Text>}
                  <Text size="xs">Rol: {item.role?.name ?? "Sin rol"} {item.is_admin ? "(Admin)" : ""}</Text>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Usuario" : "Nuevo Usuario"}>
        <VStack space="md">
          <TextInput label="Nombre" value={form.first_name} onChangeText={(v) => setForm({ ...form, first_name: v })} />
          <TextInput label="Apellido" value={form.last_name} onChangeText={(v) => setForm({ ...form, last_name: v })} />
          <TextInput label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
          <TextInput label="Teléfono" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
