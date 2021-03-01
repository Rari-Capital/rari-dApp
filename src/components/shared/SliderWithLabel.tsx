import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
} from "@chakra-ui/react";
import { Row } from "buttered-chakra";
import React from "react";

export const SliderWithLabel = ({
  value,
  setValue,
  formatValue,
  min,
  max,
  step,
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  setValue: (value: number) => any;
  formatValue?: (value: number) => string;
}) => {
  return (
    <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
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
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Row>
  );
};
