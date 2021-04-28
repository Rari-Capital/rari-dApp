import React, { useMemo } from "react";
import { Box, Tr, Td, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { smallStringUsdFormatter } from "utils/bigUtils";
import { FuseLogoSVGWhite } from "components/shared/Logos";
import { SimpleTooltip } from "components/shared/SimpleTooltip";

const FuseRow = ({ filteredPoolsData, fusePoolsData }) => {
  const singleRow = useMemo(() => fusePoolsData?.length === 1, [fusePoolsData]);
  const mb = singleRow ? null : 3;

  return (
    <motion.tr
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <Td textAlign="center">
        <SimpleTooltip label="Fuse" placement="right">
          <Box width="30px">
            <FuseLogoSVGWhite width="26px" height="26px" />
          </Box>
        </SimpleTooltip>
      </Td>
      <Td>
        {filteredPoolsData?.map(({ id }) => (
          <Text mb={mb} key={id}>
            {id}
          </Text>
        ))}
      </Td>
      <Td>
        {fusePoolsData?.map(({ comptroller, totalSupplyBalanceUSD }) => (
          <Text mb={mb} key={comptroller}>
            {smallStringUsdFormatter(totalSupplyBalanceUSD)}
          </Text>
        ))}
      </Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td>
        {filteredPoolsData?.map(({ id }) => (
          <Text mb={mb} key={id}>
            N/A
          </Text>
        ))}
      </Td>
      <Td>
        {filteredPoolsData?.map(({ id }) => (
          <Text mb={mb} key={id}>
            N/A
          </Text>
        ))}
      </Td>
    </motion.tr>
  );
};

export default FuseRow;
