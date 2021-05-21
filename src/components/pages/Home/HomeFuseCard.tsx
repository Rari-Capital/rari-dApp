import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

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
import { HomepageFusePool, HOMEPAGE_FUSE_POOLS } from "constants/homepage";

const HomeFuseCard = ({ pool }: { pool: FusePoolData }) => {
  
  const { title, subtitle } : HomepageFusePool = useMemo(
    () => HOMEPAGE_FUSE_POOLS.find((p) => p.id === pool.id)!,
    [pool]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <Link
        to={`/fuse/pool/${pool.id}`}
        as={RouterLink}
        style={{ textDecoration: "none" }}
      >
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
            transform: "translateY(-7px)",
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
                  key={_asset.underlyingToken}
                />
              );
            })}
          </AvatarGroup>
          <Heading size="sm">{pool.name}</Heading>
          <Text size="sm" color="gray.500" fontWeight="bold">
            {subtitle}
          </Text>
        </Box>
      </Link>
    </motion.div>
  );
};

export default HomeFuseCard;
