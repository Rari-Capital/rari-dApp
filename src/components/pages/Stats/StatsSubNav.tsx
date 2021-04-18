import React, { Dispatch, SetStateAction } from 'react'

// Components
import DashboardBox from 'components/shared/DashboardBox';
import { Center, Column, Row, RowOrColumn } from 'buttered-chakra';
import {
    Heading,
    Box,
  } from '@chakra-ui/react';
import { FuseSmallLogo } from '../../shared/Logos';


//   Hooks
import { useTranslation } from 'react-i18next';

// Types
import {StatsSubNav} from './StatsPage'

const SubNav = ({
    isMobile,
    subNav, 
    setSubNav
} : {
    isMobile: boolean,
    subNav: StatsSubNav,
    setSubNav: Dispatch<SetStateAction<StatsSubNav>>
}) => {
    return (
        <DashboardBox width={isMobile ? '100%' : '100%'}>
              <Column
                expand
                mainAxisAlignment="center"
                crossAxisAlignment={isMobile ? 'center' : 'flex-start'}
                textAlign="center"
                p={4}
              >
                <Row
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  width="100%"
                >
                  <SubNavItem
                    title="Total Overview"
                    setActive={() => setSubNav(StatsSubNav.TOTAL)}
                    active={subNav === StatsSubNav.TOTAL}
                  />
                  <SubNavItem
                    title="Fuse"
                    setActive={() => setSubNav(StatsSubNav.FUSE)}
                    active={subNav === StatsSubNav.FUSE}
                  />
                  <SubNavItem
                    title="Earn"
                    setActive={() => setSubNav(StatsSubNav.EARN)}
                    active={subNav === StatsSubNav.EARN}
                  />
                  <SubNavItem
                    title="Pool2"
                    setActive={() => setSubNav(StatsSubNav.POOL2)}
                    active={subNav === StatsSubNav.POOL2}
                  />
                  <SubNavItem
                    title="Tranches"
                    setActive={() => setSubNav(StatsSubNav.TRANCHES)}
                    active={subNav === StatsSubNav.TRANCHES}
                  />
                </Row>
              </Column>
            </DashboardBox>
    )
}

const SubNavItem = ({
    title,
    setActive,
    active,
  }: {
    title: string;
    setActive: () => void;
    active: boolean;
  }) => {
    const { t } = useTranslation();
  
    return (
      <Box
        mr={5}
        color={active ? 'green' : 'white'}
        _hover={{
          // background: 'pink',
          color: !active && 'pink.500',
          cursor: 'pointer',
        }}
        onClick={setActive}
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <FuseSmallLogo boxSize="20px" />
          <Heading size="md">{t(title)}</Heading>
        </Row>
      </Box>
    );
  };
  

export default SubNav
