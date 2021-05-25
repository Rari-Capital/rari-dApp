import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  AvatarGroup,
  Avatar,
  Heading,
  Link,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import {
  FusePoolData,
  USDPricedFuseAssetWithTokenData,
} from "utils/fetchFusePoolData";

import { HomepageFusePool, HOMEPAGE_FUSE_POOLS } from "constants/homepage";
import DashboardBox from "components/shared/DashboardBox";
import AppLink from "components/shared/AppLink";

const HomeFuseCard = ({ pool }: { pool: FusePoolData | undefined }) => {
  const { title, subtitle }: HomepageFusePool = useMemo(() => {
    if (!pool) return { title: null, subtitle: null, id: -1 };
    return HOMEPAGE_FUSE_POOLS.find((p) => p.id === pool.id)!;
  }, [pool]);

  const assetsSubtitle: string | null = useMemo(() => {
    if (!pool) return null;

    const NUM = 3;

    const symbols: string[] = [];

    pool.assets.forEach((a, i) => {
      const asset = a as USDPricedFuseAssetWithTokenData;
      const { symbol } = asset?.tokenData ?? {};
      if (i < NUM && symbol) symbols.push(symbol!);
    });

    let caption;
    if (pool.assets.length <= 3) {
      caption = symbols.join(", ");
    } else {
      caption = `${symbols.join(", ")}, and ${pool.assets.length - NUM} others`;
    }

    return caption;
  }, [pool]);

  return (
    // <motion.div
    //   initial={{ opacity: 0, x: 40 }}
    //   animate={{ opacity: 1, x: 0 }}
    //   exit={{ opacity: 0, x: -40 }}
    // >
    <AppLink
      href={`/fuse/pool/${pool?.id}`}
      style={{ textDecoration: "none" }}
    >
      <DashboardBox
        height="125px"
        width="300px"
        ml={10}
        p={5}
        transition="transform 0.2s ease 0s"
        opacity={0.9}
        _hover={{
          // background: "grey",
          opacity: 1,
          transform: "translateY(-7px)",
          boxShadow: "0px .2px 4px grey;",
        }}
      >
        <SkeletonText
          isLoaded={!!pool && !!pool.assets.length}
          height="10px"
          noOfLines={2}
          spacing="5"
        >
          <AvatarGroup my={1} size="xs" max={3}>
            {pool?.assets.slice(0, 3).map((asset) => {
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

          <Heading size="sm" mt={2}>{title ?? pool?.name}</Heading>
          <Text size="xs" color="gray.500" fontWeight="bold">
            {subtitle ?? assetsSubtitle}
          </Text>
        </SkeletonText>
      </DashboardBox>
    </AppLink>
    // </motion.div>
  );
};

export default HomeFuseCard;
