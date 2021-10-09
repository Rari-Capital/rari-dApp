import { memo, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Heading,
  Link,
  Progress,
  Spinner,
  Switch,
  Text,
  useDisclosure,
  useToast,
  HStack,
} from "@chakra-ui/react";
import {
  Column,
  Center,
  Row,
  RowOrColumn,
  useIsMobile,
} from "utils/chakraUtils";

// Hooks
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useRari } from "context/RariContext";
import { useBorrowLimit } from "hooks/useBorrowLimit";
import { useFusePoolData } from "hooks/useFusePoolData";
import { useIsSemiSmallScreen } from "hooks/useIsSemiSmallScreen";
import {
  ETH_TOKEN_DATA,
  TokensDataMap,
  useTokenData,
  useTokensData,
} from "hooks/useTokenData";
import { useAuthedCallback } from "hooks/useAuthedCallback";

// Utils
import { convertMantissaToAPY } from "utils/apyUtils";
import { shortUsdFormatter, smallUsdFormatter } from "utils/bigUtils";
import { createComptroller, createUnitroller } from "utils/createComptroller";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";

// Components
import DashboardBox from "components/shared/DashboardBox";
import { Header } from "components/shared/Header";
import { ModalDivider } from "components/shared/Modal";
import { SimpleTooltip } from "components/shared/SimpleTooltip";
import { SwitchCSS } from "components/shared/SwitchCSS";

import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import PoolModal, { Mode } from "./Modals/PoolModal";

import LogRocket from "logrocket";
import Footer from "components/shared/Footer";
import {
  CTokenRewardsDistributorIncentives,
  IncentivesData,
  usePoolIncentives,
} from "hooks/rewards/usePoolIncentives";
import { CTokenAvatarGroup, CTokenIcon } from "components/shared/CTokenIcon";
import { motion } from "framer-motion";

import { GlowingBox } from "components/shared/GlowingButton";
import { AdminAlert } from "components/shared/AdminAlert";
import { EditIcon } from "@chakra-ui/icons";
import { testForComptrollerErrorAndSend } from "./FusePoolEditPage";
import { handleGenericError } from "utils/errorHandling";
import { CTokenRewardsDistributorIncentivesWithRates } from "hooks/rewards/useRewardAPY";

export const useIsComptrollerAdmin = (comptrollerAddress?: string): boolean => {
  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + " admin", async () => {
    if (!comptrollerAddress) return undefined;

    const comptroller = createComptroller(comptrollerAddress, fuse);

    const admin = await comptroller.methods.admin().call();

    return admin;
  });

  return address === data;
};

export const useIsComptrollerPendingAdmin = (
  comptrollerAddress?: string
): boolean => {
  const { fuse, address, isAuthed } = useRari();

  const { data } = useQuery(comptrollerAddress + " pending admin", async () => {
    if (!comptrollerAddress) return undefined;

    const comptroller = createComptroller(comptrollerAddress, fuse);

    const pendingAdmin = await comptroller.methods.pendingAdmin().call();

    return pendingAdmin;
  });

  if (!isAuthed) return false;
  return address === data;
};

const PendingAdminAlert = ({ comptroller }: { comptroller?: string }) => {
  const { address, fuse } = useRari();

  const toast = useToast();
  const queryClient = useQueryClient();

  const [isAccepting, setIsAccepting] = useState(false);

  const isPendingAdmin = useIsComptrollerPendingAdmin(comptroller);

  const acceptAdmin = async () => {
    if (!comptroller) return;
    const unitroller = createUnitroller(comptroller, fuse);
    setIsAccepting(true);

    try {
      await testForComptrollerErrorAndSend(
        unitroller.methods._acceptAdmin(),
        address,
        ""
      );

      LogRocket.track("Fuse-AcceptAdmin");

      queryClient.refetchQueries();
      setIsAccepting(false);
    } catch (e) {
      setIsAccepting(false);

      handleGenericError(e, toast);
    }
  };

  return (
    <>
      {isPendingAdmin && (
        <AdminAlert
          isAdmin={isPendingAdmin}
          isAdminText="You are the pending admin of this Fuse Pool! Click to Accept Admin"
          rightAdornment={
            <Button
              h="100%"
              p={3}
              ml="auto"
              color="black"
              onClick={acceptAdmin}
              disabled={isAccepting}
            >
              <HStack>
                <Text fontWeight="bold">
                  {isAccepting} ? Accepting... : Accept Admin{" "}
                </Text>
              </HStack>
            </Button>
          }
        />
      )}
    </>
  );
};

