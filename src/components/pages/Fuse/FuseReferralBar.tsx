import { Button } from "@chakra-ui/react";
import { RowOrColumn, Center, Row, Column } from "buttered-chakra";
import React from "react";
import { useParams } from "react-router-dom";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import DashboardBox from "../../shared/DashboardBox";
import { mediumAddress } from "../../../utils/shortAddress";
import { useRari } from "../../../context/RariContext";
import { useTranslation } from "react-i18next";

const FuseReferralBar = () => {
    const isMobile = useIsSmallScreen();
    const { poolId } = useParams();
    const { address } = useRari();
    const { t } = useTranslation();

    const short_referral_code = `${window.location.origin}/fuse/pool/${poolId}/${mediumAddress(address)}`;
    const full_referral_code = `${window.location.origin}/fuse/pool/${poolId}/${address}`;

    const width = !isMobile ? "50%" : "100%";
    const left_padding = !isMobile ? "0.5rem" : "";

    return (
        <RowOrColumn
            isRow={!isMobile}
            expand
            mainAxisAlignment="flex-end"
            crossAxisAlignment="center"
            py={4}
            >

            <div style={{ width: width, paddingLeft: left_padding}}>
                <DashboardBox>
                    <Row
                        expand
                        mainAxisAlignment="space-between"
                        crossAxisAlignment="center"
                        width="100%"
                        p={4}
                        >
                        <Column
                            mainAxisAlignment="flex-start"
                            crossAxisAlignment="center"
                            >
                            <Center mt="0" mr="auto" mb="0" ml="0">
                                {t("Earn crypto with your referral link:")}
                            </Center>
                            <Center fontWeight="bold" mt="0" mr="auto" mb="0" ml="0">
                                <a href={full_referral_code} >{short_referral_code}</a>
                            </Center>
                        </Column>
                        <Button background={"none"} p="unset" _hover={{ bg: "none" }} onClick={() =>  navigator.clipboard.writeText(full_referral_code)}>
                            {t("Copy")}
                        </Button>
                    </Row>
                </DashboardBox>
            </div>
        </RowOrColumn>
    );
};

export default FuseReferralBar;
