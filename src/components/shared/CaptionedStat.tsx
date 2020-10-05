import React from "react";
import {
  BoxProps,
  Heading,
  Text,
  FlexProps,
  HeadingProps,
} from "@chakra-ui/core";
import { MainAxisAlignment, CrossAxisAlignment, Column } from "buttered-chakra";
import { useResponsiveProp } from "../../utils/useResponsiveProp";

interface Props {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment: CrossAxisAlignment;
  stat: string;
  statSize: { md: string; xs: string } | string;
  caption: string;
  captionSize: { md: string; xs: string } | string;
  spacing?: string | number;
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
  spacing,
  statProps,
  statSize,
  columnProps,
  crossAxisAlignment,
  mainAxisAlignment,
  captionFirst,
}: Props) => {
  const crossAxisAlignmentStatic = useResponsiveProp(crossAxisAlignment);
  const textAlign = crossAxisAlignmentStatic.replace("flex-", "") as any;

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
            textAlign={textAlign}
            mt={spacing ?? 0}
            {...captionProps}
          >
            {caption}
          </Text>
          <Heading fontSize={statSize} {...statProps}>
            {stat}
          </Heading>
        </>
      ) : (
        <>
          <Heading fontSize={statSize} {...statProps}>
            {stat}
          </Heading>
          <Text
            textTransform="uppercase"
            letterSpacing="wide"
            color="#858585"
            fontSize={captionSize}
            textAlign={textAlign}
            mt={spacing ?? 0}
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
