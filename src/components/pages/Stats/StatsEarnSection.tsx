import React from 'react';
import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from '@chakra-ui/react';

// Todo (sharad) - complete these hooks
import { usePoolBalance, usePoolBalances } from 'hooks/usePoolBalance';
import { usePoolAPYs } from 'hooks/usePoolAPY';
import { usePoolInfo, usePoolInfoFromContext, usePoolInfos } from 'hooks/usePoolInfo';

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
  const poolInfos = usePoolInfos()
  const poolAPYs = usePoolAPYs()

  console.log({poolInfos, poolAPYs})

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
          {mockData.map(p => {
            return (
              <Tr key={p.poolName}>
                <Td>{p.poolName}</Td>
                <Td>{p.apy}</Td>
                <Td>{p.deposits}</Td>
                <Td>{p.interestEarned}%</Td>
                <Td>{p.growth}%</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </>
  );
};

export default Earn
