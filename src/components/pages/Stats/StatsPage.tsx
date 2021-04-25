import React, { useMemo, useState } from 'react';

// Components
import {
  Box,
  Heading,
  Spinner
} from '@chakra-ui/react';
import { Column, Row } from 'buttered-chakra';

import CopyrightSpacer from 'components/shared/CopyrightSpacer';
import ForceAuthModal from 'components/shared/ForceAuthModal';
import { Header } from 'components/shared/Header';
import SubNav from './StatsSubNav';

import StatsTotalSection from './Totals/StatsTotalSection';
import StatsFuseSection from './StatsFuseSection';
import StatsPool2Section from './StatsPool2Section';
import StatsEarnSection from './StatsEarnSection';
import StatsTranchesSection from './StatsTranchesSection';

// Context
import { useRari } from 'context/RariContext';

// Hooks
import { useTranslation } from 'react-i18next';
import { useIsSmallScreen } from 'hooks/useIsSmallScreen';
import { usePoolBalance, useTotalPoolsBalance } from "hooks/usePoolBalance";
import { shortUsdFormatter, smallUsdFormatter } from 'utils/bigUtils';
import { SimpleTooltip } from 'components/shared/SimpleTooltip';


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

  const netBalance = useMemo(() => netDeposits - netDebt, [netDeposits, netDebt])

  return (
    <>
      <ForceAuthModal />
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        color="#FFFFFF"
        mx="auto"
        width={isMobile ? '100%' : '1000px'}
        minH="100vh"
        px={isMobile ? 4 : 0}
      >
        <Header isAuthed={isAuthed} />


        <Column
          width="100%"
          mainAxisAlignment="center"
          crossAxisAlignment="flex-start"
          height="100%"
          mt={10}
        >
          <Row mb={2} mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <SimpleTooltip placement="right" label={`${smallUsdFormatter(netDeposits)} Deposits - ${smallUsdFormatter(netDebt)} Debt`}>
              <Heading size="lg">
                {t('Net Balance')}:  {smallUsdFormatter(netBalance) ?? smallUsdFormatter(0)}
              </Heading>
            </SimpleTooltip>

          </Row>

          <SubNav
            isMobile={isMobile}
            subNav={subNav}
            setSubNav={setSubNav}
          />
          {subNav === StatsSubNav.TOTAL && <StatsTotalSection setNetDebt={setNetDebt} setNetDeposits={setNetDeposits} />}
          {subNav === StatsSubNav.FUSE && <StatsFuseSection />}
          {subNav === StatsSubNav.POOL2 && <StatsPool2Section />}
          {subNav === StatsSubNav.EARN && <StatsEarnSection />}
          {subNav === StatsSubNav.TRANCHES && <StatsTranchesSection />}
        </Column>
        <CopyrightSpacer forceShow />
      </Column>
    </>
  );
};

export default StatsPage;