const FusePoolPage = memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();

  let { poolId } = useParams();

  const data = useFusePoolData(poolId);

  const incentivesData: IncentivesData = usePoolIncentives(data?.comptroller);
  const { hasIncentives } = incentivesData;
  const isAdmin = useIsComptrollerAdmin(data?.comptroller);

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1350px"}
        px={isMobile ? 2 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar data={data} />

        <FuseTabBar />

        {
          /* If they have some asset enabled as collateral, show the collateral ratio bar */
          data && data.assets.some((asset) => asset.membership) ? (
            <CollateralRatioBar
              assets={data.assets}
              borrowUSD={data.totalBorrowBalanceUSD}
            />
          ) : null
        }

        {!!data && isAdmin && (
          <AdminAlert
            isAdmin={isAdmin}
            isAdminText="You are the admin of this Fuse Pool!"
            rightAdornment={
              <Box h="100%" ml="auto" color="black">
                <Link
                  /* @ts-ignore */
                  as={RouterLink}
                  to="./edit"
                >
                  <HStack>
                    <Text fontWeight="bold">Edit </Text>
                    <EditIcon />
                  </HStack>
                </Link>
              </Box>
            }
          />
        )}

        {!!data && isAuthed && (
          <PendingAdminAlert comptroller={data?.comptroller} />
        )}

        {hasIncentives && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ width: "100%" }}
          >
            <GlowingBox w="100%" h="50px" mt={4}>
              <Row
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                h="100%"
                w="100"
                p={3}
              >
                <Heading fontSize="md" ml={2}>
                  {" "}
                  🎉 This pool is offering rewards
                </Heading>
                <CTokenAvatarGroup
                  tokenAddresses={Object.keys(incentivesData.rewardTokensData)}
                  ml={2}
                  mr={2}
                  popOnHover={true}
                />
              </Row>
            </GlowingBox>
          </motion.div>
        )}

        <RowOrColumn
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          mt={4}
          isRow={!isMobile}
        >
          <DashboardBox width={isMobile ? "100%" : "50%"}>
            {data ? (
              <SupplyList
                assets={data.assets}
                comptrollerAddress={data.comptroller}
                supplyBalanceUSD={data.totalSupplyBalanceUSD}
                incentivesData={incentivesData}
              />
            ) : (
              <Center height="200px">
                <Spinner />
              </Center>
            )}
          </DashboardBox>

          <DashboardBox
            ml={isMobile ? 0 : 4}
            mt={isMobile ? 4 : 0}
            width={isMobile ? "100%" : "50%"}
          >
            {data ? (
              <BorrowList
                comptrollerAddress={data.comptroller}
                assets={data.assets}
                borrowBalanceUSD={data.totalBorrowBalanceUSD}
                incentivesData={incentivesData}
              />
            ) : (
              <Center height="200px">
                <Spinner />
              </Center>
            )}
          </DashboardBox>
        </RowOrColumn>
        <Footer />
      </Column>
    </>
  );
});

export default FusePoolPage;

