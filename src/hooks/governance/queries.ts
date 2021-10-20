const rariGovAdr = "0x91d9c2b5cf81d55a5f2ecc0fc84e62f9cd2cefd6"
var governanceAbi = require( "lib/rari-sdk/governance/abi/RariGovBravo.json");
import {timestampToTime, timestampToDate} from "utils/timestampUtilities"

//const rariGovAdr = "0xc0Da02939E1441F497fd74F78cE7Decb17B66529"  //this is actually compound address for debugging

import { useQuery } from "react-query";
import { useRari } from "context/RariContext";

const enumerateProposalState = (state) => {
  const proposalStates = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
  return proposalStates[state];
};

export const getAllProposals = async (rari) => {

  const govBravContract = new rari.web3.eth.Contract(governanceAbi, rariGovAdr ) //???
  const initialProposalId = await govBravContract.methods.initialProposalId().call();
  const proposalCount = await govBravContract.methods.proposalCount().call();
  const proposalGets = [];
  const proposalStateGets = [];

  for (let i = parseFloat(initialProposalId) + 1; i <= proposalCount;  i++ ){
    proposalGets.push(govBravContract.methods.proposals(i).call());
    proposalStateGets.push(govBravContract.methods.state(i).call());
  }

  const proposals = await Promise.all(proposalGets);
  const proposalStates = await Promise.all(proposalStateGets);

  const proposalCreatedEvents = await govBravContract.getPastEvents('ProposalCreated', {
   fromBlock: 0,
   toBlock: 'latest'
  });

  const proposalCanceledEvents = await govBravContract.getPastEvents('ProposalCanceled', {
   fromBlock: 0,
   toBlock: 'latest'
  });


  proposals.forEach( (p, i) => {
    const { description } = proposalCreatedEvents[i].returnValues;
    //console.log("description: ", description)
    p.title = description.split(/# |\n/g)[1] || 'Untitled'

    var desc = description.substring(p.title.length + 2) //+2 removes "# "
    //console.log("desc: ", desc)

    const descLinks = description.split("[Snapshot](")[1] || "no links"// splits on "[Snapshot](", takes links and some filler chars

    desc = desc.substring(0, desc.length - descLinks.length - 11) //-11 removes "[Snapshot](" from desc

    let snapshot = "no link"
    let forum = "no link"

    if (descLinks != "no links"){
      snapshot = descLinks.split("[Forums]")[0]
      forum = (descLinks.split("[Forums]")[1]).substring(1)

      snapshot = snapshot.substring(0, snapshot.length - 3) //removes space and )
      forum = forum.substring(0, forum.length - 1) //removes )
      p.description = desc
    }
    else{
      p.description = "unformatted description"
    }

    p.snapshot = snapshot
    p.forum = forum
    p.state = enumerateProposalState(proposalStates[i]);

    getLables(rari, p)


    //for debugging
/*
    if (p.state == "Executed"){
      p.state = "Active"
      p.againstVotes = "1059118182549173786924391"
      //console.log("p: ", p)
    }
*/

  });

  let pCanceledIndex = 0
  proposals.map(p => {
    if (p.state == "Canceled"){
      p.canceledBlock = proposalCanceledEvents[pCanceledIndex].blockNumber
      pCanceledIndex++
    }
  })

  const lables = await getLables(rari, proposals)
  proposals.forEach( (p, i) => p.dateLable = lables[i])

  return proposals

}




const getLables = async (rari, proposals) => {
  const recentBlock = await rari.web3.eth.getBlock('latest')
  const lables = []




  for (let i = 0; i < proposals.length; i++){

    let str = "dd";
    if (proposals[i].state == "Pending") {

      const ts = (recentBlock.timestamp + (proposals[i].startBlock - recentBlock.number)*13.1)

      str = "Voting Starts in: " + timestampToTime(ts - Date.now()/1000)

    }
    else if (proposals[i].state == "Active"){

      const recentBlock = await rari.web3.eth.getBlock('latest')
      const ts = (proposals[i].endBlock - recentBlock.number)*13.1

      str = "Voting Ends In: " + timestampToTime(ts)
    }
    else if (proposals[i].state == "Canceled"){
      let block = await rari.web3.eth.getBlock(proposals[i].canceledBlock)
      let ts = block.timestamp*1000

      str = "Canceled on: " + timestampToDate(ts)

    }

    else {
      let block = await rari.web3.eth.getBlock(proposals[i].endBlock)
      let ts = block.timestamp*1000
      let header;

      if (proposals[i].state == "Queued"){
        header = "Queued on: "
      }
      if (proposals[i].state == "Defeated"){
        header = "Defeated on: "
      }
      if (proposals[i].state == "Succeeded"){
        header = "Succeeded on: "
      }
      if (proposals[i].state == "Expired"){
        header = "Expired on: "
      }
      if (proposals[i].state == "Executed"){
        header = "Executed on: "
      }
      str = header + timestampToDate(ts)
    }
    lables.push(str)

  }


  return lables
}
