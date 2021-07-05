import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { useState } from "react";

const Searchbar = ({
  width,
  ...inputProps
}: {
  width: any;
  [x: string]: any;
}) => {
  const [val, setVal] = useState("");

  const handleSubmit = () => {
    alert(val);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        width={width}
        h="55px"
        // pl={2}
      >
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          color="grey"
          children={<SearchIcon color="gray.300" boxSize={5} />}
          ml={1}
        />
        <Input
          border="3px solid"
          borderColor="grey"
          height="100%"
          placeholder="Search by token, pool or product..."
          _placeholder={{ color: "grey", fontWeight: "bold" }}
          onChange={({ target: { value } }) => setVal(value)}
          value={val}
          color="grey"
          {...inputProps}
        />
      </InputGroup>
    </form>
  );
};

export default Searchbar;
