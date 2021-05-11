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
      <Box height="120px" width="200px" background="lime" ml={10} p={5} _hover={{
          background:'pink'
      }}>
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
        <Text size="sm" color="gray.500" fontWeight="bold">Subtitle</Text>
      </Box>
    </Link>
  );
};

export default HomeFuseCard;
