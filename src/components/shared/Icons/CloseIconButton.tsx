import { IconButton } from "@chakra-ui/button";
import { CloseIcon } from "@chakra-ui/icons";

const CloseIconButton = ({ alignRight = true }: { alignRight?: boolean }) => {
  return (
    <IconButton
      ml={alignRight ? "auto" : ""}
      aria-label="Close"
      icon={<CloseIcon />}
      color="white"
      _hover={{ color: "grey"}}
    />
  );
};

export default CloseIconButton;
