import { Box, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import AppLink from "components/shared/AppLink";
import { AggregatePoolInfo } from "hooks/usePoolInfo";

import { TokenData } from "hooks/useTokenData";
import { useVaultsDataForAsset } from "hooks/vaults/useVaultsDataForAsset";
import Image from "next/image";
import { Row } from "lib/chakraUtils";
import { getSortIcon, useSortableList } from "hooks/useSortableList";
import { Icon } from "@chakra-ui/icons";
import { Stack } from "@chakra-ui/react";

const VaultsList = ({ token }: { token?: TokenData }) => {
  const { aggregatePoolsInfo } = useVaultsDataForAsset(token?.address);

  const {
    sorted: sortedPoolInfos,
    handleSortClick,
    sortBy,
    sortDir,
  } = useSortableList(aggregatePoolsInfo);

  return (
    <Box h="100%" w="100%">
      <Table variant="unstyled">
        <Thead position="sticky" top={0} left={0} bg="#121212">
          <Tr>
            <Th fontSize="sm">
              <b>Vault</b>
            </Th>
            <Th
              fontSize="sm"
              _hover={{ cursor: "pointer" }}
              onClick={() => handleSortClick("poolAPY")}
            >
              <Stack direction="row">
                <Text fontWeight="bold">APY</Text>
                <Icon as={getSortIcon(sortBy === "poolAPY", sortDir)} />
              </Stack>
            </Th>
          </Tr>
        </Thead>
        <Tbody w="100%">
          {sortedPoolInfos ? (
            sortedPoolInfos.map((vault, i) => {
              return <VaultsRow key={i} vault={vault} />;
            })
          ) : (
            <Tr>
              <Spinner my={8} />
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default VaultsList;

// UI
const VaultsRow = ({ vault }: { vault: AggregatePoolInfo }) => {
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
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" p={3}>
            <Image src={`${vault.poolInfo.logo}`} width={35} height={35} />
            <Text ml={3} fontWeight="bold">
              {vault.poolInfo.name}
            </Text>
          </Row>
        </Td>
        <Td isNumeric>
          <Text fontWeight="bold">
            {vault.poolAPY !== undefined ? `${vault.poolAPY}%` : <Spinner />}
          </Text>
        </Td>
      </AppLink>
    </>
  );
};
