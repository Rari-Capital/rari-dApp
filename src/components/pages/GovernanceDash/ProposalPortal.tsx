import { RowOrColumn, Column, Row, Center } from "lib/chakraUtils";
import { Text, Heading, Button, Spinner, Box }  from "@chakra-ui/react";

import { getAllProposals } from "hooks/governance/queries";
import DashboardBox from "components/shared/DashboardBox";
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import { useEffect, useState } from "react";
import { useIsSmallScreen } from "hooks/useIsSmallScreen"


import ProgressBar from "./ProgressBar";
import StatusBox from "./StatusBox"

const ProposalPortal = ({ proposalId }) => {
  const [displayProposal, setDisplayProposal] = useState()
  const [validProposal, setValidProposal] = useState()
  const [color, setColor] = useState("#FFFFFF")
  const { rari } = useRari();

  const { data: proposals } = useQuery('null',
    async () => {
      var proposals = await getAllProposals(rari)
      return proposals
    }
  )

  useEffect(() => {
    setupProposal()
  },[proposals])


  const setupProposal = () => {
    if ( (typeof(proposals) != "undefined") && (proposalId <= proposals.length) && (proposalId >  0) ){
      setDisplayProposal(proposals[proposalId - 1])
    }
  }

  return  (
    <>
      {
        (typeof(proposals) != "undefined" && (proposalId > proposals.length || proposalId <  0)) ?
          <Column width="100%" height="100%" mainAxisAlignment="center" crossAxisAlignment="center">
            <Heading fontSize= "34" color="#FFFFFF"> Invalid Proposal </Heading>
            <Heading fontSize= "34" color={color}>
            <a href="/governance" onMouseEnter={() => setColor("#858585")} onMouseLeave={() => setColor("#FFFFFF")}>
              Go Back To The Dashboard
            </a>
            </Heading>
          </Column>

        :
        <ProposalWholePage proposal={displayProposal} />

      }
    </>
  )
}

const ProposalWholePage = ({ proposal }) => {
  const isMobile = useIsSmallScreen()

  return (
    <>
      {

        <Column width="100%" height="100%">
          {
            (typeof(proposal) == "undefined") ?
            <Column width="100%" height="200px" mainAxisAlignment="center" crossAxisAlignment="center">
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="#121212"
                size="xl"
              />
            </Column>
            :

            <ProposalTopInfo proposal={proposal}/>
          }

          <RowOrColumn
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            isRow={!isMobile}
            color="#FFFFFF"
            width="100%"
            paddingLeft={isMobile ? "40px" : "66px"}
            paddingTop="30px"
          >
            <Column
            height = {isMobile ? "800px" : "850px"}
            width = {isMobile ? "100%" : "40%"}
            paddingRight={isMobile ? "40px" : ""}
            paddingBottom={isMobile ? "66px" : ""}
            >
              {typeof(proposal) == "undefined" ?

              <DashboardBox background="#000000">
                <Column width="100%" height="800px" mainAxisAlignment="center" crossAxisAlignment="center">
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="#121212"
                    size="xl"
                  />
                </Column>
              </DashboardBox>

              :
                <iframe src={proposal.forum != "no link" ? proposal.forum : ""} width="100%" height="100%"/>
              }


            </Column>


            <Column
            paddingLeft={isMobile ? "" :"50px"}
            height = {isMobile ? "800px" : "850px"}
            width = {isMobile ? "100%" : "55%"}
            paddingRight={isMobile ? "40px" : ""}
            >
              {typeof(proposal) == "undefined" ?
              <DashboardBox background="#000000">
                <Column width="100%" height="800px" mainAxisAlignment="center" crossAxisAlignment="center">
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="#121212"
                    size="xl"
                  />
                </Column>
              </DashboardBox>
               :
                <iframe src={"https://www.withtally.com/governance/rari/proposal/"+proposal.id} width="100%" height="100%"/>
              }

            </Column>

          </RowOrColumn>
        </Column>
      }
    </>
  )
}

const ProposalTopInfo = ({proposal}) => {
  const [color, setColor] = useState("#858585")
  const isMobile = useIsSmallScreen()

    const percentFor = () => {
      return (parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes)))
    }

    const presentVotes = (votes) => {
      let str = "0"
      if (votes > 1000 && votes < 1000000){
        str = (votes/1000).toFixed(2) + "K"
      }
      else if (votes > 1000000){
        str = (votes/1000000).toFixed(2) + "M"
      }
      return str
    }


  return(
    <Column width="100%">

      <Row mainAxisAlignment="center" paddingBottom="5px">

        <Column crossAxisAlignment="center" mainAxisAlignment="center">
          <Heading color="#FFFFFF" fontSize="30px" textAlign="center">
            {proposal.title}
          </Heading>
          <Row crossAxisAlignment="Center">
            <Column paddingRight="10px">
            <StatusBox state={proposal.state} width="60px" height="18px" />
            </Column>
            <Text color="#FFFFFF">
              {proposal.dateLable}
            </Text>
          </Row>

        </Column>

      </Row>


      <Row mainAxisAlignment="center" paddingBottom="25px">
        <Column width="20%" paddingLeft={isMobile ? "40px" : "66px"} mainAxisAlignment="center" crossAxisAlignment="flex-start" paddingRight="10px">
            <a href="/governance" onMouseEnter={() => setColor("#FFFFFF")} onMouseLeave={() => setColor("#858585")}>
              <Text fontSize="20px" color={color} >
                {"← Back"}
              </Text>
            </a>
        </Column>

        <Column width="30%" paddingRight="30px">
          <Row height="30px">
            <Text color="#FFFFFF"> For </Text>
            <Column width="100%" crossAxisAlignment="flex-end">
              <Text color="#FFFFFF">{presentVotes(proposal.forVotes/1000000000000000000)}</Text>
            </Column>
          </Row>
          <ProgressBar percentageFilled={percentFor()} filledColor="#41C345"/>
        </Column>

        <Column width="30%" paddingLeft="30px">
          <Row height="30px" mainAxisAlignment="flex-start">
            <Text color="#FFFFFF"> Against </Text>
              <Column width="100%" crossAxisAlignment="flex-end">
                <Text color="#FFFFFF">{presentVotes(proposal.againstVotes/1000000000000000000)}</Text>
              </Column>
          </Row>
          <ProgressBar percentageFilled={1-percentFor()} filledColor="#C91C05"/>
        </Column>

        <Column width="20%">
        </Column>

      </Row>

      <Row width="100%">
        <Column width="20%" >
        </Column>

        <Column width = "60%" textAlign="center">

          <Text fontSize="18px" color="#FFFFFF">
            {proposal.description}
          </Text>
        </Column>

        <Column width="20%" >
        </Column>

      </Row>
    </Column>
  )
}









export default ProposalPortal
