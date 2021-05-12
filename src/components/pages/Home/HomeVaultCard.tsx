import React, { Props } from "react";
import {
  AvatarGroup,
  Avatar,
  Box,
  Heading,
  Link,
  Select,
  Spinner,
  Text,
  useClipboard,
} from "@chakra-ui/react";
import { Column } from "buttered-chakra";

const HomeVaultCard = ({ bg }: { bg?: string }) => {
  return (
    <Link to="/fuse">
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        height="200px"
        width="150px"
        ml={10}
        p={5}
        border="1px solid grey"
        borderRadius="lg"
        transition="transform 0.2s ease 0s"
        opacity={0.9}
        _hover={{
          opacity: 1,
          transform: "translateY(-5px)",
        }}
        bg={bg}
      >
        <Heading size="sm">Title </Heading>
        <Text size="sm" color="gray.500" fontWeight="bold">
          Subtitle
        </Text>
      </Column>
    </Link>
  );
};

export default HomeVaultCard;
