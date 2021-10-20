import { NextApiRequest, NextApiResponse } from "next";
import { queryAllUnderlyingAssets } from "services/gql";
import {makeHasuraRequest} from "utils/gql"
import {GET_TREASURY_TRANSACTIONS, INSERT_TREASURY_TRANSACTIONS_MUTATION} from "gql/insertTreasuryTransactions"
import axios from "axios"



//this is just my abi for now
const etherscanApi = "https://api.etherscan.io/api?module=account&action=txlist&address=0x10dB6Bce3F2AE1589ec91A872213DAE59697967a&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=3YJK1NIK13TFEKSXRA91GBZJ2FP5A7KWA1"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllAssetsResponse>
) {
  if (req.method === "GET") {
    const result = await makeHasuraRequest(GET_TREASURY_TRANSACTIONS)
    console.log(result)
    return res.json(result)
  }
  else if (req.method === "POST") {

    const response = await axios.get(etherscanApi)
    const treasuryData = response.data.result
    console.log(treasuryData.reverse())

    let formattedData = []
    treasuryData.map(t => {
      const x = {
        id: t.hash,
        block_number: t.blockNumber,
        to: t.to,
        from: t.from,
        value: t.value
      }
      formattedData.push(x)
    })

    const result = await makeHasuraRequest(INSERT_TREASURY_TRANSACTIONS_MUTATION, { objects: formattedData })
    console.log(result)
    return res.json(result)

  }
}
