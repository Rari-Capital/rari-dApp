import { Box } from "@chakra-ui/layout";
import AssetBorrowLend from "components/modules/AssetBorrowLend";
import { useTokenData } from "hooks/useTokenData";

const Components = () => {
  const token = useTokenData("0x0000000000000000000000000000000000000000"); //eth

  return (
    <Box w="500px">
      <AssetBorrowLend token={token} />
    </Box>
  );
};

export default Components;
