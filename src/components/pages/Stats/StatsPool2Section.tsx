import { useMemo } from "react";
import {
  Box,
  Table,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { QuestionOutlineIcon } from "@chakra-ui/icons";

// Hooks
import { usePool2APR } from "hooks/pool2/usePool2APR";
import { usePool2UnclaimedRGT } from "hooks/pool2/usePool2UnclaimedRGT";
import { usePool2Balance } from "hooks/pool2/usePool2Balance";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { Row } from "utils/buttered-chakra";
import { smallUsdFormatter } from "utils/bigUtils";
import { useTranslation } from "react-i18next";

const Earn = () => {
  const { t } = useTranslation();

  const apr = usePool2APR();
  const earned = usePool2UnclaimedRGT();
  const balance = usePool2Balance();

  const balanceSLP = balance?.hasDeposited ? balance.SLP!.toFixed(4) : "0.0000";
  const balanceETH = balance?.hasDeposited ? balance.eth!.toFixed(2) : "0.0000";
  const balanceRGT = balance?.hasDeposited ? balance.rgt!.toFixed(2) : "0.0000";
  const balanceUSD = balance?.hasDeposited
    ? smallUsdFormatter(balance.balanceUSD)
    : "$0";

  const hasDeposits = useMemo(() => earned! > 0, [earned]);

  return (
    <motion.div
      key="pool2"
      style={{ width: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Table variant="simple">
        <Thead color="white">
          <Tr>
            <Th color="white">{t("Pool")}</Th>
            <Th color="white" textAlign="right">
              {t("APY")}
            </Th>
            <Th color="white" textAlign="right">
              {t("Deposits")}
            </Th>
            <Th color="white" textAlign="right">
              {t("RGT Earned")}
            </Th>
            <Th color="white" textAlign="right">
              {t("Growth")}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <>
            {hasDeposits && (
              <Tr>
                <Td>
                  <Row
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment="center"
                  >
                    <Box>
                      <Avatar
                        bg="#FFF"
                        boxSize="30px"
                        name={"RGT"}
                        src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD291E7a03283640FDc51b121aC401383A46cC623/logo.png"
                      />
                      <Avatar
                        bg="#FFF"
                        boxSize="30px"
                        name={"ETH"}
                        src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/64/Ethereum-ETH-icon.png"
                      />
                    </Box>
                    <Box ml={3}>RGT-ETH</Box>
                  </Row>
                </Td>
                <Td textAlign="right">{apr}%</Td>
                <Td textAlign="right">
                  <Row
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment="center"
                  >
                    <Box>{balanceSLP} RGT-ETH</Box>
                    <SimpleTooltip
                      label={`${balanceRGT} RGT - ${balanceETH} ETH  `}
                      placement="top-start"
                    >
                      <Box
                        ml={4}
                        my="auto"
                        _hover={{ color: "gray", cursor: "auto" }}
                      >
                        <QuestionOutlineIcon color="currentColor" />
                      </Box>
                    </SimpleTooltip>
                  </Row>
                </Td>
                <Td textAlign="right">{earned?.toFixed(2)} RGT</Td>
                <Td textAlign="right">0%</Td>
              </Tr>
            )}

            {/* Todo (sharad) - implement totals for apy and growth */}
            <Tr>
              <Td>
                <Text fontWeight={hasDeposits ? "bold" : "normal"}>Total</Text>
              </Td>

              <Td textAlign="right">
                <Text fontWeight={hasDeposits ? "bold" : "normal"}>
                  {parseFloat(balanceSLP) > 0 ? `${apr}%` : null}
                </Text>
              </Td>

              <Td textAlign="right">
                <Text fontWeight={hasDeposits ? "bold" : "normal"}>
                  {balanceUSD}
                </Text>
              </Td>

              <Td textAlign="right">
                <Text fontWeight={hasDeposits ? "bold" : "normal"}>
                  {earned?.toFixed(2)} RGT
                </Text>
              </Td>

              <Td textAlign="right"> </Td>
            </Tr>
          </>
        </Tbody>
      </Table>
    </motion.div>
  );
};

export default Earn;
