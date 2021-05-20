import React from "react";
import {
  AvatarGroup,
  Avatar,
  Box,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import {
  FusePoolData,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";

import { motion } from "framer-motion";

const HomeFuseCard = ({ pool }: { pool: FusePoolData }) => {

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
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
          <AvatarGroup my={1} size="xs" max={3}>
            {pool.assets.slice(0, 3).map((asset) => {
              const _asset = asset as USDPricedFuseAssetWithTokenData;
              return (
                <Avatar
                  bg="#FFF"
                  borderWidth="1px"
                  name={"Loading..."}
                  src={_asset?.tokenData?.logoURL ?? undefined}
                />
              );
            })}
          </AvatarGroup>
          <Heading size="sm">{pool.name}</Heading>
          <Text size="sm" color="gray.500" fontWeight="bold">
            Subtitle
          </Text>
        </Box>
      </Link>
    </motion.div>
  );
};

export default HomeFuseCard;
