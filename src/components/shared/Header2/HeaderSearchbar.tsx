import { Box } from "@chakra-ui/react";
import Searchbar from "../Searchbar";

const HeaderSearchbar = (props: any) => {
  return (
    <Box {...props} w={800} mx={5} alignSelf="flex-start">
      <Searchbar variant="" height="40px" mb={2} smaller/>
    </Box>
  );
};

export default HeaderSearchbar;
