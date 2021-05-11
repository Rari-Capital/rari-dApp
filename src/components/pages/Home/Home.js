import React from "react";
import { Avatar, AvatarGroup, Link, Spinner, Text } from "@chakra-ui/react";
import { Center, Column, Row, useIsMobile } from "buttered-chakra";
import { useRari } from "context/RariContext";
import { useIsSmallScreen } from "hooks/useIsSmallScreen";
import NewHeader from "components/shared/Header2/NewHeader";

const Home = React.memo(() => {
  const { isAuthed } = useRari()
  const isMobile = useIsSmallScreen()
  return (
    <>
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width="100%"
        height="100%"
        px={4}
      >
        <NewHeader />
      </Column>
    </>
  );
});

export default Home;
