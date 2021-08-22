import { Center, Column } from "utils/chakraUtils";

import DashboardBox from "../shared/DashboardBox";
import { Header } from "../shared/Header";

import Footer from "components/shared/Footer";
import { memo, useMemo } from "react";

import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";

import { Plot, PlotFigure } from "components/shared/Plot";

const BASE_CONFIG = { x: "x", y: "y", strokeWidth: 3 };

const ChartsPage = memo(() => {
  const isMobile = useIsSmallScreen();

  const { fuse, rari, isAuthed } = useRari();

  const options = useMemo(() => {
    return {
      width: 810,
      height: 510,

      y: {
        label: null,
        grid: false,
      },

      x: {
        label: null,
        grid: false,
      },

      marks: [
        Plot.frame(),
        Plot.line(
          Array.from({ length: 500 }, (_, x) => {
            return {
              x,
              y: x * Math.random(),
            };
          }),

          { ...BASE_CONFIG, stroke: "orange" }
        ),
      ],
    };
  }, []);

  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? "100%" : "1000px"}
        height="100%"
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />

        <Column
          mt={4}
          mainAxisAlignment="flex-start"
          crossAxisAlignment="center"
          width="100%"
        >
          <DashboardBox
            height="550px"
            width="100%"
            overflow="hidden"
            bg="#141619"
            background="white"
          >
            <Center expand>
              <PlotFigure options={options} />
            </Center>
          </DashboardBox>
        </Column>

        <Footer />
      </Column>
    </>
  );
});

export default ChartsPage;
