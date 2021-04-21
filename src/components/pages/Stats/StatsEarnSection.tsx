import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner
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

  const { totals, aggregatePoolsInfo } = useAggregatePoolInfos()

  console.log({ aggregatePoolsInfo, totals })

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
          {aggregatePoolsInfo?.map(p => {
            if (p?.poolBalance && !p.poolBalance.isZero())return (
              <Tr key={p.poolInfo.title}>
                <Td>{p.poolInfo.title}</Td>
                <Td>{p.poolAPY ?? <Spinner />}%</Td>
                <Td>{p.formattedPoolBalance ?? <Spinner />}</Td>
                <Td>{p.formattedPoolInterestEarned ?? <Spinner />}</Td>
                <Td>{p.formattedPoolGrowth ?? <Spinner />}%</Td>
              </Tr>
            )
          })}
          {/* Todo (sharad) - implement totals for apy and growth */}
          <Tr>
            <Td>Total</Td>
            <Td>0%</Td>
            <Td>{totals?.balance }</Td>
            <Td>{totals?.interestEarned }</Td>
            <Td>0%</Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  );
};

const LoadableTableData = ({ value }: {value: string}) => {}

export default Earn
