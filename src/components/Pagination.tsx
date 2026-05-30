import { HStack, Button, ButtonText } from "@gluestack-ui/themed";

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, hasMore, onPrev, onNext }: PaginationProps) {
  return (
    <HStack justifyContent="center" alignItems="center" space="md" p="$3">
      <Button variant="outline" size="sm" onPress={onPrev} isDisabled={page <= 1}>
        <ButtonText>Anterior</ButtonText>
      </Button>
      <ButtonText>{page}</ButtonText>
      <Button variant="outline" size="sm" onPress={onNext} isDisabled={!hasMore}>
        <ButtonText>Siguiente</ButtonText>
      </Button>
    </HStack>
  );
}
