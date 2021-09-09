const rariGovAdr = "0x91d9c2b5cf81d55a5f2ecc0fc84e62f9cd2cefd6"
var governanceAbi = require( "lib/rari-sdk/governance/abi/RariGovBravo.json"); //fix path


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

  const voteResult = (for_votes, against_votes) => {

    if ((for_votes == 0.0) && (against_votes == 0.0) ){
      return "No Votes"
    }
    else{
      const forP = (parseFloat(for_votes) / (parseFloat(for_votes) + parseFloat(against_votes))*100).toFixed(0)
      const againstP =  (parseFloat(against_votes) / (parseFloat(for_votes) + parseFloat(against_votes))*100).toFixed(0)
      return (forP.toString() + "% / " + againstP.toString() + "%")
    }
  }

  proposalCreatedEvents.reverse();

  proposals.forEach( (p, i) => {
    const { description } = proposalCreatedEvents[i].returnValues;
    //console.log("desc at  beginning: ", description)
    p.title = description.split(/# |\n/g)[1] || 'Untitled'
    var desc = description.substring(p.title.length + 2)

    const descTrash = description.split("[Snapshot](")[0]
    const descLinks = description.split("[Snapshot](")[1]

    desc = desc.substring(0, desc.length - descLinks.length - 11)
    p.description = desc

    //console.log("descTrash: ", descTrash)
    //console.log("descLinks: ", descLinks)

    var snapshot = descLinks.split("[Forums]")[0]
    var forum = (descLinks.split("[Forums]")[1]).substring(1)

    snapshot = snapshot.substring(0, snapshot.length - 3) //removes space and )
    forum = forum.substring(0, forum.length - 1) //removes )

    p.snapshot = snapshot
    p.forum = forum
    p.state = enumerateProposalState(proposalStates[i]);

  });

  //console.log(proposals)

  return proposals

}


const treasuryTransactions = async (rari) => {

var treasuryAdr = '0x10dB6Bce3F2AE1589ec91A872213DAE59697967a'
var block = await rari.web3.eth.getBlock('latest')
var blockNumber = block.number
var n = await rari.web3.eth.getTransactionCount(treasuryAdr)
var bal = await rari.web3.eth.getBalance(treasuryAdr)



rari.web3.eth.getTransactionCount(treasuryAdr).then(tCount => {
  console.log("tCount: ", tCount)
})

rari.web3.eth.getBalance(treasuryAdr).then(bal => {
  console.log("bal: ", bal)
})
//console.log("curblock: ", bloc)
/*for (var i=blockNumber; i >= 0 && (n > 0 || bal > 0); --i) {
  //console.log("in for")
  try {
      var block = await rari.web3.eth.getBlock(i)
      if (block && block.transactions) {
          block.transactions.forEach(function(e) {
              if (myAddr == e.from) {
                  if (e.from != e.to)
                      bal = bal.plus(e.value);
                  console.log(i, e.from, e.to, e.value.toString(10));
                  --n;
              }
              if (myAddr == e.to) {
                  if (e.from != e.to)
                      bal = bal.minus(e.value);
                  console.log(i, e.from, e.to, e.value.toString(10));
              }
          });
      }
  } catch (e) { console.error("Error in block " + i, e); }
}*/

}


export const getTeasuryTransactions = (rari) => {
  treasuryTransactions(rari)
  console.log("hello")



  return null
}
