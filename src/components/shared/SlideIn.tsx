import React from "react";
import { SlideIn as ChakraSlideIn } from "@chakra-ui/core";

interface Props {
  isActivted: boolean;
  render: (styles: any) => JSX.Element;
}

const SlideIn = React.memo((props: Props) => {
  // @ts-ignore
  return <ChakraSlideIn in={props.isActivted}>{props.render}</ChakraSlideIn>;
});

export default SlideIn;
