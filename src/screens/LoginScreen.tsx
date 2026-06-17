import { useState, useRef, useEffect } from "react";
import { SafeAreaView, ScrollView, Image, TouchableOpacity, View, Linking } from "react-native";
import { Text, HStack, VStack } from "@gluestack-ui/themed";
import { SvgXml } from "react-native-svg";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import TermsModal from "./TermsModal";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const hexagonSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#647a8a" stroke-width="1.6"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`;
const cameraSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#647a8a" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#647a8a" stroke="none"/></svg>`;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const termsAcceptedRef = useRef(false);
  const { setCurrentUser } = useAuth();
  const { showAlert } = useAlert();

  useEffect(() => {
    AsyncStorage.getItem("remembered_email").then((saved) => {
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    });
  }, []);

  const doLogin = async (acceptedTerms: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("http://10.0.2.2:8000/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accepted_terms: acceptedTerms }),
      });
      const data = await res.json();

      if (res.status === 403 && data.detail?.includes("términos")) {
        setShowTermsModal(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        showAlert("error", data.detail ?? "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      if (remember) {
        await AsyncStorage.setItem("remembered_email", email);
      } else {
        await AsyncStorage.removeItem("remembered_email");
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

  const handleLogin = () => {
    if (!email || !password) {
      showAlert("error", "Email y contraseña son requeridos");
      return;
    }
    doLogin(false);
  };

  const handleTermsAccept = () => {
    termsAcceptedRef.current = true;
    setShowTermsModal(false);
    doLogin(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#D9DCD6" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32, alignItems: "center" }}>
            <Image
              source={require("../../assets/Logo_Saip.png")}
              style={{ width: 120, height: 120, marginBottom: 24 }}
              resizeMode="contain"
            />

            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 24,
                color: "#16425b",
                marginBottom: 8,
              }}
            >
              Iniciar sesión
            </Text>

            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: 13.5,
                color: "#647a8a",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              Ingrese sus credenciales para acceder a su cuenta.
            </Text>

            <View style={{ width: "100%", gap: 16 }}>
              <TextInput
                variant="login"
                value={email}
                onChangeText={setEmail}
                placeholder="Su nombre de usuario o correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                variant="login"
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese su contraseña"
                secureTextEntry
                showPasswordToggle
              />
            </View>

            <HStack
              justifyContent="space-between"
              alignItems="center"
              width="$full"
              mt={16}
              mb={32}
            >
              <TouchableOpacity
                onPress={() => setRemember(!remember)}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    borderWidth: 1.5,
                    borderColor: "#647a8a",
                    backgroundColor: remember ? "#16425b" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {remember && (
                    <Text style={{ color: "white", fontSize: 12, lineHeight: 14 }}>✓</Text>
                  )}
                </View>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, color: "#647a8a" }}>
                  Recordar correo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("RecoverPassword")}>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, color: "#3a7ca5" }}>
                  ¿Olvidó su contraseña?
                </Text>
              </TouchableOpacity>
            </HStack>

            <Button
              title={loading ? "Verificando..." : "Iniciar sesión"}
              onPress={handleLogin}
              variant="submit"
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          backgroundColor: "#ffffff",
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: "center",
          gap: 8,
        }}
      >
        <TouchableOpacity onPress={() => {}}>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, color: "#647a8a" }}>
            Conócenos
          </Text>
        </TouchableOpacity>

        <HStack space="sm">
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#bcc7d0",
              backgroundColor: "#ffffff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SvgXml xml={hexagonSvg} width={16} height={16} />
          </View>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#bcc7d0",
              backgroundColor: "#ffffff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SvgXml xml={cameraSvg} width={16} height={16} />
          </View>
        </HStack>
      </View>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />
    </SafeAreaView>
  );
}
