/* eslint-disable */
import Web3 from "web3";
import axios from "axios";

export const get0xSwapOrders = function (
  inputTokenAddress,
  outputTokenAddress,
  maxInputAmountBN,
  maxMakerAssetFillAmountBN
) {
  return new Promise(async function (resolve, reject) {
    try {
      var decoded = (await axios.get(
        "https://api.0x.org/swap/v0/quote?affiliateAddress=0x10dB6Bce3F2AE1589ec91A872213DAE59697967a&sellToken=" +
          inputTokenAddress +
          "&buyToken=" +
          outputTokenAddress +
          (maxMakerAssetFillAmountBN !== undefined && maxMakerAssetFillAmountBN !== null
            ? "&buyAmount=" + maxMakerAssetFillAmountBN.toString()
            : "&sellAmount=" + maxInputAmountBN.toString())
      )).data;
    } catch (error) {
      if (error.response && error.response.data.validationErrors && error.response.data.validationErrors[0].reason === "INSUFFICIENT_ASSET_LIQUIDITY") return reject("Insufficient liquidity");
      return reject("Error requesting quote from 0x swap API: " + error.message);
    }

    if (!decoded) return reject("Failed to decode quote from 0x swap API");
    if (!decoded.orders) return reject("No orders found on 0x swap API");

    decoded.orders.sort((a, b) =>
      a.makerAssetAmount / (a.takerAssetAmount + a.takerFee) <
      b.makerAssetAmount / (b.takerAssetAmount + b.takerFee)
        ? 1
        : -1
    );

    var orders = [];
    var inputFilledAmountBN = Web3.utils.toBN(0);
    var takerAssetFilledAmountBN = Web3.utils.toBN(0);
    var makerAssetFilledAmountBN = Web3.utils.toBN(0);

    for (var i = 0; i < decoded.orders.length; i++) {
      if (
        decoded.orders[i].takerFee > 0 &&
        decoded.orders[i].takerFeeAssetData.toLowerCase() !==
          "0xf47261b0000000000000000000000000" + inputTokenAddress.toLowerCase()
      )
        continue;
      var takerAssetAmountBN = Web3.utils.toBN(
        decoded.orders[i].takerAssetAmount
      );
      var takerFeeBN = Web3.utils.toBN(decoded.orders[i].takerFee);
      var orderInputAmountBN = takerAssetAmountBN.add(takerFeeBN); // Maximum amount we can send to this order including the taker fee
      var makerAssetAmountBN = Web3.utils.toBN(
        decoded.orders[i].makerAssetAmount
      );

      if (maxMakerAssetFillAmountBN !== undefined && maxMakerAssetFillAmountBN !== null) {
        // maxMakerAssetFillAmountBN is specified, so use it
        if (
          maxMakerAssetFillAmountBN
            .sub(makerAssetFilledAmountBN)
            .lte(makerAssetAmountBN)
        ) {
          // Calculate orderTakerAssetFillAmountBN and orderInputFillAmountBN from maxMakerAssetFillAmountBN
          var orderMakerAssetFillAmountBN = maxMakerAssetFillAmountBN.sub(
            makerAssetFilledAmountBN
          );
          var orderTakerAssetFillAmountBN = orderMakerAssetFillAmountBN
            .mul(takerAssetAmountBN)
            .div(makerAssetAmountBN);
          var orderInputFillAmountBN = orderMakerAssetFillAmountBN
            .mul(orderInputAmountBN)
            .div(makerAssetAmountBN);

          var tries = 0;
          while (
            makerAssetAmountBN
              .mul(orderInputFillAmountBN)
              .div(orderInputAmountBN)
              .lt(orderMakerAssetFillAmountBN)
          ) {
            if (tries >= 1000)
              return reject(
                "Failed to get increment order input amount to achieve desired output amount"
              );
            orderInputFillAmountBN.iadd(Web3.utils.toBN(1)); // Make sure we have enough input fill amount to achieve this maker asset fill amount
            tries++;
          }
        } else {
          // Fill whole order
          var orderMakerAssetFillAmountBN = makerAssetAmountBN;
          var orderTakerAssetFillAmountBN = takerAssetAmountBN;
          var orderInputFillAmountBN = orderInputAmountBN;
        }

        // If this order input amount is higher than the remaining input, calculate orderTakerAssetFillAmountBN and orderMakerAssetFillAmountBN from the remaining maxInputAmountBN as usual
        if (
          maxInputAmountBN !== undefined && maxInputAmountBN !== null && orderInputFillAmountBN.gt(maxInputAmountBN.sub(inputFilledAmountBN))
        ) {
          orderInputFillAmountBN = maxInputAmountBN.sub(inputFilledAmountBN);
          orderTakerAssetFillAmountBN = orderInputFillAmountBN
            .mul(takerAssetAmountBN)
            .div(orderInputAmountBN);
          orderMakerAssetFillAmountBN = orderInputFillAmountBN
            .mul(makerAssetAmountBN)
            .div(orderInputAmountBN);
        }
      } else {
        // maxMakerAssetFillAmountBN is not specified, so use maxInputAmountBN
        if (maxInputAmountBN !== undefined && maxInputAmountBN !== null && maxInputAmountBN.sub(inputFilledAmountBN).lte(orderInputAmountBN)) {
          // Calculate orderInputFillAmountBN and orderTakerAssetFillAmountBN from the remaining maxInputAmountBN as usual
          var orderInputFillAmountBN = maxInputAmountBN.sub(
            inputFilledAmountBN
          );
          var orderTakerAssetFillAmountBN = orderInputFillAmountBN
            .mul(takerAssetAmountBN)
            .div(orderInputAmountBN);
          var orderMakerAssetFillAmountBN = orderInputFillAmountBN
            .mul(makerAssetAmountBN)
            .div(orderInputAmountBN);
        } else {
          // Fill whole order
          var orderInputFillAmountBN = orderInputAmountBN;
          var orderTakerAssetFillAmountBN = takerAssetAmountBN;
          var orderMakerAssetFillAmountBN = makerAssetAmountBN;
        }
      }

      // Add order to returned array
      orders.push(decoded.orders[i]);

      // Add order fill amounts to total fill amounts
      inputFilledAmountBN.iadd(orderInputFillAmountBN);
      takerAssetFilledAmountBN.iadd(orderTakerAssetFillAmountBN);
      makerAssetFilledAmountBN.iadd(orderMakerAssetFillAmountBN);

      // Check if we have hit maxInputAmountBN or maxTakerAssetFillAmountBN
      if (
        (maxInputAmountBN !== undefined && maxInputAmountBN !== null && inputFilledAmountBN.gte(maxInputAmountBN)) ||
        (maxMakerAssetFillAmountBN !== undefined && maxMakerAssetFillAmountBN !== null &&
          makerAssetFilledAmountBN.gte(maxMakerAssetFillAmountBN))
      )
        break;
    }

    if (takerAssetFilledAmountBN.isZero())
      return reject("No orders found on 0x swap API");
    resolve([
      orders,
      inputFilledAmountBN,
      decoded.protocolFee,
      takerAssetFilledAmountBN,
      makerAssetFilledAmountBN,
      decoded.gasPrice,
    ]);
  });
};
