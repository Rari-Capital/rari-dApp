import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Heading, Link, Image, Text } from "@chakra-ui/react";
import { Column } from "buttered-chakra";

import { HomepageOpportunity } from "constants/homepage";
import { useOpportunitySubtitle } from "hooks/homepage/useOpportunitySubtitle";
import { getOpportunityLink } from "utils/homepage";

const HomeVaultCard = ({
  opportunity,
}: {
  opportunity: HomepageOpportunity;
}) => {
  const subheading = useOpportunitySubtitle(opportunity);
  const link = useMemo(() => getOpportunityLink(opportunity), [opportunity]);

  return (
    <Link to={link} as={RouterLink} style={{ textDecoration: "none" }}>
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
        }}
        bg={opportunity.bgColor}
      >
        <Heading size="sm">{opportunity.title} </Heading>
        <Text fontSize="xs">{subheading}</Text>
        <Box alignSelf="center" mt="auto" mb="auto">
          <Image src={opportunity.icon} boxSize="70px" float="left" my="auto" />
        </Box>
      </Column>
    </Link>
  );
};

export default HomeVaultCard;
