import Rari from "rari-sdk/index";
import { BN, stringUsdFormatter } from "./bigUtils";

// Formats a BN balance USD or ETH denominated string
export const formatBalanceBN = (rari: Rari, balanceData: BN | null, shouldFormatETH: boolean = false) : string | null => {
    
    if (!balanceData) return null
    
    let formattedBalance = stringUsdFormatter(rari.web3.utils.fromWei(balanceData!));
    
    if (shouldFormatETH) formattedBalance = formattedBalance.replace("$", "") + " ETH";
    
    return formattedBalance
}

export function formatAbbreviatedCurrency(x: number) {
	if(isNaN(x)) return x;

	if(x < 9999) {
		return x.toFixed(2);
	}

	if(x < 1000000) {
		return (x/1000).toFixed(1) + "K";
	}
	if( x < 10000000) {
		return (x/1000000).toFixed(1) + "M";
	}

	if(x < 1000000000) {
		return Math.round((x/1000000)) + "M";
	}

	if(x < 1000000000000) {
		return Math.round((x/1000000000)) + "B";
	}

	return "1T+";
}