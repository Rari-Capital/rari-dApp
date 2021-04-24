import React from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';

// Hooks
import { usePool2APR } from 'hooks/pool2/usePool2APR';
import { usePool2UnclaimedRGT } from 'hooks/pool2/usePool2UnclaimedRGT';
import { usePool2Balance } from 'hooks/pool2/usePool2Balance';

const Earn = () => {

    const apr = usePool2APR()
    const earned = usePool2UnclaimedRGT()
    const balance = usePool2Balance()

    const balanceSLP = balance?.hasDeposited ? balance.SLP!.toFixed(4) : "0.0000"
    const balanceETH = balance?.hasDeposited ? balance.eth!.toFixed(0) : "0.0000"
    const balanceRGT = balance?.hasDeposited ? balance.rgt!.toFixed(0) : "0.0000"

    console.log({ balance })

    return (
        <>
            <Table variant="simple">
                <Thead color="white">
                    <Tr>
                        <Th color="white">Pool</Th>
                        <Th color="white">APY</Th>
                        <Th color="white">Deposits</Th>
                        <Th color="white">RGT Earned</Th>
                        <Th color="white">Growth</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        balance?.SLP > 0
                            ? (
                                <>
                                    <Tr>
                                        <Td>RGT-ETH</Td>
                                        <Td>{apr}%</Td>
                                        <Td>{balanceSLP} RGT-ETH</Td>
                                        <Td>{earned.toFixed(2)} RGT</Td>
                                        <Td>0%</Td>
                                    </Tr>
                                    {/* Todo (sharad) - implement totals for apy and growth */}
                                    <Tr>
                                        <Td>Total</Td>
                                        <Td>{apr}%</Td>
                                        <Td>{balanceSLP} RGT-ETH</Td>
                                        <Td>{earned.toFixed(2)} RGT</Td>
                                        <Td>0%</Td>
                                    </Tr>
                                </>
                            )
                            : (
                                <Tr>
                                    No pool 2 Balance to show
                                </Tr>
                            )
                    }
                </Tbody>
            </Table>
        </>
    );
};

export default Earn

