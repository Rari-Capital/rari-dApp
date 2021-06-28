import { Box } from "@chakra-ui/layout";
import AssetBorrowLend from "components/modules/AssetBorrowLend";
import { useAssetsArrayWithTokenData } from "hooks/useAssetsMap";
import { useTokenData } from "hooks/useTokenData";

const Components = () => {
  const token = useTokenData("0xD291E7a03283640FDc51b121aC401383A46cC623");

  return (
    <Box w="500px">
      <AssetBorrowLend token={token} />
    </Box>
  );
};

export default Components;
