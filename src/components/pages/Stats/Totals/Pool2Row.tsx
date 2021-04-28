import React from "react";
import { Box, Tr, Td } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Pool2LogoSVGWhite } from "components/shared/Logos";
import { SimpleTooltip } from "components/shared/SimpleTooltip";

const EarnRow = ({
  apr,
  earned,
  balance,
}: {
  apr: any;
  earned: any;
  balance: any;
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      <Td>
        <SimpleTooltip label="Pool2" placement="right">
          <Box width="30px">
            <Pool2LogoSVGWhite width="25px" height="25px" />
          </Box>
        </SimpleTooltip>
      </Td>
      <Td>RGT-ETH</Td>
      <Td>{balance?.SLP?.toFixed(2)} RGT-ETH</Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td>{earned?.toFixed(2)} RGT</Td>
      <Td>N/A</Td>
    </motion.tr>
  );
};

export default EarnRow;
