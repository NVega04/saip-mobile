import { ReactNode } from "react";
import { Modal as GSModal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalBackdrop, Heading, Button, ButtonText, Icon, CloseIcon } from "@gluestack-ui/themed";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  return (
    <GSModal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{title}</Heading>
          <Button variant="link" onPress={onClose}>
            <Icon as={CloseIcon} />
          </Button>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </GSModal>
  );
}
