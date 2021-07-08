import { Box } from "@chakra-ui/react";
import Searchbar from "../Searchbar";

const HeaderSearchbar = (props: any) => {
  return (
    <Box {...props} w={800} mx={5}>
      <Searchbar variant="filled" />
      
    </Box>
  );
};

export default HeaderSearchbar;
