import Rari from "rari-sdk/index";
import { BN, stringUsdFormatter } from "./bigUtils";

// Formats a BN balance USD or ETH denominated string
export const formatBalanceBN = (
  rari: Rari,
  balanceData: BN | null,
  shouldFormatETH: boolean = false
): string | null => {
  if (!balanceData) return null;

  let formattedBalance = stringUsdFormatter(
    rari.web3.utils.fromWei(balanceData!)
  );

  if (shouldFormatETH)
    formattedBalance = formattedBalance.replace("$", "") + " ETH";

  return formattedBalance;
};
