import React, { useMemo, useState, useEffect } from 'react';

// Components
import {
  Box,
  Heading,
  Text,
  Spinner
} from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons'
import { Column, Row } from 'buttered-chakra';
import { motion} from 'framer-motion'


import ForceAuthModal from 'components/shared/ForceAuthModal';
import { Header } from 'components/shared/Header';
import SubNav from './StatsSubNav';

import StatsTotalSection from './Totals/StatsTotalSection';
import StatsFuseSection from './StatsFuseSection';
import StatsPool2Section from './StatsPool2Section';
import StatsEarnSection from './StatsEarnSection';
import StatsTranchesSection from './StatsTranchesSection';
import Footer from 'components/shared/Footer';


// Context
import { useRari } from 'context/RariContext';

// Hooks
import { useTranslation } from 'react-i18next';
import { useIsSmallScreen } from 'hooks/useIsSmallScreen';
import { usePoolBalance, useTotalPoolsBalance } from "hooks/usePoolBalance";
import { shortUsdFormatter, smallUsdFormatter } from 'utils/bigUtils';
import { SimpleTooltip } from 'components/shared/SimpleTooltip';
import { SaffronProvider } from '../Tranches/SaffronContext';


export enum StatsSubNav {
  TOTAL = 'TOTAL',
  FUSE = 'FUSE',
  EARN = 'EARN',
  POOL2 = 'POOL2',
  TRANCHES = 'TRANCHES',
}

const StatsPage = () => {
  const { isAuthed } = useRari();
  const { t } = useTranslation();
  const isMobile = useIsSmallScreen();
  const [subNav, setSubNav] = useState(StatsSubNav.TOTAL);

  const [netDeposits, setNetDeposits] = useState(0)
  const [netDebt, setNetDebt] = useState(0)

  const netBalance = useMemo(() => {
    return netDeposits - netDebt
  }, [netDeposits, netDebt])

  return (
    <SaffronProvider>
      <ForceAuthModal />
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? '100%' : '1000px'}
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />


        <Column
          width="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
          mt={10}
          p={15}
        >
          {/* <SimpleTooltip placement="right" label={`${smallUsdFormatter(netDeposits)} Deposits - ${smallUsdFormatter(netDebt)} Debt`}> */}
          {/* </SimpleTooltip> */}

          <Row mb={2} mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Heading size="lg">
              {t('Net Balance')}:
              </Heading>
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
              >
                <Heading ml={2} size='lg' >
                  {smallUsdFormatter(netBalance) ?? smallUsdFormatter(0)}
                </Heading>
              </motion.div>
            <SimpleTooltip 
            label={`${smallUsdFormatter(netDeposits)} Deposits - ${smallUsdFormatter(netDebt)} Debt`}
            placement="right">
              <Box ml={4} my="auto" _hover={{ color: "gray", cursor: "auto" }}>
                <QuestionOutlineIcon color="currentColor" />
              </Box>
            </SimpleTooltip>
          </Row>

          <SubNav
            isMobile={isMobile}
            subNav={subNav}
            setSubNav={setSubNav}
          />
          <Box width="100%">
            {subNav === StatsSubNav.TOTAL && <StatsTotalSection setNetDebt={setNetDebt} setNetDeposits={setNetDeposits} />}
            {subNav === StatsSubNav.FUSE && <StatsFuseSection />}
            {subNav === StatsSubNav.POOL2 && <StatsPool2Section />}
            {subNav === StatsSubNav.EARN && <StatsEarnSection />}
            {subNav === StatsSubNav.TRANCHES && <StatsTranchesSection />}
          </Box>
        </Column>
      </Column>
    </SaffronProvider>
  );
};

export default StatsPage;
