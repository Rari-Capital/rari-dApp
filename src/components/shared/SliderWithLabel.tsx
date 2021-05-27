import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
} from "@chakra-ui/react";
import { Row } from "utils/buttered-chakra";

export const SliderWithLabel = ({
  value,
  setValue,
  formatValue,
  min,
  max,
  step,
  isDisabled,
  ...others
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  isDisabled?: boolean;
  setValue: (value: number) => any;
  formatValue?: (value: number) => string;
  [key: string]: any;
}) => {
  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" {...others}>
      <Text fontWeight="bold" mr={2}>
        {formatValue ? formatValue(value) : value}
      </Text>
      <Slider
        width="190px"
        colorScheme="white"
        onChange={setValue}
        value={value}
        min={min ?? 0}
        max={max ?? 100}
        step={step ?? 1}
        isDisabled={isDisabled}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Row>
  );
};
