import React, { useMemo } from 'react';
import {
    Box,
    Table,
    Text,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Avatar,
} from '@chakra-ui/react';
import { motion } from 'framer-motion'
import { QuestionOutlineIcon } from '@chakra-ui/icons'

// Hooks
import { usePool2APR } from 'hooks/pool2/usePool2APR';
import { usePool2UnclaimedRGT } from 'hooks/pool2/usePool2UnclaimedRGT';
import { usePool2Balance } from 'hooks/pool2/usePool2Balance';
import { SimpleTooltip } from 'components/shared/SimpleTooltip';
import { Row } from 'buttered-chakra';
import { smallUsdFormatter } from 'utils/bigUtils';
import { useMySaffronData, usePrincipal, TranchePool, TrancheRating, useEstimatedSFI } from 'hooks/tranches/useSaffronData';
import { useSFIDistributions } from 'hooks/tranches/useSFIDistributions';
import { useSFIEarnings } from 'hooks/tranches/useSFIEarnings';

const Earn = () => {

    const apr = usePool2APR()
    const earned = usePool2UnclaimedRGT()
    const balance = usePool2Balance()

    const mySaffronData = useMySaffronData()
    const daiSPrincipal = usePrincipal(TranchePool.DAI, TrancheRating.S)
    const daiAPrincipal = usePrincipal(TranchePool.DAI, TrancheRating.A)
    const estimatedSFI = useEstimatedSFI()
    const sfiDistributions = useSFIDistributions()
    const sfiEarnings = useSFIEarnings()

    console.log({sfiDistributions, sfiEarnings})

    const totalPrincipal = parseFloat(daiSPrincipal ?? '0') + parseFloat(daiAPrincipal ?? '0')

    const hasDeposits = useMemo(() => totalPrincipal > 0, [totalPrincipal])

    // console.log({  mySaffronData, totalPrincipal, daiSPrincipal, daiAPrincipal })

    return (
        <motion.div
            key="pool2"
            style={{ width: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Table variant="simple">
                <Thead color="white">
                    <Tr>
                        <Th color="white">Pool</Th>
                        <Th color="white" textAlign="right">APY</Th>
                        <Th color="white" textAlign="right">Deposits</Th>
                        <Th color="white" textAlign="right">Est. SFI Earnings</Th>
                        <Th color="white" textAlign="right">Growth</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <>
                    {/* DAI S Pool */}
                        <Tr>
                            <Td>
                                <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
                                    <Box>
                                        <Text textAlign="right"> DAI-S  </Text>
                                    </Box>
                                </Row>

                            </Td>
                            <Td><Text textAlign="right">{mySaffronData?.[0]?.tranches?.[TrancheRating.S]?.['total-apy']}%</Text></Td>
                            <Td>
                                <Text textAlign="right">{daiSPrincipal} DAI</Text>
                            </Td>
                            <Td> <Text textAlign="right">{estimatedSFI?.formattedSPoolSFIEarned}</Text> </Td>
                            <Td><Text textAlign="right">N/A</Text></Td>
                        </Tr>
                    {/* DAI A Pool */}
                         <Tr>
                            <Td>
                                <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
                                    <Box>
                                        <Text textAlign="right"> DAI-A  </Text>
                                    </Box>
                                </Row>

                            </Td>
                            <Td><Text textAlign="right">{mySaffronData?.[0]?.tranches?.[TrancheRating.A]?.['total-apy']}%</Text></Td>
                            <Td>
                                <Text textAlign="right">{daiAPrincipal} DAI</Text>
                            </Td>
                            <Td> <Text textAlign="right">{estimatedSFI?.formattedAPoolSFIEarned}</Text> </Td>
                            <Td><Text textAlign="right">N/A</Text></Td>
                        </Tr>
                    {/* Totals */}
                        <Tr>
                            <Td><Text fontWeight={hasDeposits && "bold"}>Total</Text></Td>
                            <Td><Text fontWeight={hasDeposits && "bold"} textAlign="right"></Text></Td>
                            <Td><Text fontWeight={hasDeposits && "bold"} textAlign="right">{smallUsdFormatter(totalPrincipal)}</Text></Td>
                            <Td><Text fontWeight={hasDeposits && "bold"} textAlign="right">{estimatedSFI?.formattedTotalSFIEarned}</Text></Td>
                            <Td></Td>
                        </Tr>
                    </>
                </Tbody>
            </Table>
        </motion.div>
    );
};

export default Earn

