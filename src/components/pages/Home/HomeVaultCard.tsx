import { useMemo } from "react";
import { Box, Heading, Image, Text, Skeleton } from "@chakra-ui/react";
import { Column } from "lib/chakraUtils";

import { HomepageOpportunity } from "constants/homepage";
import { useOpportunitySubtitle } from "hooks/homepage/useOpportunitySubtitle";
import { getOpportunityLink } from "utils/homepage";
import AppLink from "components/shared/AppLink";

const HomeVaultCard = ({
  opportunity,
}: {
  opportunity: HomepageOpportunity;
}) => {
  const subheading = useOpportunitySubtitle(opportunity);
  const link = useMemo(() => getOpportunityLink(opportunity), [opportunity]);

  return (
    <AppLink href={link} style={{ textDecoration: "none" }}>
      <Box>
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
            transform: "translateY(-10px)",
            boxShadow: ".5px 1px 2px grey;",
          }}
          bg={opportunity.bgColor}
        >
          <Heading size="sm">{opportunity.title} </Heading>
          <Skeleton isLoaded={!!subheading} height="10px">
            <Text fontSize="xs">{`${subheading}`}</Text>
          </Skeleton>
          <Box alignSelf="center" mt="auto" mb="auto">
            <Image
              src={opportunity.icon}
              boxSize="70px"
              float="left"
              my="auto"
            />
          </Box>
        </Column>
      </Box>
    </AppLink>
  );
};

export default HomeVaultCard;
