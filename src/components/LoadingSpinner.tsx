import { Center, Spinner } from "@gluestack-ui/themed";

export default function LoadingSpinner() {
  return (
    <Center flex={1}>
      <Spinner size="large" />
    </Center>
  );
}
