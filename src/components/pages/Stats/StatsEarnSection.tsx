import React, { useMemo } from 'react';
import {
  Table,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner
} from '@chakra-ui/react';
import { motion } from 'framer-motion'


import { useAggregatePoolInfos } from 'hooks/usePoolInfo';
import { smallUsdFormatter } from 'utils/bigUtils';

const Earn = () => {

  const { totals, aggregatePoolsInfo } = useAggregatePoolInfos()

  const hasDeposits = useMemo(() => totals.balance > 0, [totals.balance])

  console.log({ totals, aggregatePoolsInfo })

  return (
    <motion.div
      key="earn"
      style={{ width: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
            if (p?.poolBalance && !p.poolBalance.isZero()) return (
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
            <Td><Text fontWeight={hasDeposits && "bold"}>Total</Text></Td>
            <Td></Td>
            <Td><Text fontWeight={hasDeposits && "bold"}>{smallUsdFormatter(totals?.balance)}</Text></Td>
            <Td><Text fontWeight={hasDeposits && "bold"}>{totals?.interestEarned}</Text></Td>
            <Td></Td>
          </Tr>
        </Tbody>
      </Table>
    </motion.div>
  );
};

export default Earn
