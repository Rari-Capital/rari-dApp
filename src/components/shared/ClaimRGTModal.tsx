import { InfoIcon } from "@chakra-ui/icons";
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
import { claimAllRewards } from "utils/rewards";

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
    rewardTokensMap,
    unclaimed: unclaimedFuseRewards,
  } = useUnclaimedFuseRewards();

  const { allClaimable } = useClaimable(showPrivate);
  const toast = useToast();

  const [claimingAll, setClaimingAll] = useState(false);
  const [claimingToken, setClaimingToken] = useState<string | undefined>();

  const rewardTokensData = useTokensDataAsMap(Object.keys(rewardTokensMap));

  console.log({ rewardTokensData });

  const handleClaimAll = useCallback(() => {
    setClaimingAll(true);
    claimAllRewards(fuse, address, Object.keys(rewardsDistributorsMap))
      .then(() => {
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

  // Claims Fuse LM rewards
  const handleClaimFuseRewardsForToken = useCallback(
    (rewardToken: string) => {
      const rDs = rewardTokensMap[rewardToken];
      const rDAddresses = rDs.map((rD) => rD.rewardsDistributorAddress);
      if (!!rDs.length) {
        setClaimingToken(rewardToken);
        claimAllRewards(fuse, address, rDAddresses)
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
          return (
            <ClaimableRow
              handleClaimFuseRewardsForToken={handleClaimFuseRewardsForToken}
              unclaimed={claimable.unclaimed}
              rewardTokenData={
                rewardTokensData[claimable.unclaimed.rewardToken]
              }
              mode={claimable.mode}
              claimingToken={claimingToken}
              my={1}
            />
          );
        })
      ) : (
        <Heading>No Claimable Rewards.</Heading>
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
  ...rowProps
}: {
  unclaimed: UnclaimedReward;
  handleClaimFuseRewardsForToken?: (rewardToken: string) => void;
  rewardTokenData: TokenData;
  claimingToken?: string;
  mode: ClaimMode;
  [x: string]: any;
}) => {
  const { rari, address } = useRari();

  const isClaimingToken = claimingToken === unclaimed.rewardToken;

  const claimRewards = () => {
    // Old "claim RGT" code
    if (mode !== "fuse") {
      const claimMethod =
        mode === "private"
          ? rari.governance.rgt.vesting.claim
          : mode === "yieldagg"
          ? rari.governance.rgt.distributions.claim
          : rari.governance.rgt.sushiSwapDistributions.claim;

      // Could do something with the receipt but notify.js is watching the account and will send a notification for us.
      claimMethod(
        rari.web3.utils.toBN(
          //@ts-ignore
          new BigNumber(amount).multipliedBy(1e18).decimalPlaces(0)
        ),
        { from: address }
      );
      return;
    }

    // If claiming fuse rewards
    console.log({ handleClaimFuseRewardsForToken });
    if (mode === "fuse" && !!handleClaimFuseRewardsForToken) {
      handleClaimFuseRewardsForToken(unclaimed.rewardToken);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ width: "100%" }}
    >
      <DashboardBox w="100%" h="50px" {...rowProps}>
        <Row
          expand
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          p={3}
        >
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Image src={rewardTokenData?.logoURL ?? ""} boxSize="30px" />
            <Text fontWeight="bold" ml={3}>
              {rewardTokenData?.symbol}
            </Text>
          </Row>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text fontWeight="bold" ml={3}>
              {(
                parseFloat(unclaimed.unclaimed.toString()) /
                (1 * 10 ** (rewardTokenData?.decimals ?? 18))
              ).toFixed(3)}{" "}
              {rewardTokenData?.symbol}
            </Text>
            <Button
              ml={2}
              bg="black"
              onClick={() => claimRewards()}
              disabled={isClaimingToken}
            >
              {isClaimingToken ? <Spinner /> : "Claim"}
            </Button>
          </Row>
        </Row>
      </DashboardBox>
    </motion.div>
  );
};
