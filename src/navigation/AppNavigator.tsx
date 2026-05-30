import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import AppDrawer from "./AppDrawer";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
      {currentUser ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}
