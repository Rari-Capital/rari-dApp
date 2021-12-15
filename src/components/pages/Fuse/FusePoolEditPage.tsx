// Chakra and UI
import {
  Box,
  Badge,
  Heading,
  Text,
  useDisclosure,
  Spinner,

  // Table
  Image,
  HStack,
  Th,
  Thead,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import { Column, RowOrColumn, Center, Row } from "utils/chakraUtils";
import DashboardBox from "../../shared/DashboardBox";

// Components
import { Header } from "../../shared/Header";
import FuseStatsBar from "./FuseStatsBar";
import FuseTabBar from "./FuseTabBar";
import AddAssetModal from "./Modals/AddAssetModal/AddAssetModal";

// React
import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";

// Rari
import { useRari } from "../../../context/RariContext";

// Hooks
import { useIsSemiSmallScreen } from "../../../hooks/useIsSemiSmallScreen";
import { useFusePoolData } from "../../../hooks/useFusePoolData";
import { useTokenData } from "../../../hooks/useTokenData";

// Utils
import { CTokenAvatarGroup } from "components/shared/CTokenIcon";
import { createComptroller } from "../../../utils/createComptroller";

// Libraries
import LogRocket from "logrocket";
import { useIsComptrollerAdmin } from "./FusePoolPage";
import { AdminAlert } from "components/shared/AdminAlert";

import { useAuthedCallback } from "hooks/useAuthedCallback";
import {
  useCTokensUnderlying,
  usePoolIncentives,
} from "hooks/rewards/usePoolIncentives";
import { useRewardsDistributorsForPool } from "hooks/rewards/useRewardsDistributorsForPool";
import { RewardsDistributor } from "hooks/rewards/useRewardsDistributorsForPool";
import { useTokenBalance } from "hooks/useTokenBalance";
import AddRewardsDistributorModal from "./Modals/AddRewardsDistributorModal";
import EditRewardsDistributorModal from "./Modals/EditRewardsDistributorModal";
import AssetConfiguration, {
  AddAssetButton,
} from "./Modals/Edit/AssetConfiguration";
import PoolConfiguration from "./Modals/Edit/PoolConfiguration";
import { ModalDivider } from "components/shared/Modal";

export enum ComptrollerErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  COMPTROLLER_MISMATCH,
  INSUFFICIENT_SHORTFALL,
  INSUFFICIENT_LIQUIDITY,
  INVALID_CLOSE_FACTOR,
  INVALID_COLLATERAL_FACTOR,
  INVALID_LIQUIDATION_INCENTIVE,
  MARKET_NOT_ENTERED, // no longer possible
  MARKET_NOT_LISTED,
  MARKET_ALREADY_LISTED,
  MATH_ERROR,
  NONZERO_BORROW_BALANCE,
  PRICE_ERROR,
  REJECTION,
  SNAPSHOT_ERROR,
  TOO_MANY_ASSETS,
  TOO_MUCH_REPAY,
  SUPPLIER_NOT_WHITELISTED,
  BORROW_BELOW_MIN,
  SUPPLY_ABOVE_MAX,
  NONZERO_TOTAL_SUPPLY,
}

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(comptrollerAddress + " isUpgradeable", async () => {
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const isUpgradeable: boolean = await comptroller.methods
      .adminHasRights()
      .call();

    return isUpgradeable;
  });

  return data;
};

export async function testForComptrollerErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string
) {
  let response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
  if (response[0] !== "0") {
    const err = new Error(
      failMessage + " Code: " + (ComptrollerErrorCodes[response] ?? response)
    );

    LogRocket.captureException(err);
    throw err;
  }

  return txObject.send({ from: caller });
}

