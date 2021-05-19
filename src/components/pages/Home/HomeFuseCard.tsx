import React from "react";
import {
  AvatarGroup,
  Avatar,
  Box,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import { FusePoolData, USDPricedFuseAsset } from "utils/fetchFusePoolData";

const HomeFuseCard = ({ pool }: { pool: FusePoolData }) => {
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
          opacity: 1,
          transform: "translateY(-5px)",
        }}
      >
        <AvatarGroup my={1} size="xs" max={0}>
          {pool.assets.slice(0,2).map((asset : USDPricedFuseAsset, i) => {
            console.log(i, asset)
            return (
              <Avatar
              bg="#FFF"
              borderWidth="1px"
              name={"Loading..."}
              src="https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
            /> 
            )
          })}
        </AvatarGroup>
        <Heading size="sm">{pool.name}</Heading>
        <Text size="sm" color="gray.500" fontWeight="bold">
          Subtitle
        </Text>
      </Box>
    </Link>
  );
};

export default HomeFuseCard;
