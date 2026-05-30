import { FlatList } from "react-native";
import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => string;
  flex?: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export default function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  const renderHeader = () => (
    <HStack bg="$backgroundLight100" p="$3" borderBottomWidth={1} borderColor="$borderLight200">
      {columns.map((col) => (
        <Box key={col.key} flex={col.flex ?? 1} px="$1">
          <Text size="sm" bold>{col.title}</Text>
        </Box>
      ))}
    </HStack>
  );

  const renderItem = ({ item }: { item: T }) => (
    <HStack p="$3" borderBottomWidth={1} borderColor="$borderLight100">
      {columns.map((col) => (
        <Box key={col.key} flex={col.flex ?? 1} px="$1">
          <Text size="sm">
            {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
          </Text>
        </Box>
      ))}
    </HStack>
  );

  return (
    <VStack>
      {renderHeader()}
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </VStack>
  );
}
