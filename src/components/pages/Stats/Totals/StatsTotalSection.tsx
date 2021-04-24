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
import { usePool2APR } from 'hooks/pool2/usePool2APR';
import { usePool2UnclaimedRGT } from 'hooks/pool2/usePool2UnclaimedRGT';
import { usePool2Balance } from 'hooks/pool2/usePool2Balance';

// Components
import EarnRow from './EarnRow';
import FuseRow from './FuseRow'
import Pool2Row from './Pool2Row'

export default () => {
  // Earn
  const { totals, aggregatePoolsInfo } = useAggregatePoolInfos()
  const hasDepositsInEarn = aggregatePoolsInfo?.some((p) => !p?.poolBalance?.isZero())

  // Fuse
  const { filteredPools: filteredFusePools } = useFusePools('my-pools')
  const poolIds: number[] = filteredFusePools?.map(({ id }) => id) ?? []
  const fusePoolsData: any[] | null = useFusePoolsData(poolIds)

  // Pool2
  const apr = usePool2APR()
  const earned = usePool2UnclaimedRGT()
  const balance = usePool2Balance()
  const hasDepositsInPool2 = !!balance?.SLP

  console.log({ aggregatePoolsInfo, hasDepositsInEarn })

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
          {fusePoolsData && <FuseRow fusePoolsData={fusePoolsData} filteredPoolsData={filteredFusePools} />}
          {/* earn section */}
          {hasDepositsInEarn && <EarnRow poolsInfo={aggregatePoolsInfo} />}
          {/* Pool2 Section */}
          {hasDepositsInPool2 && <Pool2Row apr={apr} earned={earned} balance={balance} />}
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
