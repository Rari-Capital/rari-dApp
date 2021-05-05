import React, { useMemo } from "react";
import { Box, Td, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { smallStringUsdFormatter } from "utils/bigUtils";
import { FuseLogoSVGWhite } from "components/shared/Logos";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { useTranslation } from "react-i18next";
import { MergedPool } from "hooks/fuse/useFusePools";
import { FusePoolData } from "utils/fetchFusePoolData";

const FuseRow = ({ filteredPoolsData, fusePoolsData } : { filteredPoolsData: MergedPool[] | undefined, fusePoolsData: FusePoolData[]}) => {
  const singleRow = useMemo(() => fusePoolsData?.length === 1, [fusePoolsData]);
  const mb = singleRow ? null : 3;

  const { t } = useTranslation();

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
          <Text mb={mb ?? "0"} key={id}>
            {id}
          </Text>
        ))}
      </Td>
      <Td>
        {fusePoolsData?.map(({ comptroller, totalSupplyBalanceUSD }) => (
          <Text mb={mb ?? "0"} key={comptroller}>
            {smallStringUsdFormatter(totalSupplyBalanceUSD)}
          </Text>
        ))}
      </Td>
      {/* Todo (sharad) - implement RGT earned in poolInfo */}
      <Td>
        {filteredPoolsData?.map(({ id }) => (
          <Text mb={mb ?? "0"} key={id}>
            {t("N/A")}
          </Text>
        ))}
      </Td>
      <Td>
        {filteredPoolsData?.map(({ id }) => (
          <Text mb={mb ?? "0"} key={id}>
            {t("N/A")}
          </Text>
        ))}
      </Td>
    </motion.tr>
  );
};

export default FuseRow;
