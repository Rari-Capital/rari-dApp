import { Box, Divider, Heading, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import {
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/table";
import AppLink from "components/shared/AppLink";
import { ModalDivider } from "components/shared/Modal";
import { AggregatePoolsInfoReturn } from "hooks/usePoolInfo";

import { TokenData } from "hooks/useTokenData";
import { useVaultsDataForAsset } from "hooks/vaults/useVaultsDataForAsset";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Row, useIsMobile } from "utils/chakraUtils";

const EarnOpportunities = ({ token }: { token: TokenData }) => {
  const vaultsData: AggregatePoolsInfoReturn = useVaultsDataForAsset(
    token.address
  );
  const isMobile = useIsMobile();
  const { t } = useTranslation();
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
          {vaultsData.aggregatePoolsInfo.map((vault) => {
            return (
              <>
                <AppLink
                  href={`/pools/${vault.poolInfo.type}`}
                  as={Tr}
                  className="hover-row"
                  width="100%"
                  borderTop="1px solid #272727"
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
                      <Text ml={3} fontWeight="bold"> {vault.poolInfo.name}</Text>
                    </Row>
                  </Td>
                  <Td isNumeric>{vault.poolAPY ? `${vault.poolAPY }%`: <Spinner />}</Td>
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