const FusePoolEditPage = memo(() => {
  const { isAuthed } = useRari();

  const isMobile = useIsSemiSmallScreen();

  const {
    isOpen: isAddAssetModalOpen,
    onOpen: openAddAssetModal,
    onClose: closeAddAssetModal,
  } = useDisclosure();

  const {
    isOpen: isAddRewardsDistributorModalOpen,
    onOpen: openAddRewardsDistributorModal,
    onClose: closeAddRewardsDistributorModal,
  } = useDisclosure();

  const {
    isOpen: isEditRewardsDistributorModalOpen,
    onOpen: openEditRewardsDistributorModal,
    onClose: closeEditRewardsDistributorModal,
  } = useDisclosure();

  const authedOpenModal = useAuthedCallback(openAddAssetModal);

  const { t } = useTranslation();

  const { poolId } = useParams();

  const data = useFusePoolData(poolId);
  const isAdmin = useIsComptrollerAdmin(data?.comptroller);

  // RewardsDistributor stuff
  const poolIncentives = usePoolIncentives(data?.comptroller);
  const rewardsDistributors = useRewardsDistributorsForPool(data?.comptroller);
  const [rewardsDistributor, setRewardsDistributor] = useState<
    RewardsDistributor | undefined
  >();

  console.log({ rewardsDistributors, poolIncentives });

  const handleRewardsRowClick = useCallback(
    (rD: RewardsDistributor) => {
      setRewardsDistributor(rD);
      openEditRewardsDistributorModal();
    },
    [setRewardsDistributor, openEditRewardsDistributorModal]
  );

  return (
    <>
      {data ? (
        <AddAssetModal
          comptrollerAddress={data.comptroller}
          poolOracleAddress={data.oracle}
          oracleModel={data.oracleModel}
          existingAssets={data.assets}
          poolName={data.name}
          poolID={poolId}
          isOpen={isAddAssetModalOpen}
          onClose={closeAddAssetModal}
        />
      ) : null}

      {data ? (
        <AddRewardsDistributorModal
          comptrollerAddress={data.comptroller}
          poolName={data.name}
          poolID={poolId}
          isOpen={isAddRewardsDistributorModalOpen}
          onClose={closeAddRewardsDistributorModal}
        />
      ) : null}

      {data && !!rewardsDistributor ? (
        <EditRewardsDistributorModal
          rewardsDistributor={rewardsDistributor}
          pool={data}
          isOpen={isEditRewardsDistributorModalOpen}
          onClose={closeEditRewardsDistributorModal}
        />
      ) : null}

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1150px"}
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} isFuse />

        <FuseStatsBar data={data} />

        <FuseTabBar />

        {!!data && (
          <AdminAlert
            isAdmin={isAdmin}
            isAdminText="You are the admin of this Fuse Pool!"
            isNotAdminText="You are not the admin of this Fuse Pool!"
          />
        )}

        <RowOrColumn
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          isRow={!isMobile}
        >
          <DashboardBox
            width={isMobile ? "100%" : "50%"}
            height={isMobile ? "auto" : "560px"}
            mt={4}
          >
            {data ? (
              <PoolConfiguration
                assets={data.assets}
                comptrollerAddress={data.comptroller}
                oracleAddress={data.oracle}
              />
            ) : (
              <Center expand>
                <Spinner my={8} />
              </Center>
            )}
          </DashboardBox>

          <Box pl={isMobile ? 0 : 4} width={isMobile ? "100%" : "50%"}>
            <DashboardBox
              width="100%"
              mt={4}
              height={isMobile ? "auto" : "560px"}
            >
              {data ? (
                data.assets.length > 0 ? (
                  <AssetConfiguration
                    openAddAssetModal={authedOpenModal}
                    assets={data.assets}
                    poolOracleAddress={data.oracle}
                    oracleModel={data.oracleModel}
                    comptrollerAddress={data.comptroller}
                    poolID={poolId}
                    poolName={data.name}
                  />
                ) : (
                  <Column
                    expand
                    mainAxisAlignment="center"
                    crossAxisAlignment="center"
                    py={4}
                  >
                    <Text mb={4}>{t("There are no assets in this pool.")}</Text>

                    <AddAssetButton
                      comptrollerAddress={data.comptroller}
                      openAddAssetModal={authedOpenModal}
                    />
                  </Column>
                )
              ) : (
                <Center expand>
                  <Spinner my={8} />
                </Center>
              )}
            </DashboardBox>
          </Box>
        </RowOrColumn>

        {/* Rewards Distributors */}
        <DashboardBox w="100%" h="100%" my={4}>
          <Row
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            p={3}
          >
            <Heading size="md">Rewards Distributors </Heading>
            <AddRewardsDistributorButton
              openAddRewardsDistributorModal={openAddRewardsDistributorModal}
              comptrollerAddress={data?.comptroller}
            />
          </Row>

          {!!data && !rewardsDistributors.length && (
            <Column
              w="100%"
              h="100%"
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              p={4}
            >
              <Text mb={4}>
                {t("There are no RewardsDistributors for this pool.")}
              </Text>
              <AddRewardsDistributorButton
                openAddRewardsDistributorModal={openAddRewardsDistributorModal}
                comptrollerAddress={data?.comptroller}
              />
            </Column>
          )}

          {!data && (
            <Column
              w="100%"
              h="100%"
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              p={4}
            >
              <Spinner />
            </Column>
          )}

          {!!data && !!rewardsDistributors.length && (
            <Table>
              <Thead>
                <Tr>
                  <Th color="white" size="sm">
                    {t("Reward Token:")}
                  </Th>
                  <Th color="white">{t("Active CTokens:")}</Th>
                  <Th color="white">{t("Balance:")}</Th>
                  <Th color="white">{t("Admin?")}</Th>
                </Tr>
              </Thead>

              <Tbody minHeight="50px">
                {!data && !rewardsDistributors.length ? (
                  <Spinner />
                ) : (
                  rewardsDistributors.map((rD, i) => {
                    return (
                      <RewardsDistributorRow
                        key={rD.address}
                        rewardsDistributor={rD}
                        handleRowClick={handleRewardsRowClick}
                        hideModalDivider={i === rewardsDistributors.length - 1}
                        activeCTokens={
                          poolIncentives.rewardsDistributorCtokens[rD.address]
                        }
                      />
                    );
                  })
                )}
              </Tbody>
            </Table>
          )}

          <ModalDivider />
        </DashboardBox>
      </Column>
    </>
  );
});

