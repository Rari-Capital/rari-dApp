import React from "react";
import {
  BoxProps,
  Heading,
  Text,
  FlexProps,
  HeadingProps,
} from "@chakra-ui/core";
import { MainAxisAlignment, CrossAxisAlignment, Column } from "buttered-chakra";

interface Props {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment: CrossAxisAlignment;
  stat: string;
  statSize: "xl" | "2xl" | "lg" | "md" | "sm" | "xs";
  caption: string;
  captionSize: "xl" | "2xl" | "lg" | "md" | "sm" | "xs";

  captionProps?: BoxProps;
  statProps?: HeadingProps;
  columnProps?: FlexProps;

  captionFirst?: boolean;
}

const CaptionedStat = ({
  stat,
  caption,
  captionProps,
  captionSize,
  statProps,
  statSize,
  columnProps,
  crossAxisAlignment,
  mainAxisAlignment,
  captionFirst,
}: Props) => {
  return (
    <Column
      mainAxisAlignment={mainAxisAlignment || "center"}
      crossAxisAlignment={crossAxisAlignment}
      {...columnProps}
    >
      {captionFirst ?? true ? (
        <>
          <Text
            textTransform="uppercase"
            letterSpacing="wide"
            color="#858585"
            fontSize={captionSize}
            {...captionProps}
          >
            {caption}
          </Text>
          <Heading size={statSize} {...statProps}>
            {stat}
          </Heading>
        </>
      ) : (
        <>
          <Heading size={statSize} {...statProps}>
            {stat}
          </Heading>
          <Text
            textTransform="uppercase"
            letterSpacing="wide"
            color="#858585"
            fontSize={captionSize}
            textAlign={
              crossAxisAlignment.toString().replace("flex-", "") as any
            }
            {...captionProps}
          >
            {caption}
          </Text>
        </>
      )}
    </Column>
  );
};

export default CaptionedStat;
