import { Button as GSButton, ButtonText, Spinner } from "@gluestack-ui/themed";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "solid" | "outline" | "link" | "submit";
  action?: "primary" | "secondary" | "positive" | "negative";
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

export default function Button({ title, onPress, variant = "solid", action = "primary", disabled, loading, style }: ButtonProps) {
  if (variant === "submit") {
    return (
      <GSButton
        bg="#16425b"
        borderRadius={12}
        height={52}
        w="$full"
        sx={{
          boxShadow: "0 10px 20px rgba(22, 66, 91, 0.2)",
          ":active": { bg: "#2d6b8f" },
        }}
        onPress={onPress}
        isDisabled={disabled || loading}
        opacity={disabled || loading ? 0.7 : 1}
        style={style}
      >
        {loading ? (
          <Spinner color="white" size="small" />
        ) : (
          <ButtonText
            fontFamily="Poppins_600SemiBold"
            fontSize={16}
            color="white"
          >
            {title}
          </ButtonText>
        )}
      </GSButton>
    );
  }

  return (
    <GSButton variant={variant} action={action} onPress={onPress} isDisabled={disabled || loading}>
      {loading ? <Spinner color="white" size="small" /> : <ButtonText>{title}</ButtonText>}
    </GSButton>
  );
}