const CollateralRatioBar = ({
  assets,
  borrowUSD,
}: {
  assets: USDPricedFuseAsset[];
  borrowUSD: number;
}) => {
  const { t } = useTranslation();

  const maxBorrow = useBorrowLimit(assets);

  const borrowPercent = borrowUSD / maxBorrow;
  const ratio = isNaN(borrowPercent) ? 0 : borrowPercent * 100;

  useEffect(() => {
    if (ratio > 95) {
      LogRocket.track("Fuse-AtRiskOfLiquidation");
    }
  }, [ratio]);

  return (
    <DashboardBox width="100%" height="65px" mt={4} p={4}>
      <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" expand>
        <SimpleTooltip
          label={t("Keep this bar from filling up to avoid being liquidated!")}
        >
          <Text flexShrink={0} mr={4}>
            {t("Borrow Limit")}
          </Text>
        </SimpleTooltip>

        <SimpleTooltip label={t("This is how much you have borrowed.")}>
          <Text flexShrink={0} mt="2px" mr={3} fontSize="10px">
            {smallUsdFormatter(borrowUSD)}
          </Text>
        </SimpleTooltip>

        <SimpleTooltip
          label={`You're using ${ratio.toFixed(1)}% of your ${smallUsdFormatter(
            maxBorrow
          )} borrow limit.`}
        >
          <Box width="100%">
            <Progress
              size="xs"
              width="100%"
              colorScheme={
                ratio <= 40
                  ? "whatsapp"
                  : ratio <= 60
                  ? "yellow"
                  : ratio <= 80
                  ? "orange"
                  : "red"
              }
              borderRadius="10px"
              value={ratio}
            />
          </Box>
        </SimpleTooltip>

        <SimpleTooltip
          label={t(
            "If your borrow amount reaches this value, you will be liquidated."
          )}
        >
          <Text flexShrink={0} mt="2px" ml={3} fontSize="10px">
            {smallUsdFormatter(maxBorrow)}
          </Text>
        </SimpleTooltip>
      </Row>
    </DashboardBox>
  );
};

const SupplyList = ({
  assets,
  supplyBalanceUSD,
  comptrollerAddress,
  incentivesData,
}: {
  assets: USDPricedFuseAsset[];
  supplyBalanceUSD: number;
  comptrollerAddress: string;
  incentivesData: IncentivesData;
}) => {
  const { t } = useTranslation();

  const suppliedAssets = assets.filter((asset) => asset.supplyBalanceUSD > 1);
  const nonSuppliedAssets = assets.filter(
    (asset) => asset.supplyBalanceUSD < 1
  );

  const isMobile = useIsMobile();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      pb={1}
    >
      <Heading size="md" px={4} py={3}>
        {t("Supply Balance:")} {smallUsdFormatter(supplyBalanceUSD)}
      </Heading>
      <ModalDivider />

      {assets.length > 0 ? (
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
          px={4}
          mt={4}
        >
          <Text width="27%" fontWeight="bold" pl={1}>
            {t("Asset")}
          </Text>

          {isMobile ? null : (
            <Text width="27%" fontWeight="bold" textAlign="right">
              {t("APY/LTV")}
            </Text>
          )}

          <Text
            width={isMobile ? "40%" : "27%"}
            fontWeight="bold"
            textAlign="right"
          >
            {t("Balance")}
          </Text>

          <Text
            width={isMobile ? "34%" : "20%"}
            fontWeight="bold"
            textAlign="right"
          >
            {t("Collateral")}
          </Text>
        </Row>
      ) : null}

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
        mt={1}
      >
        {assets.length > 0 ? (
          <>
            {suppliedAssets.map((asset, index) => {
              const supplyIncentivesForAsset = (
                incentivesData?.incentives?.[asset.cToken] ?? []
              ).filter(({ supplySpeed }) => !!supplySpeed);

              return (
                <AssetSupplyRow
                  comptrollerAddress={comptrollerAddress}
                  key={asset.underlyingToken}
                  assets={suppliedAssets}
                  index={index}
                  supplyIncentives={supplyIncentivesForAsset}
                  rewardTokensData={incentivesData.rewardTokensData}
                />
              );
            })}

            {suppliedAssets.length > 0 ? <ModalDivider my={2} /> : null}

            {nonSuppliedAssets.map((asset, index) => {
              const supplyIncentivesForAsset = (
                incentivesData?.incentives?.[asset.cToken] ?? []
              ).filter(({ supplySpeed }) => !!supplySpeed);

              return (
                <AssetSupplyRow
                  comptrollerAddress={comptrollerAddress}
                  key={asset.underlyingToken}
                  assets={nonSuppliedAssets}
                  index={index}
                  supplyIncentives={supplyIncentivesForAsset}
                  rewardTokensData={incentivesData.rewardTokensData}
                />
              );
            })}
          </>
        ) : (
          <Center expand my={8}>
            {t("There are no assets in this pool.")}
          </Center>
        )}
      </Column>
    </Column>
  );
};

