import React from "react";
import { Input } from "@chakra-ui/input";
import {  Heading } from "@chakra-ui/react";
import { Center, Column, Row, useIsMobile } from "buttered-chakra";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import NewHeader from "components/shared/Header2/NewHeader";
import Marquee from "react-fast-marquee";
import HomeFuseCard from "./HomeFuseCard";

const Home = React.memo(() => {
  const { isAuthed } = useRari();
  const isMobile = useIsSmallScreen();
  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width="100%"
        height="100%"
      >
        <NewHeader />
        <Column
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          mx="auto"
          width="100%"
          height="50%"
          background="aqua"
        >
            <Heading size="2xl" textAlign="center" mb={4}>Easily earn, lend <br/> and borrow</Heading>
            <Input placeholder="Search" width="50%" outline="5px solid grey"/>
        </Column>
        <Column
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          mx="auto"
          width="100%"
          background="pink"
        >
         <Marquee pauseOnHover gradient={false} style={{
             background: 'red'
         }}>
                <HomeFuseCard></HomeFuseCard>
                <HomeFuseCard></HomeFuseCard>
                <HomeFuseCard></HomeFuseCard>
                <HomeFuseCard></HomeFuseCard>
                <HomeFuseCard></HomeFuseCard>
                <HomeFuseCard></HomeFuseCard>
                <HomeFuseCard></HomeFuseCard>
        </Marquee>
        </Column>
      </Column>
    </>
  );
});

export default Home;
