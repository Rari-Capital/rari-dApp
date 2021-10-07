import { motion } from "framer-motion";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Heading,
  Image,
  Button,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { Column, Row } from "utils/chakraUtils";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useRari } from "../../context/RariContext";

import { GlowingButton } from "./GlowingButton";
import { ModalDivider, ModalTitleWithCloseButton, MODAL_PROPS } from "./Modal";

import {
  UnclaimedReward,
  useUnclaimedFuseRewards,
} from "hooks/rewards/useUnclaimedFuseRewards";
import DashboardBox from "./DashboardBox";
import {
  TokenData,
  useTokenData,
  useTokensDataAsMap,
} from "hooks/useTokenData";
import { createRewardsDistributor } from "utils/createComptroller";
import { useClaimable } from "hooks/rewards/useClaimable";
import { claimRewardsFromRewardsDistributors } from "utils/rewards";
import { SimpleTooltip } from "./SimpleTooltip";

import { useQueryClient } from "react-query";


export type ClaimMode = "pool2" | "private" | "yieldagg" | "fuse";

const RGT = "0xd291e7a03283640fdc51b121ac401383a46cc623";

export const ClaimRGTModal = ({
  isOpen,
  onClose,
  defaultMode,
}: {
  isOpen: boolean;
  onClose: () => any;
  defaultMode?: ClaimMode;
}) => {
  const { t } = useTranslation();

  const [amount, setAmount] = useState(0);

  const { fuse } = useRari();

  // pool2
  // private
  // yieldagg
  const [showPrivate, setShowPrivate] = useState<boolean>(true);

  // If user presses meta key or control key + slash they will toggle the private allocation claim mode.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "Slash") {
        e.preventDefault();
        setShowPrivate(true);
      }
    };

    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent {...MODAL_PROPS}>
        <ModalTitleWithCloseButton
          text={t("Claim Rewards")}
          onClose={onClose}
        />

        <ModalDivider />

        <Column
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          p={3}
        >
          <ClaimRewards showPrivate={showPrivate} />
        </Column>
      </ModalContent>
    </Modal>
  );
};

