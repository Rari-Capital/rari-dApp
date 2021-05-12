import React from "react";
import { Box, Heading, Text } from "@chakra-ui/layout";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { Column } from "buttered-chakra";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";

const HomeCarousel = () => {
  const isMobile = useIsSmallScreen();

  return (
    <Column
      width="100%"
      height="100%"
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      bg="blue"
      //   padding={3}
      id="carousel-column"
    >
      <Carousel
        autoPlay
        infiniteLoop
        showStatus={false}
        showArrows={false}
        showThumbs={false}
        showIndicators={isMobile ? false : true}
      >
        <Box bg="lime" w="100%">
          <Heading fontSize={["md", "large"]} textAlign="left">
            The Rari Capital Ecosystem currently has 1 Bajilion dollars earning
            18.5% yield.
          </Heading>
        </Box>
        <Box bg="lime" w="100%">
          <Heading fontSize={["md", "large"]} textAlign="left">
            The Rari Capital Ecosystem currently has 1 Bajilion dollars earning
            18.5% yield.
          </Heading>
        </Box>
        <Box bg="lime" w="100%">
          <Heading fontSize={["md", "lg"]} textAlign="left">
            The Rari Capital Ecosystem currently has 1 Bajilion dollars earning
            18.5% yield.
          </Heading>
        </Box>
      </Carousel>
    </Column>
  );
};

export default HomeCarousel;
