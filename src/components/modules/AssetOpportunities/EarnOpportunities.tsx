import { Box, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import AppLink from "components/shared/AppLink";
import { AggregatePoolsInfoReturn } from "hooks/usePoolInfo";

import { TokenData } from "hooks/useTokenData";
import { useVaultsDataForAsset } from "hooks/vaults/useVaultsDataForAsset";
import Image from "next/image";
import { Row } from "lib/chakraUtils";

const EarnOpportunities = ({ token }: { token?: TokenData }) => {
  const vaultsData: AggregatePoolsInfoReturn = useVaultsDataForAsset(
    token?.address
  );
  // const isMobile = useIsMobile();
  // const { t } = useTranslation();
  return (
    <Box h="100%" w="100%">
      <Table variant="unstyled">
        <Thead position="sticky" top={0} left={0} bg="#121212">
          <Tr>
            <Th fontSize="sm">
              <b>Vault</b>
            </Th>
            <Th fontSize="sm">
              <b>APY</b>
            </Th>
          </Tr>
        </Thead>
        <Tbody w="100%">
          {vaultsData.aggregatePoolsInfo.map((vault, i) => {
            return (
              <>
                <AppLink
                  href={`/pools/${vault.poolInfo.type}`}
                  as={Tr}
                  className="hover-row"
                  width="100%"
                  borderTop="1px solid #272727"
                  key={i}
                >
                  <Td>
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                      p={3}
                    >
                      <Image
                        src={`${vault.poolInfo.logo}`}
                        width={35}
                        height={35}
                      />
                      <Text ml={3} fontWeight="bold">
                        {" "}
                        {vault.poolInfo.name}
                      </Text>
                    </Row>
                  </Td>
                  <Td isNumeric>
                    {vault.poolAPY !== undefined ? (
                      `${vault.poolAPY}%`
                    ) : (
                      <Spinner />
                    )}
                  </Td>
                </AppLink>
              </>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default EarnOpportunities;
