import React from "react";
import { Scale as ChakraScale } from "@chakra-ui/core";

interface Props {
  isActivted: boolean;
  render: (styles: any) => JSX.Element;
}

const ModalAnimation = (props: Props) => {
  // @ts-ignore
  return <ChakraScale in={props.isActivted}>{props.render}</ChakraScale>;
};

export default ModalAnimation;
