import { InfoIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Image,
  Button,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { Column, Row } from "utils/chakraUtils";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

import { useRari } from "../../context/RariContext";

import { GlowingButton } from "./GlowingButton";
import { AnimatedSmallLogo } from "./Logos";
import { ModalDivider, ModalTitleWithCloseButton, MODAL_PROPS } from "./Modal";

import { SimpleTooltip } from "./SimpleTooltip";
import { useUnclaimedRewards } from "hooks/rewards/useUnclaimedRewards";
import DashboardBox from "./DashboardBox";
import { BN } from "utils/bigUtils";
import { useTokenData } from "hooks/useTokenData";
import { createRewardsDistributor } from "utils/createComptroller";

type ClaimMode = "pool2" | "private" | "yieldagg" | "fuse";

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

  const { address, rari } = useRari();

  const [amount, setAmount] = useState(0);

  const { data: unclaimed } = useQuery(address + " unclaimed RGT", async () => {
    return parseFloat(
      rari.web3.utils.fromWei(
        await rari.governance.rgt.distributions.getUnclaimed(address)
      )
    );
  });

  const { data: privateUnclaimed } = useQuery(
    address + " privateUnclaimed RGT",
    async () => {
      return parseFloat(
        rari.web3.utils.fromWei(
          await rari.governance.rgt.vesting.getUnclaimed(address)
        )
      );
    }
  );

  const { data: pool2Unclaimed } = useQuery(
    address + " pool2Unclaimed RGT",
    async () => {
      return parseFloat(
        rari.web3.utils.fromWei(
          await rari.governance.rgt.sushiSwapDistributions.getUnclaimed(address)
        )
      );
    }
  );

  // pool2
  // private
  // yieldagg
  const [mode, setMode] = useState<ClaimMode>(defaultMode ?? "pool2");

  const currentUnclaimed =
    mode === "pool2"
      ? pool2Unclaimed
      : mode === "private"
      ? privateUnclaimed
      : unclaimed;

  useEffect(() => {
    if (currentUnclaimed !== undefined) {
      setAmount(Math.floor(currentUnclaimed * 1000000) / 1000000);
    }
  }, [currentUnclaimed]);

  const claimRGT = () => {
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
  };

  // const { data: claimFee } = useQuery("claimFee", async () => {
  //   const blockNumber = await rari.web3.eth.getBlockNumber();
  //   const raw = rari.governance.rgt.distributions.getClaimFee(blockNumber);

  //   return (parseFloat(rari.web3.utils.fromWei(raw)) * 100).toFixed(2);
  // });

  // If user presses meta key or control key + slash they will toggle the private allocation claim mode.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "Slash") {
        e.preventDefault();
        setMode("private");
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
        <ModalTitleWithCloseButton text={t("Claim RGT")} onClose={onClose} />

        <ModalDivider />

        <Column
          width="100%"
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          p={4}
        >
          <Select
            size="md"
            mb={6}
            value={mode}
            onChange={(event) => setMode(event.target.value as ClaimMode)}
          >
            <option value="pool2" className="black-bg-option">
              {t("Pool2 Rewards")}
            </option>
            <option value="yieldagg" className="black-bg-option">
              {t("Yield Aggregator Rewards")}
            </option>
            <option value="fuse" className="black-bg-option">
              {t("Fuse Liquidity Mining Rewards")}
            </option>
            {mode === "private" ? (
              <option value="private" className="black-bg-option">
                {t("Private RGT")}
              </option>
            ) : null}
          </Select>

          {mode !== "fuse" ? (
            <ClaimRGT
              mode={mode}
              currentUnclaimed={currentUnclaimed}
              amount={amount}
              setAmount={setAmount}
            />
          ) : (
            <ClaimFuseRewards />
          )}

          {mode !== "fuse" && (
            <GlowingButton
              mt={3}
              label={t("Claim RGT")}
              fontSize="2xl"
              disabled={amount <= 0 || amount > (currentUnclaimed ?? 0)}
              onClick={claimRGT}
              width="100%"
              height="60px"
            />
          )}
        </Column>
      </ModalContent>
    </Modal>
  );
};

