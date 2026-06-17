import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Input, InputField, FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText, Icon, EyeIcon, EyeOffIcon } from "@gluestack-ui/themed";

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  variant?: "default" | "login";
  showPasswordToggle?: boolean;
}

export default function TextInput({ label, value, onChangeText, placeholder, error, secureTextEntry, keyboardType = "default", autoCapitalize = "sentences", variant = "default", showPasswordToggle }: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (variant === "login") {
    const isPassword = secureTextEntry;
    const effectiveSecure = isPassword ? !showPassword : false;

    return (
      <FormControl isInvalid={!!error}>
        <Input
          sx={{
            ":focus": {
              bg: "#ffffff",
              borderColor: "#8fa4b2",
              boxShadow: "0 4px 12px rgba(184, 160, 138, 0.15)",
            },
          }}
          bg={isFocused ? "#ffffff" : "#d9dcd6"}
          borderWidth={1.5}
          borderColor={isFocused ? "#8fa4b2" : "#d9dcd6"}
          borderRadius={12}
          height={50}
          px="$3"
          isFocused={isFocused}
        >
          <InputField
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#647a8a"
            secureTextEntry={effectiveSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            fontFamily="Poppins_400Regular"
            fontSize={14}
            color="#16425b"
          />
          {showPasswordToggle && isPassword && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingLeft: 8 }}>
              {showPassword ? (
                <EyeOffIcon color="#8fa4b2" size="xl" />
              ) : (
                <EyeIcon color="#8fa4b2" size="xl" />
              )}
            </TouchableOpacity>
          )}
        </Input>
        {error && (
          <FormControlError>
            <FormControlErrorText>{error}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>
    );
  }

  return (
    <FormControl isInvalid={!!error}>
      {label && (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}
      <Input>
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
