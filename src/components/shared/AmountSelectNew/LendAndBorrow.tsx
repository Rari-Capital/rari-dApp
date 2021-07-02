import { Box, Heading, Text } from "@chakra-ui/layout";
import { Button, useToast } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import DashboardBox from "../DashboardBox";
import { Center, Column, Row, useIsMobile } from "utils/chakraUtils";
import FuseAmountInput from "./components/FuseAmountInput";

// Hooks
import { useCallback, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUpdatedUserAssetsForBorrowAndLend } from "hooks/fuse/useUpdatedUserAssets";
import { useBorrowCredit, useBorrowLimit } from "hooks/useBorrowLimit";
import { useTotalBorrowAndSupplyBalanceUSD } from "hooks/fuse/useTotalBorrowBalanceUSD";
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { useBestFusePoolForAsset } from "hooks/opportunities/useBestFusePoolForAsset";

// Utils
import { handleGenericError } from "utils/errorHandling";
import { fetchTokenBalance } from "hooks/useTokenBalance";
import {
  bigNumberIsZero,
  smallUsdFormatter,
  abbreviateAmount,
} from "utils/bigUtils";
import { convertMantissaToAPR, convertMantissaToAPY } from "utils/apyUtils";
import BigNumber from "bignumber.js";
import { onLendBorrowConfirm } from "utils/inputUtils";

