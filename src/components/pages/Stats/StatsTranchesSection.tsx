import React, { useMemo } from "react";
import { Box, Table, Text, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { motion } from "framer-motion";

// Hooks
import { useTokenData } from "hooks/useTokenData";
import { Row } from "buttered-chakra";
import {
  useMySaffronData,
  usePrincipal,
  TranchePool,
  TrancheRating,
  useEstimatedSFI,
  usePrincipalBalance,
} from "hooks/tranches/useSaffronData";
import { smallUsdFormatter } from "utils/bigUtils";

const Earn = () => {
  const dai = useTokenData("0x6b175474e89094c44da98b954eedeac495271d0f");

  const mySaffronData = useMySaffronData();
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
            <Th color="white">Pool</Th>
            <Th color="white" textAlign="right">
              APY
            </Th>
            <Th color="white" textAlign="right">
              Deposits
            </Th>
            <Th color="white" textAlign="right">
              Est. SFI Earnings
            </Th>
            <Th color="white" textAlign="right">
              Growth
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <>
            {/* DAI S Pool */}
            {hasDeposits && (
              <>
                <Tr>
                  <Td>
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                    >
                      <Box>
                        <Text textAlign="right"> DAI-S </Text>
                      </Box>
                    </Row>
                  </Td>
                  <Td>
                    <Text textAlign="right">
                      {
                        mySaffronData?.[0]?.tranches?.[TrancheRating.S]?.[
                          "total-apy"
                        ]
                      }
                      %
                    </Text>
                  </Td>
                  <Td>
                    <Text textAlign="right">{daiSPrincipal} DAI</Text>
                  </Td>
                  <Td>
                    {" "}
                    <Text textAlign="right">
                      {estimatedSFI?.formattedSPoolSFIEarned}
                    </Text>{" "}
                  </Td>
                  <Td>
                    <Text textAlign="right">N/A</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="center"
                    >
                      <Box>
                        <Text textAlign="right"> DAI-A </Text>
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
                    <Text textAlign="right">{daiAPrincipal} DAI</Text>
                  </Td>
                  <Td>
                    {" "}
                    <Text textAlign="right">
                      {estimatedSFI?.formattedAPoolSFIEarned}
                    </Text>{" "}
                  </Td>
                  <Td>
                    <Text textAlign="right">N/A</Text>
                  </Td>
                </Tr>
              </>
            )}
            {/* Totals */}
            <Tr>
              <Td>
                <Text fontWeight={hasDeposits && "bold"}>Total</Text>
              </Td>
              <Td>
                <Text
                  fontWeight={hasDeposits && "bold"}
                  textAlign="right"
                ></Text>
              </Td>
              <Td>
                <Text fontWeight={hasDeposits && "bold"} textAlign="right">
                  {smallUsdFormatter(totalPrincipal) ?? 0}
                </Text>
              </Td>
              <Td>
                <Text fontWeight={hasDeposits && "bold"} textAlign="right">
                  {estimatedSFI?.formattedTotalSFIEarned ?? "0 SFI"}
                </Text>
              </Td>
              <Td>
                {" "}
                <Text
                  fontWeight={hasDeposits && "bold"}
                  textAlign="right"
                ></Text>
              </Td>
            </Tr>
          </>
        </Tbody>
      </Table>
    </motion.div>
  );
};

export default Earn;
