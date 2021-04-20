import React, { useState } from 'react';

// Components
import { Center, Column, Row, RowOrColumn } from 'buttered-chakra';
import {
  Heading,
  Link,
  Text,
  Icon,
  Image,
  useDisclosure,
  Box,
} from '@chakra-ui/react';
import { MdSwapHoriz } from 'react-icons/md';
import CopyrightSpacer from 'components/shared/CopyrightSpacer';
import ForceAuthModal from 'components/shared/ForceAuthModal';
import DashboardBox from 'components/shared/DashboardBox';
import { Header } from 'components/shared/Header';
import SubNav from './StatsSubNav';

import StatsTotalSection from './StatsTotalSection';
import StatsFuseSection from './StatsFuseSection';
import StatsPool2Section from './StatsPool2Section';
import StatsEarnSection from './StatsEarnSection';
import StatsTranchesSection from './StatsTranchesSection';


// Context
import { useRari } from 'context/RariContext';

// Hooks
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useIsSmallScreen } from 'hooks/useIsSmallScreen';

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

  const nw = 0;

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
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
          flexGrow={1}
        >
          <Column
            width="100%"
            mainAxisAlignment="center"
            crossAxisAlignment="flex-start"
            height="100%"
            mt="auto"
          >
            <Heading size="md">
              {t('Net Balance')}: ${nw}
            </Heading>
            <SubNav
              isMobile={isMobile}
              subNav={subNav}
              setSubNav={setSubNav}
            />
            {subNav === StatsSubNav.TOTAL && <StatsTotalSection />}
            {subNav === StatsSubNav.FUSE && <StatsFuseSection />}
            {subNav === StatsSubNav.POOL2 && <StatsPool2Section />}
            {subNav === StatsSubNav.EARN && <StatsEarnSection />}
            {subNav === StatsSubNav.TRANCHES && <StatsTranchesSection />}
          </Column>
          <CopyrightSpacer forceShow />
        </Column>
      </Column>
    </>
  );
};

export default StatsPage;
