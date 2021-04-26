import React from 'react'


import { Column, Row } from 'buttered-chakra';
import { Header } from 'components/shared/Header';
import Footer from './Footer';
import { useRari } from 'context/RariContext';
import { useIsSmallScreen } from 'hooks/useIsSmallScreen';


const Layout = ({ children }: { children: any }) => {
    const { isAuthed } = useRari()
    const isMobile = useIsSmallScreen()

    return (
        // <Column
        //     mainAxisAlignment="flex-start"
        //     crossAxisAlignment="center"
        //     color="#FFFFFF"
        //     mx="auto"
        //     width={isMobile ? '100%' : '1000px'}
        //     minH="100vh"
        //     px={isMobile ? 4 : 0}
        // >
        //     <Header isAuthed={isAuthed} />
        <>
        <Column>
                {children}
                <Footer forceShow />
        </Column>
        </>


    )
}

export default Layout
