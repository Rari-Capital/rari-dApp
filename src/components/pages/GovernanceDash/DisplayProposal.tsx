import { Row, Column, RowOrColumn } from "lib/chakraUtils";
import { Text, Heading, Link, Box }  from "@chakra-ui/react";
import { ModalDivider } from "components/shared/Modal";
import { useRari } from "context/RariContext";
import  { timestampToTime }  from "utils/timestampUtilities";
import ProgressBar from "./ProgressBar";
import StatusBox from "./StatusBox"
import { useIsSmallScreen } from "hooks/useIsSmallScreen"
import { useIsVerySmall } from "hooks/useIsVerySmall"

const DisplayProposal = (props) => {
  const proposal = props.proposal
  const { rari } = useRari();
  const isMobile = useIsSmallScreen()
  const isVerySmall = useIsVerySmall()


  const voteResult = () => {
    if ((proposal.forVotes == "0") && (proposal.againstVotes == "0") ){
      return "No Votes"
    }
    else{
      const forP = (parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))*100).toFixed(0)
      const againstP =  (parseFloat(proposal.againstVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))*100).toFixed(0)
      return forP.toString() + "% / " + againstP.toString() + "%"
    }
  }

  return(
    <>
      <RowOrColumn
      isRow={!(isVerySmall && proposal.state == "Active")}
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      paddingTop="13px"
      paddingBottom="13px"
      >
        <Column width={isVerySmall ? "100%" : "75%"} paddingLeft={isVerySmall ? "10px" :"25px"} paddingRight={isVerySmall ? "10px" : ""} textAlign={isVerySmall ? "center" : ""}>
          <Heading fontSize={isVerySmall ? "15px" : "17px"}  paddingTop="4px" >
            <Link href={"/governance/proposals/" + proposal.id}>
            {"["}{proposal.id}{"] "}{proposal.title}
            </Link>
          </Heading>
          <RowOrColumn isRow={!isVerySmall} crossAxisAlignment="center" paddingTop={isVerySmall ? "7px" : ""} >
            <StatusBox state={proposal.state} width="60px" height="18px"/>
            <Text fontSize={isVerySmall ? "15px" : "17px"} paddingLeft={isVerySmall ? "" : "10px"} paddingTop={isVerySmall ? "5px" : ""}  fontWeight={proposal.state == "Active" ? "semibold" : ""} flexWrap="wrap">
            {proposal.dateLable}

            </Text>
          </RowOrColumn>
        </Column>
        {proposal.state == "Active" ? <ActiveProposalDisplay forVotes={proposal.forVotes/1000000000000000000} againstVotes={proposal.againstVotes/1000000000000000000} /> :
        !isVerySmall ?
        <Column width="25%" height="100%" mainAxisAlignment="center" crossAxisAlignment="center">
          <StatusBoxBig  state={proposal.state}/>
        </Column>
          : null
        }








      </RowOrColumn>
      <ModalDivider />
    </>
  )
}

//borderColor="purple.400"


const StatusBoxBig = ({state}) => {

  return(
    <>
      <Box
      width="90px"
      height="26px"
      borderWidth="1px"
      borderRadius="5px"

      >
        <Column  expand mainAxisAlignment="center" crossAxisAlignment="center">
        <Heading fontSize="15px">
          {state}

        </Heading>
        </Column>
      </Box>

    </>
  )
}

const ActiveProposalDisplay = ({forVotes, againstVotes}) => {
  const isVerySmall = useIsVerySmall()

  const percentFor = () => {
    return (parseFloat(forVotes) / (parseFloat(forVotes) + parseFloat(againstVotes)))
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

  return (
    <>
      {
        !isVerySmall ?
        <Row width="42%" height="100%" paddingLeft="10px"  mainAxisAlignment="center" crossAxisAlignment="flex-start" >
        <Column width="70%" height="100%" mainAxisAlignment="center" crossAxisAlignment="flex-end">
          <Row width="100%" paddingBottom="15px">
            <ProgressBar percentageFilled={percentFor()} filledColor="#41C345" />
          </Row>
          <Row width="100%">
            <ProgressBar percentageFilled={1-percentFor()} filledColor="#C91C05"/>
          </Row>

        </Column>

        <Column width="30%" height="100%" mainAxisAlignment="center" crossAxisAlignment="flex-start" pl={2} pr={2}>
          <Text fontSize="14px" paddingBottom="3px">
          {presentVotes(forVotes)}
          </Text>

          <Text fontSize="14px" >
          {presentVotes(againstVotes)}
          </Text>

        </Column>
      </Row>
      :
      <Column width="100%" height="100%" paddingRight="25px" paddingLeft="25px" paddingTop="5px" mainAxisAlignment="center" crossAxisAlignment="center" >
        <Row width="100%">
          <Row width="100%">
            <Column width="50%" crossAxisAlignment="flex-end" paddingRight="10px">
              <Text fontSize="14px" >
              {presentVotes(forVotes)}
              </Text>
            </Column>
            <Column width="50%" paddingLeft="10px" crossAxisAlignment="flex-end">
              <Text fontSize="14px" >
              {presentVotes(againstVotes)}
              </Text>
            </Column>
          </Row>
        </Row>
        <Row width="100%">
          <Row width="100%">
            <Column width="100%" paddingRight="10px">
              <ProgressBar percentageFilled={percentFor()} filledColor="#41C345" />
            </Column>
            <Column width="100%" paddingLeft="10px">
              <ProgressBar percentageFilled={1-percentFor()} filledColor="#C91C05"/>
            </Column>

          </Row>
        </Row>

      </Column>
    }
  </>
  )
}







export default DisplayProposal
