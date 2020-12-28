import React, { useCallback } from "react";

import { Button } from "@chakra-ui/react";

import { Fade } from "react-awesome-reveal";
import { Column } from "buttered-chakra";

import { Mode } from ".";
import { useTranslation } from "react-i18next";
import { ModalDivider, ModalTitleWithCloseButton } from "../../../shared/Modal";
import { DASHBOARD_BOX_SPACING } from "../../../shared/DashboardBox";
import { TranchePool, useSaffronData } from "../TranchesPage";
import { useQuery } from "react-query";

const OptionsMenu = React.memo(
  ({
    onSetMode,
    onClose,
    tranchePool,
    onSetEpoch,
  }: {
    onClose: () => any;
    onSetMode: (mode: Mode) => any;
    tranchePool: TranchePool;
    onSetEpoch: (epoch: number) => any;
  }) => {
    const { t } = useTranslation();

    const openDeposit = useCallback(() => {
      onSetMode(Mode.DEPOSIT);
      onClose();
    }, [onSetMode, onClose]);

    const redeemEpoch = useCallback(
      (epoch: number) => {
        onSetMode(Mode.WITHDRAW);
        onSetEpoch(epoch);
        onClose();
      },
      [onSetMode, onSetEpoch, onClose]
    );

    const { fetchCurrentEpoch } = useSaffronData();

    const { data: redeemableEpochs } = useQuery(
      "redeemableEpochs " + tranchePool,
      async () => {
        const currentEpoch = await fetchCurrentEpoch();

        //TODO: USDC STARTING EPOCH
        const startingEpoch = tranchePool === TranchePool.DAI ? 3 : 0;

        let redeemableEpochs = [];

        for (let i = startingEpoch; i < currentEpoch; i++) {
          redeemableEpochs.push(i);
        }

        return redeemableEpochs;
      }
    );

    return (
      <Fade>
        <ModalTitleWithCloseButton text={t("Options")} onClose={onClose} />
        <ModalDivider />
        <Column
          mt={DASHBOARD_BOX_SPACING.asPxString()}
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
        >
          <Button colorScheme="whatsapp" variant="solid" onClick={openDeposit}>
            {t("Deposit")}
          </Button>

          {redeemableEpochs
            ? redeemableEpochs.map((epoch) => {
                return (
                  <Button
                    mt={4}
                    key={epoch}
                    colorScheme="red"
                    variant="solid"
                    onClick={() => redeemEpoch(epoch)}
                  >
                    {t("Redeem Epoch {{epoch}}", { epoch })}
                  </Button>
                );
              })
            : null}
        </Column>
      </Fade>
    );
  }
);

export default OptionsMenu;
