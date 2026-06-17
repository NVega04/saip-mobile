import { GluestackUIProvider } from "@gluestack-ui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/context/AuthContext";
import { AlertProvider } from "./src/context/AlertContext";
import { ConfirmProvider } from "./src/context/ConfirmContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { bakeryConfig } from "./src/theme/bakeryTheme";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#D9DCD6", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 24, color: "#16425b" }}>SAIP</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={bakeryConfig}>
        <AuthProvider>
          <AlertProvider>
            <ConfirmProvider>
              <AppNavigator />
            </ConfirmProvider>
          </AlertProvider>
        </AuthProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
