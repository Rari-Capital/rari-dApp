import { useMemo } from "react";
import { Box, Table, Text, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { motion } from "framer-motion";

// Hooks
import { Row } from "buttered-chakra";
import {
  useMySaffronData,
  usePrincipal,
  TranchePool,
  TrancheRating,
  useEstimatedSFI,
  usePrincipalBalance,
  SaffronTranchePool,
} from "hooks/tranches/useSaffronData";
import { smallUsdFormatter } from "utils/bigUtils";
import { useTranslation } from "react-i18next";

const Earn = () => {
  const { t } = useTranslation();

  const mySaffronData: SaffronTranchePool[] = useMySaffronData();
  const daiSPrincipal = usePrincipal(TranchePool.DAI, TrancheRating.S);
  const daiAPrincipal = usePrincipal(TranchePool.DAI, TrancheRating.A);
  const estimatedSFI = useEstimatedSFI();
  const totalPrincipalFormatted = usePrincipalBalance();
  const totalPrincipal: number = totalPrincipalFormatted
    ? parseFloat(totalPrincipalFormatted?.replace(",", "").replace("$", ""))
    : 0;
  const hasDeposits = useMemo(() => totalPrincipal > 0, [totalPrincipal]);

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
              {t("Est. SFI Earnings")}
            </Th>
            <Th color="white" textAlign="right">
              {t("Growth")}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <>
            {/* DAI S Pool */}
            {hasDeposits && (
              <>
                <Tr>
                  <Td textAlign="right">
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                    >
                      <Box>
                        <Text textAlign="right"> {t("DAI-S")} </Text>
                      </Box>
                    </Row>
                  </Td>
                  <Td textAlign="right">
                    <Text>
                      {
                        mySaffronData?.[0]?.tranches?.[TrancheRating.S]?.[
                          "total-apy"
                        ]
                      }
                      %
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <Text>
                      {daiSPrincipal} {t("DAI")}
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <Text>{estimatedSFI?.formattedSPoolSFIEarned}</Text>
                  </Td>
                  <Td textAlign="right">
                    <Text textAlign="right">{t("N/A")}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                    >
                      <Box>
                        <Text textAlign="right"> {t("DAI-A")} </Text>
                      </Box>
                    </Row>
                  </Td>
                  <Td>
                    <Text textAlign="right">
                      {
                        mySaffronData?.[0]?.tranches?.[TrancheRating.A]?.[
                          "total-apy"
                        ]
                      }
                      %
                    </Text>
                  </Td>
                  <Td>
                    <Text textAlign="right">
                      {daiAPrincipal} {t("DAI")}
                    </Text>
                  </Td>
                  <Td>
                    {" "}
                    <Text textAlign="right">
                      {estimatedSFI?.formattedAPoolSFIEarned}
                    </Text>{" "}
                  </Td>
                  <Td>
                    <Text textAlign="right">{t("N/A")}</Text>
                  </Td>
                </Tr>
              </>
            )}
            {/* Totals */}
            <Tr fontWeight={hasDeposits ? "bold" : "normal"}>
              <Td>
                <Text>{t("Total")}</Text>
              </Td>
              <Td>
                <Text textAlign="right"></Text>
              </Td>
              <Td>
                <Text textAlign="right">
                  {smallUsdFormatter(totalPrincipal) ?? 0}
                </Text>
              </Td>
              <Td>
                <Text textAlign="right">
                  {estimatedSFI?.formattedTotalSFIEarned ?? "0 SFI"}
                </Text>
              </Td>
              <Td>
                <Text textAlign="right" />
              </Td>
            </Tr>
          </>
        </Tbody>
      </Table>
    </motion.div>
  );
};

export default Earn;
