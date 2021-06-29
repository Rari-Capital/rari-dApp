// Hooks
import { useRari } from "context/RariContext";
import { useQuery, UseQueryResult } from "react-query";
import { useMemo } from "react";

// Utils / types
import BigNumber from "bignumber.js";
import { Mode } from "components/pages/Fuse/Modals/PoolModal";
import { USDPricedFuseAsset } from "utils/fetchFusePoolData";
import { AmountSelectMode } from "components/shared/AmountSelectNew/AmountSelectNew";

const useUpdatedUserAssets = ({
  mode,
  index,
  assets,
  amount,
}: {
  mode: Mode | AmountSelectMode;
  assets: USDPricedFuseAsset[] | undefined;
  index: number;
  amount: number;
}) => {
  const { rari, fuse } = useRari();

  const { data: updatedAssets }: UseQueryResult<USDPricedFuseAsset[]> =
    useQuery(
      mode + " " + index + " " + JSON.stringify(assets) + " " + amount,
      async () => {
        if (!assets || !assets.length) return [];

        const ethPrice: number = fuse.web3.utils.fromWei(
          await rari.getEthUsdPriceBN()
        ) as any;

        const assetToBeUpdated = assets[index];

        const interestRateModel = await fuse.getInterestRateModel(
          assetToBeUpdated.cToken
        );

        let updatedAsset: USDPricedFuseAsset;
        if (mode === Mode.SUPPLY || mode === AmountSelectMode.LEND) {
          const supplyBalance =
            parseInt(assetToBeUpdated.supplyBalance as any) + amount;

          const totalSupply =
            parseInt(assetToBeUpdated.totalSupply as any) + amount;

        //   console.log(
        //     { mode, assetToBeUpdated, totalSupply, amount },
        //     assetToBeUpdated.totalSupply
        //   );

          updatedAsset = {
            ...assetToBeUpdated,

            supplyBalance,
            supplyBalanceUSD:
              ((supplyBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalSupply,
            supplyRatePerBlock: interestRateModel.getSupplyRate(
              fuse.web3.utils.toBN(
                totalSupply > 0
                  ? new BigNumber(assetToBeUpdated.totalBorrow)
                      .dividedBy(totalSupply.toString())
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        } else if (mode === Mode.WITHDRAW) {
          const supplyBalance =
            parseInt(assetToBeUpdated.supplyBalance as any) - amount;

          const totalSupply =
            parseInt(assetToBeUpdated.totalSupply as any) - amount;

          updatedAsset = {
            ...assetToBeUpdated,

            supplyBalance,
            supplyBalanceUSD:
              ((supplyBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalSupply,
            supplyRatePerBlock: interestRateModel.getSupplyRate(
              fuse.web3.utils.toBN(
                totalSupply > 0
                  ? new BigNumber(assetToBeUpdated.totalBorrow)
                      .dividedBy(totalSupply.toString())
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        } else if (mode === Mode.BORROW || mode === AmountSelectMode.BORROW) {
          const borrowBalance =
            parseInt(assetToBeUpdated.borrowBalance as any) + amount;

          const totalBorrow =
            parseInt(assetToBeUpdated.totalBorrow as any) + amount;

        //   console.log({ assetToBeUpdated, totalBorrow, mode });

          updatedAsset = {
            ...assetToBeUpdated,

            borrowBalance,
            borrowBalanceUSD:
              ((borrowBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalBorrow,
            borrowRatePerBlock: interestRateModel.getBorrowRate(
              fuse.web3.utils.toBN(
                assetToBeUpdated.totalSupply > 0
                  ? new BigNumber(totalBorrow.toString())
                      .dividedBy(assetToBeUpdated.totalSupply)
                      .multipliedBy(1e18)
                      .toFixed(0)
                  : 0
              )
            ),
          };
        } else if (mode === Mode.REPAY) {
          const borrowBalance =
            parseInt(assetToBeUpdated.borrowBalance as any) - amount;

          const totalBorrow =
            parseInt(assetToBeUpdated.totalBorrow as any) - amount;

          const borrowRatePerBlock = interestRateModel.getBorrowRate(
            fuse.web3.utils.toBN(
              assetToBeUpdated.totalSupply > 0
                ? new BigNumber(totalBorrow.toString())
                    .dividedBy(assetToBeUpdated.totalSupply.toString())
                    .multipliedBy(1e18)
                    .toFixed(0)
                : 0
            )
          );

        //   console.log({ borrowRatePerBlock });

          updatedAsset = {
            ...assetToBeUpdated,

            borrowBalance,
            borrowBalanceUSD:
              ((borrowBalance * assetToBeUpdated.underlyingPrice) / 1e36) *
              ethPrice,

            totalBorrow,
            borrowRatePerBlock,
          };
        }

        return assets.map((value, _index) => {
          if (_index === index) {
            return updatedAsset;
          } else {
            return value;
          }
        });
      }
    );

//   console.log({ updatedAssets, mode });

  return useMemo(() => updatedAssets, [updatedAssets]);
};

export const useUpdatedUserAssetsForBorrowAndLend = ({
  index,
  assets,
  lendAmount,
  borrowAmount,
}: {
  assets: USDPricedFuseAsset[];
  index: number;
  lendAmount: number;
  borrowAmount: number;
}) => {
//   console.log({ lendAmount, borrowAmount });

  const updatedAssetsLend: USDPricedFuseAsset[] | undefined =
    useUpdatedUserAssets({
      mode: AmountSelectMode.LEND,
      assets,
      index,
      amount: lendAmount,
    });

  const updatedAssetsLendAndBorrow: USDPricedFuseAsset[] | undefined =
    useUpdatedUserAssets({
      mode: AmountSelectMode.BORROW,
      assets: updatedAssetsLend,
      index,
      amount: borrowAmount,
    });

  //   console.log({ updatedAssetsLend, updatedAssetsLendAndBorrow });

  return updatedAssetsLend;
};

// const useAmountIsValid = ({
//     mode,
//     amount,
//   }: {
//     mode: Mode;
//     amount: number;
//   }) => {

//   const { rari, fuse, address } = useRari();

// const { data: amountIsValid } = useQuery(
//     (amount?.toString() ?? "null") + " " + mode + " isValid",
//     async () => {
//       if (amount === null || amount.isZero()) {
//         return false;
//       }

//       try {
//         const max = await fetchMaxAmount(
//           mode,
//           fuse,
//           address,
//           asset,
//           comptrollerAddress
//         );

//         return amount.lte(max!.toString());
//       } catch (e) {
//         handleGenericError(e, toast);
//         return false;
//       }
//     }
//   );
// })

export default useUpdatedUserAssets;
