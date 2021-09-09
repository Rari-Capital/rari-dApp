import { RowOrColumn, Column } from "lib/chakraUtils";
import { getAllProposals } from "hooks/governance/queries";
import DashboardBox from "components/shared/DashboardBox";
import { useQuery } from "react-query";
import { useRari } from "context/RariContext";



const ProposalPortal = ({ proposalId }) => {



  const { rari } = useRari();

  const { data: proposals } = useQuery('null',
    async () => {
      var proposals = await getAllProposals(rari)
      return proposals
    }
  )


  var displayThisProposal
  var isValidId = true;



  if ( (typeof(proposals) != "undefined") && (proposals.length >= proposalId) && (proposalId > 0) ){
    displayThisProposal = proposals[proposalId-1]
  }
  else {
    isValidId = false
  }


  const displayThis = () => {
    if (isValidId == false){
      return <div> NOT VALID PROPOSAL </div>
    }
    else{
      return <ProposalWholePage proposal={displayThisProposal} />
    }
  }





  return  (
    <>

      {displayThis()}

    </>
  )
}

const ProposalWholePage = ({ proposal }) => {


  return (
    <>


      <RowOrColumn

        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        isRow={true}
        color="#FFFFFF"
        width="100%"
        height="800px"
        paddingLeft="66px"
        paddingTop="30px"
      >
      <Column
      height = "100%"
      width = "40%"
      >
        <DashboardBox
        width="100%"
        height="100%"
        background="#000000"

        >
        {(proposal == "undefined" || proposal.forum  == "undefined") ? <div>LOADING?</div> :
          <iframe src={proposal.forum} width="100%" height="100%"/>
        }
        </DashboardBox>

      </Column>


      <Column
      paddingLeft="66px"
      height = "100%"
      width = "55%"
      >
        <DashboardBox
        width="100%"
        height="100%"
        background="#000000"
        >
        {proposal == 'undefined' ? <div>LOADING?</div> :
          <iframe src={"https://www.withtally.com/governance/rari/proposal/" + proposal.id} width="100%" height="100%"/>
        }
        </DashboardBox>

      </Column>

      </RowOrColumn>

    </>
  )
}











export default ProposalPortal