const ClaimRGT = ({
  mode,
  currentUnclaimed,
  amount,
  setAmount,
}: {
  mode: ClaimMode;
  currentUnclaimed?: number;
  amount: any;
  setAmount: (x: any) => any;
}) => {
  const { rari } = useRari();
  const { t } = useTranslation();

  const { data: privateClaimFee } = useQuery("privateClaimFee", async () => {
    const raw = rari.governance.rgt.vesting.getClaimFee(
      Math.floor(Date.now() / 1000)
    );

    return (parseFloat(rari.web3.utils.fromWei(raw)) * 100).toFixed(2);
  });

  return (
    <>
      <AnimatedSmallLogo boxSize="50px" />
      <Heading mt={4}>
        {currentUnclaimed !== undefined
          ? Math.floor(currentUnclaimed! * 10000) / 10000
          : "?"}
      </Heading>

      <Row
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        width="100%"
        mb={6}
      >
        <Text
          textTransform="uppercase"
          letterSpacing="wide"
          color="#858585"
          fontSize="lg"
        >
          {t("Claimable RGT")}
        </Text>
      </Row>

      <NumberInput
        mb={4}
        min={0}
        max={currentUnclaimed ?? 0}
        onChange={(value: any) => {
          setAmount(value);
        }}
        value={amount}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      {mode === "private" ? (
        <Text
          textTransform="uppercase"
          letterSpacing="wide"
          color="#858585"
          fontSize="xs"
          textAlign="center"
        >
          <SimpleTooltip
            label={t(
              "Claiming private RGT before October 20th, 2022 will result in a fraction of it being burned. This amount decreases from 100% linearly until the 20th when it will reach 0%."
            )}
          >
            <span>
              {t(
                "Claiming private RGT now will result in a {{amount}}% burn/takeback",
                { amount: privateClaimFee ?? "?" }
              )}

              <InfoIcon mb="3px" color="#858585" ml={1} boxSize="9px" />
            </span>
          </SimpleTooltip>
        </Text>
      ) : null}
    </>
  );
};

const ClaimFuseRewards = () => {
  const {
    rewardsDistributorsMap,
    rewardTokensMap,
    unclaimed: unclaimedRewards,
  } = useUnclaimedRewards();

  const { fuse, address } = useRari();
  console.log({ rewardsDistributorsMap, rewardTokensMap, unclaimedRewards });

  const claimRewardToken = (rewardToken: string) => {
    // Look up rewardsDistributors by token
    const rewardsDistributors = rewardTokensMap[rewardToken];

    // for each RD, call claim
    rewardsDistributors.forEach(async (rD) => {
      const rdInstance = createRewardsDistributor(
        rD.rewardsDistributorAddress,
        fuse
      );

      await rdInstance.methods.claimRewards(address).send({ from: address });
    });
  };

  return (
    <Column
      w="100%"
      h="100%"
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
    >
      <Heading fontSize="sm">WE CLAIMING FUSE REWARDS BABY!</Heading>
      {unclaimedRewards?.map((unclaimed, i) => {
        return (
          <ClaimableRow
            unclaimed={unclaimed}
            key={i}
            claimRewardToken={claimRewardToken}
          />
        );
      })}
    </Column>
  );
};

const ClaimableRow = ({
  unclaimed,
  claimRewardToken,
}: {
  unclaimed: { rewardToken: string; unclaimed: BN };
  claimRewardToken: (rewardToken: string) => void;
}) => {
  const tokenData = useTokenData(unclaimed.rewardToken);

  return (
    <DashboardBox w="100%" h="50px">
      <Row
        expand
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        p={3}
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Image src={tokenData?.logoURL ?? ""} boxSize="30px" />
          <Text fontWeight="bold" ml={3}>
            {tokenData?.symbol}
          </Text>
        </Row>
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <Text fontWeight="bold" ml={3}>
            {(
              parseFloat(unclaimed.unclaimed.toString()) /
              ((tokenData?.decimals ?? 18) * 1e18)
            ).toFixed(4)}{" "}
            {tokenData?.symbol}
          </Text>
          <Button
            ml={2}
            bg="black"
            onClick={() => claimRewardToken(unclaimed.rewardToken)}
          >
            Claim
          </Button>
        </Row>
      </Row>
    </DashboardBox>
  );
};
