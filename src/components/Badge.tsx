import { Badge as GSBadge, BadgeText } from "@gluestack-ui/themed";

interface BadgeProps {
  text: string;
  variant?: "solid" | "outline";
  action?: "success" | "error" | "warning" | "info" | "muted";
}

export default function Badge({ text, variant = "solid", action = "info" }: BadgeProps) {
  return (
    <GSBadge variant={variant} action={action} size="sm">
      <BadgeText>{text}</BadgeText>
    </GSBadge>
  );
}
