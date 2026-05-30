import { Input, InputField, Icon, SearchIcon } from "@gluestack-ui/themed";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <Input>
      <Icon as={SearchIcon} ml="$3" />
      <InputField value={value} onChangeText={onChangeText} placeholder={placeholder} />
    </Input>
  );
}
