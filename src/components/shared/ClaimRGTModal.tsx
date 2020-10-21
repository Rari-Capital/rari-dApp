import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Heading,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/core";
import { Column, Row } from "buttered-chakra";

import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRari } from "../../context/RariContext";

import { DASHBOARD_BOX_SPACING } from "./DashboardBox";
import { GlowingButton } from "./GlowingButton";
import { AnimatedSmallLogo } from "./Logos";
import { ModalDivider, ModalTitleWithCloseButton, MODAL_PROPS } from "./Modal";
import ModalAnimation from "./ModalAnimation";
import { SimpleTooltip } from "./SimpleTooltip";

export const LiquidityMiningStartTimestamp = 1603177200000;

function datediff(first: number, second: number) {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function calculateRGTBurn() {
  const daysPast = datediff(LiquidityMiningStartTimestamp, Date.now());

  return (33 - (33 / 60) * daysPast).toFixed(2);
}

function toFixed(num: number, fixed: number) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return num.toString().match(re)![0];
}

export const ClaimRGTModal = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => any }) => {
    const { t } = useTranslation();

    const { address, rari } = useRari();

    const { data: unclaimed, isLoading: isUnclaimedLoading } = useQuery(
      address + " unclaimed RGT",
      async () => {
        return parseFloat(
          rari.web3.utils.fromWei(
            await rari.governance.rgt.distributions.getUnclaimed(address)
          )
        );
      },
      { refetchInterval: 1000 }
    );

    const [amount, setAmount] = useState(0);
    const handleAmountChange = useCallback(
      (value) => {
        setAmount(value);
      },
      [setAmount]
    );

    const claimRGT = useCallback(() => {
      rari.governance.rgt.distributions.claim(
        rari.web3.utils.toBN((amount * 1e18).toString()),
        { from: address }
      );
    }, [rari.governance.rgt.distributions, amount, rari.web3.utils, address]);

    return (
      <ModalAnimation
        isActivted={isOpen}
        render={(styles) => (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent {...styles} {...MODAL_PROPS}>
              <ModalTitleWithCloseButton
                text={t("Claim RGT")}
                onClose={onClose}
              />

              <ModalDivider />

              <Column
                width="100%"
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                p={DASHBOARD_BOX_SPACING.asPxString()}
              >
                <AnimatedSmallLogo size="50px" />
                <Heading mt={DASHBOARD_BOX_SPACING.asPxString()}>
                  {isUnclaimedLoading ? "?" : toFixed(unclaimed!, 5)}
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
                  color="#000"
                  mb={DASHBOARD_BOX_SPACING.asPxString()}
                  min={0}
                  max={unclaimed ?? 0}
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
                  mb={DASHBOARD_BOX_SPACING.asPxString()}
                >
                  <Text
                    textTransform="uppercase"
                    letterSpacing="wide"
                    color="#858585"
                    fontSize="xs"
                    textAlign="center"
                  >
                    <SimpleTooltip
                      label={t(
                        "Claiming your RGT before December 19th, 2020 will result in a fraction of it being burned and sent back to the protocol. 70% of the amount taken will be burned and 30% taken back into the protocol. This amount decreases from 33% linearly until the 19th when it will reach 0%."
                      )}
                    >
                      <span>
                        {t(
                          "Claiming RGT now will result in a {{amount}}% burn/takeback",
                          { amount: calculateRGTBurn() }
                        )}

                        <Icon
                          mb="2px"
                          color="#858585"
                          ml={1}
                          name="info"
                          size="10px"
                        />
                      </span>
                    </SimpleTooltip>
                  </Text>
                </Row>

                <GlowingButton
                  label={t("Claim") + " " + amount + " RGT"}
                  fontSize="2xl"
                  disabled={amount > (unclaimed ?? 0)}
                  onClick={claimRGT}
                  width="100%"
                  height="60px"
                />
              </Column>
            </ModalContent>
          </Modal>
        )}
      />
    );
  }
);
