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
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { Column, Row } from "buttered-chakra";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../context/RariContext";

import { GlowingButton } from "./GlowingButton";
import { AnimatedSmallLogo } from "./Logos";
import { ModalDivider, ModalTitleWithCloseButton, MODAL_PROPS } from "./Modal";

import { SimpleTooltip } from "./SimpleTooltip";

export const ClaimRGTModal = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => any }) => {
    const { t } = useTranslation();

    const { address, rari } = useRari();

    const [amount, setAmount] = useState(0);
    const handleAmountChange = useCallback(
      (value: any) => {
        setAmount(value);
      },
      [setAmount]
    );

    const { data: unclaimed, isLoading: isUnclaimedLoading } = useQuery(
      address + " unclaimed RGT",
      async () => {
        return parseFloat(
          rari.web3.utils.fromWei(
            await rari.governance.rgt.distributions.getUnclaimed(address)
          )
        );
      }
    );

    const {
      data: privateUnclaimed,
      isLoading: isPrivateUnclaimedLoading,
    } = useQuery(address + " privateUnclaimed RGT", async () => {
      return parseFloat(
        rari.web3.utils.fromWei(
          await rari.governance.rgt.vesting.getUnclaimed(address)
        )
      );
    });

    const [isPrivateMode, setIsPrivateMode] = useState(false);

    // When we get a number for unclaimed/privateUnclaimed, set the amount to it.
    useEffect(() => {
      if (isPrivateMode && !isPrivateUnclaimedLoading) {
        setAmount(Math.floor(privateUnclaimed! * 1000000) / 1000000);
      } else if (!isPrivateMode && !isUnclaimedLoading) {
        setAmount(Math.floor(unclaimed! * 1000000) / 1000000);
      }
    }, [
      unclaimed,
      privateUnclaimed,
      isPrivateMode,
      isPrivateUnclaimedLoading,
      isUnclaimedLoading,
    ]);

    const claimRGT = useCallback(() => {
      const claimMethod = isPrivateMode
        ? rari.governance.rgt.vesting.claim
        : rari.governance.rgt.distributions.claim;

      // Could do something with the receipt but notify.js is watching the account and will send a notification for us.
      claimMethod(
        rari.web3.utils.toBN(
          //@ts-ignore
          new BigNumber(amount).multipliedBy(1e18).decimalPlaces(0)
        ),
        { from: address }
      );
    }, [rari.governance.rgt, amount, rari.web3.utils, address, isPrivateMode]);

    const { data: privateClaimFee } = useQuery("privateClaimFee", async () => {
      const raw = rari.governance.rgt.vesting.getClaimFee(
        Math.floor(Date.now() / 1000)
      );

      return (parseFloat(rari.web3.utils.fromWei(raw)) * 100).toFixed(2);
    });

    const { data: claimFee } = useQuery("claimFee", async () => {
      const blockNumber = await rari.web3.eth.getBlockNumber();
      const raw = rari.governance.rgt.distributions.getClaimFee(blockNumber);

      return (parseFloat(rari.web3.utils.fromWei(raw)) * 100).toFixed(2);
    });

    // If user presses meta key or control key + slash they will toggle the private allocation claim mode.
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.code === "Slash") {
          e.preventDefault();
          setIsPrivateMode((past) => !past);
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
            text={isPrivateMode ? t("Claim Private RGT") : t("Claim RGT")}
            onClose={onClose}
          />

          <ModalDivider />

          <Column
            width="100%"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="center"
            p={4}
          >
            <AnimatedSmallLogo boxSize="50px" />
            <Heading mt={4}>
              {(
                isPrivateMode ? !isPrivateUnclaimedLoading : !isUnclaimedLoading
              )
                ? Math.floor(
                    (isPrivateMode ? privateUnclaimed! : unclaimed!) * 10000
                  ) / 10000
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
                {isPrivateMode
                  ? t("Claimable Private RGT")
                  : t("Claimable RGT")}
              </Text>
            </Row>

            <NumberInput
              mb={4}
              min={0}
              max={(isPrivateMode ? privateUnclaimed : unclaimed) ?? 0}
              onChange={handleAmountChange}
              value={amount}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Row
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              width="100%"
              mb={4}
            >
              <Text
                textTransform="uppercase"
                letterSpacing="wide"
                color="#858585"
                fontSize="xs"
                textAlign="center"
              >
                <SimpleTooltip
                  label={
                    isPrivateMode
                      ? t(
                          "Claiming private RGT before October 20th, 2022 will result in a fraction of it being burned. This amount decreases from 100% linearly until the 20th when it will reach 0%."
                        )
                      : t(
                          "Claiming your RGT before December 19th, 2020 will result in a fraction of it being burned. This amount decreases from 33% linearly until the 19th when it will reach 0%."
                        )
                  }
                >
                  <span>
                    {isPrivateMode
                      ? t(
                          "Claiming private RGT now will result in a {{amount}}% burn/takeback",
                          { amount: privateClaimFee ?? "?" }
                        )
                      : t(
                          "Claiming RGT now will result in a {{amount}}% burn/takeback",
                          { amount: claimFee ?? "?" }
                        )}

                    <InfoIcon mb="3px" color="#858585" ml={1} boxSize="9px" />
                  </span>
                </SimpleTooltip>
              </Text>
            </Row>

            <GlowingButton
              label={isPrivateMode ? t("Claim Private RGT") : t("Claim RGT")}
              fontSize="2xl"
              disabled={
                amount <= 0 ||
                amount > ((isPrivateMode ? privateUnclaimed : unclaimed) ?? 0)
              }
              onClick={claimRGT}
              width="100%"
              height="60px"
            />
          </Column>
        </ModalContent>
      </Modal>
    );
  }
);
