import {
  useInterval,
  useDisclosure,
  Heading,
  Link,
  Spinner,
  Text,
  Box,
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
        redeemable: true,
        token_ids: [1, 2],
        token_amounts: [10, 20]
    },
    {
        pool_id: 2,
        pool_name: "Pool 2",
        pool_share_percent: 5,
        redeemable: false,
        token_ids: [1],
        token_amounts: [10]
    },
    {
        pool_id: 3,
        pool_name: "Pool 3",
        pool_share_percent: 70,
        redeemable: true,
        token_ids: [1, 2, 3, 4],
        token_amounts: [10, 20, 30, 40]
    },
    {
        pool_id: 4,
        pool_name: "Pool 4",
        pool_share_percent: 50,
        redeemable: true,
        token_ids: [1, 2, 3 ],
        token_amounts: [10, 20, 30 ]
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
          <DashboardBox width="100%">
            <Column
              expand
              mainAxisAlignment="center"
              crossAxisAlignment={isMobile ? "center" : "flex-start"}
              textAlign="center"
              p={4}
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
    const [clickOpen, setClickOpen] = useState(false);
    const isMobile = useIsSmallScreen();
    const { t } = useTranslation();

    return (
        <DashboardBox
                height={isMobile ? "auto" : "100%"}
                width={isMobile ? "100%" : "100%"}
                onClick={() => setClickOpen(!clickOpen)}
                onMouseOver={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                cursor="pointer"
                p={4}
                my={4}
            >
              <Column
                mainAxisAlignment="flex-end"
                crossAxisAlignment={isMobile ? "center" : "flex-end"}
                flexShrink={0}
                pb={4}
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
                    my={"auto"}
                >
                    <svg xmlns="//www.w3.org/2000/svg" version="1.1" className="svg-filters" style={{display: "none"}}>
                      <defs>
                        <filter id="marker-shape">
                          <feTurbulence type="fractalNoise" baseFrequency="0 0.15" numOctaves="1" result="warp" />
                          <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30" in="SourceGraphic" in2="warp" />
                        </filter>
                      </defs>
                    </svg>
                      <Text my={"auto"} height={"1em"} width={"fit-content"} py={0} pr={6} textAlign={isMobile ? "center" : "left"}>
                          <Link
                              textDecoration={"none"}
                              isExternal={false}
                              href={`/fuse/pool/${reward.pool_id}`} // * If external preferred, prepend ${window.location.origin}
                          >
                            <div style={{
                              content: "",
                              backgroundColor: "#d6232a",
                              width: "130%",
                              height: "1.2em",
                              position: "relative",
                              zIndex: 0,
                              filter: "url(#marker-shape)",
                              left: "-0.25em",
                              top: "0.1em",
                              padding: "0 0.25em",
                              WebkitFontSmoothing: "subpixel-antialiased"
                            }}></div>
                            <p style={{height: "1em", position: "relative", fontWeight: "bold", top: "-20px", left: "5px"}}>{t(text)}</p>
                          </Link>{" "}
                      </Text>
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
                      <Box
                        pr={2}
                      >
                        <GlowingButton
                            mt={1}
                            label={t("Claim Pool NFTs")}
                            fontSize="l"
                            disabled={!(reward.redeemable)}
                            onClick={claimNFTs}
                            width="100%"
                            height="30px"
                        />
                      </Box>
                        {open || clickOpen ? (<FaAngleUp size={25} />) :
                        (<FaAngleDown size={25} />)}
                    </Row>
                </Column>
            </RowOrColumn>
            </Column>
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment={isMobile ? "center" : "flex-start"}
              flexShrink={0}
              transition={"0.2s ease-out"}
              visibility={open || clickOpen ? "visible" : "hidden"}
              display={open || clickOpen ? "initial" : "none"}
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
                    <Text width={"fit-content"} py={0} pr={2} textAlign={isMobile ? "center" : "left"}>
                        {t("Pool TVL Percent:")}{" "}
                    </Text>
                  </Column>
                  <Column
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment={isMobile ? "center" : "flex-start"}
                      py={0}
                      pr={2}
                      width={"auto"}
                      flexShrink={0}
                  >
                      <ProgressBar colorShift={true} fillColor="blue" percent={reward.pool_share_percent} />
                  </Column>
                  <Column
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment={isMobile ? "center" : "flex-start"}
                      width={"auto"}
                      flexShrink={0}
                  >
                    <Text width={"fit-content"} textAlign={isMobile ? "center" : "left"}>
                            {t(reward.pool_share_percent + "%")}{" "}
                        </Text>
                  </Column>
              </RowOrColumn>
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
                    <Text width={"fit-content"} py={0} textAlign={isMobile ? "center" : "left"}>
                        {t("Tokens available to claim:")}{" "}
                        {reward.token_amounts.reduce((total: number, num: number) => total + num, 0)}
                    </Text>
                  </Column>
              </RowOrColumn>
            </Column>
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
