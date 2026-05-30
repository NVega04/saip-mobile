import { Button as GSButton, ButtonText, Spinner } from "@gluestack-ui/themed";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "solid" | "outline" | "link";
  action?: "primary" | "secondary" | "positive" | "negative";
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ title, onPress, variant = "solid", action = "primary", disabled, loading }: ButtonProps) {
  return (
    <GSButton variant={variant} action={action} onPress={onPress} isDisabled={disabled || loading}>
      {loading ? <Spinner color="white" size="small" /> : <ButtonText>{title}</ButtonText>}
    </GSButton>
  );
}
