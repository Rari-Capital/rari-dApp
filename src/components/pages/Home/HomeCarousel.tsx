import React from "react";
import { Box, Heading, Text } from "@chakra-ui/layout";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { Column } from "buttered-chakra";

const HomeCarousel = () => {
  return (
    <Column
      width="100%"
      height="100%"
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      p={10}
    >
      <Carousel
        autoPlay
        infiniteLoop
        showStatus={false}
        showArrows={false}
        showThumbs={false}
      >
        <Box>
          <Heading size="lg">
            The Rari Capital Ecosystem currently has 1 Bajilion dollars earning
            18.5% yield.
          </Heading>
        </Box>
        <Box>
          <Heading size="lg">
            The Rari Capital Ecosystem currently has 1 Bajilion dollars earning
            18.5% yield.
          </Heading>
        </Box>
        <Box>
          <Heading size="lg">
            The Rari Capital Ecosystem currently has 1 Bajilion dollars earning
            18.5% yield.
          </Heading>
        </Box>
      </Carousel>
    </Column>
  );
};

export default HomeCarousel;
