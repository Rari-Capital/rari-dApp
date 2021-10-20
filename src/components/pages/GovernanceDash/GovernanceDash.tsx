import { useEffect, useState } from "react";
import { RowOrColumn, Column, Row } from "lib/chakraUtils";
import DashboardBox from "components/shared/DashboardBox";
import { useRari } from "context/RariContext";
import { useQuery } from "react-query";
import { getAllProposals } from "hooks/governance/queries";

import { ModalDivider } from "components/shared/Modal";
import { Text, Heading, Image, Spinner }  from "@chakra-ui/react";

import { useTranslation } from 'next-i18next';
import { useIsNotBigScreen } from "hooks/useIsNotBigScreen";
import { useIsSemiSmallScreen } from "hooks/useIsSemiSmallScreen"
import { motion } from "framer-motion";


import BarFilter from "./BarFilter"
import DisplayProposals from "./DisplayProposals"
import SubscribeBox from "./SubscribeBox"
import TreasuryBox from "./TreasuryBox"
import WarningBar from "./WarningBar"
import FullPageSpinner from "components/shared/FullPageSpinner";
import { useIsVerySmall } from "hooks/useIsVerySmall"




//make treasury not reload on screen switch - make subscribe button good - make treasury tsx text small on smaller screen
//on active page if no active proposals allow users to switch to all proposals

const GovernanceDashPage = () => {


  const [whichProposals, setWhichProposals] = useState("All")




  const { t } = useTranslation();
  const isMobile = useIsSemiSmallScreen();
  const isVerySmall = useIsVerySmall();
  const { rari } = useRari();


  const { data: proposals } = useQuery('null',
    async () => {
      const proposals = await getAllProposals(rari)
      console.log("proposals: ", proposals)
      return proposals.reverse()
    }
  )




  const isActiveProposal = () => {
    if (typeof(proposals) != "undefined"  && proposals.filter(p => p.state =="Active").length > 0) {
      return true
    }
    else {
      return false
    }
  }





  return (
    <>
      <RowOrColumn

        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        isRow={isMobile ? false : true}
        color="#FFFFFF"
        width={isMobile ? "100%" : "100%"}
        height="100%"
        paddingLeft={isMobile ? "40px" :"40px"}
        paddingTop="30px"
        >
        {
          !proposals ? <Column
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          paddingBottom="200px"
          height = "931px"
          width = {isMobile ? "100%" :"70%"}

          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="#121212"
              size="xl"
            />
          </Column> :

          <Column
          mainAxisAlignment="flex-start"
          height = "100%"
          width = {isMobile ? "100%" :"70%"}
          paddingRight={isMobile ? "40px" : "40px"}
          >
            {isActiveProposal() ?
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
              >
                <WarningBar proposals={proposals} />
              </motion.div>
              : null}

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
            >
              <Column
              with="100%"
              >

                <DashboardBox
                height = "931px"
                width = "100%"
                backgroundColor = "#000000"
                borderColor ="#4D4D4D"
                >
                  <Column width="100%" crossAxisAlignment={isVerySmall ? "center" : "flex-start"} paddingLeft={isVerySmall ? "10px" : "25px"} paddingRight="10px"  pt={4} pb={2}>
                    <Heading fontSize = "2xl"   mb={3}>
                    {t("Governance Proposals")}
                    </Heading>

                    <BarFilter setWhichProposals={setWhichProposals} whichProposals={whichProposals}/>
                  </Column>


                      <ModalDivider />

                      <Row
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="flex-start"
                      width="100%"
                      >
                        {
                          isVerySmall ?
                          <Column width = "100%" crossAxisAlignment="center">
                            <Heading fontSize="17px" paddingTop="4px" paddingBottom="4px">
                            {t("Proposal")}
                            </Heading>
                          </Column>
                          :
                          <>
                            <Column width = "75%">
                              <Heading fontSize="17px" paddingLeft="25px" paddingTop="4px" paddingBottom="4px">
                              {t("Proposal")}
                              </Heading>
                            </Column>
                            <Column width="25%" height="100%" mainAxisAlignment="center" crossAxisAlignment="center">
                              <Heading fontSize="17px" paddingTop="4px" paddingBottom="4px">
                              {t("Status")}
                              </Heading>
                            </Column>
                          </>
                        }
                      </Row>
                    <ModalDivider />

                    <Column
                    height="780px"
                    overflowY="scroll"
                    >
                      <DisplayProposals setWhichProposals={setWhichProposals} whichProposals={whichProposals} proposals={proposals}/>
                    </Column>


                </DashboardBox>
              </Column>
            </motion.div>

          </Column>
        }

        <RowOrColumn
        isRow = {false}
        crossAxisAlignment = {isMobile ? "flex-start" : "center"}
        paddingTop = {isMobile ? "35px" : ""}
        paddingRight = {isMobile ? "" : "40px"}
        width = {isMobile ? "100%" : "40%"}
        height = "100%"
        >

        {
          <>
          {!isMobile ? <SubscribeBox/> : null}
          <Column
            paddingRight={isMobile ? "40px" : ""}
            width="100%"
            paddingTop={!isMobile ? "35px" : ""}
            crossAxisAlignment="center"
          >
              <TreasuryBox/>
          </Column>
          {isMobile ? <Column paddingRight="40px" width="100%" crossAxisAlignment="flex-start" paddingTop="35px"> <SubscribeBox/> </Column>: null}


          </>
        }
        </RowOrColumn>

      </RowOrColumn>


    </>
  )
};







