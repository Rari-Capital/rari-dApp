import { useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  Skeleton,
} from "@chakra-ui/react";
import { Column, Row } from "utils/chakraUtils";

import { HomepageOpportunity } from "constants/homepage";
import { useOpportunitySubtitle } from "hooks/homepage/useOpportunitySubtitle";
import { getOpportunityLink } from "utils/homepage";
import AppLink from "components/shared/AppLink";

const OpportunityCard = ({
  opportunity,
}: {
  opportunity: HomepageOpportunity;
}) => {
  const subheading: string | null = useOpportunitySubtitle(opportunity);
  const link = useMemo(() => getOpportunityLink(opportunity), [opportunity]);

  return (
    <AppLink
    href={link}
    style={{ textDecoration: "none" }}
  >
    <Box
      bg={opportunity.bgColor}
      height="130px"
      width="100%"
      borderRadius="lg"
      p={["5%", "5%", "5%"]}
      transition="transform 0.2s ease 0s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: ".2px .3px 1px white;",
      }}
    >
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        h="100%"
      >
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height={"100%"}
          flex="0 0 70%"
        >
          <Heading size="sm">{opportunity.title}</Heading>
          <Skeleton isLoaded={!!subheading} height="10px" my={1}>
            <Text fontSize="xs" fontWeight="bold">{`${subheading}`}</Text>
          </Skeleton>
          <Text fontSize="xs" mt={2}>
            {opportunity.subtitle}
          </Text>
        </Column>
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height={"100%"}
          flex="0 1 30%"
        >
          <Image src={opportunity.icon} boxSize="60px" my="auto" mx="auto" />
        </Column>
      </Row>
    </Box>
    </AppLink>
  );
};

export default OpportunityCard;
