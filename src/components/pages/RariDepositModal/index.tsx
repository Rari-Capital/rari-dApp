import React, { useState, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";

import TokenSelect from "./TokenSelect";
import AmountSelect from "./AmountSelect";
import OptionsMenu from "./OptionsMenu";
import { MODAL_PROPS } from "../../shared/Modal";
import { Pool, usePoolType } from "../../../context/PoolContext";
import { poolHasDivergenceRisk } from "../../../utils/poolUtils";
import { ETH_TOKEN_DATA } from "../../../hooks/useTokenData";

enum CurrentScreen {
  MAIN,
  COIN_SELECT,
  OPTIONS,
}

export enum Mode {
  DEPOSIT,
  WITHDRAW,
}

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const DepositModal = (props: Props) => {
  const [mode, setMode] = useState(Mode.DEPOSIT);

  const [currentScreen, setCurrentScreen] = useState(CurrentScreen.MAIN);

  useEffect(() => {
    // When the modal closes return to the main screen.
    if (!props.isOpen) {
      setCurrentScreen(CurrentScreen.MAIN);
    }
  }, [props.isOpen]);

  const poolType = usePoolType();

  const [selectedToken, setSelectedToken] = useState(() => {
    if (poolType === Pool.ETH) {
      return ETH_TOKEN_DATA.address;
    } else {
      // USDC
      return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    }
  });

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={props.isOpen}
      onClose={props.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        {...MODAL_PROPS}
        height={{
          md: poolHasDivergenceRisk(poolType) ? "320px" : "295px",
          base: poolHasDivergenceRisk(poolType) ? "350px" : "310px",
        }}
      >
        {currentScreen === CurrentScreen.MAIN ? (
          <AmountSelect
            onClose={props.onClose}
            openCoinSelect={() => setCurrentScreen(CurrentScreen.COIN_SELECT)}
            openOptions={() => setCurrentScreen(CurrentScreen.OPTIONS)}
            selectedToken={selectedToken}
            mode={mode}
          />
        ) : currentScreen === CurrentScreen.COIN_SELECT ? (
          <TokenSelect
            onClose={() => setCurrentScreen(CurrentScreen.MAIN)}
            onSelectToken={setSelectedToken}
            mode={mode}
          />
        ) : (
          <OptionsMenu
            onClose={() => setCurrentScreen(CurrentScreen.MAIN)}
            onSetMode={setMode}
            mode={mode}
          />
        )}
      </ModalContent>
    </Modal>
  );
};

export default DepositModal;
