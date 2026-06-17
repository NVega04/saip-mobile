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

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
}

interface Provider {
  id: number;
  token: string;
  company: string;
  nit: string;
  email: string;
  status: string;
  contacts: Contact[];
}

const PAGE_SIZE = 15;

export default function ProvidersScreen() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState({ company: "", nit: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [providerForContact, setProviderForContact] = useState<Provider | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/providers/");
      if (res.ok) setProviders(await res.json());
    } catch { showAlert("error", "Error al cargar proveedores"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = providers.filter((p) => p.company.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setForm({ company: "", nit: "", email: "" }); setModalOpen(true); };
  const openEdit = (p: Provider) => { setEditing(p); setForm({ company: p.company, nit: p.nit, email: p.email }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/providers/${editing.id}` : "/providers/";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); showAlert("error", data.detail ?? "Error al guardar"); return; }
      showAlert("success", editing ? "Proveedor actualizado" : "Proveedor creado");
      setModalOpen(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleDelete = (p: Provider) => {
    showConfirm({
      message: `¿Eliminar "${p.company}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/providers/${p.id}`, { method: "DELETE" });
        if (!res.ok) { showAlert("error", "Error al eliminar"); return; }
        showAlert("success", "Proveedor eliminado");
        fetchData();
      },
    });
  };

  const openContactModal = (p: Provider, c?: Contact) => {
    setProviderForContact(p);
    if (c) {
      setEditingContact(c);
      setContactForm({ name: c.name, email: c.email, phone: c.phone, notes: c.notes ?? "" });
    } else {
      setEditingContact(null);
      setContactForm({ name: "", email: "", phone: "", notes: "" });
    }
    setContactModal(true);
  };

  const handleContactSave = async () => {
    if (!providerForContact) return;
    setSaving(true);
    try {
      const url = editingContact
        ? `/providers/${providerForContact.id}/contacts/${editingContact.id}`
        : `/providers/${providerForContact.id}/contacts/`;
      const method = editingContact ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(contactForm) });
      if (!res.ok) { showAlert("error", "Error al guardar contacto"); return; }
      showAlert("success", editingContact ? "Contacto actualizado" : "Contacto creado");
      setContactModal(false);
      fetchData();
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleContactDelete = (p: Provider, c: Contact) => {
    showConfirm({
      message: `¿Eliminar contacto "${c.name}"?`,
      confirmText: "Eliminar",
      onConfirm: async () => {
        const res = await apiFetch(`/providers/${p.id}/contacts/${c.id}`, { method: "DELETE" });
        if (!res.ok) { showAlert("error", "Error al eliminar contacto"); return; }
        showAlert("success", "Contacto eliminado");
        fetchData();
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg" color="$textLight900">Proveedores</Heading>
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
                  <Text bold>{item.company}</Text>
                  <Text size="xs">NIT: {item.nit}</Text>
                  <Text size="xs">{item.email}</Text>
                </VStack>
                <Badge text={item.status} action={item.status === "active" ? "success" : "error"} />
              </HStack>
              {item.contacts.length > 0 && (
                <VStack mt="$2">
                  <Text size="xs" bold>Contactos:</Text>
                  {item.contacts.map((c) => (
                    <HStack key={c.id} justifyContent="space-between" alignItems="center" py="$1">
                      <Text size="xs">{c.name} - {c.phone}</Text>
                      <HStack space="xs">
                        <Button title="Editar" onPress={() => openContactModal(item, c)} variant="link" />
                        <Button title="Eliminar" onPress={() => handleContactDelete(item, c)} variant="link" action="negative" />
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              )}
              <HStack space="sm" mt="$1">
                <Button title="Editar" onPress={() => openEdit(item)} variant="outline" />
                <Button title="+ Contacto" onPress={() => openContactModal(item)} variant="outline" />
                <Button title="Eliminar" onPress={() => handleDelete(item)} action="negative" />
              </HStack>
            </VStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Box h="$2" />}
        ListEmptyComponent={<EmptyState />}
      />
      <Pagination page={page} hasMore={page < totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Proveedor" : "Nuevo Proveedor"}>
        <VStack space="md">
          <TextInput label="Empresa" value={form.company} onChangeText={(v) => setForm({ ...form, company: v })} />
          <TextInput label="NIT" value={form.nit} onChangeText={(v) => setForm({ ...form, nit: v })} />
          <TextInput label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      </Modal>

      <Modal isOpen={contactModal} onClose={() => setContactModal(false)} title={editingContact ? "Editar Contacto" : "Nuevo Contacto"}>
        <VStack space="md">
          <TextInput label="Nombre" value={contactForm.name} onChangeText={(v) => setContactForm({ ...contactForm, name: v })} />
          <TextInput label="Email" value={contactForm.email} onChangeText={(v) => setContactForm({ ...contactForm, email: v })} keyboardType="email-address" autoCapitalize="none" />
          <TextInput label="Teléfono" value={contactForm.phone} onChangeText={(v) => setContactForm({ ...contactForm, phone: v })} keyboardType="phone-pad" />
          <Button title="Guardar" onPress={handleContactSave} loading={saving} />
        </VStack>
      </Modal>
    </VStack>
  );
}
