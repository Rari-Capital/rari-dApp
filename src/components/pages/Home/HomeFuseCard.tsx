import React from "react";
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

const HomeFuseCard = () => {
  return (
    <Link to="/fuse">
      <Box
        height="100%"
        width="200px"
        ml={10}
        p={5}
        border="1px solid grey"
        borderRadius="lg"
        transition="transform 0.2s ease 0s"
        opacity={0.9}
        _hover={{
          // background: "grey",
          opacity:1,
          transform: "translateY(-5px)",
        }}
      >
        <AvatarGroup mt={1} size="xs" max={3}>
          <Avatar
            bg="#FFF"
            borderWidth="1px"
            name={"Loading..."}
            src="https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
          />
          <Avatar
            bg="#FFF"
            borderWidth="1px"
            name={"Loading..."}
            src="https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
          />
          <Avatar
            bg="#FFF"
            borderWidth="1px"
            name={"Loading..."}
            src="https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
          />
        </AvatarGroup>
        <Heading size="sm">Title Title Title </Heading>
        <Text size="sm" color="gray.500" fontWeight="bold">
          Subtitle
        </Text>
      </Box>
    </Link>
  );
};

export default HomeFuseCard;
