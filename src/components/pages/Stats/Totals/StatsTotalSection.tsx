import React from 'react'
import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text
} from '@chakra-ui/react';

//   Hooks
import { useAggregatePoolInfos } from 'hooks/usePoolInfo';
import EarnRow from './EarnRow';


export default () => {
  const { totals, aggregatePoolsInfo } = useAggregatePoolInfos()

  return (
    <>
      <Table variant="simple">
        <Thead color="white">
          <Tr>
            <Th color="white">Product</Th>
            <Th color="white">Pool</Th>
            <Th color="white">Deposits</Th>
            <Th color="white">RGT Earned</Th>
            <Th color="white">Interest Earned</Th>
          </Tr>
        </Thead>

        <Tbody>
          {/* Fuse section */}
          <Tr>
            <Td>Fuse</Td>
            <Td>
              <Text mb={2}>6</Text>
              <Text mb={2}>5</Text>
              <Text mb={2}>2</Text>
            </Td>
            <Td>
              <Text mb={2}>N/A</Text>
              <Text mb={2}>N/A</Text>
              <Text mb={2}>N/A</Text>
            </Td>
            <Td>
              <Text mb={2}>N/A</Text>
              <Text mb={2}>N/A</Text>
              <Text mb={2}>N/A</Text>
            </Td>
            <Td>
              <Text mb={2}>N/A</Text>
              <Text mb={2}>N/A</Text>
              <Text mb={2}>N/A</Text>
            </Td>
          </Tr>
          {/* earn section */}
          <EarnRow poolsInfo={aggregatePoolsInfo} />
          {/* Pool2 Section */}
          <Tr>
            <Td>Pool2</Td>
            <Td>
              <Text>RGT-ETH</Text>
            </Td>
            <Td>
              <Text>$34,374.21</Text>
            </Td>
            <Td>20.34 RGT</Td>
            <Td>N/A</Td>
          </Tr>
          {/* {aggregatePoolsInfo?.map(p => {
              if (p?.poolBalance && !p.poolBalance.isZero())return (
                <Tr key={p.poolInfo.title}>
                  <Td>{p.poolInfo.title}</Td>
                  <Td>{p.poolAPY ?? <Spinner />}%</Td>
                  <Td>{p.formattedPoolBalance ?? <Spinner />}</Td>
                  <Td>{p.formattedPoolInterestEarned ?? <Spinner />}</Td>
                  <Td>{p.formattedPoolGrowth ?? <Spinner />}%</Td>
                </Tr>
              )
            })} */}
          {/* Todo (sharad) - implement totals for apy and growth */}
          <Tr>
            <Td>Total</Td>
            <Td></Td>
            <Td>{totals?.balance}</Td>
            <Td>20.34 RGT</Td>
            <Td>{totals?.interestEarned}</Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  )
}
