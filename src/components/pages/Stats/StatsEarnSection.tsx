import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

// Todo (sharad) - complete these hooks
import { useAggregatePoolInfos } from 'hooks/usePoolInfo';

const mockData = [
  {
    poolName: 'Stable',
    poolAddress: "0x1234",
    apy: "40%",
    deposits: 700300,
    interestEarned: 41300,
    growth: 5.9
  },
  {
    poolName: 'ETH',
    poolAddress: "0x12345",
    apy: "20%",
    deposits: "200",
    interestEarned: 41300,
    growth: 5.9
  },
  {
    poolName: 'Yield',
    poolAddress: "0x123456",
    apy: "50%",
    deposits: 10,
    interestEarned: 41300,
    growth: 5.9
  },
]

const Earn = () => {

  const aggregatePoolInfos = useAggregatePoolInfos()
  console.log({ aggregatePoolInfos })

  return (
    <>
      <Table variant="simple">
        <Thead color="white">
          <Tr>
            <Th color="white">Pool</Th>
            <Th color="white">APY</Th>
            <Th color="white">Deposits</Th>
            <Th color="white">Interest</Th>
            <Th color="white">Growth</Th>
          </Tr>
        </Thead>
        <Tbody>
          {aggregatePoolInfos.map(p => {
            return (
              <Tr key={p.poolInfo.tile}>
                <Td>{p.poolInfo.title}</Td>
                <Td>{p.poolAPY}%</Td>
                <Td>{p.formattedBalance ?? '?'}</Td>
                <Td>{p.poolInterestEarned}%</Td>
                <Td>{p.poolGrowth}%</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </>
  );
};

export default Earn