const AssetSupplyRow = ({
  assets,
  index,
  comptrollerAddress,
  supplyIncentives,
  rewardTokensData,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
  supplyIncentives: CTokenRewardsDistributorIncentivesWithRates[];
  rewardTokensData: TokensDataMap;
}) => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openModal);

  const asset = assets[index];

  const { fuse, address } = useRari();

  const tokenData = useTokenData(asset.underlyingToken);

  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);

  const queryClient = useQueryClient();

  const toast = useToast();

  const onToggleCollateral = async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    let call;
    if (asset.membership) {
      call = comptroller.methods.exitMarket(asset.cToken);
    } else {
      call = comptroller.methods.enterMarkets([asset.cToken]);
    }

    let response = await call.call({ from: address });
    // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
    if (response[0] !== "0") {
      if (asset.membership) {
        toast({
          title: "Error! Code: " + response,
          description:
            "You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        toast({
          title: "Error! Code: " + response,
          description:
            "You cannot enable this asset as collateral at this time.",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      }

      return;
    }

    await call.send({ from: address });

    LogRocket.track("Fuse-ToggleCollateral");

    queryClient.refetchQueries();
  };

  const isStakedOHM =
    asset.underlyingToken.toLowerCase() ===
    "0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F".toLowerCase();

  const { data: stakedOHMApyData } = useQuery("sOHM_APY", async () => {
    const data = (
      await fetch("https://api.rari.capital/fuse/pools/18/apy")
    ).json();

    return data as Promise<{ supplyApy: number; supplyWpy: number }>;
  });

  const isMobile = useIsMobile();

  const { t } = useTranslation();

  const hasSupplyIncentives = !!supplyIncentives.length;
  const totalSupplyAPR =
    supplyIncentives?.reduce((prev, incentive) => {
      const apr = incentive.supplyAPR;
      return prev + apr;
    }, 0) ?? 0;

  const [hovered, setHovered] = useState<number>(-1);

  const handleMouseEnter = (index: number) => setHovered(index);
  const handleMouseLeave = () => setHovered(-1);

  const displayedSupplyAPR =
    hovered >= 0 ? supplyIncentives[hovered].supplyAPR : totalSupplyAPR;

  const displayedSupplyAPRLabel =
    hovered >= 0
      ? `${supplyIncentives[hovered].supplyAPR.toFixed(2)} % APR in ${
          rewardTokensData[supplyIncentives[hovered].rewardToken].symbol
        } distributions.`
      : `${displayedSupplyAPR.toFixed(2)}% total APR `;

  const _hovered = hovered > 0 ? hovered : 0;

  const color =
    rewardTokensData[supplyIncentives?.[_hovered]?.rewardToken]?.color ??
    "white";

  return (
    <>
      <PoolModal
        defaultMode={Mode.SUPPLY}
        comptrollerAddress={comptrollerAddress}
        assets={assets}
        index={index}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        width="100%"
        px={4}
        py={1.5}
        className="hover-row"
      >
        {/* Underlying Token Data */}
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="27%"
        >
          <Row
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            width="100%"
            as="button"
            onClick={authedOpenModal}
          >
            <Avatar
              bg="#FFF"
              boxSize="37px"
              name={asset.underlyingSymbol}
              src={
                tokenData?.logoURL ??
                "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
              }
            />
            <Text fontWeight="bold" fontSize="lg" ml={2} flexShrink={0}>
              {tokenData?.symbol ?? asset.underlyingSymbol}
            </Text>
          </Row>
        </Column>

        {/* APY */}
        {isMobile ? null : (
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-end"
            width="27%"
            as="button"
            onClick={authedOpenModal}
          >
            <Text
              color={tokenData?.color ?? "#FF"}
              fontWeight="bold"
              fontSize="17px"
            >
              {isStakedOHM
                ? stakedOHMApyData
                  ? (stakedOHMApyData.supplyApy * 100).toFixed(2)
                  : "?"
                : supplyAPY.toFixed(2)}
              %
            </Text>

            {/* Demo Supply Incentives */}
            {hasSupplyIncentives && (
              <Row
                // ml={1}
                // mb={.5}
                crossAxisAlignment="center"
                mainAxisAlignment="flex-end"
                py={2}
              >
                <Text fontWeight="bold" mr={1}>
                  +
                </Text>
                <AvatarGroup size="xs" max={30} ml={2} mr={1} spacing={1}>
                  {supplyIncentives?.map((supplyIncentive, i) => {
                    return (
                      <SimpleTooltip label={displayedSupplyAPRLabel}>
                        <CTokenIcon
                          address={supplyIncentive.rewardToken}
                          boxSize="20px"
                          onMouseEnter={() => handleMouseEnter(i)}
                          onMouseLeave={() => handleMouseLeave()}
                          _hover={{
                            zIndex: 9,
                            border: ".5px solid white",
                            transform: "scale(1.3);",
                          }}
                        />
                      </SimpleTooltip>
                    );
                  })}
                </AvatarGroup>
                <SimpleTooltip label={displayedSupplyAPRLabel}>
                  <Text color={color} fontWeight="bold" pl={1}>
                    {/* {(supplyIncentive.supplySpeed / 1e18).toString()}%  */}
                    {displayedSupplyAPR.toFixed(2)}%
                  </Text>
                </SimpleTooltip>
              </Row>
            )}

            {/* Incentives */}
            {/* {hasSupplyIncentives && (
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-end"
                py={1}
              >
                {supplyIncentives?.map((supplyIncentive) => {
                  return (
                    <Row
                      ml={1}
                      py={0.5}
                      // mb={.5}
                      crossAxisAlignment="center"
                      mainAxisAlignment="flex-end"
                    >
                      <Text fontWeight="bold" mr={2}>
                        +
                      </Text>
                      <CTokenIcon
                        address={supplyIncentive.rewardToken}
                        boxSize="20px"
                      />
                      <Text fontWeight="bold" mr={2}></Text>
                      <Text
                        color={
                          rewardTokensData[supplyIncentive.rewardToken].color ??
                          "white"
                        }
                        fontWeight="bold"
                      >
                        {(supplyIncentive.supplySpeed / 1e18).toString()}%
                      </Text>
                    </Row>
                  );
                })}
              </Column>
            )} */}

            <SimpleTooltip
              label={t(
                "The Loan to Value (LTV) ratio defines the maximum amount of tokens in the pool that can be borrowed with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool."
              )}
            >
              <Text fontSize="sm">{asset.collateralFactor / 1e16}% LTV</Text>
            </SimpleTooltip>

            {/* Incentives under APY
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-end"
              my={1}
            >
              {supplyIncentives?.map((supplyIncentive) => {
                return (
                  <Row
                    mainAxisAlignment="space-between"
                    crossAxisAlignment="center"
                    w="100%"
                  >
                    <Avatar
                      src={
                        rewardTokensData[supplyIncentive.rewardToken].logoURL ?? ""
                      }
                      boxSize="20px"
                    />
                    <Text
                      ml={2}
                      fontWeight="bold"
                      color={
                        rewardTokensData[supplyIncentive.rewardToken].color ?? ""
                      }
                    >
                      {(supplyIncentive.supplySpeed / 1e18).toString()}%
                    </Text>
                  </Row>
                );
              })}
            </Column>
             */}
          </Column>
        )}

        {/* Incentives */}
        {/* <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
          {supplyIncentives?.map((supplyIncentive) => {
            return (
              <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
                <Avatar
                  src={rewardTokensData[supplyIncentive.rewardToken].logoURL}
                  boxSize="15px"
                />
                <Box>
                  {(supplyIncentive.supplySpeed / 1e18).toString()}% APY
                </Box>
              </Row>
            );
          })}
        </Column> */}

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width={isMobile ? "40%" : "27%"}
          as="button"
          onClick={authedOpenModal}
        >
          <Text
            color={tokenData?.color ?? "#FFF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {smallUsdFormatter(asset.supplyBalanceUSD)}
          </Text>

          <Text fontSize="sm">
            {smallUsdFormatter(
              asset.supplyBalance / 10 ** asset.underlyingDecimals
            ).replace("$", "")}{" "}
            {tokenData?.symbol ?? asset.underlyingSymbol}
          </Text>
        </Column>

        {/* Set As Collateral  */}
        <Row
          width={isMobile ? "34%" : "20%"}
          mainAxisAlignment="flex-end"
          crossAxisAlignment="center"
          // alignSelf=
        >
          <SwitchCSS symbol={asset.underlyingSymbol} color={tokenData?.color} />
          <Switch
            isChecked={asset.membership}
            className={asset.underlyingSymbol + "-switch"}
            onChange={onToggleCollateral}
            size="md"
            mt={1}
            mr={5}
          />
        </Row>
      </Row>
    </>
  );
};

const BorrowList = ({
  assets,
  borrowBalanceUSD,
  comptrollerAddress,
  incentivesData,
}: {
  assets: USDPricedFuseAsset[];
  borrowBalanceUSD: number;
  comptrollerAddress: string;
  incentivesData: IncentivesData;
}) => {
  const { t } = useTranslation();
  const borrowedAssets = assets.filter((asset) => asset.borrowBalanceUSD > 1);
  const nonBorrowedAssets = assets.filter(
    (asset) => asset.borrowBalanceUSD < 1
  );

  const isMobile = useIsMobile();

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100%"
      pb={1}
    >
      <Heading size="md" px={4} py={3}>
        {t("Borrow Balance:")} {smallUsdFormatter(borrowBalanceUSD)}
      </Heading>
      <ModalDivider />

      {assets.length > 0 ? (
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          width="100%"
          px={4}
          mt={4}
        >
          <Text width="27%" fontWeight="bold" pl={1}>
            {t("Asset")}
          </Text>

          {isMobile ? null : (
            <Text width="27%" fontWeight="bold" textAlign="right">
              {t("APY/TVL")}
            </Text>
          )}

          <Text
            fontWeight="bold"
            textAlign="right"
            width={isMobile ? "40%" : "27%"}
          >
            {t("Balance")}
          </Text>

          <Text
            fontWeight="bold"
            textAlign="right"
            width={isMobile ? "34%" : "20%"}
          >
            {t("Liquidity")}
          </Text>
        </Row>
      ) : null}

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        expand
        mt={1}
      >
        {assets.length > 0 ? (
          <>
            {borrowedAssets.map((asset, index) => {
              // Don't show paused assets.
              if (asset.isPaused) {
                return null;
              }

              const incentivesForAsset = (
                incentivesData?.incentives?.[asset.cToken] ?? []
              ).filter(({ borrowSpeed }) => !!borrowSpeed);

              return (
                <AssetBorrowRow
                  comptrollerAddress={comptrollerAddress}
                  key={asset.underlyingToken}
                  assets={borrowedAssets}
                  index={index}
                  borrowIncentives={incentivesForAsset}
                  rewardTokensData={incentivesData.rewardTokensData}
                />
              );
            })}

            {borrowedAssets.length > 0 ? <ModalDivider my={2} /> : null}

            {nonBorrowedAssets.map((asset, index) => {
              // Don't show paused assets.
              if (asset.isPaused) {
                return null;
              }

              const incentivesForAsset = (
                incentivesData?.incentives?.[asset.cToken] ?? []
              ).filter(({ borrowSpeed }) => !!borrowSpeed);

              return (
                <AssetBorrowRow
                  comptrollerAddress={comptrollerAddress}
                  key={asset.underlyingToken}
                  assets={nonBorrowedAssets}
                  index={index}
                  borrowIncentives={incentivesForAsset}
                  rewardTokensData={incentivesData.rewardTokensData}
                />
              );
            })}
          </>
        ) : (
          <Center expand my={8}>
            {t("There are no assets in this pool.")}
          </Center>
        )}
      </Column>
    </Column>
  );
};

