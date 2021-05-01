import { useQuery } from "react-query";
import { useRari } from "context/RariContext";
import Rari from "rari-sdk/index";
import Fuse from "fuse-sdk";

export const fetchPool2Balance = async ({
  rari,
  fuse,
  address,
}: {
  rari: Rari;
  fuse: Fuse;
  address: string;
}) => {
  const SLP = parseFloat(
    rari.web3.utils.fromWei(
      await rari.governance.rgt.sushiSwapDistributions.stakingBalanceOf(address)
    )
  );

  const balanceUSDBN = await rari.governance.rgt.sushiSwapDistributions.usdStakingBalanceOf(
    address
  );
  const balanceUSD = parseFloat(balanceUSDBN.toString()) / 10 ** 18;

  const {
    eth: _eth,
    rgt: _rgt,
  } = await rari.governance.rgt.sushiSwapDistributions.stakedReservesOf(
    address
  );

  return {
    SLP,
    balanceUSD,
    hasDeposited: SLP > 0,
    // @ts-ignore
    eth: _eth.toString() / 1e18,
    // @ts-ignore
    rgt: _rgt.toString() / 1e18,
  };
};

export const usePool2Balance = () => {
  const { rari, fuse, address } = useRari();

  const { data: balance } = useQuery(
    address + " pool2Balance",
    async () => await fetchPool2Balance({ rari, fuse, address })
  );

  return balance;
};
