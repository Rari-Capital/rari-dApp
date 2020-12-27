import React, { useEffect, useMemo, useState } from "react";
import {
  Center,
  Column,
  Row,
  RowOrColumn,
  useWindowSize,
} from "buttered-chakra";
import { useRari } from "../../../context/RariContext";
import DashboardBox, { DASHBOARD_BOX_SPACING } from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import {
  Heading,
  Link,
  Text,
  Icon,
  Box,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MdSwapHoriz } from "react-icons/md";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import { useQuery } from "react-query";
import { Contract } from "web3-eth-contract";
import SaffronPoolABI from "./SaffronPoolABI.json";
import SaffronStrategyABI from "./SaffronStrategyABI.json";
import ERC20ABI from "../../../rari-sdk/abi/ERC20.json";
import {
  smallStringUsdFormatter,
  smallUsdFormatter,
} from "../../../utils/bigUtils";
import DepositModal from "./SaffronDepositModal";

export enum TranchePool {
  DAI = "DAI",
  USDC = "USDC",
}

export enum TrancheRating {
  S = "S",
  AA = "AA",
  A = "A",
}

export const trancheRatingIndex = (trancheRating: TrancheRating) => {
  return trancheRating === TrancheRating.S
    ? 0
    : trancheRating === TrancheRating.AA
    ? 1
    : 2;
};

export const tranchePoolIndex = (tranchePool: TranchePool) => {
  // TODO: CHANGE USDC TO WHATEVER IT BECOMES LATER
  return tranchePool === TranchePool.DAI ? 9 : 0;
};

interface SaffronContextType {
  saffronStrategy: Contract;
  saffronPool: Contract;
}

export const SaffronContext = React.createContext<
  SaffronContextType | undefined
>(undefined);

const SaffronStrategyAddress = "0x9e0278646fD72318909338Ad87deC7f3464BC434";
const SaffronPoolAddress = "0xbafA231AAac12CE8ba0b23b86669f54a05fC23b5";

const WrappedTranchePage = React.memo(() => {
  const { rari } = useRari();

  const [saffronStrategy, setSaffronStrategy] = useState(() => {
    return new rari.web3.eth.Contract(
      SaffronStrategyABI as any,
      SaffronStrategyAddress
    );
  });

  const [saffronPool, setSaffronPool] = useState(() => {
    return new rari.web3.eth.Contract(
      SaffronPoolABI as any,
      SaffronPoolAddress
    );
  });

  useEffect(() => {
    setSaffronStrategy(
      new rari.web3.eth.Contract(
        SaffronStrategyABI as any,
        SaffronStrategyAddress
      )
    );

    setSaffronPool(
      new rari.web3.eth.Contract(SaffronPoolABI as any, SaffronPoolAddress)
    );
  }, [rari]);

  const value = useMemo(() => {
    return { saffronStrategy, saffronPool };
  }, [saffronStrategy, saffronPool]);

  return (
    <SaffronContext.Provider value={value}>
      <TranchePage />
    </SaffronContext.Provider>
  );
});

export const useSaffronData = () => {
  const context = React.useContext(SaffronContext);

  const { data } = useQuery("saffronData", async () => {
    return (await fetch("https://api.spice.finance/apy")).json();
  });

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  const fetchCurrentEpoch = async () => {
    const currentEpoch = await context.saffronPool.methods
      .get_current_epoch()
      .call();

    return currentEpoch;
  };

  return {
    saffronData: data as {
      SFI: { USD: number };
      pools: {
        name: string;
        tranches: { A: { "total-apy": number }; S: { "total-apy": number } };
      }[];
    },
    fetchCurrentEpoch,
    ...context,
  };
};

export default WrappedTranchePage;

