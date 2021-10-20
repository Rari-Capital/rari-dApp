import { Column, Row } from "lib/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { useRari } from "context/RariContext";
import { timestampToTime } from "utils/timestampToTime"
import { Heading, Image }  from "@chakra-ui/react";
import { useEffect, useState } from "react";





const WarningBar = ({proposals}) => {
  const { rari } = useRari();

  const mostActiveProposal = () => {

    const activeProposals = (typeof(proposals) == "undefined" ? [] : proposals.filter(p => p.state == "Active"))

    if (activeProposals.length > 0) {
      return ("RIP-" + activeProposals[activeProposals.length - 1].id + " Live for voting right now, don't miss it!")
    }

  }


  

  return(
    <Column paddingBottom="30px">
      <DashboardBox
      height = "45px"
      width = "100%"
      background= "#F7F5F5"
      >
        <Row
        expand
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        textAlign="center"
        px={4}
        >
          <Image
          paddingBottom="2px"
          boxSize="14px"
          src={"/static/icons/alert.svg"}

          />
          <Heading paddingLeft="9px" fontSize = "16px" color = "#0C0B0B"  >
          {mostActiveProposal()}
          </Heading>
        </Row>

      </DashboardBox>
    </Column>
  )
}


export default WarningBar
