import { Icon, Stack, Text, Th } from "@chakra-ui/react";
import { getSortIcon, SortDir } from "hooks/useSortableList";

export const SortableTableHeader = ({
  text,
  handleSortClick,
  isActive,
  sortDir,
}: {
  text: string;
  handleSortClick: () => void;
  isActive: boolean;
  sortDir?: SortDir;
}) => {
  return (
    <Th
      fontSize="sm"
      _hover={{ cursor: "pointer", fontStyle: "underline" }}
      onClick={handleSortClick}
    >
      <Stack direction="row">
        <Text fontWeight="bold">{text}</Text>
        <Icon as={getSortIcon(isActive, sortDir)} />
      </Stack>
    </Th>
  );
};
