import { useBestFusePoolForAsset } from "hooks/opportunities/useBestFusePoolForAsset";
import { TokenData } from "hooks/useTokenData";
import { useState } from "react";
import { AmountSelectMode, AmountSelectUserAction } from "../AmountSelectNew";
import LendAndBorrow from "../LendAndBorrow";

import { Column, Row } from "lib/chakraUtils";
import { Box, Heading } from "@chakra-ui/react";
import { Tab, TabList, Tabs } from "@chakra-ui/tabs";
import { useTranslation } from 'next-i18next';
import { useMemo } from "react";
import AwaitingTransactions from "../AwaitingTransactions";

// LBRW for Lend, Borrow, Repay, Withdraw
const LBRW = ({ token }: { token?: TokenData }) => {
  // Get necessary data about the best pool and the Fuse Asset (based on the token) for this pool
  const { bestPool, poolAssetIndex } = useBestFusePoolForAsset(token?.address);

  const [userAction, setUserAction] = useState(
    AmountSelectUserAction.NO_ACTION
  );

  const [mode, setMode] = useState<AmountSelectMode>(
    AmountSelectMode.LENDANDBORROW
  );

  const {
    hasBorrows,
    hasDeposits,
  }: { hasBorrows: boolean; hasDeposits: boolean } = useMemo(
    () => ({
      hasBorrows: bestPool?.totalBorrowBalanceUSD > 0,
      hasDeposits: bestPool?.totalSupplyBalanceUSD > 0,
    }),
    [bestPool]
  );

  return (
    <>
      {userAction !== AmountSelectUserAction.NO_ACTION ? (
        <AwaitingTransactions token={token} mode={userAction} />
      ) : (
        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          p={4}
        >
          <TabBar
            mode={mode}
            modes={[
              AmountSelectMode.LENDANDBORROW,
              AmountSelectMode.REPAYANDWITHDRAW,
            ]}
            setMode={setMode}
            hasBorrows={hasBorrows}
            hasDeposits={hasDeposits}
            color={token?.color ?? "white"}
          />
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            bg=""
            expand
          >
            {mode === AmountSelectMode.LENDANDBORROW && (
              <LendAndBorrow
                token={token}
                bestPool={bestPool}
                poolAssetIndex={poolAssetIndex}
                setUserAction={setUserAction}
              />
            )}
            {mode === AmountSelectMode.REPAYANDWITHDRAW && (
              <Box h="300px">
                <Heading>Repay And Withdraw</Heading>
              </Box>
            )}
          </Row>
        </Column>
      )}
    </>
  );
};

export default LBRW;

// Tab Bar for Lend&Borrow / Repay/Withdraw
const TabBar = ({
  color,
  modes,
  mode,
  hasBorrows,
  hasDeposits,
  setMode,
}: {
  color?: string | null | undefined;
  mode: AmountSelectMode;
  modes: AmountSelectMode[];
  hasBorrows: boolean;
  hasDeposits: boolean;
  setMode: (mode: AmountSelectMode) => any;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <style>
        {`
              
              .chakra-tabs__tab {
                color: ${color ?? "#FFFFFF"} !important;
  
                border-bottom-width: 1px;
              }
  
              .chakra-tabs__tablist {
                border-bottom: 1px solid;
                border-color: #272727;
              }
              
          `}
      </style>
      <Box width="100%" mt={1} mb="-1px" zIndex={99999}>
        <Tabs
          isFitted
          width="100%"
          align="center"
          onChange={(index: number) => {
            setMode(modes[index]);
          }}
        >
          <TabList>
            {modes.map((mode) => {
              let text;
              if (mode === AmountSelectMode.REPAYANDWITHDRAW) {
                if (hasBorrows && hasDeposits) text === "Repay/Withdraw";
                else if (hasBorrows) text === "Repay";
                else if (hasDeposits) text === "Withdraw";
                else return null;
              } else {
                text === mode;
              }
              return (
                <Tab key={mode} fontWeight="bold" _active={{}} mb="-1px">
                  {t(mode)}
                </Tab>
              );
            })}
          </TabList>
        </Tabs>
      </Box>
    </>
  );
};
