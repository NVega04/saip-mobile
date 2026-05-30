import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getAllowedModules(): Promise<string[]> {
  const raw = await AsyncStorage.getItem("modules");
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

export function canAccessModule(moduleId: string, allowedModules: string[]): boolean {
  if (allowedModules.includes("all")) return true;
  if (["dashboard", "acerca", "contacto"].includes(moduleId)) return true;
  return allowedModules.includes(moduleId);
}
