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
              <Text>6</Text>
              <Text>5</Text>
              <Text>2</Text>
            </Td>
            <Td>
              <Text>Deposits</Text>
              <Text>Deposits</Text>
              <Text>Deposits</Text>
            </Td>
            <Td>RGT Earned</Td>
            <Td>Interest Earned</Td>
          </Tr>
          {/* earn section */}
          <EarnRow poolsInfo={aggregatePoolsInfo} />
          {/* Pool2 Section */}
          <Tr>
            <Td>Pool2</Td>
            <Td>
              <Text>Pool2</Text>
            </Td>
            <Td>
              <Text>Deposits</Text>
            </Td>
            <Td>RGT Earned</Td>
            <Td>Interest Earned</Td>
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
            <Td>0 RGT</Td>
            <Td>{totals?.interestEarned}</Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  )
}
