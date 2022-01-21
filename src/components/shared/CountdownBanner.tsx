import { Flex, Text, Box, Image } from "@chakra-ui/react"
import ArbitrumLogo from "../../static/arbitrum-banner/arbitrum.png";
import RightArrow from "../../static/arbitrum-banner/right-arrow.png";
import BGLeft from "../../static/arbitrum-banner/bg-left.png";
import BGRight from "../../static/arbitrum-banner/bg-right.png";

import { useEffect, useState } from "react"

export const CountdownBanner = () => {

    const [countdownValue, setCountdownValue] = useState(999999)
    const final = new Date(Date.UTC(2022, 0, 24, 0, 0, 0, 0)).getTime()

    const getCountdownSeconds = () => {
        const now = new Date().getTime()
        return (final - now) / 1000
    }

    const updateCountdownValue = () => {
        let newCountdownValue = getCountdownSeconds()
        setCountdownValue(newCountdownValue)
        if(newCountdownValue > 0) {
            setTimeout(() => {
                updateCountdownValue()
            }, 1000)
        }
    }

    const getCountdownString = (inputSeconds: number) => {
        let hours = inputSeconds / 3600
        let minutes = (hours % 1) * 60
        let seconds = (minutes % 1) * 60

        let hoursText = hours < 10 ? '0'+Math.floor(hours) : Math.floor(hours)
        let minutesText = minutes < 10 ? '0'+Math.floor(minutes) : Math.floor(minutes)
        let secondsText = seconds < 10 ? '0'+Math.floor(seconds) : Math.floor(seconds)
        
        return hoursText + ':' + minutesText + ':' + secondsText
    }

    useEffect(() => {
        updateCountdownValue()
    }, [])

    return (
        <Flex width="100%" height="82px" flexDirection={'column'} justifyContent={'center'}
        backgroundImage={`url(${BGLeft}), url(${BGRight}), linear-gradient(90.05deg, #072FAD 4.01%, #0F82C7 96.95%)`}
        backgroundSize={'contain'}
        backgroundRepeat={'no-repeat'}
        backgroundPosition={'left, right, left'}
        >
            <Flex width="100%" flexDirection={'row'} justifyContent={'center'}>
                    <Image width="30px" height="34px" src={ArbitrumLogo}/>
                    <Text textTransform="uppercase" fontSize={'xl'} color={'#FFFFFF'} marginX={"12px"} mt={"3px"} textShadow={'0px 0px 5px rgba(255, 255, 255, 0.5);'}>
                        {countdownValue > 0 ? 
                        <>
                        Arbitrum is live in <Box as='span' fontWeight="bold">{getCountdownString(countdownValue)}</Box>
                        </>
                        :
                        <>
                        Arbitrum is <Box as='span' fontWeight="bold">here</Box>
                        </>
                        }
                    </Text>
                    {countdownValue <= 0 && <Image height="28px" width="28px" src={RightArrow} mt="3px" ml="-1px"/>}
            </Flex>
        </Flex>
    )
}

export default CountdownBanner