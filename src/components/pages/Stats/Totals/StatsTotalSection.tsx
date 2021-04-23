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

// Hooks
import { useAggregatePoolInfos } from 'hooks/usePoolInfo';
import { useFusePools } from 'hooks/fuse/useFusePools';
import { useFusePoolsData } from 'hooks/useFusePoolData';

// Components
import EarnRow from './EarnRow';
import FuseRow from './FuseRow'

export default () => {
  const { totals, aggregatePoolsInfo } = useAggregatePoolInfos()

  const { filteredPools: filteredFusePools } = useFusePools('my-pools')
  const poolIds: number[] = filteredFusePools?.map(({ id }) => id) ?? []
  const fusePoolsData: any[] | null = useFusePoolsData(poolIds)

  console.log({fusePoolsData, filteredFusePools})

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
          <FuseRow filteredPoolsData={filteredFusePools} fusePoolsData={fusePoolsData} />
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
