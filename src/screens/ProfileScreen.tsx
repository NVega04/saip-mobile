import { useEffect, useState } from "react";
import { VStack, HStack, Heading, Text } from "@gluestack-ui/themed";
import Button from "../components/Button";
import Card from "../components/Card";
import TextInput from "../components/TextInput";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { useConfirm } from "../context/ConfirmContext";
import { apiFetch, logout } from "../api/client";

export default function ProfileScreen() {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm({ first_name: currentUser.first_name, last_name: currentUser.last_name, phone: currentUser.phone ?? "" });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/users/me", { method: "PUT", body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); showAlert("error", d.detail ?? "Error"); return; }
      showAlert("success", "Perfil actualizado");
      setEditing(false);
    } catch { showAlert("error", "Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleChangePwd = async () => {
    setChangingPwd(true);
    try {
      const res = await apiFetch("/session/change-password", {
        method: "POST",
        body: JSON.stringify(pwdForm),
      });
      if (!res.ok) { const d = await res.json(); showAlert("error", d.detail ?? "Error al cambiar contraseña"); return; }
      showAlert("success", "Contraseña cambiada");
      setPwdModal(false);
      setPwdForm({ current_password: "", new_password: "" });
    } catch { showAlert("error", "Error de conexión"); }
    finally { setChangingPwd(false); }
  };

  const handleDeleteAccount = () => {
    showConfirm({
      title: "Eliminar cuenta",
      message: "¿Estás seguro de eliminar tu cuenta?",
      confirmText: "Eliminar",
      onConfirm: async () => {
        try {
          await apiFetch("/users/me", {
            method: "DELETE",
            headers: { "X-Confirm-Password": "" },
          });
          showAlert("success", "Cuenta eliminada");
          await logout();
        } catch { showAlert("error", "Error al eliminar cuenta"); }
      },
    });
  };

  if (!currentUser) return <LoadingSpinner />;

  return (
    <VStack flex={1} p="$4" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="$textLight900">Perfil</Heading>
      <Card>
        <VStack space="md">
          <Text bold>{currentUser.first_name} {currentUser.last_name}</Text>
          <Text size="sm">{currentUser.email}</Text>
          <Text size="sm">Rol: {currentUser.role?.name}</Text>
          <Text size="sm">Admin: {currentUser.is_admin ? "Sí" : "No"}</Text>
        </VStack>
      </Card>

      <Button title={editing ? "Cancelar" : "Editar Perfil"} onPress={() => setEditing(!editing)} variant={editing ? "outline" : "solid"} />

      {editing && (
        <VStack space="md">
          <TextInput label="Nombre" value={form.first_name} onChangeText={(v) => setForm({ ...form, first_name: v })} />
          <TextInput label="Apellido" value={form.last_name} onChangeText={(v) => setForm({ ...form, last_name: v })} />
          <TextInput label="Teléfono" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
          <Button title={saving ? "Guardando..." : "Guardar"} onPress={handleSave} loading={saving} />
        </VStack>
      )}

      <HStack space="md">
        <Button title="Cambiar Contraseña" onPress={() => setPwdModal(true)} variant="outline" />
        <Button title="Eliminar Cuenta" onPress={handleDeleteAccount} action="negative" />
      </HStack>

      <Modal isOpen={pwdModal} onClose={() => setPwdModal(false)} title="Cambiar Contraseña">
        <VStack space="md">
          <TextInput label="Contraseña Actual" value={pwdForm.current_password} onChangeText={(v) => setPwdForm({ ...pwdForm, current_password: v })} secureTextEntry />
          <TextInput label="Nueva Contraseña" value={pwdForm.new_password} onChangeText={(v) => setPwdForm({ ...pwdForm, new_password: v })} secureTextEntry />
          <Button title={changingPwd ? "Cambiando..." : "Cambiar"} onPress={handleChangePwd} loading={changingPwd} />
        </VStack>
      </Modal>
    </VStack>
  );
}
