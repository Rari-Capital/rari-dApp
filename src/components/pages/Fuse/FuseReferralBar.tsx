import { Button } from "@chakra-ui/react";
import { RowOrColumn, Center } from "buttered-chakra";
import React from "react";
import { useParams } from "react-router-dom";
import { useIsSmallScreen } from "../../../hooks/useIsSmallScreen";
import DashboardBox from "../../shared/DashboardBox";
import { shortAddress } from "../../../utils/shortAddress";
import { useRari } from "../../../context/RariContext";

const FuseReferralBar = () => {
    const isMobile = useIsSmallScreen();
    let { poolId } = useParams();
    const { address } = useRari();

    const short_referral_code = `https://app.rari.capital/fuse/pool/${poolId}/${shortAddress(address)}`;
    const full_referral_code = `https://app.rari.capital/fuse/pool/${poolId}/${address}`;

    return (
        <RowOrColumn
            isRow={!isMobile}
            expand
            mainAxisAlignment="flex-end"
            crossAxisAlignment="center"
            py={4}
            >
            <DashboardBox>
                <RowOrColumn
                    isRow={!isMobile}
                    expand
                    mainAxisAlignment="flex-end"
                    crossAxisAlignment="center"
                    p={2}
                    >
                    <RowOrColumn
                        isRow={false}
                        mainAxisAlignment="flex-start"
                        crossAxisAlignment="center"
                        >
                        <Center margin={"0 auto 0 0"} pl="9px" pr="10px">
                            Earn crypto with your referral link:
                        </Center>
                        <Center margin={"0 auto 0 0"} pl="9px" pr="10px">
                            {short_referral_code}
                        </Center>
                    </RowOrColumn>
                    <Button background={"none"} color={"aliceblue"} _hover={{ bg: "none", color: "aliceblue" }} onClick={() =>  navigator.clipboard.writeText(full_referral_code)}>
                        Copy
                    </Button>
                </RowOrColumn>
            </DashboardBox>
        </RowOrColumn>
    );
};

export default FuseReferralBar;
