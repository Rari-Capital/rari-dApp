import { Box, Heading, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useBestFusePoolForAsset } from "hooks/opportunities/useBestFusePoolForAsset";
import { TokenData } from "hooks/useTokenData";
import { useCallback, useMemo, useState } from "react";
import { Center, Column, Row, useIsMobile } from "utils/chakraUtils";
import {
  FusePoolData,
  USDPricedFuseAsset,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";
import { AmountSelectUserAction, AmountSelectMode } from "./AmountSelectNew";
import FuseAmountInput from "./components/FuseAmountInput";

import BigNumber from "bignumber.js";
import { useTranslation } from "react-i18next";
import useUpdatedUserAssets, {
  useUpdatedUserAssetsForBorrowAndLend,
} from "hooks/fuse/useUpdatedUserAssets";
import { useBorrowLimit } from "hooks/useBorrowLimit";
import { convertMantissaToAPR, convertMantissaToAPY } from "utils/apyUtils";
import DashboardBox from "../DashboardBox";
import { smallUsdFormatter } from "utils/bigUtils";
import { Spinner } from "@chakra-ui/spinner";
import tokenData from "pages/api/tokenData";

const LendAndBorrow = ({
  token,
  setUserAction,
}: {
  token?: TokenData;
  setUserAction: (action: AmountSelectUserAction) => void;
}) => {

  const isMobile = useIsMobile()

  // Get necessary data about the best pool and the Fuse Asset (based on the token) for this pool
  const { bestPool, poolAssetIndex } = useBestFusePoolForAsset(token?.address);
  const assetWithTokenData: USDPricedFuseAssetWithTokenData = useMemo(
    () =>
      (bestPool?.assets[poolAssetIndex!] as USDPricedFuseAssetWithTokenData) ??
      undefined,
    [bestPool, poolAssetIndex]
  );

  // State
  const [lendInput, setLendInput] = useState<string>("");
  const [lendAmountBN, setLendAmountBN] = useState<BigNumber | null>(
    () => new BigNumber(0)
  );

  const [borrowInput, setBorrowInput] = useState<string>("");
  const [borrowAmountBN, setBorrowAmountBN] = useState<BigNumber | null>(
    () => new BigNumber(0)
  );

  const updateLendAmount = useCallback(
    (newAmount: string) => {
      if (newAmount.startsWith("-")) return;
      setLendInput(newAmount);

      // Try to set the amount to BigNumber(newAmount):
      try {
        BigNumber.DEBUG = true;
        const bigAmount = new BigNumber(newAmount);
        setLendAmountBN(
          bigAmount.multipliedBy(10 ** assetWithTokenData.underlyingDecimals)
        );
      } catch (e) {
        // If the number was invalid, set the amount to null to disable confirming:
        setLendAmountBN(null);
      }

      setUserAction(AmountSelectUserAction.NO_ACTION);
    },
    [assetWithTokenData]
  );

  const updateBorrowAmount = useCallback(
    (newAmount: string) => {
      if (newAmount.startsWith("-")) return;
      setBorrowInput(newAmount);

      // Try to set the amount to BigNumber(newAmount):
      try {
        BigNumber.DEBUG = true;
        const bigAmount = new BigNumber(newAmount);
        setBorrowAmountBN(
          bigAmount.multipliedBy(10 ** assetWithTokenData.underlyingDecimals)
        );
      } catch (e) {
        // If the number was invalid, set the amount to null to disable confirming:
        setBorrowAmountBN(null);
      }

      setUserAction(AmountSelectUserAction.NO_ACTION);
    },
    [assetWithTokenData]
  );

  if (!bestPool || !bestPool.assets.length)
    return (
      <Box h="200px" w="100%">
        <Center h="100%" w="100%">
          <Spinner />
        </Center>
      </Box>
    );

  return (
    <Box h="100%" w="100%" color={token?.color ?? "white"}>
      {/* Lend */}
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <FuseAmountInput
          asset={assetWithTokenData}
          fusePool={bestPool}
          mode={AmountSelectMode.LEND}
          value={lendInput}
          updateAmount={updateLendAmount}
        />
      </Row>

      {/* Borrow */}
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        mt={3}
      >
        <Heading size="md" mb={4} color="white" pl={3}>
          Borrow{" "}
        </Heading>
        <FuseAmountInput
          asset={assetWithTokenData}
          fusePool={bestPool}
          mode={AmountSelectMode.BORROW}
          value={borrowInput}
          updateAmount={updateBorrowAmount}
        />
      </Column>

      {/* Stats */}
      <StatsColumn
        color={token?.color}
        mode={AmountSelectMode.LENDANDBORROW}
        pool={bestPool}
        assets={bestPool.assets}
        assetIndex={poolAssetIndex!}
        lendAmount={parseInt(lendAmountBN?.toFixed(0) ?? "0") ?? 0}
        borrowAmount={parseInt(borrowAmountBN?.toFixed(0) ?? "0") ?? 0}
        enableAsCollateral={true}
      />

{/* Submit Button - todo */}
        <Button
              mt={4}
              fontWeight="bold"
            //   fontSize={
            //     depositOrWithdrawAlert ? depositOrWithdrawAlertFontSize : "2xl"
            //   }
              borderRadius="10px"
              width="100%"
              height="70px"
              bg={token?.color ?? "#FFF"}
              color={token?.overlayTextColor ?? "#000"}
              // If the size is small, this means the text is large and we don't want the font size scale animation.
              className={
                isMobile
                  ? "confirm-button-disable-font-size-scale"
                  : ""
              }
              _hover={{ transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.95)" }}
            //   onClick={onConfirm}
            //   isDisabled={!amountIsValid}
            >
              {/* {depositOrWithdrawAlert ?? t("Confirm")} */}
              Confirm
            </Button>
    </Box>
  );
};

export default LendAndBorrow;

// Todo - Refactor this back into a single component!
const StatsColumn = ({
  color,
  mode,
  assets,
  assetIndex,
  lendAmount,
  borrowAmount,
  pool,
  enableAsCollateral = true,
}: {
  color?: string;
  lendAmount: number;
  borrowAmount: number;
  mode: AmountSelectMode;
  assets: USDPricedFuseAssetWithTokenData[] | USDPricedFuseAsset[];
  assetIndex: number;
  pool?: FusePoolData;
  enableAsCollateral?: boolean;
}) => {
  const { t } = useTranslation();

  // Get the new representation of a user's USDPricedFuseAssets after proposing a supply amount.
  const updatedAssets: USDPricedFuseAsset[] | undefined =
    useUpdatedUserAssetsForBorrowAndLend({
      assets,
      index: assetIndex,
      lendAmount: lendAmount,
      borrowAmount,
    });

  // Define the old and new asset (same asset different numerical values)
  const asset = assets[assetIndex];
  const updatedAsset = updatedAssets ? updatedAssets[assetIndex] : null;

  // Calculate Old and new Borrow Limits
  const borrowLimit = useBorrowLimit(assets);
  const updatedBorrowLimit = useBorrowLimit(updatedAssets ?? [], {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
    subtractDebt: true,
  });

  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
  const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

  const updatedSupplyAPY = convertMantissaToAPY(
    updatedAsset?.supplyRatePerBlock ?? 0,
    365
  );
  const updatedBorrowAPR = convertMantissaToAPR(
    updatedAsset?.borrowRatePerBlock ?? 0
  );

  const isSupplyingOrWithdrawing = true;

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedAPYDiffIsLarge = isSupplyingOrWithdrawing
    ? Math.abs(updatedSupplyAPY - supplyAPY) > 0.1
    : Math.abs(updatedBorrowAPR - borrowAPR) > 0.1;

  return (
    <DashboardBox width="100%" height="190px" mt={4}>
      {updatedAsset ? (
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          expand
          py={3}
          px={4}
          fontSize="lg"
        >
          {/* Supply Balance */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t("Supply Balance")}:
            </Text>
            <Text fontWeight="bold" flexShrink={0} fontSize={"sm"}>
              {smallUsdFormatter(
                asset.supplyBalance / 10 ** asset.underlyingDecimals
              ).replace("$", "")}
              {isSupplyingOrWithdrawing ? (
                <>
                  {" → "}
                  {smallUsdFormatter(
                    updatedAsset!.supplyBalance /
                      10 ** updatedAsset!.underlyingDecimals
                  ).replace("$", "")}
                </>
              ) : null}{" "}
              {asset.underlyingSymbol}
            </Text>
          </Row>

          {/* Borrow Balance */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color={"white"}
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t("Borrow Balance")}:
            </Text>
            <Text fontWeight="bold" flexShrink={0} fontSize={"sm"}>
              {smallUsdFormatter(
                asset.borrowBalance / 10 ** asset.underlyingDecimals
              ).replace("$", "")}
              <>
                {" → "}
                {smallUsdFormatter(
                  updatedAsset!.borrowBalance /
                    10 ** updatedAsset!.underlyingDecimals
                ).replace("$", "")}
              </>
              {asset.underlyingSymbol}
            </Text>
          </Row>

         {/* Supply APY  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
          >
            <Text fontWeight="bold" flexShrink={0}>
              {isSupplyingOrWithdrawing ? t("Supply APY") : t("Borrow APR")}:
            </Text>
            <Text
              fontWeight="bold"
              fontSize={updatedAPYDiffIsLarge ? "sm" : "lg"}
            >
              {isSupplyingOrWithdrawing
                ? supplyAPY.toFixed(2)
                : borrowAPR.toFixed(2)}
              %
              {updatedAPYDiffIsLarge ? (
                <>
                  {" → "}
                  {isSupplyingOrWithdrawing
                    ? updatedSupplyAPY.toFixed(2)
                    : updatedBorrowAPR.toFixed(2)}
                  %
                </>
              ) : null}
            </Text>
          </Row>

         {/* Borrow Limit  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t("Borrow Limit")}:
            </Text>
            <Text
              fontWeight="bold"
              fontSize={isSupplyingOrWithdrawing ? "sm" : "lg"}
            >
              {smallUsdFormatter(borrowLimit)}
              {isSupplyingOrWithdrawing ? (
                <>
                  {" → "} {smallUsdFormatter(updatedBorrowLimit)}
                </>
              ) : null}{" "}
            </Text>
          </Row>

         {/* Debt Balance  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold">{t("Debt Balance")}:</Text>
            <Text
              fontWeight="bold"
              fontSize={!isSupplyingOrWithdrawing ? "sm" : "lg"}
            >
              {smallUsdFormatter(asset.borrowBalanceUSD)}
              {!isSupplyingOrWithdrawing ? (
                <>
                  {" → "}
                  {smallUsdFormatter(updatedAsset.borrowBalanceUSD)}
                </>
              ) : null}
            </Text>
          </Row>

         {/* Fuse Pool  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold">{t("Fuse Pool")}:</Text>
            <Text
              fontWeight="bold"
              fontSize={!isSupplyingOrWithdrawing ? "sm" : "lg"}
            >
              {pool?.id}
            </Text>
          </Row>
        </Column>
      ) : (
        <Center expand>
          <Spinner />
        </Center>
      )}
    </DashboardBox>
  );
};
