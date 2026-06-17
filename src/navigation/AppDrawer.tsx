import { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AppDrawerParamList } from "./types";
import { getAllowedModules, canAccessModule } from "../utils/permissions";
import DashboardScreen from "../screens/DashboardScreen";
import InventoryScreen from "../screens/InventoryScreen";
import ProductsScreen from "../screens/ProductsScreen";
import SuppliesScreen from "../screens/SuppliesScreen";
import SupplyCategoriesScreen from "../screens/SupplyCategoriesScreen";
import UnitsScreen from "../screens/UnitsScreen";
import ProvidersScreen from "../screens/ProvidersScreen";
import RecipesScreen from "../screens/RecipesScreen";
import ProductionScreen from "../screens/ProductionScreen";
import SalesScreen from "../screens/SalesScreen";
import UsersScreen from "../screens/UsersScreen";
import RolesScreen from "../screens/RolesScreen";
import ReportsScreen from "../screens/ReportsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AboutScreen from "../screens/AboutScreen";

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export default function AppDrawer() {
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  useEffect(() => {
    getAllowedModules().then(setAllowedModules);
  }, []);

  const hasAccess = (module: string) => canAccessModule(module, allowedModules);

  return (
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#003459" },
          headerTintColor: "#FFFFFF",
          drawerActiveTintColor: "#3a7ca5",
          drawerActiveBackgroundColor: "#E8EDF5",
          drawerInactiveTintColor: "#FFFFFF",
          drawerLabelStyle: { color: "#FFFFFF" },
          drawerStyle: { backgroundColor: "#003459" },
          headerTitleStyle: { color: "#FFFFFF" },
        }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      {hasAccess("inventario") && (
        <>
          <Drawer.Screen name="Inventory" component={InventoryScreen} options={{ title: "Inventario" }} />
          <Drawer.Screen name="Products" component={ProductsScreen} options={{ title: "Productos" }} />
          <Drawer.Screen name="Supplies" component={SuppliesScreen} options={{ title: "Insumos" }} />
          <Drawer.Screen name="SupplyCategories" component={SupplyCategoriesScreen} options={{ title: "Categorías de Insumos" }} />
          <Drawer.Screen name="Units" component={UnitsScreen} options={{ title: "Unidades de Medida" }} />
        </>
      )}
      {hasAccess("proveedores") && (
        <Drawer.Screen name="Providers" component={ProvidersScreen} options={{ title: "Proveedores" }} />
      )}
      {hasAccess("recetas") && (
        <>
          <Drawer.Screen name="Recipes" component={RecipesScreen} options={{ title: "Recetas" }} />
          <Drawer.Screen name="Production" component={ProductionScreen} options={{ title: "Producción" }} />
        </>
      )}
      {hasAccess("ventas") && (
        <Drawer.Screen name="Sales" component={SalesScreen} options={{ title: "Ventas" }} />
      )}
      {hasAccess("usuarios") && (
        <>
          <Drawer.Screen name="Users" component={UsersScreen} options={{ title: "Usuarios" }} />
          <Drawer.Screen name="Roles" component={RolesScreen} options={{ title: "Roles" }} />
        </>
      )}
      <Drawer.Screen name="Reports" component={ReportsScreen} options={{ title: "Reportes" }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: "Acerca de" }} />
    </Drawer.Navigator>
  );
}
