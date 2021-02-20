import {
  useInterval,
  useDisclosure,
  Heading,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Center, RowOrColumn, Column, Row } from "buttered-chakra";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRari } from "../../../context/RariContext";
import { smallUsdFormatter } from "../../../utils/bigUtils";
import { ClaimRGTModal } from "../../shared/ClaimRGTModal";
import CopyrightSpacer from "../../shared/CopyrightSpacer";
import DashboardBox from "../../shared/DashboardBox";
import ForceAuthModal from "../../shared/ForceAuthModal";
import { Header } from "../../shared/Header";
import { useQuery } from "react-query";
import FaucetModal from "./FaucetModal";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
// @ts-ignore
import ProgressBar from 'react-percent-bar';
import { ModalTitleWithCloseButton } from "../../shared/Modal";
import { GlowingButton } from "../../shared/GlowingButton";

// TODO: Actually fetch these
let rewards = [
    {
        pool_id: 1,
        pool_name: "Pool 1",
        pool_share_percent: 20,
        redeemable: true
    },
    {
        pool_id: 2,
        pool_name: "Pool 2",
        pool_share_percent: 5,
        redeemable: false
    },
    {
        pool_id: 3,
        pool_name: "Pool 3",
        pool_share_percent: 70,
        redeemable: true
    },
    {
        pool_id: 4,
        pool_name: "Pool 4",
        pool_share_percent: 50,
        redeemable: true
    }
]


const FaucetPage = () => {
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
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />

        <Column
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
        >
          <DashboardBox height={isMobile ? "110px" : "95px"} width="100%">
            <Column
              expand
              mainAxisAlignment="center"
              crossAxisAlignment={isMobile ? "center" : "flex-start"}
              textAlign="center"
              px={4}
            >
                <Heading size="lg">{t("Faucet Rewards - Redeemable NFTs for Liquidity Providing")}</Heading>

                <div>
                    {t(
                        "Earn redeemable NFT tokens for providing liquidity in Rari Pools and Fuse Pools!"
                    )}
                </div>
                <div>
                    {t(
                        "Use these NFT tokens to govern, set pool NFT URIs, and much, much more!"
                    )}
                </div>
            </Column>
          </DashboardBox>

          <RowOrColumn
            mt={4}
            isRow={!isMobile}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            width="100%"
            height={isMobile ? "auto" : "100%"}
          >
            <DashboardBox
              height={isMobile ? "auto" : "100%"}
              width={isMobile ? "100%" : "100%"}
              p={4}
            >
              <RowOrColumn
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                height="100%"
                width="100%"
                isRow={!isMobile}
              >
                <Column
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment={isMobile ? "center" : "flex-start"}
                    width={"100%"}
                    height={"100%"}
                >
                    <Heading fontSize="25px">{t("NFT Pool Rewards")} </Heading>

                    <Column
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment={isMobile ? "center" : "flex-start"}
                    width={"100%"}
                    height={"100%"}
                    overflowY="scroll"
                    >
                        {rewards.map((reward) => {
                            return (<ExpandingModal text={reward.pool_name} description={""} reward={reward} />)
                        })}
                    </Column>
                </Column>

                
              </RowOrColumn>
            </DashboardBox>
          </RowOrColumn>
        </Column>
      </Column>
      <CopyrightSpacer forceShow={isMobile} />
    </>
  );
};

const claimNFTs = () => {

}


