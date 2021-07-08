import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { SEARCH_FOR_TOKEN } from "gql/searchTokens";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { makeGqlRequest } from "utils/gql";

// Fetchers
const searchFetcher = async (query: any, search: string) => {
  console.log({ query, search });
  if (!search) return undefined;
  await makeGqlRequest(query, { search: search.toUpperCase() });
};

const Searchbar = ({
  width,
  ...inputProps
}: {
  width?: any;
  [x: string]: any;
}) => {
  const [val, setVal] = useState("");

  const router = useRouter();

  const { data, error } = useSWR([SEARCH_FOR_TOKEN, val], searchFetcher);

  const handleSubmit = () => {
    router.push(`/token/${val}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        width={width ?? ""}
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
