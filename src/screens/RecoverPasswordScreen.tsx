import { useState } from "react";
import { SafeAreaView, ScrollView, View, TouchableOpacity } from "react-native";
import { Text } from "@gluestack-ui/themed";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#D9DCD6" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, backgroundColor: "#ffffff", paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: 24,
              color: "#16425b",
              marginBottom: 8,
            }}
          >
            Recuperar Contraseña
          </Text>

          {step === "email" ? (
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 13.5,
                  color: "#647a8a",
                  textAlign: "center",
                  marginBottom: 28,
                }}
              >
                Ingresa tu correo electrónico para recibir un token de recuperación.
              </Text>

              <TextInput
                variant="login"
                value={email}
                onChangeText={setEmail}
                placeholder="Su correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ marginTop: 24 }}>
                <Button title={loading ? "Enviando..." : "Enviar Token"} onPress={handleSendEmail} loading={loading} variant="submit" />
              </View>
            </View>
          ) : (
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 13.5,
                  color: "#647a8a",
                  textAlign: "center",
                  marginBottom: 28,
                }}
              >
                Ingresa el token recibido por correo y tu nueva contraseña.
              </Text>

              <View style={{ gap: 16 }}>
                <TextInput
                  variant="login"
                  value={token}
                  onChangeText={setToken}
                  placeholder="Token de recuperación"
                  autoCapitalize="none"
                />
                <TextInput
                  variant="login"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nueva contraseña"
                  secureTextEntry
                />
              </View>

              <View style={{ marginTop: 24 }}>
                <Button title={loading ? "Restableciendo..." : "Restablecer Contraseña"} onPress={handleReset} loading={loading} variant="submit" />
              </View>
            </View>
          )}

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, color: "#3a7ca5" }}>
              Volver al Inicio
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
