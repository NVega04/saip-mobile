import { useState } from "react";
import { VStack, Text, Box, Heading, Checkbox, CheckboxLabel, CheckboxIndicator, CheckboxIcon, CheckIcon } from "@gluestack-ui/themed";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { apiFetch } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();
  const { showAlert } = useAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("error", "Email y contraseña son requeridos");
      return;
    }
    if (!acceptedTerms) {
      showAlert("error", "Debes aceptar los términos y condiciones");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://10.0.2.2:8000/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accepted_terms: acceptedTerms }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert("error", data.detail ?? "Error al iniciar sesión");
        return;
      }
      await AsyncStorage.setItem("session_token", data.session_token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      if (data.modules) {
        await AsyncStorage.setItem("modules", JSON.stringify(data.modules));
      }
      setCurrentUser(data.user);
    } catch {
      showAlert("error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack flex={1} justifyContent="center" p="$6" space="md" bg="$backgroundLight50">
      <Box alignItems="center" mb="$8">
        <Heading size="2xl" color="#5C3D1E">SAIP</Heading>
        <Text size="sm" color="$textLight500">Sistema Administrativo Integral de Productos</Text>
      </Box>
      <TextInput label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Contraseña" value={password} onChangeText={setPassword} placeholder="Tu contraseña" secureTextEntry />
      <Checkbox value="terms" isChecked={acceptedTerms} onChange={(val) => setAcceptedTerms(!!val)}>
        <CheckboxIndicator>
          <CheckboxIcon as={CheckIcon} />
        </CheckboxIndicator>
        <CheckboxLabel>Acepto los términos y condiciones</CheckboxLabel>
      </Checkbox>
      <Button title="Iniciar Sesión" onPress={handleLogin} loading={loading} />
      <Button title="Recuperar Contraseña" onPress={() => navigation.navigate("RecoverPassword")} variant="link" />
    </VStack>
  );
}
