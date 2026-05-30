import { createContext, useContext, useState, ReactNode } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogBody, AlertDialogBackdrop, Button, ButtonText, Heading, Text } from "@gluestack-ui/themed";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => void;
  hideConfirm: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmState({ isOpen: true, ...options });
  };

  const hideConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    confirmState.onConfirm();
    hideConfirm();
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      <AlertDialog isOpen={confirmState.isOpen} onClose={hideConfirm}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">{confirmState.title ?? "Confirmar"}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="md">{confirmState.message}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" action="secondary" onPress={hideConfirm} mr="$3">
              <ButtonText>{confirmState.cancelText ?? "Cancelar"}</ButtonText>
            </Button>
            <Button action="negative" onPress={handleConfirm}>
              <ButtonText>{confirmState.confirmText ?? "Confirmar"}</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  }
  return context;
}
