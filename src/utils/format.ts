import { stringUsdFormatter } from "./bigUtils";
import { fromWei } from "./ethersUtils";
import { BigNumber } from "ethers"
import { Vaults } from "rari-sdk-sharad-v2";

// Formats a BN balance USD or ETH denominated string
export const formatBalanceBN = (
  rari: Vaults,
  balanceData: BigNumber | null,
  shouldFormatETH: boolean = false
): string | null => {
  if (!balanceData) return null;

  let formattedBalance = stringUsdFormatter(
    fromWei(balanceData!)
  );

  if (shouldFormatETH)
    formattedBalance = formattedBalance.replace("$", "") + " ETH";

  return formattedBalance;
};