const TranchePage = React.memo(() => {
  const { isAuthed } = useRari();

  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  return (
    <>
      <ForceAuthModal />

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        px={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
      >
        <Header isAuthed={isAuthed} />

        <RowOrColumn
          width="100%"
          isRow={!isMobile}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
        >
          <Column
            width={isMobile ? "100%" : "75%"}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            mr={DASHBOARD_BOX_SPACING.asPxString()}
          >
            <DashboardBox height={isMobile ? "110px" : "95px"} width="100%">
              <Column
                expand
                mainAxisAlignment="center"
                crossAxisAlignment={isMobile ? "center" : "flex-start"}
                textAlign="center"
                px={4}
              >
                <Heading size="lg">{t("Tranches")}</Heading>
                {t(
                  "Access Saffron Finance tranches through the Rari Capital interface!"
                )}
              </Column>
            </DashboardBox>

            <DashboardBox
              mt={4}
              height={isMobile ? "auto" : "200px"}
              width="100%"
            >
              <TranchesRatingInfo />
            </DashboardBox>

            <DashboardBox
              mt={4}
              height={isMobile ? "auto" : "200px"}
              width="100%"
            >
              <TranchePoolInfo tranchePool={TranchePool.DAI} />
            </DashboardBox>

            {isMobile ? null : (
              <DashboardBox
                mt={4}
                height="200px"
                width="100%"
                style={{ filter: "blur(3px)", pointerEvents: "none" }}
              >
                <TranchePoolInfo tranchePool={TranchePool.USDC} />
              </DashboardBox>
            )}
          </Column>
          <Column
            mt={isMobile ? DASHBOARD_BOX_SPACING.asPxString() : 0}
            width={isMobile ? "100%" : "25%"}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
          >
            <DashboardBox height="95px" width="100%">
              <RedemptionDate />
            </DashboardBox>

            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              height="200px"
              width="100%"
            >
              <InterestEarned />
            </DashboardBox>

            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              height="200px"
              width="100%"
            >
              <EstimatedReturns />
            </DashboardBox>

            <DashboardBox
              mt={DASHBOARD_BOX_SPACING.asPxString()}
              height="200px"
              width="100%"
              p={4}
            >
              <SFIDistributions />
            </DashboardBox>
          </Column>
        </RowOrColumn>
      </Column>
      <CopyrightSpacer forceShow />
    </>
  );
});

export const TranchesRatingInfo = React.memo(() => {
  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  return (
    <RowOrColumn
      isRow={!isMobile}
      p={4}
      expand
      crossAxisAlignment="flex-start"
      mainAxisAlignment="space-between"
    >
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment={isMobile ? "center" : "flex-start"}
        expand
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
        >
          <Heading size="md">{t("Tranche Details")}</Heading>
          <Text mt={1} textAlign={isMobile ? "center" : "left"}>
            {t(
              "SFI and interest is distributed to LPs proportionally at the end of each epoch."
            )}
          </Text>
        </Column>

        <Link isExternal href="https://app.saffron.finance/#docs">
          <u>{t("Learn More")}</u>
        </Link>
      </Column>

      <TrancheRatingColumn trancheRating={TrancheRating.S} />
      <TrancheRatingColumn trancheRating={TrancheRating.AA} />
      <TrancheRatingColumn trancheRating={TrancheRating.A} />
    </RowOrColumn>
  );
});

export const TrancheRatingColumn = React.memo(
  ({ trancheRating }: { trancheRating: TrancheRating }) => {
    const { t } = useTranslation();

    const isMobile = useIsSmallScreen();

    const { saffronPool } = useSaffronData();

    const { data } = useQuery("sfiEarnings", async () => {
      const {
        S,
        AA,
        A,
      } = await saffronPool.methods.TRANCHE_SFI_MULTIPLIER().call();

      return { S: S / 1000, AA: AA / 1000, A: A / 1000 };
    });

    return (
      <Column
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        expand
        ml={isMobile ? 0 : 4}
        mt={isMobile ? 6 : 0}
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          mb={isMobile ? 2 : 0}
        >
          <Heading size="sm">
            {trancheRating} {t("Tranche")}
          </Heading>
          <Text textAlign="center" mt={1}>
            {trancheRating === TrancheRating.S
              ? t("Liquidity added to other tranches as needed.")
              : trancheRating === TrancheRating.A
              ? "Reduced interest earned. Covered in case of failure by AA tranche."
              : "10x interest earned. Cover provided to A tranche in case of failure."}
          </Text>
        </Column>

        <i>
          SFI Earnings: <b>{data ? data[trancheRating] + "%" : "?%"}</b>
        </i>
      </Column>
    );
  }
);

export const TranchePoolInfo = React.memo(
  ({ tranchePool }: { tranchePool: TranchePool }) => {
    const { t } = useTranslation();

    const isMobile = useIsSmallScreen();

    return (
      <RowOrColumn
        isRow={!isMobile}
        p={4}
        expand
        crossAxisAlignment="flex-start"
        mainAxisAlignment="space-between"
      >
        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment={isMobile ? "center" : "flex-start"}
          expand
          textAlign={isMobile ? "center" : "left"}
        >
          <Heading size="md">
            {tranchePool} {t("Pool")}
          </Heading>
          <Text mt={2}>
            {t("Deposits are locked until the end of each 2 week epoch.")}
          </Text>
          <Text mt={3}>
            <i>{t("SFI staking is required to enter the A tranche!")}</i>
          </Text>
        </Column>

        <TrancheColumn
          tranchePool={tranchePool}
          trancheRating={TrancheRating.S}
        />

        {isMobile ? null : (
          <Box
            width="100%"
            height="100%"
            style={{
              opacity: tranchePool !== "USDC" ? "0.3" : "1",
              pointerEvents: "none",
            }}
          >
            <TrancheColumn
              tranchePool={tranchePool}
              trancheRating={TrancheRating.AA}
            />
          </Box>
        )}

        <TrancheColumn
          tranchePool={tranchePool}
          trancheRating={TrancheRating.A}
        />
      </RowOrColumn>
    );
  }
);

export const TrancheColumn = React.memo(
  ({
    tranchePool,
    trancheRating,
  }: {
    tranchePool: TranchePool;
    trancheRating: TrancheRating;
  }) => {
    const { t } = useTranslation();
    const isMobile = useIsSmallScreen();

    const { rari, address } = useRari();
    const { saffronData, saffronPool, fetchCurrentEpoch } = useSaffronData();

    const { data: principal } = useQuery(
      tranchePool + trancheRating + " principal " + address,
      async () => {
        //TODO: ADD USDC POOL

        const currentEpoch = await fetchCurrentEpoch();

        const tranchePToken = new rari.web3.eth.Contract(
          ERC20ABI as any,
          await saffronPool.methods
            .principal_token_addresses(
              currentEpoch,
              trancheRatingIndex(trancheRating)
            )
            .call()
        );

        return smallUsdFormatter(
          parseInt(await tranchePToken.methods.balanceOf(address).call()) / 1e18
        ).replace("$", "");
      }
    );

    const {
      isOpen: isDepositModalOpen,
      onOpen: openDepositModal,
      onClose: closeDepositModal,
    } = useDisclosure();

    return (
      <>
        <DepositModal
          trancheRating={trancheRating}
          tranchePool={tranchePool}
          isOpen={isDepositModalOpen}
          onClose={closeDepositModal}
        />

        <Column
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          expand
          ml={isMobile ? 0 : 4}
          mt={isMobile ? 8 : 0}
        >
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Heading size="sm">
              {trancheRating} {t("Tranche")}
            </Heading>
            <Text textAlign="center" mt={4}>
              {principal ?? "?"} {tranchePool}
            </Text>
            <Text textAlign="center" fontWeight="bold" mt={4}>
              {trancheRating === "AA"
                ? // TODO REMOVE HARDCODED CHECK ABOUT AA TRANCHE ONCE IT'S IMPLEMENTED
                  "0.45%"
                : saffronData
                ? saffronData.pools[tranchePoolIndex(tranchePool)].tranches[
                    trancheRating
                  ]["total-apy"] + "%"
                : "?%"}
            </Text>
          </Column>

          <DashboardBox
            onClick={openDepositModal}
            mt={DASHBOARD_BOX_SPACING.asPxString()}
            as="button"
            height="45px"
            width={isMobile ? "100%" : "85%"}
            borderRadius="7px"
            fontSize="xl"
            fontWeight="bold"
          >
            <Center expand>
              <Icon as={MdSwapHoriz} boxSize="30px" />
            </Center>
          </DashboardBox>
        </Column>
      </>
    );
  }
);

export const RedemptionDate = React.memo(() => {
  const { t } = useTranslation();

  const { saffronPool, fetchCurrentEpoch } = useSaffronData();

  const { data } = useQuery("epochEndDate", async () => {
    const currentEpoch = await fetchCurrentEpoch();

    const endDate = new Date(
      (await saffronPool.methods.get_epoch_end(currentEpoch).call()) * 1000
    );

    return { currentEpoch, endDate };
  });

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading size="sm">
        {t("Epoch {{epoch}} Redemption Date", {
          epoch: data?.currentEpoch ?? "?",
        })}
      </Heading>
      <Text>{data ? data.endDate.toDateString() : "?"}</Text>
      <Text fontSize="14px">
        {data ? data.endDate.toLocaleTimeString() : "?"}
      </Text>
    </Column>
  );
});

