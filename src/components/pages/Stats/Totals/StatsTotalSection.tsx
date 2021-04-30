import React, { useMemo, useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

// Hooks
import { useAggregatePoolInfos } from "hooks/usePoolInfo";
import { useFusePools } from "hooks/fuse/useFusePools";
import { useFusePoolsData } from "hooks/useFusePoolData";
import { usePool2APR } from "hooks/pool2/usePool2APR";
import { usePool2UnclaimedRGT } from "hooks/pool2/usePool2UnclaimedRGT";
import { usePool2Balance } from "hooks/pool2/usePool2Balance";
import {
  usePrincipal,
  TranchePool,
  TrancheRating,
  useEstimatedSFI,
  usePrincipalBalance,
} from "hooks/tranches/useSaffronData";

// Components
import EarnRow from "./EarnRow";
import FuseRow from "./FuseRow";
import Pool2Row from "./Pool2Row";
import { smallUsdFormatter } from "utils/bigUtils";
import TranchesRow from "./TranchesRow";

const StatsTotalSection = ({ setNetDeposits, setNetDebt }) => {
  // Earn
  const { totals, aggregatePoolsInfo } = useAggregatePoolInfos();
  const hasDepositsInEarn = aggregatePoolsInfo?.some(
    (p) => !p?.poolBalance?.isZero()
  );

  // Fuse
  const { filteredPools: filteredFusePools } = useFusePools("my-pools");
  const poolIds: number[] = filteredFusePools?.map(({ id }) => id) ?? [];
  const fusePoolsData: any[] | null = useFusePoolsData(poolIds);

  // Pool2
  const apr = usePool2APR();
  const earned = usePool2UnclaimedRGT();
  const balance = usePool2Balance();
  const hasDepositsInPool2 = !!balance?.SLP;

  // Tranches
  const daiSPrincipal = usePrincipal(TranchePool.DAI, TrancheRating.S);
  const daiAPrincipal = usePrincipal(TranchePool.DAI, TrancheRating.A);
  const totalPrincipal = usePrincipalBalance();
  const parsedTotalPrincipal: number = totalPrincipal
    ? parseFloat(totalPrincipal?.replace(",", "").replace("$", ""))
    : 0;
  const estimatedSFI = useEstimatedSFI();
  const hasDepositsInTranches = useMemo(
    () => parsedTotalPrincipal > 0 ?? false,
    [totalPrincipal]
  );

  // Total Deposits
  const totalDepositsUSD = useMemo(() => {
    const { totalSupplyBalanceUSD: fuseTotal } = fusePoolsData?.reduce(
      (a, b) => {
        return {
          totalSupplyBalanceUSD:
            a.totalSupplyBalanceUSD + b.totalSupplyBalanceUSD,
        };
      }
    ) ?? { totalSupplyBalanceUSD: 0 };

    const vaultTotal = totals?.balance ?? 0;

    const pool2Total = balance?.balanceUSD ?? 0;

    const tranchesTotal = parsedTotalPrincipal ?? 0;

    const total = fuseTotal + vaultTotal + pool2Total + tranchesTotal;

    console.log({
      total,
      fuseTotal,
      vaultTotal,
      pool2Total,
      tranchesTotal,
      totalPrincipal,
    });

    return total;
  }, [totals, fusePoolsData, balance, parsedTotalPrincipal]);

  // Total debt - todo: refactor into the `useFusePoolsData` hook
  const totalDebtUSD = useMemo(() => {
    const { totalBorrowBalanceUSD } = fusePoolsData?.reduce((a, b) => {
      return {
        totalBorrowBalanceUSD:
          a.totalBorrowBalanceUSD + b.totalBorrowBalanceUSD,
      };
    }) ?? { totalBorrowBalanceUSD: 0 };
    return totalBorrowBalanceUSD;
  }, [fusePoolsData]);

  useEffect(() => {
    console.log({ totalDepositsUSD, totalDebtUSD });
    if (totalDepositsUSD && !Number.isNaN(totalDepositsUSD))
      setNetDeposits(totalDepositsUSD);
    if (totalDebtUSD && !Number.isNaN(totalDebtUSD)) setNetDebt(totalDebtUSD);
  }, [totalDepositsUSD, totalDebtUSD, setNetDeposits, setNetDebt]);

  return (
    <motion.div
      key="totals"
      style={{ width: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Table variant="simple">
        <Thead color="white">
          <Tr>
            <Th color="white">Product</Th>
            <Th color="white">Pool</Th>
            <Th color="white">Deposits</Th>
            <Th color="white">
              RGT {hasDepositsInTranches && `+ SFI `} Earned
            </Th>
            <Th color="white">Interest Earned</Th>
          </Tr>
        </Thead>

        <Tbody>
          {/* Fuse section */}
          {fusePoolsData && (
            <FuseRow
              fusePoolsData={fusePoolsData}
              filteredPoolsData={filteredFusePools}
            />
          )}
          {/* earn section */}
          {hasDepositsInEarn && <EarnRow poolsInfo={aggregatePoolsInfo} />}
          {/* Pool2 Section */}
          {hasDepositsInPool2 && (
            <Pool2Row apr={apr} earned={earned} balance={balance} />
          )}
          {/* Tranches */}
          {hasDepositsInTranches && (
            <TranchesRow
              daiSPrincipal={daiSPrincipal}
              daiAPrincipal={daiAPrincipal}
              estimatedSFI={estimatedSFI}
            />
          )}
          {/* Todo (sharad) - implement totals for apy and growth */}
          <motion.tr
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <Td fontWeight="bold">Total</Td>
            <Td></Td>
            <Td>
              <Text fontWeight="bold">
                {smallUsdFormatter(totalDepositsUSD)}
              </Text>
            </Td>
            <Td>
              <Text fontWeight="bold">
                {earned?.toFixed(2)} RGT{" "}
                {hasDepositsInTranches &&
                  ` + ${estimatedSFI?.formattedTotalSFIEarned}`}
              </Text>
            </Td>
            <Td>
              <Text fontWeight="bold">{totals?.interestEarned}</Text>
            </Td>
          </motion.tr>
        </Tbody>
      </Table>
    </motion.div>
  );
};

export default StatsTotalSection;
