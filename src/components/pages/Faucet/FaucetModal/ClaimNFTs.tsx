import {
    Modal,
    ModalOverlay,
    ModalContent,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { Column } from "buttered-chakra";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

import { useRari } from "../../../../context/RariContext";

// * Import shared aspects
import { GlowingButton } from "../../../shared/GlowingButton";
import { ModalDivider, ModalTitleWithCloseButton, MODAL_PROPS } from "../../../shared/Modal";

export const ClaimNFTs = ({
    isOpen,
    onClose
}: {
    isOpen: boolean;
    onClose: () => any;
}) => {
    const { t } = useTranslation();

    const { address, faucet } = useRari();

    const [amount, setAmount] = useState(0);


    const { data: unclaimed } = useQuery(
        address + " unclaimed faucet pool NFTS",
        async () => {
        return parseFloat(
            faucet.web3.utils.fromWei(
            await faucet.getUnclaimed(address)
            )
        );
        }
    );

    const currentUnclaimed = unclaimed;

    useEffect(() => {
        if (currentUnclaimed !== undefined) {
        setAmount(Math.floor(currentUnclaimed * 1000000) / 1000000);
        }
    }, [currentUnclaimed]);

    const claimTokens = () => {
        const claimMethod = faucet.redeem;

        claimMethod(
            faucet.web3.utils.toBN(
                //@ts-ignore
                new BigNumber(amount).multipliedBy(1e18).decimalPlaces(0)
            ),
            { from: address }
            );
        };

    return (
        <Modal
            motionPreset="slideInBottom"
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            >
            <ModalOverlay />
            <ModalContent {...MODAL_PROPS}>
            <ModalTitleWithCloseButton text={t("Claim Pool Tokens")} onClose={onClose} />

            <ModalDivider />

                <Column
                width="100%"
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
                p={4}
                >
                    {/*
                    // TODO: Display which tokens are available to claim in token:amount pairings (idk best way to visualize)
                    */}
                    <GlowingButton
                        mt={3}
                        label={t("Claim All Pool Tokens")}
                        fontSize="2xl"
                        disabled={amount <= 0 || amount > (currentUnclaimed ?? 0)}
                        onClick={claimTokens}
                        width="100%"
                        height="60px"
                    />
                </Column>
            </ModalContent>
        </Modal>
    );
};
