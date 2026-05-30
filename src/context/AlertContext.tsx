import { createContext, useContext, ReactNode } from "react";
import { useToast, Toast, ToastTitle, ToastDescription, VStack } from "@gluestack-ui/themed";
import React from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertContextType {
  showAlert: (type: AlertType, message: string, duration?: number) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const colorMap: Record<AlertType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  const showAlert = (type: AlertType, message: string, duration = 3000) => {
    const color = colorMap[type];
    toast.show({
      duration,
      placement: "top",
      render: ({ id }) => (
        <Toast>
          <VStack space="xs">
            <ToastTitle style={{ color }}>{message}</ToastTitle>
          </VStack>
        </Toast>
      ),
    });
  };

  const hideAlert = () => {
    toast.closeAll();
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert debe usarse dentro de AlertProvider");
  }
  return context;
}