export const InterestEarned = React.memo(() => {
  const { t } = useTranslation();

  const { rari, address } = useRari();
  const { saffronPool, saffronStrategy, fetchCurrentEpoch } = useSaffronData();

  const { data: principal } = useQuery(
    "principalBalance " + address,
    async () => {
      const currentEpoch = await fetchCurrentEpoch();

      const sTranchePToken = new rari.web3.eth.Contract(
        ERC20ABI as any,
        await saffronPool.methods
          .principal_token_addresses(currentEpoch, 0)
          .call()
      );

      const aTranchePToken = new rari.web3.eth.Contract(
        ERC20ABI as any,
        await saffronPool.methods
          .principal_token_addresses(currentEpoch, 2)
          .call()
      );

      return smallStringUsdFormatter(
        rari.web3.utils.fromWei(
          rari.web3.utils
            .toBN(await sTranchePToken.methods.balanceOf(address).call())
            .add(
              rari.web3.utils.toBN(
                await aTranchePToken.methods.balanceOf(address).call()
              )
            )
        )
      );
    }
  );

  const { data: sfiEarned } = useQuery("sfiEarned " + address, async () => {
    // TODO: ADD USDC

    const DAI_SFI_REWARDS = await saffronStrategy.methods
      .pool_SFI_rewards(tranchePoolIndex(TranchePool.DAI))
      .call();

    const SFI_multipliers = await saffronPool.methods
      .TRANCHE_SFI_MULTIPLIER()
      .call();

    const currentEpoch = await fetchCurrentEpoch();

    const dsecSToken = new rari.web3.eth.Contract(
      ERC20ABI as any,
      await saffronPool.methods
        .principal_token_addresses(
          currentEpoch,
          trancheRatingIndex(TrancheRating.S)
        )
        .call()
    );

    // TODO ADD AA POOL

    const dsecSSupply = await dsecSToken.methods.totalSupply().call();

    const sPoolSFIEarned =
      DAI_SFI_REWARDS *
      (SFI_multipliers[trancheRatingIndex(TrancheRating.S)] / 100000) *
      // If supply is zero we will get NaN for dividing by zero
      (dsecSSupply === "0"
        ? 0
        : (await dsecSToken.methods.balanceOf(address).call()) / dsecSSupply);

    const dsecAToken = new rari.web3.eth.Contract(
      ERC20ABI as any,
      await saffronPool.methods
        .principal_token_addresses(
          currentEpoch,
          trancheRatingIndex(TrancheRating.A)
        )
        .call()
    );

    const dsecASupply = await dsecAToken.methods.totalSupply().call();

    const aPoolSFIEarned =
      DAI_SFI_REWARDS *
      (SFI_multipliers[trancheRatingIndex(TrancheRating.A)] / 100000) *
      // If supply is zero we will get NaN for dividing by zero
      (dsecASupply === "0"
        ? 0
        : (await dsecAToken.methods.balanceOf(address).call()) / dsecASupply);

    return (
      smallUsdFormatter(sPoolSFIEarned + aPoolSFIEarned).replace("$", "") +
      " SFI"
    );
  });

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading lineHeight={1.4} fontSize="18px">
        {t("Principal Amount")}
      </Heading>
      <Text>{principal ?? "$?"}</Text>

      <Heading lineHeight={1.4} fontSize="18px" mt={10}>
        {t("Estimated SFI Earned")}
      </Heading>
      <Text>{sfiEarned ?? "? SFI"}</Text>
    </Column>
  );
});

