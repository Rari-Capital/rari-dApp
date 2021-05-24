import { Box, Heading, Text } from "@chakra-ui/layout";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { Column } from "buttered-chakra";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import { useFuseDataForAssets } from "hooks/fuse/useFuseDataForAsset";
import { smallStringUsdFormatter, smallUsdFormatter } from "utils/bigUtils";

const ASSETS = ["DAI", "ETH", "RGT"];

const HomeCarousel = () => {
  const isMobile = useIsSmallScreen();

  const { totals: pools } = useFuseDataForAssets(ASSETS);

  return (
    <Column
      width="100%"
      height="100%"
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      // bg="blue"
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
        {pools.map((pool, i) => {
          return (
            <Box w="100%" h="100%">
              <Heading
                fontSize={{ base: "md", sm: "lg", md: "lg", lg: "xl" }}
                textAlign={isMobile ? "left" : "center"}
              >
                The Rari Capital Ecosystem currently has{" "}
                <InlineStyledText
                  text={`${smallStringUsdFormatter(pool.totalSuppliedUSD)} ${
                    ASSETS[i]
                  }`}
                />{" "}
                earning{" "}
                <InlineStyledText
                  text={`${pool.highestSupplyAPY.toFixed(2)}%`}
                />{" "}
                yield.
              </Heading>
            </Box>
          );
        })}
      </Carousel>
    </Column>
  );
};

export default HomeCarousel;

const InlineStyledText = ({ text }: { text: string }) => (
  <Text
    as="span"
    sx={{
      textDecorationColor: "#00C628",
      // textDecoration: "underline",
      color: "#00C628",
    }}
  >
    {text}
  </Text>
);
