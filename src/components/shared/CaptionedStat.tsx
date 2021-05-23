import { Heading, Text } from "@chakra-ui/react";
import { CrossAxisAlignment, Column } from "buttered-chakra";
import { useMaybeResponsiveProp } from "../../hooks/useMaybeResponsiveProp";

export interface CaptionedStatProps {
  crossAxisAlignment: CrossAxisAlignment;
  stat: string;
  statSize: string;
  caption: string;
  captionSize: string;
  spacing?: string | number;
  captionFirst?: boolean;
}

const CaptionedStat = ({
  stat,
  caption,
  captionSize,
  spacing,
  statSize,
  crossAxisAlignment,
  captionFirst,
}: CaptionedStatProps) => {
  const crossAxisAlignmentStatic = useMaybeResponsiveProp(crossAxisAlignment);
  const textAlign = crossAxisAlignmentStatic.replace("flex-", "") as any;

  return (
    <Column mainAxisAlignment="center" crossAxisAlignment={crossAxisAlignment}>
      {captionFirst ?? true ? (
        <>
          <Caption
            size={captionSize}
            spacing={spacing ?? 0}
            textAlign={textAlign}
            text={caption}
          />
          <Stat size={statSize} text={stat} />
        </>
      ) : (
        <>
          <Stat size={statSize} text={stat} />
          <Caption
            size={captionSize}
            spacing={spacing ?? 0}
            textAlign={textAlign}
            text={caption}
          />
        </>
      )}
    </Column>
  );
};

const Stat = ({
  size,
  text,
}: {
  size: { md: string; xs: string } | string;
  text: string;
}) => {
  return (
    <Heading fontSize={size} lineHeight="2.5rem">
      {text}
    </Heading>
  );
};

const Caption = ({
  size,
  textAlign,
  spacing,
  text,
}: {
  size: { md: string; xs: string } | string;

  textAlign: any;

  spacing: string | number;

  text: string;
}) => {
  return (
    <Text
      textTransform="uppercase"
      letterSpacing="wide"
      color="#858585"
      fontSize={size}
      textAlign={textAlign}
      mt={spacing ?? 0}
    >
      {text}
    </Text>
  );
};

export default CaptionedStat;
