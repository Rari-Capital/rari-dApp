import React, { useCallback } from "react";

import { Heading, Box, Button } from "@chakra-ui/core";

import { Fade } from "react-awesome-reveal";
import { Row, Column } from "buttered-chakra";

import { Mode } from ".";

const OptionsMenu = React.memo(
  ({ mode, onSetMode }: { mode: Mode; onSetMode: (mode: Mode) => any }) => {
    const toggleMode = useCallback(
      () => onSetMode(mode === Mode.DEPOSIT ? Mode.WITHDRAW : Mode.DEPOSIT),
      [onSetMode, mode]
    );

    return (
      <Fade>
        <Row
          width="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          p={4}
        >
          <Heading fontSize="27px">Options</Heading>
        </Row>
        <Box h="1px" bg="#272727" />
        <Column
          mt={4}
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
        >
          <Button
            leftIcon="question"
            variantColor="whiteAlpha"
            variant="solid"
            onClick={toggleMode}
          >
            Want to {mode === Mode.DEPOSIT ? "withdraw" : "deposit"}?
          </Button>
        </Column>
      </Fade>
    );
  }
);

export default OptionsMenu;
