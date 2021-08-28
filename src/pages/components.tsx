import { Box } from "@chakra-ui/layout";
import { useTokenData } from "hooks/useTokenData";

import { useEffect } from "react";

const Components = () => {
  const token = useTokenData("0x0000000000000000000000000000000000000000"); //eth

  useEffect(() => {
  }, []);

  return <Box w="500px">{/* <AssetBorrowLend token={token} /> */}</Box>;
};

export default Components;
