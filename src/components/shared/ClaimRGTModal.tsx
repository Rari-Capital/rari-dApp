import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Heading,
  Icon,
} from "@chakra-ui/core";
import { Column, Row } from "buttered-chakra";

import React, { useCallback } from "react";
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
        ).toFixed(3);
      }
    );

    const claimRGT = useCallback(() => {
      rari.governance.rgt.distributions.claim(address, { from: address });
    }, [rari.governance.rgt.distributions, address]);

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
                  {isUnclaimedLoading ? "$?" : unclaimed}
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
                    fontSize="xs"
                    textAlign="center"
                  >
                    <SimpleTooltip
                      label={t(
                        "Transferring your RGT after claiming before December 19th, 2020 will result in a fraction of it being burned and sent back to the protocol. 70% of the amount taken will be burned and 30% taken back into the protocol. This amount decreases from 33% linearly until the 19th when it will reach 0%."
                      )}
                    >
                      <span>
                        {t(
                          "Transferring RGT (after claiming) now will result in a {{amount}}% burn/takeback",
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
                  label={t("Claim")}
                  fontSize="2xl"
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
