import React from 'react'

import {
    Heading,
    Text,
    Link,
    Image,
    LinkBox,
  } from "@chakra-ui/react";
import { Center, Column, Row, useIsMobile } from "buttered-chakra";

import FusePNGWhite from "static/icons/fuse.png";


const OpportunityCard = () => {
    return (
      <Link to="/">
        <LinkBox
          bg="aqua"
          height="100%"
          width="100%"
          borderRadius="lg"
          p={["5%", "10%", "10%"]}
          transition="transform 0.2s ease 0s"
          _hover={{
            transform: "translateY(-5px)",
          }}
        >
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
            <Column
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              height={"100%"}
            >
              <Heading size="xs">Heading</Heading>
              <Text fontSize="xs">Subtitle</Text>
              <Text fontSize="xs" mt={2}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </Text>
            </Column>
            <Image src={FusePNGWhite} boxSize="50px" float="left" my="auto" />
          </Row>
        </LinkBox>
      </Link>
    );
  };
  

export default OpportunityCard
