import { Box } from "@chakra-ui/react";
import Searchbar from "../Searchbar";

const HeaderSearchbar = (props: any) => {
  return (
    <Box {...props} w={800} mx={5} my="auto " alignSelf="flex-start">
      <Searchbar  height="33px" smaller/>
    </Box>
  );
};

export default HeaderSearchbar;