export default GovernanceDashPage



/*




  return (
    <>
      <RowOrColumn

        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        isRow={isNotBig || isMobile ? false : true}
        color="#FFFFFF"
        width={isNotBig || isMobile ? "100%" : "100%"}
        height="100%"
        paddingLeft={isMobile ? "40px" :"66px"}
        paddingTop="30px"
        >
        {
          !proposals ? <Column
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          paddingBottom="200px"
          height = "931px"
          width = {isNotBig || isMobile ? "100%" :"70%"}

          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="#121212"
              size="xl"
            />
          </Column> :

          <Column
          mainAxisAlignment="flex-start"
          height = "100%"
          width = {isNotBig || isMobile ? "100%" :"70%"}
          paddingRight={isNotBig ? "66px" : isMobile ? "40px" : ""}


          >
            {isActiveProposal() ?
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
              >
                <WarningBar proposals={proposals} />
              </motion.div>
              : null}

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
            >
              <Column
              with="100%"
              >

                <DashboardBox
                height = "931px"
                width = "100%"
                backgroundColor = "#000000"
                borderColor ="#4D4D4D"
                >
                  <Column width="100%" crossAxisAlignment={isVerySmall ? "center" : "flex-start"} paddingLeft={isVerySmall ? "10px" : "25px"} paddingRight="10px">
                    <Heading fontSize = "20px" paddingTop="4px" paddingBottom="10px" >
                    {t("Governance Proposals")}
                    </Heading>

                    <BarFilter setWhichProposals={setWhichProposals}/>
                  </Column>


                      <ModalDivider />

                      <RowOrColumn
                      mainAxisAlignment="flex-start"
                      crossAxisAlignment="flex-start"

                      width="100%"
                      isRow={true}
                      >
                        <Column width = "75%">
                          <Heading fontSize="17px" paddingLeft="25px" paddingTop="4px" paddingBottom="4px">
                          {t("Proposal")}
                          </Heading>
                        </Column>
                        <Column width="25%" height="100%" mainAxisAlignment="center" crossAxisAlignment="center">
                          <Heading fontSize="17px" paddingTop="4px" paddingBottom="4px">
                          {t("Status")}
                          </Heading>
                        </Column>
                      </RowOrColumn>
                    <ModalDivider />

                    <Column
                    height="810px"
                    overflowY="scroll"
                    >
                      <DisplayProposals whichProposals={whichProposals} proposals={proposals}/>
                    </Column>


                </DashboardBox>
              </Column>
            </motion.div>

          </Column>
        }

        <RowOrColumn
        isRow = {isNotBig}
        crossAxisAlignment = {isNotBig || isMobile ? "flex-start" : "center"}
        paddingTop = {isNotBig || isMobile ? "35px" : ""}
        width = {isNotBig || isMobile ? "100%" : "40%"}
        height = "100%"
        >
          {isNotBig ?
            <>
              <Column width="100%" crossAxisAlignment="flex-start">
                  <TreasuryBox/>
              </Column>

              <Column width="100%" crossAxisAlignment="flex-end" paddingRight="66px">
                  <SubscribeBox/>
              </Column>
            </>
           :
            <>
                {!isMobile ? <SubscribeBox/> : null}
              <Column
                paddingRight={isMobile ? "40px" : ""}
                width={isMobile ? "100%" : ""}
                paddingTop={!isNotBig & !isMobile ? "35px" : ""}
              >
                  <TreasuryBox/>
              </Column>
              {isMobile ? <Column paddingRight="66px" width="100%" crossAxisAlignment="flex-start" paddingTop="35px"> <SubscribeBox/> </Column>: null}
            </>}
        </RowOrColumn>

      </RowOrColumn>


    </>
  )
};



*/
