import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, Link, Text, Td, Tr } from "@chakra-ui/react";
import { useState } from "react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

import DashboardBox from "components/shared/DashboardBox";

import { MergedPool } from "hooks/fuse/useFusePools";

import { smallUsdFormatter } from "utils/bigUtils";
import { FusePoolData, filterPoolName } from "utils/fetchFusePoolData";

import PoolAssetsTable from "./PoolAssetsTable";
import { tdStyle, borderBottomColor } from "./styles";

/**
 * Displays a single pool's information in row form. Designed for use in the
 * `PoolsTable` component.
 */
const PoolTr = ({
  pool,
  poolData,
}: {
  pool: MergedPool;
  poolData: FusePoolData;
}) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const dynamicTdStyle: React.CSSProperties = {
    ...tdStyle,
    borderBottomColor: dropdownOpened ? "transparent" : borderBottomColor,
  };

  return (
    <>
      <Tr onClick={() => setDropdownOpened(!dropdownOpened)}>
        <Td style={dynamicTdStyle}>
          <Flex alignItems="center">
            {dropdownOpened ? (
              <FaCaretDown cursor="pointer" />
            ) : (
              <FaCaretRight cursor="pointer" />
            )}
            &nbsp;
            {/* Prevent selection on double click */}
            <Text fontWeight="bold" userSelect="none">
              {filterPoolName(pool.name)}
            </Text>
          </Flex>
        </Td>
        <Td style={dynamicTdStyle}>
          {smallUsdFormatter(poolData?.totalSupplyBalanceUSD)}
        </Td>
        <Td style={dynamicTdStyle}>
          {smallUsdFormatter(poolData?.totalBorrowBalanceUSD)}
        </Td>
        <Td style={dynamicTdStyle}>
          <Link
            as={RouterLink}
            width="100%"
            className="no-underline"
            to={"/fuse/pool/" + pool.id}
            // Call `stopPropagation` to prevent dropdown from opening
            // when a user specifically clicks on the `ExternalLinkIcon`
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon />
          </Link>
        </Td>
      </Tr>
      {dropdownOpened && (
        <Tr>
          <Td colSpan={99} pt={0} pl={0} borderBottomColor={borderBottomColor}>
            <DashboardBox width="100%" p={4}>
              <Box my={2}>
                <Text fontWeight="bold" mb={2}>
                  Supply positions
                </Text>
                <PoolAssetsTable poolData={poolData} filter="supplied" />
              </Box>
              <Box my={2} mt={4}>
                <Text fontWeight="bold" mb={2}>
                  Borrow positions
                </Text>
                <PoolAssetsTable poolData={poolData} filter="borrowed" />
              </Box>
            </DashboardBox>
          </Td>
        </Tr>
      )}
    </>
  );
};

export default PoolTr;