// List of rewards to claim
const ClaimRewards = ({ showPrivate }: { showPrivate: boolean }) => {
  const { fuse, address } = useRari();
  const { t } = useTranslation();

  const {
    rewardsDistributorsMap,
    unclaimed: unclaimedFuseRewards,
    rewardTokensMap,
  } = useUnclaimedFuseRewards();

  const { allClaimable, allRewardsTokens } = useClaimable(showPrivate);
  const toast = useToast();

  const [claimingAll, setClaimingAll] = useState(false);
  const [claimingToken, setClaimingToken] = useState<string | undefined>();

  const rewardTokensData = useTokensDataAsMap(allRewardsTokens);

  console.log({ allClaimable, rewardTokensData });

  const queryClient = useQueryClient();

  // Claims all Fuse LM rewards at once
  const handleClaimAll = useCallback(() => {
    setClaimingAll(true);

    // Claim from ALL available RDs
    claimRewardsFromRewardsDistributors(
      fuse,
      address,
      Object.keys(rewardsDistributorsMap)
    )
      .then(() => {
        queryClient.refetchQueries()
        setClaimingAll(false);
        toast({
          title: "Claimed All Rewards!",
          description: "",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch((err) => {
        setClaimingAll(false);
        toast({
          title: "Error claiming rewards.",
          description: err.message,
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });
      });
  }, [fuse, address, rewardsDistributorsMap]);

  // Claims Fuse LM rewards for a single token
  const handleClaimFuseRewardsForToken = useCallback(
    (rewardToken: string) => {
      const rDs = rewardTokensMap[rewardToken];
      const rDAddresses = rDs.map((rD) => rD.rewardsDistributorAddress); // all rewardsdistributors for this token
      if (!!rDs.length) {
        setClaimingToken(rewardToken);
        claimRewardsFromRewardsDistributors(fuse, address, rDAddresses)
          .then(() => {
            setClaimingToken(undefined);
            toast({
              title: `Claimed All ${rewardTokensData[rewardToken].symbol} Rewards!`,
              description: "",
              status: "success",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
          })
          .catch((err) => {
            setClaimingToken(undefined);
            toast({
              title: "Error claiming rewards.",
              description: err.message,
              status: "error",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
          });
      }
    },
    [unclaimedFuseRewards, rewardsDistributorsMap, rewardTokensMap]
  );

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      expand
      p={3}
    >
      {allClaimable.length ? (
        allClaimable.map((claimable) => {
          const pools =
            rewardTokensMap[claimable.unclaimed.rewardToken]?.reduce(
              (agg: number[], rD) => {
                return [...new Set([...agg, ...rD.pools])];
              },
              []
            ) ?? [];
          return (
            <ClaimableRow
              handleClaimFuseRewardsForToken={handleClaimFuseRewardsForToken}
              unclaimed={claimable.unclaimed}
              rewardTokenData={
                rewardTokensData[claimable.unclaimed.rewardToken]
              }
              mode={claimable.mode}
              claimingToken={claimingToken}
              pools={pools}
              my={1}
            />
          );
        })
      ) : (
        <Heading textAlign="center" size="md">
          No Claimable Rewards.
        </Heading>
      )}
      {!!allClaimable.length && (
        <GlowingButton
          onClick={() => handleClaimAll()}
          disabled={claimingAll}
          width="100%"
          height="51px"
          my={4}
        >
          {claimingAll ? <Spinner /> : t("Claim All")}
        </GlowingButton>
      )}
    </Column>
  );
};

const ClaimableRow = ({
  unclaimed,
  handleClaimFuseRewardsForToken,
  rewardTokenData,
  claimingToken,
  mode,
  pools = [],
  ...rowProps
}: {
  unclaimed: UnclaimedReward;
  handleClaimFuseRewardsForToken?: (rewardToken: string) => void;
  rewardTokenData: TokenData;
  claimingToken?: string;
  mode: ClaimMode;
  pools?: number[];
  [x: string]: any;
}) => {
  const { rari, address } = useRari();

  const isClaimingToken = claimingToken === unclaimed.rewardToken;

  const claimRewards = async () => {
    let claimMethod;

    // Old "claim RGT" code
    if (mode !== "fuse") {
      switch (mode) {
        case "private":
          claimMethod = rari.governance.rgt.vesting.claim;
          break;
        case "yieldagg":
          claimMethod = rari.governance.rgt.distributions.claim;
          break;
        case "pool2":
          claimMethod = rari.governance.rgt.sushiSwapDistributions.claim;
          break;
        default:
          claimMethod = rari.governance.rgt.sushiSwapDistributions.claim;
      }

      console.log({ mode, claimMethod });

      // Could do something with the receipt but notify.js is watching the account and will send a notification for us.
      await claimMethod(rari.web3.utils.toBN(unclaimed.unclaimed), {
        from: address,
      });
      return;
    }

    // If claiming fuse rewards
    if (mode === "fuse" && !!handleClaimFuseRewardsForToken) {
      handleClaimFuseRewardsForToken(unclaimed.rewardToken);
    }
  };

  const unclaimedAmount =
    parseFloat(unclaimed.unclaimed.toString()) /
    (1 * 10 ** (rewardTokenData?.decimals ?? 18));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ width: "100%", height: "100%" }}
    >
      <DashboardBox w="100%" h="100%" {...rowProps}>
        <Row
          expand
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          p={3}
        >
          {/* Token and Pools */}
          <Column
            expand
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            py={2}
          >
            <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
              <Image src={rewardTokenData?.logoURL ?? ""} boxSize="30px" />{" "}
              <Text fontWeight="bold" ml={3}>
                {rewardTokenData?.symbol}{" "}
              </Text>{" "}
            </Row>
            {!!pools.length && (
              <Row
                expand
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                px={6}
                py={4}
                // bg="aqua"
              >
                <ul>
                  {pools.map((p) => (
                    <>
                      <motion.li
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <Text>Pool {p}</Text>
                      </motion.li>
                    </>
                  ))}
                </ul>
              </Row>
            )}
            {mode === "pool2" ? (
              <Row
                expand
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                px={6}
                py={2}
                // bg="aqua"
              >
                <ul>
                  <motion.li
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Text>Pool 2 Rewards</Text>
                  </motion.li>
                </ul>
              </Row>
            ) : null}
          </Column>
          {/* Reward amt and claim btn */}
          <Column
            expand
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            h="100%"
          >
            <Row
              mainAxisAlignment="flex-start"
              crossAxisAlignment="center"
              // bg="pink"
              h="100%"
            >
              <SimpleTooltip
                label={`${unclaimedAmount.toString()} ${
                  rewardTokenData?.symbol
                }`}
              >
                <Text fontWeight="bold" ml={3}>
                  {unclaimedAmount.toFixed(3)} {rewardTokenData?.symbol}
                </Text>
              </SimpleTooltip>
              <Button
                ml={2}
                bg="black"
                onClick={() => claimRewards()}
                disabled={isClaimingToken}
              >
                {isClaimingToken ? <Spinner /> : "Claim"}
              </Button>
            </Row>
          </Column>
        </Row>
      </DashboardBox>
    </motion.div>
  );
};
