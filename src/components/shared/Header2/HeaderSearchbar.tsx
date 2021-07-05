import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { SearchIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Box } from "@chakra-ui/react";
import Searchbar from "../Searchbar";

const HeaderSearchbar = (props: any) => {
  return (
    <Box {...props} w={800} mx={5}>
      <Searchbar variant="filled"/>
      {/* <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.300" />}
        />
        <Input
          variant="filled"
          value={val}
          onChange={({ target: { value } }) => setVal(value)}
          placeholder="Search by token, pool or product..."
          _placeholder={{ color: "grey.500", fontWeight: "bold" }}
        />
      </InputGroup> */}
    </Box>
  );
};

export default HeaderSearchbar;
