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
import { useTokenData } from "hooks/useTokenData";
import { createRewardsDistributor } from "utils/createComptroller";
import { useClaimable } from "hooks/rewards/useClaimable";

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

  // Claims Fuse LM rewards
  const claimFuseRewards = useCallback(
    (rewardToken: string) => {
      const rDs = rewardTokensMap[rewardToken];
      if (rDs && rDs.length) {
        rDs.forEach(async (rDAddress) => {
          const rewardsDistributor = createRewardsDistributor(
            rDAddress.rewardsDistributorAddress,
            fuse
          );

          await rewardsDistributor.methods
            .claimRewards(address)
            .send({ from: address });
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
              claimFuseRewards={claimFuseRewards}
              unclaimed={claimable.unclaimed}
              mode={claimable.mode}
              my={1}
            />
          );
        })
      ) : (
        <Heading>No Claimable Rewards.</Heading>
      )}
      {!!allClaimable.length && (
        <GlowingButton
          label={t("Claim All")}
          onClick={() => alert("Claiming All")}
          width="100%"
          height="51px"
          my={4}
        />
      )}
    </Column>
  );
};

// const ClaimRGT = ({
//   mode,
//   currentUnclaimed,
//   amount,
//   setAmount,
// }: {
//   mode: ClaimMode;
//   currentUnclaimed?: number;
//   amount: any;
//   setAmount: (x: any) => any;
// }) => {
//   const { rari } = useRari();
//   const { t } = useTranslation();

//   const { data: privateClaimFee } = useQuery("privateClaimFee", async () => {
//     const raw = rari.governance.rgt.vesting.getClaimFee(
//       Math.floor(Date.now() / 1000)
//     );

//     return (parseFloat(rari.web3.utils.fromWei(raw)) * 100).toFixed(2);
//   });

//   return (
//     <>
//       <AnimatedSmallLogo boxSize="50px" />
//       <Heading mt={4}>
//         {currentUnclaimed !== undefined
//           ? Math.floor(currentUnclaimed! * 10000) / 10000
//           : "?"}
//       </Heading>

//       <Row
//         mainAxisAlignment="center"
//         crossAxisAlignment="center"
//         width="100%"
//         mb={6}
//       >
//         <Text
//           textTransform="uppercase"
//           letterSpacing="wide"
//           color="#858585"
//           fontSize="lg"
//         >
//           {t("Claimable RGT")}
//         </Text>
//       </Row>

//       <NumberInput
//         mb={4}
//         min={0}
//         max={currentUnclaimed ?? 0}
//         onChange={(value: any) => {
//           setAmount(value);
//         }}
//         value={amount}
//       >
//         <NumberInputField />
//         <NumberInputStepper>
//           <NumberIncrementStepper />
//           <NumberDecrementStepper />
//         </NumberInputStepper>
//       </NumberInput>

//       {mode === "private" ? (
//         <Text
//           textTransform="uppercase"
//           letterSpacing="wide"
//           color="#858585"
//           fontSize="xs"
//           textAlign="center"
//         >
//           <SimpleTooltip
//             label={t(
//               "Claiming private RGT before October 20th, 2022 will result in a fraction of it being burned. This amount decreases from 100% linearly until the 20th when it will reach 0%."
//             )}
//           >
//             <span>
//               {t(
//                 "Claiming private RGT now will result in a {{amount}}% burn/takeback",
//                 { amount: privateClaimFee ?? "?" }
//               )}

//               <InfoIcon mb="3px" color="#858585" ml={1} boxSize="9px" />
//             </span>
//           </SimpleTooltip>
//         </Text>
//       ) : null}
//     </>
//   );
// };

// const ClaimFuseRewards = ({
//   rewardsDistributorsMap,
//   rewardTokensMap,
//   unclaimed,
// }: {
//   rewardsDistributorsMap: {
//     [rewardsDistributorAddr: string]: RewardsDistributor;
//   };
//   rewardTokensMap: RewardsTokenMap;
//   unclaimed: UnclaimedFuseReward[] | undefined;
// }) => {
//   const { fuse, address } = useRari();
//   console.log({ rewardsDistributorsMap, rewardTokensMap, unclaimed });

//   return (
//     <Column
//       w="100%"
//       h="100%"
//       mainAxisAlignment="flex-start"
//       crossAxisAlignment="flex-start"
//     >
//       {unclaimed?.map((_unclaimed, i) => {
//         return (
//           <ClaimableRow
//             unclaimed={_unclaimed}
//             key={i}
//             claimFuseRewards={claimFuseRewards}
//           />
//         );
//       })}
//     </Column>
//   );
// };

const ClaimableRow = ({
  unclaimed,
  claimFuseRewards,
  mode,
  ...rowProps
}: {
  unclaimed: UnclaimedReward;
  claimFuseRewards?: (rewardToken: string) => void;
  mode: ClaimMode;
  [x: string]: any;
}) => {
  const tokenData = useTokenData(unclaimed.rewardToken);
  const { rari, address } = useRari();

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
    if (mode === "fuse" && !!claimFuseRewards) {
      claimFuseRewards(unclaimed.rewardToken);
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
            <Image src={tokenData?.logoURL ?? ""} boxSize="30px" />
            <Text fontWeight="bold" ml={3}>
              {tokenData?.symbol}
            </Text>
          </Row>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Text fontWeight="bold" ml={3}>
              {(
                parseFloat(unclaimed.unclaimed.toString()) /
                (1 * 10 ** (tokenData?.decimals ?? 18))
              ).toFixed(3)}{" "}
              {tokenData?.symbol}
            </Text>
            <Button ml={2} bg="black" onClick={() => claimRewards()}>
              Claim
            </Button>
          </Row>
        </Row>
      </DashboardBox>
    </motion.div>
  );
};
