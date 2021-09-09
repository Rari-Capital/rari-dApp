import { useEffect, useState } from "react";
import { RowOrColumn, Column, Row } from "lib/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";

import { ModalDivider } from "components/shared/Modal";
import { Text, Heading, Image }  from "@chakra-ui/react";

import { useTranslation } from 'next-i18next';
import { useIsSmallScreen } from "hooks/useIsSmallScreen";


import BarFilter from "./BarFilter"
import DisplayProposals from "./DisplayProposals"
import SubscribeBox from "./SubscribeBox"
import TreasuryBox from "./TreasuryBox"


const GovernanceDashPage = () => {


  const [whichProposals, setWhichProposals] = useState("Active")

  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();


  return (
    <>
      <RowOrColumn

        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        isRow={true}
        color="#FFFFFF"
        width={isMobile ? "100%" : "100%"}
        height="100%"
        px={isMobile ? 4 : 0}


        paddingLeft="66px" //fix later to make look like figma
        paddingTop="30px"
      >
        <Column
        mainAxisAlignment="flex-start"


        height = "100%"
        width = "70%"

        >
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
              boxSize="13px"
              src={"/static/icons/alert.svg"}

              />
              <Text paddingLeft="9px" fontSize = "16px" color = "#0C0B0B"  >
              {t("rip-31: Live for voting right now, don't miss it!")}
              </Text>
            </Row>

          </DashboardBox>
          <Column
          paddingTop = "30px"
          with="100%"
          >
            <DashboardBox
            height = "931px"
            width = "100%"
            backgroundColor = "#000000"
            borderColor ="#4D4D4D"
            >
              <Heading fontSize = "20px" paddingTop="4px" paddingBottom="10px" paddingLeft="25px">
              {t("Governance Proposals")}
              </Heading>
              <BarFilter setWhichProposals={setWhichProposals}/>
              <ModalDivider />

                <RowOrColumn
                mainAxisAlignment="flex-start"
                crossAxisAlignment="flex-start"

                width="100%"
                isRow={true}
                >
                  <Column width = "58%">
                    <Heading fontSize="17px" paddingLeft="25px" paddingTop="4px" paddingBottom="4px">
                    {t("Proposal")}
                    </Heading>
                  </Column>

                  <Column width = "27%">
                    <Heading fontSize="17px" paddingTop="4px" paddingBottom="4px">
                    {t("Results")}
                    </Heading>
                  </Column>

                  <Column width = "15%">
                    <Heading fontSize="17px" paddingTop="4px" paddingBottom="4px">
                    {t("End Date")}
                    </Heading>
                  </Column>
                </RowOrColumn>
                <ModalDivider />

                <Column>
                  <DisplayProposals whichProposals={whichProposals}/>
                </Column>



            </DashboardBox>
          </Column>

        </Column>

        <Column
        mainAxisAlignment = "flex-start"
        crossAxisAlignment = "center"
        width = "40%"
        height = "100%"
        >
        <SubscribeBox/>
        <Column paddingTop="35px">
          <TreasuryBox/>
        </Column>
        </Column>

      </RowOrColumn>
      ---test image---
      <Image
      boxSize="50px"

      src={"/static/icons/alert.svg"} //... idk why this doesnt work
      backgroundSize="100% auto"
      />

    </>
  )
};







export default GovernanceDashPage
