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
}: {
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
        aria-label="slider-ex-1"
        width="190px"
        colorScheme="white"
        onChange={setValue}
        value={value}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Row>
  );
};
