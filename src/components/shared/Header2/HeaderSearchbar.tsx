import { Input } from "@chakra-ui/input";
import React, { useState } from "react";
import {
    Box,
  } from "@chakra-ui/react";

const HeaderSearchbar = (props: any) => {
  const [val, setVal] = useState("");
  return (
    <Box {...props} w={800} mx={5}>
      <Input
        variant="filled"
        value={val}
        placeholder="Search by token, pool or product..."
        onChange={({ target: { value } }) => setVal(value)}
      />
    </Box>
  );
};

export default HeaderSearchbar;