// Types
import { TokenData } from "hooks/useTokenData";
import {
  FusePoolData,
  USDPricedFuseAsset,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";
import { AmountSelectUserAction, AmountSelectMode } from "./AmountSelectNew";
import AppLink from "../AppLink";
import { string } from "mathjs";

const LendAndBorrow = ({
  token,
  setUserAction,
}: {
  token?: TokenData;
  setUserAction: (action: AmountSelectUserAction) => void;
}) => {
  const isMobile = useIsMobile();
  const toast = useToast();
  const { fuse, address } = useRari();

  // Get necessary data about the best pool and the Fuse Asset (based on the token) for this pool
  const { bestPool, poolAssetIndex } = useBestFusePoolForAsset(token?.address);

  // Assets
  const lendAsset: USDPricedFuseAssetWithTokenData = useMemo(
    () => bestPool?.assets[poolAssetIndex!] as USDPricedFuseAssetWithTokenData,
    [bestPool, poolAssetIndex]
  );

  const [borrowAssetIndex, setBorrowAssetIndex] = useState<number>(
    poolAssetIndex ?? 0
  );

  const borrowAsset: USDPricedFuseAssetWithTokenData = useMemo(
    () =>
      bestPool?.assets[borrowAssetIndex!] as USDPricedFuseAssetWithTokenData,
    [bestPool, borrowAssetIndex]
  );

  // State
  const [lendInput, setLendInput] = useState<string>("");
  const [lendAmountBN, setLendAmountBN] = useState<BigNumber | undefined>(
    () => new BigNumber(0)
  );

  const [borrowInput, setBorrowInput] = useState<string>("");
  const [borrowAmountBN, setBorrowAmountBN] = useState<BigNumber | undefined>(
    () => new BigNumber(0)
  );

  // Bubbled up from StatsColumn
  const [error, setError] = useState<string | null>(null);

  // Wrappers for updating input
  const updateLendAmount = useCallback(
    (newAmount: string) => {
      if (newAmount.startsWith("-")) return;
      setLendInput(newAmount);

      // Try to set the amount to BigNumber(newAmount):
      const bigAmount = new BigNumber(newAmount);
      bigAmount.isNaN()
        ? setLendAmountBN(undefined)
        : setLendAmountBN(
            bigAmount.multipliedBy(10 ** lendAsset.underlyingDecimals)
          );
    },
    [lendAsset]
  );

  const updateBorrowAmount = useCallback(
    (newAmount: string) => {
      if (newAmount.startsWith("-")) return;
      setBorrowInput(newAmount);

      // Try to set the amount to BigNumber(newAmount):
      const bigAmount = new BigNumber(newAmount);
      bigAmount.isNaN()
        ? setBorrowAmountBN(undefined)
        : setBorrowAmountBN(
            bigAmount.multipliedBy(10 ** lendAsset.underlyingDecimals)
          );
    },
    [lendAsset]
  );

  const updateBorrowedAsset = useCallback(
    (tokenAddress: string) => {
      const borrowedAssetIndex: number | undefined = bestPool?.assets.findIndex(
        (asset) => asset.underlyingToken === tokenAddress
      );
      if (borrowedAssetIndex) setBorrowAssetIndex(borrowedAssetIndex);
    },
    [setBorrowAssetIndex, bestPool]
  );

  const handleSubmit = () => {
    if (!bestPool) return undefined;
    onLendBorrowConfirm({
      asset: lendAsset as USDPricedFuseAsset,
      borrowedAsset: borrowAsset as USDPricedFuseAsset,
      fuse,
      address,
      lendAmount: lendAmountBN,
      borrowAmount: borrowAmountBN,
      comptrollerAddress: bestPool.comptroller,
      setUserAction,
      toast,
    });
  };

  if (!bestPool || !bestPool.assets.length)
    return (
      <Box h="100%" w="100%">
        <Center h="100%" w="100%">
          <Spinner />
        </Center>
      </Box>
    );

  return (
    <Box h="100%" w="100%" color={"white"}>
      {/* Lend */}
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
        <FuseAmountInput
          asset={lendAsset}
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
          asset={borrowAsset}
          fusePool={bestPool}
          mode={AmountSelectMode.BORROW}
          value={borrowInput}
          updateAmount={updateBorrowAmount}
          updateAsset={updateBorrowedAsset}
        />
      </Column>

      {/* Stats */}
      <StatsColumn
        mode={AmountSelectMode.LENDANDBORROW}
        pool={bestPool}
        assets={bestPool.assets}
        assetIndex={poolAssetIndex!}
        borrowAssetIndex={borrowAssetIndex}
        lendAmount={parseInt(lendAmountBN?.toFixed(0) ?? "0") ?? 0}
        borrowAmount={parseInt(borrowAmountBN?.toFixed(0) ?? "0") ?? 0}
        enableAsCollateral={true}
        lendColor={lendAsset?.tokenData.color ?? "white"}
        borrowColor={borrowAsset?.tokenData.color ?? "white"}
        setError={setError}
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
        className={isMobile ? "confirm-button-disable-font-size-scale" : ""}
        _hover={{ transform: "scale(1.02)" }}
        _active={{ transform: "scale(0.95)" }}
        onClick={handleSubmit}
        isDisabled={!!error}
      >
        {error
          ? error
          : !bigNumberIsZero(lendAmountBN) && !bigNumberIsZero(borrowAmountBN)
          ? "Lend & Borrow"
          : !bigNumberIsZero(lendAmountBN)
          ? "Lend"
          : "Borrow"}
      </Button>
    </Box>
  );
};

export default LendAndBorrow;

// Todo - Refactor this back into a single component!
const StatsColumn = ({
  mode,
  assets,
  assetIndex,
  borrowAssetIndex,
  lendAmount,
  borrowAmount,
  pool,
  lendColor,
  borrowColor,
  enableAsCollateral = true,
  setError,
}: {
  mode: AmountSelectMode;
  lendAmount: number;
  borrowAmount: number;
  assets: USDPricedFuseAssetWithTokenData[] | USDPricedFuseAsset[];
  assetIndex: number;
  borrowAssetIndex: number;
  pool?: FusePoolData;
  lendColor: string;
  borrowColor: string;
  enableAsCollateral?: boolean;
  setError: (error: string | null) => void;
}) => {
  const { t } = useTranslation();
  const { fuse, address } = useRari();
  const toast = useToast();

  // Get the new representation of a user's USDPricedFuseAssets after proposing a supply an/or borrow amount.
  const updatedAssets: USDPricedFuseAsset[] | undefined =
    useUpdatedUserAssetsForBorrowAndLend({
      assets,
      lendIndex: assetIndex,
      borrowIndex: borrowAssetIndex,
      lendAmount,
      borrowAmount,
    });

  // Define the old and new asset (same asset different numerical values)
  const asset = assets[assetIndex];
  const updatedAsset = updatedAssets ? updatedAssets[assetIndex] : null;

  const borrowAsset = assets[borrowAssetIndex];
  const updatedBorrowAsset = updatedAssets
    ? updatedAssets[borrowAssetIndex]
    : null;

  // Calculate Old and new Borrow Limits
  const borrowCredit = useBorrowCredit(assets);
  const borrowLimit = useBorrowLimit(assets);
  const updatedBorrowCredit = useBorrowCredit(updatedAssets ?? [], {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
  });
  const updatedBorrowLimit = useBorrowLimit(updatedAssets ?? [], {
    ignoreIsEnabledCheckFor: enableAsCollateral ? asset.cToken : undefined,
  });

  // Total USD supplied/borrowed
  const borrowAndSupplyBalanceUSD = useTotalBorrowAndSupplyBalanceUSD(assets);
  const updatedBorrowAndSupplyBalanceUSD = useTotalBorrowAndSupplyBalanceUSD(
    updatedAssets ?? []
  );

  // Borrow Ratios (Inverse of health factor)
  // Todo - Fix this
  const oldRatio =
    borrowAndSupplyBalanceUSD.totalBorrowBalanceUSD / borrowLimit;
  const updatedRatio =
    updatedBorrowAndSupplyBalanceUSD.totalBorrowBalanceUSD / updatedBorrowLimit;

  // At Liquidation Risk?
  const atRiskOfLiquidation = oldRatio > 0.95;
  const updatedAtRiskOfLiquidation = updatedRatio > 0.95;

  // Is there liquidity for this borrow?
  const insufficientBorrowLiquidity = useMemo(
    () => borrowAmount >= borrowAsset.liquidity,
    [borrowAsset, borrowAmount]
  );

  // APY/APRs
  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);

  const borrowAPR = convertMantissaToAPR(borrowAsset.borrowRatePerBlock);

  const updatedSupplyAPY = convertMantissaToAPY(
    updatedAsset?.supplyRatePerBlock ?? 0,
    365
  );
  const updatedBorrowAPR = convertMantissaToAPR(
    updatedAsset?.borrowRatePerBlock ?? borrowAPR
  );

  // todo - Vestigial, should remove
  const isSupplyingOrWithdrawing = true;

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedLendAPYDiffIsLarge =
    Math.abs(updatedSupplyAPY - supplyAPY) > 0.1;

  const updatedBorrowAPYDiffIsLarge =
    Math.abs(updatedBorrowAPR - borrowAPR) > 0.1;

  // Todo - refactor this query
  const { data: lendAmountisValid } = useQuery(
    (lendAmount?.toString() ?? "null") + "LEND" + " isValid",
    async () => {
      if (lendAmount === null) return false;

      try {
        const balance = await fetchTokenBalance(
          asset.underlyingToken,
          fuse.web3,
          address
        );

        // Check if lend amount is more than balance
        return lendAmount <= parseFloat(balance.toString());
      } catch (e) {
        handleGenericError(e, toast);
        return false;
      }
    }
  );

  const error: string | null = useMemo(() => {
    if (!pool) return "Finding best pool...";
    else if (
      lendAmount === null ||
      lendAmount < 0 ||
      (lendAmount === 0 && borrowAmount <= 0)
    )
      return "Enter a valid amount to supply.";
    else if (lendAmountisValid === undefined) return `Loading your balance...`;
    else if (!lendAmountisValid)
      return `You don't have enough ${asset.underlyingSymbol}!`;
    else if (insufficientBorrowLiquidity)
      return "Insufficient liquidity for this borrow!";
    else if (updatedAtRiskOfLiquidation) return "You cannot borrow this much!";
    else return null;
  }, [
    lendAmount,
    borrowAmount,
    lendAmountisValid,
    updatedAtRiskOfLiquidation,
    asset,
  ]);

  useEffect(() => {
    setError(error);
  }, [error]);

  const showSpinner: boolean = useMemo(
    () => (lendAmount >= 0 && borrowAmount >= 0 && !updatedAsset) ?? false,
    [updatedAsset, lendAmount, borrowAmount]
  );

  return (
    <DashboardBox width="100%" height="250px" mt={4}>
      {showSpinner ? (
        <Center expand>
          <Spinner />
        </Center>
      ) : (
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
            <Text fontWeight="bold" fontSize="md">
              {t("Supply Balance")}:
            </Text>
            <Text fontWeight="bold" flexShrink={0} fontSize={"xs"}>
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
            <Text fontWeight="bold" fontSize="md">
              {t("Borrow Balance")}:
            </Text>
            <Text fontWeight="bold" flexShrink={0} fontSize={"xs"}>
              {abbreviateAmount(
                borrowAsset.borrowBalance / 10 ** borrowAsset.underlyingDecimals
              ).replace("$", "")}
              <>
                {" → "}
                {abbreviateAmount(
                  updatedBorrowAsset!.borrowBalance /
                    10 ** updatedBorrowAsset!.underlyingDecimals
                ).replace("$", "")}
              </>{" "}
              {borrowAsset.underlyingSymbol}
            </Text>
          </Row>

          {/* Supply APY  */}

          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color={lendColor}
          >
            <Text fontWeight="bold" fontSize="md">
              Supply APY
            </Text>
            <Text
              fontWeight="bold"
              fontSize={updatedLendAPYDiffIsLarge ? "xs" : "md"}
            >
              {supplyAPY.toFixed(2)} %
              {updatedLendAPYDiffIsLarge ? (
                <>
                  {" → "}
                  {updatedSupplyAPY.toFixed(2)}%
                </>
              ) : null}
            </Text>
          </Row>

          {/* Borrow APR  */}
          {borrowAmount > 0 && (
            <Row
              mainAxisAlignment="space-between"
              crossAxisAlignment="center"
              width="100%"
              color={borrowColor}
            >
              <Text fontWeight="bold" fontSize="md">
                Borrow APR
              </Text>
              <Row
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                fontSize={"md"}
              >
                <Text fontWeight="bold">
                {borrowAPR.toFixed(2)}%
                </Text>
                <Text ml={1} fontWeight="bold">
                  {" → "}
                </Text>
                <Text
                  ml={1}
                  fontWeight="bold"
                >
                  {updatedBorrowAPR.toFixed(2)}%
                </Text>
              </Row>
            </Row>
          )}

          {/* Borrow Credit  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold" fontSize="md">
              {t("Borrow Credit")}:
            </Text>
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              fontSize={updatedAtRiskOfLiquidation ? "md" : "xs"}
            >
              <Text fontWeight="bold" fontSize={"xs"}>
                {abbreviateAmount(borrowCredit)}
              </Text>
              <Text ml={1} fontWeight="bold" fontSize={"xs"}>
                {" → "}
              </Text>
              <Text
                ml={1}
                fontWeight="bold"
                color={updatedAtRiskOfLiquidation ? "red" : ""}
                fontSize={updatedAtRiskOfLiquidation ? "md" : "xs"}
              >
                {abbreviateAmount(updatedBorrowCredit)}
              </Text>
            </Row>
          </Row>

          {/* Ratio  */}
          {/* <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold" flexShrink={0}>
              {t("Ratios")}:
            </Text>
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Text fontWeight="bold" fontSize={"sm"}>
                {(oldRatio * 100).toFixed(2)}%
              </Text>
              <Text ml={1} fontWeight="bold" fontSize={"sm"}>
                {" → "}
              </Text>
              <Text
                ml={1}
                fontWeight="bold"
                fontSize={updatedAtRiskOfLiquidation ? "lg" : "sm"}
                color={updatedAtRiskOfLiquidation ? "red" : ""}
              >
                {updatedAtRiskOfLiquidation
                  ? "Too Risky!"
                  : `${(updatedRatio * 100).toFixed(2)}%`}
              </Text>
            </Row>
          </Row> */}

          {/* Asset Debt Balance 
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
              {" → "}
              {smallUsdFormatter(updatedAsset.borrowBalanceUSD)}
            </Text>
          </Row> */}

          {/* Total Debt Balance  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold" fontSize="md">
              {t("Total Debt")}:
            </Text>
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Text fontWeight="bold" fontSize={"xs"}>
                {abbreviateAmount(
                  borrowAndSupplyBalanceUSD.totalBorrowBalanceUSD
                )}
              </Text>
              <Text ml={1} fontWeight="bold" fontSize={"xs"}>
                {" → "}
              </Text>
              <Text
                ml={1}
                fontWeight="bold"
                fontSize={updatedAtRiskOfLiquidation ? "md" : "xs"}
                color={updatedAtRiskOfLiquidation ? "red" : ""}
              >
                {abbreviateAmount(
                  updatedBorrowAndSupplyBalanceUSD.totalBorrowBalanceUSD
                )}{" "}
                ({!isNaN(updatedRatio) && (updatedRatio * 100).toFixed(0)}%)
              </Text>
            </Row>
          </Row>

          {/* Fuse Pool  */}
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            width="100%"
            color="white"
          >
            <Text fontWeight="bold" fontSize="md">
              {t("Fuse Pool")}:
            </Text>
            <AppLink href={`/fuse/pool/${pool?.id}`}>
              <Text
                fontWeight="bold"
                fontSize={!isSupplyingOrWithdrawing ? "xs" : "md"}
              >
                {pool?.id}
              </Text>
            </AppLink>
          </Row>
        </Column>
      )}
    </DashboardBox>
  );
};
