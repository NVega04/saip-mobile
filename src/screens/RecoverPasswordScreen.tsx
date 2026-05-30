import { useState } from "react";
import { VStack, Text, Heading } from "@gluestack-ui/themed";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { useAlert } from "../context/AlertContext";
import { apiFetch } from "../api/client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "RecoverPassword">;

export default function RecoverPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<"email" | "token">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSendEmail = async () => {
    if (!email) {
      showAlert("error", "Ingresa tu correo electrónico");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/session/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        showAlert("error", data.detail ?? "Error al enviar correo");
        return;
      }
      showAlert("success", "Revisa tu correo para el token de recuperación");
      setStep("token");
    } catch {
      showAlert("error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token || !newPassword) {
      showAlert("error", "Token y nueva contraseña son requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/session/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        showAlert("error", data.detail ?? "Error al restablecer contraseña");
        return;
      }
      showAlert("success", "Contraseña restablecida. Inicia sesión.");
      navigation.goBack();
    } catch {
      showAlert("error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack flex={1} justifyContent="center" p="$6" space="md" bg="$backgroundLight50">
      <Heading size="lg" color="#5C3D1E" textAlign="center">Recuperar Contraseña</Heading>
      {step === "email" ? (
        <>
          <Text size="sm" color="$textLight500" textAlign="center">
            Ingresa tu correo electrónico para recibir un token de recuperación.
          </Text>
          <TextInput label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
          <Button title="Enviar Token" onPress={handleSendEmail} loading={loading} />
        </>
      ) : (
        <>
          <Text size="sm" color="$textLight500" textAlign="center">
            Ingresa el token recibido por correo y tu nueva contraseña.
          </Text>
          <TextInput label="Token" value={token} onChangeText={setToken} placeholder="Token de recuperación" autoCapitalize="none" />
          <TextInput label="Nueva Contraseña" value={newPassword} onChangeText={setNewPassword} placeholder="Nueva contraseña" secureTextEntry />
          <Button title="Restablecer Contraseña" onPress={handleReset} loading={loading} />
        </>
      )}
      <Button title="Volver al Inicio" onPress={() => navigation.goBack()} variant="link" />
    </VStack>
  );
}
