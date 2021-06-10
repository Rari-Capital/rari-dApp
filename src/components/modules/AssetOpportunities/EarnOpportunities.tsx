import { Box, Heading, Text } from "@chakra-ui/layout";

import { TokenData } from "hooks/useTokenData";
import { useVaultsDataForAsset } from "hooks/vaults/useVaultsDataForAsset";

const EarnOpportunities = ({ token }: { token: TokenData }) => {
    
  const vaultsData = useVaultsDataForAsset(token.address);
  console.log({ vaultsData });
  return <Heading>Earn opportunities</Heading>;
};

export default EarnOpportunities;