export const EstimatedReturns = React.memo(() => {
  const { t } = useTranslation();

  const { saffronData } = useSaffronData();

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Image
        mt={2}
        boxSize="90px"
        src="https://assets.coingecko.com/coins/images/13117/large/sfi_red_250px.png?1606020144"
      />

      <Heading size="sm" mt={3}>
        {t("Current SFI Price")}
      </Heading>
      <Text>{saffronData ? "$" + saffronData.SFI.USD : "$?"}</Text>
    </Column>
  );
});

export const SFIDistributions = React.memo(() => {
  const { t } = useTranslation();

  const { address } = useRari();
  const { saffronStrategy } = useSaffronData();

  const { data: sfiRewards } = useQuery("sfiRewards " + address, async () => {
    const DAI = await saffronStrategy.methods
      .pool_SFI_rewards(tranchePoolIndex(TranchePool.DAI))
      .call();

    const USDC = await saffronStrategy.methods
      .pool_SFI_rewards(tranchePoolIndex(TranchePool.USDC))
      .call();

    return { DAI, USDC };
  });

  // TODO: ADD USDC
  return (
    <Column mainAxisAlignment="center" crossAxisAlignment="center" expand>
      <Heading size="sm">{t("SFI Pool Distributions")}</Heading>

      <Row
        width="100%"
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-start"
        mt={4}
      >
        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">{t("Pool")}</Text>
          <Text>DAI</Text>
        </Column>

        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">{t("Tranche")}</Text>
          <Text>S + A</Text>
        </Column>

        <Column
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <Text fontWeight="bold">SFI</Text>
          <Text>{sfiRewards ? sfiRewards.DAI : "?"}</Text>
        </Column>
      </Row>

      <Link mt={4} isExternal href="https://app.saffron.finance/#dashboard">
        <u>{t("Learn More")}</u>
      </Link>
    </Column>
  );
});

const useIsSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1030;
};