const ExpandingModal = ({ text, description, reward }: { text: string, description: string, reward: any }) => {
    const [open, setOpen] = useState(false);
    const isMobile = useIsSmallScreen();
    const { t } = useTranslation();

    return (
        <DashboardBox
                height={isMobile ? "auto" : "100%"}
                width={isMobile ? "100%" : "100%"}
                onClick={() => setOpen(!open)}
                cursor="pointer"
                p={4}
                my={4}
            >
                <RowOrColumn
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"
                height="100%"
                width="100%"
                isRow={!isMobile}
            >
                <Column
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment={isMobile ? "center" : "flex-start"}
                    width={"auto"}
                    flexShrink={0}
                >
                    <Text textAlign={isMobile ? "center" : "left"}>
                        {t(text)}{" "}
                    </Text>
                    {open ? (
                        <Row
                            mainAxisAlignment="flex-end"
                            crossAxisAlignment={isMobile ? "center" : "flex-end"}
                        >
                            <Text p={"0 0.5rem 0 0"} textAlign={isMobile ? "center" : "left"}>
                                {t(description)}{" "}
                                <Link
                                    isExternal
                                    // TODO: Define the pool link
                                    href={"Pool link"}
                                >
                                    <u>{t(reward.pool_name)}</u>
                                </Link>{" "}
                            </Text>
                            <Column
                                mainAxisAlignment="flex-end"
                                crossAxisAlignment={isMobile ? "center" : "flex-end"}
                                p={"0 0.5rem 0 0 "}
                                flexShrink={0}
                            >
                                <ProgressBar colorShift={true} fillColor="blue" percent={reward.pool_share_percent} />
                            </Column>
                            <Text textAlign={isMobile ? "center" : "left"}>
                                {t(reward.pool_share_percent + "%")}{" "}
                            </Text>
                        </Row>
                    ) : ('')}
                </Column>
                <Column
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment={isMobile ? "center" : "flex-end"}
                    m={"auto 0 auto auto"}
                    flexShrink={0}
                >
                    <Row
                        mainAxisAlignment="flex-end"
                        crossAxisAlignment={isMobile ? "center" : "flex-end"}
                    >
                        <GlowingButton
                            mt={1}
                            label={t("Claim Pool NFTs")}
                            fontSize="xl"
                            disabled={(reward.redeemable)}
                            onClick={claimNFTs}
                            width="100%"
                            height="20px"
                        />
                        {open ? (<FaAngleUp size={25} />) :
                        (<FaAngleDown size={25} />)}
                    </Row>
                </Column>
            </RowOrColumn>
        </DashboardBox>
    );
}

export const TotalStaked = () => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const { data: totalStaked } = useQuery("pool2TotalStaked", async () => {
    return parseFloat(
      rari.web3.utils.fromWei(
        await rari.governance.rgt.sushiSwapDistributions.totalStakedUsd()
      )
    );
  });

    return (
        <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
            <Heading mb={1} size="sm">
                {t("Total Staked (USD)")}
            </Heading>
            <Text>{totalStaked ? smallUsdFormatter(totalStaked) : "?"}</Text>
        </Column>
    );
};

const startDate = Date.parse("22 Feb 2021 00:10:00 PST");
// 3 years = 9.461e+10
const endDate = startDate + 9.461e10;

export const StartAndEnd = () => {
  const { t } = useTranslation();

  const { rari } = useRari();

  const { data: hasStarted } = useQuery(
    "hasSushiswapRewardsStarted",
    async () => {
      const block = await rari.web3.eth.getBlockNumber();

      const startingBlock =
        rari.governance.rgt.sushiSwapDistributions.DISTRIBUTION_START_BLOCK;

      return block >= startingBlock;
    }
  );

  return (
    <Column expand mainAxisAlignment="center" crossAxisAlignment="center">
      <Heading mb={1} size="sm">
        {hasStarted ? t("Bonus Rewards End") : t("Bonus Rewards Begin")}
      </Heading>
      {hasStarted !== undefined ? (
        <Countdown endDate={hasStarted ? endDate : startDate} />
      ) : (
        <Spinner m={2} />
      )}
    </Column>
  );
};

const Countdown = ({ endDate }: { endDate: number }) => {
  const [msLeft, setMsLeft] = useState(endDate - Date.now());

  const seconds = Math.floor((msLeft / 1000) % 60);
  const minutes = Math.floor((msLeft / 1000 / 60) % 60);
  const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));

  useInterval(() => {
    setMsLeft(endDate - Date.now());
  }, 1000);

  return (
    <Text>
      <b>{days}</b> days&nbsp; <b>{hours}</b> hrs&nbsp; <b>{minutes}</b>{" "}
      min.&nbsp; <b>{seconds}</b> sec
    </Text>
  );
};


export default FaucetPage;