export default FusePoolEditPage;

export const SaveButton = ({
  onClick,
  altText,
  ...others
}: {
  onClick: () => any;
  altText?: string;
  [key: string]: any;
}) => {
  const { t } = useTranslation();

  return (
    <DashboardBox
      flexShrink={0}
      ml={2}
      px={2}
      height="35px"
      as="button"
      fontWeight="bold"
      onClick={onClick}
      {...others}
    >
      <Center expand>{altText ?? t("Save")}</Center>
    </DashboardBox>
  );
};

export const ConfigRow = ({
  children,
  ...others
}: {
  children: ReactNode;
  [key: string]: any;
}) => {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      width="100%"
      my={4}
      px={4}
      overflowX="auto"
      flexShrink={0}
      {...others}
    >
      {children}
    </Row>
  );
};

const AddRewardsDistributorButton = ({
  openAddRewardsDistributorModal,
  comptrollerAddress,
}: {
  openAddRewardsDistributorModal: () => any;
  comptrollerAddress: string;
}) => {
  const { t } = useTranslation();

  const isUpgradeable = useIsUpgradeable(comptrollerAddress);

  return isUpgradeable ? (
    <DashboardBox
      onClick={openAddRewardsDistributorModal}
      as="button"
      py={1}
      px={2}
      fontWeight="bold"
    >
      {t("Add Rewards Distributor")}
    </DashboardBox>
  ) : null;
};

const RewardsDistributorRow = ({
  rewardsDistributor,
  handleRowClick,
  hideModalDivider,
  activeCTokens,
}: {
  rewardsDistributor: RewardsDistributor;
  handleRowClick: (rD: RewardsDistributor) => void;
  hideModalDivider: boolean;
  activeCTokens: string[];
}) => {
  const { address, fuse } = useRari();
  const isAdmin = address === rewardsDistributor.admin;

  const tokenData = useTokenData(rewardsDistributor.rewardToken);
  //   Balances
  const { data: rDBalance } = useTokenBalance(
    rewardsDistributor.rewardToken,
    rewardsDistributor.address
  );

  const underlyingsMap = useCTokensUnderlying(activeCTokens);
  const underlyings = Object.values(underlyingsMap);

  return (
    <>
      <Tr
        _hover={{ background: "grey", cursor: "pointer" }}
        h="30px"
        p={5}
        flexDir="row"
        onClick={() => handleRowClick(rewardsDistributor)}
      >
        <Td>
          <HStack>
            {tokenData?.logoURL ? (
              <Image
                src={tokenData.logoURL}
                boxSize="30px"
                borderRadius="50%"
              />
            ) : null}
            <Heading fontSize="22px" color={tokenData?.color ?? "#FFF"} ml={2}>
              {tokenData
                ? tokenData.symbol ?? "Invalid Address!"
                : "Loading..."}
            </Heading>
          </HStack>
        </Td>

        <Td>
          {!!underlyings.length ? (
            <CTokenAvatarGroup tokenAddresses={underlyings} popOnHover={true} />
          ) : (
            <Badge colorScheme="red">Inactive</Badge>
          )}
        </Td>

        <Td>
          {(
            parseFloat(rDBalance?.toString() ?? "0") /
            10 ** (tokenData?.decimals ?? 18)
          ).toFixed(3)}{" "}
          {tokenData?.symbol}
        </Td>

        <Td>
          <Badge colorScheme={isAdmin ? "green" : "red"}>
            {isAdmin ? "Is Admin" : "Not Admin"}
          </Badge>
        </Td>
      </Tr>
      {/* {!hideModalDivider && <ModalDivider />} */}
    </>
  );
};
