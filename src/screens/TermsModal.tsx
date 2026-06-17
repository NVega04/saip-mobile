import { ScrollView, Text } from "react-native";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalBackdrop, Heading, Button, ButtonText } from "@gluestack-ui/themed";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg" fontFamily="Poppins_600SemiBold" color="#16425b">
            Términos y Condiciones
          </Heading>
        </ModalHeader>
        <ModalBody>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>1. Aceptación de los términos</Text>
              {"\n"}
              Al acceder y utilizar SAIP (Sistema Administrativo Integral de Productos), usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguno de estos términos, por favor no utilice el sistema.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>2. Descripción del servicio</Text>
              {"\n"}
              SAIP es una plataforma de gestión administrativa diseñada para el control de inventario y productos de panadería. El sistema permite administrar usuarios, productos, unidades de medida y demás elementos relacionados con la operación del negocio.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>3. Cuenta de usuario</Text>
              {"\n"}
              Para acceder al sistema, cada usuario recibirá credenciales de acceso personalizadas (correo electrónico y contraseña). El usuario es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>4. Uso adecuado</Text>
              {"\n"}
              El usuario se compromete a utilizar el sistema únicamente para fines legítimos y de acuerdo con las políticas internas de la organización. Queda prohibido utilizar el sistema para actividades ilegales o no autorizadas.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>5. Protección de datos</Text>
              {"\n"}
              Sus datos personales serán tratados de acuerdo con las políticas de privacidad de la organización. Nos comprometemos a proteger su información y utilizarla únicamente para los fines contemplados en este servicio.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>6. Modificaciones del servicio</Text>
              {"\n"}
              SAIP se reserva el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso. No nos haremos responsables por la pérdida de datos derivada de estas modificaciones.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>7. Limitación de responsabilidad</Text>
              {"\n"}
              El sistema se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido, seguro o libre de errores. El usuario utiliza el sistema bajo su propia responsabilidad.
            </Text>

            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#647a8a", lineHeight: 22, marginBottom: 12 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#16425b" }}>8. Ley aplicable</Text>
              {"\n"}
              Estos términos se rigen por las leyes vigentes. Cualquier disputa derivada del uso del sistema será resuelta de acuerdo con los procedimientos legales aplicables.
            </Text>
          </ScrollView>
        </ModalBody>
        <ModalFooter>
          <Button bg="#16425b" borderRadius={12} h={48} w="$full" onPress={onAccept}>
            <ButtonText fontFamily="Poppins_600SemiBold" fontSize={15} color="white">
              Aceptar y continuar
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}