const AssetBorrowRow = ({
  assets,
  index,
  comptrollerAddress,
  borrowIncentives,
  rewardTokensData,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  comptrollerAddress: string;
  borrowIncentives: CTokenRewardsDistributorIncentives[];
  rewardTokensData: TokensDataMap;
}) => {
  const asset = assets[index];

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openModal);

  const tokenData = useTokenData(asset.underlyingToken);

  const borrowAPY = convertMantissaToAPY(asset.borrowRatePerBlock, 365);

  const { t } = useTranslation();

  const isMobile = useIsMobile();

  const hasBorrowIncentives = !!borrowIncentives.length;

  const totalBorrowAPY =
    borrowIncentives?.reduce((prev, incentive) => {
      const apy = incentive.borrowSpeed / 1e18;
      return prev + apy;
    }, 0) ?? 0;

  const [hovered, setHovered] = useState<number>(-1);

  const handleMouseEnter = (index: number) => setHovered(index);
  const handleMouseLeave = () => setHovered(-1);

  const displayedBorrowAPY =
    hovered >= 0
      ? borrowIncentives[hovered].borrowSpeed / 1e18
      : totalBorrowAPY;

  return (
    <>
      <PoolModal
        comptrollerAddress={comptrollerAddress}
        defaultMode={Mode.BORROW}
        assets={assets}
        index={index}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="100%"
        px={4}
        py={1.5}
        className="hover-row"
        as="button"
        onClick={authedOpenModal}
      >
        <Row
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="27%"
        >
          <Avatar
            bg="#FFF"
            boxSize="37px"
            name={asset.underlyingSymbol}
            src={
              tokenData?.logoURL ??
              "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
            }
          />
          <Text fontWeight="bold" fontSize="lg" ml={2} flexShrink={0}>
            {tokenData?.symbol ?? asset.underlyingSymbol}
          </Text>
        </Row>

        {isMobile ? null : (
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-end"
            width="27%"
          >
            <Text
              color={tokenData?.color ?? "#FF"}
              fontWeight="bold"
              fontSize="17px"
            >
              {borrowAPY.toFixed(2)}%
            </Text>

            {/* Demo Borrow Incentives */}
            {hasBorrowIncentives && (
              <Row
                // ml={1}
                // mb={.5}
                crossAxisAlignment="center"
                mainAxisAlignment="flex-end"
                py={1}
              >
                <Text fontWeight="bold" mr={1}>
                  +
                </Text>
                <AvatarGroup size="xs" max={30} ml={2} mr={2} spacing={1}>
                  {borrowIncentives?.map((borrowIncentive, i) => {
                    return (
                      <CTokenIcon
                        address={borrowIncentive.rewardToken}
                        boxSize="20px"
                        _hover={{
                          zIndex: 9,
                          border: ".5px solid white",
                          transform: "scale(1.3);",
                        }}
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </AvatarGroup>
                <Text
                  color={
                    rewardTokensData[borrowIncentives?.[hovered]?.rewardToken]
                      ?.color ?? "white"
                  }
                  pl={1}
                  fontWeight="bold"
                >
                  {/* {(supplyIncentive.supplySpeed / 1e18).toString()}%  */}
                  {displayedBorrowAPY}%
                </Text>
              </Row>
            )}

            {/* Borrow Incentives */}
            {/* {hasBorrowIncentives && (
              <Column
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-end"
                py={1}
              >
                {borrowIncentives?.map((borrowIncentive) => {
                  return (
                    <Row
                      ml={1}
                      // mb={.5}
                      crossAxisAlignment="center"
                      mainAxisAlignment="flex-end"
                    >
                      <Text fontWeight="bold" mr={2}>
                        +
                      </Text>
                      <CTokenIcon
                        address={borrowIncentive.rewardToken}
                        boxSize="20px"
                      />
                      <Text fontWeight="bold" mr={2}></Text>
                      <Text
                        color={
                          rewardTokensData[borrowIncentive.rewardToken].color ??
                          "white"
                        }
                        fontWeight="bold"
                      >
                        {(borrowIncentive.borrowSpeed / 1e18).toString()}%
                      </Text>
                    </Row>
                  );
                })}
              </Column>
            )} */}

            <SimpleTooltip
              label={t(
                "Total Value Lent (TVL) measures how much of this asset has been supplied in total. TVL does not account for how much of the lent assets have been borrowed, use 'liquidity' to determine the total unborrowed assets lent."
              )}
            >
              <Text fontSize="sm">
                {shortUsdFormatter(asset.totalSupplyUSD)} TVL
              </Text>
            </SimpleTooltip>

            {/* Borrow Incentives under APY */}
            {/* <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-end"
              my={1}
            >
              {borrowIncentives?.map((borrowIncentive) => {
                return (
                  <Row
                    mainAxisAlignment="space-between"
                    crossAxisAlignment="center"
                    w="100%"
                  >
                    <Avatar
                      src={
                        rewardTokensData[borrowIncentive.rewardToken].logoURL ??
                        ""
                      }
                      boxSize="20px"
                    />
                    <Text
                      ml={2}
                      fontWeight="bold"
                      color={
                        rewardTokensData[borrowIncentive.rewardToken].color ??
                        ""
                      }
                    >
                      {(borrowIncentive.borrowSpeed / 1e18).toString()}%
                    </Text>
                  </Row>
                );
              })}
            </Column> */}
          </Column>
        )}

        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-end"
          width={isMobile ? "40%" : "27%"}
        >
          <Text
            color={tokenData?.color ?? "#FFF"}
            fontWeight="bold"
            fontSize="17px"
          >
            {smallUsdFormatter(asset.borrowBalanceUSD)}
          </Text>

          <Text fontSize="sm">
            {smallUsdFormatter(
              asset.borrowBalance / 10 ** asset.underlyingDecimals
            ).replace("$", "")}{" "}
            {tokenData?.symbol ?? asset.underlyingSymbol}
          </Text>
        </Column>

        <SimpleTooltip
          label={t(
            "Liquidity is the amount of this asset that is available to borrow (unborrowed). To see how much has been supplied and borrowed in total, navigate to the Pool Info tab."
          )}
          placement="top-end"
        >
          <Box width={isMobile ? "34%" : "20%"}>
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-end"
            >
              <Text
                color={tokenData?.color ?? "#FFF"}
                fontWeight="bold"
                fontSize="17px"
              >
                {shortUsdFormatter(asset.liquidityUSD)}
              </Text>

              <Text fontSize="sm">
                {shortUsdFormatter(
                  asset.liquidity / 10 ** asset.underlyingDecimals
                ).replace("$", "")}{" "}
                {tokenData?.symbol}
              </Text>
            </Column>
          </Box>
        </SimpleTooltip>
      </Row>
    </>
  );
};
