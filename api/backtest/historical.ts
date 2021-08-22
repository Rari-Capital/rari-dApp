/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-loop-func */

import { biggerblockno, point, resultSet } from '../../src/utils/rssUtils';
import { uniswap, testUni }     from './uniswap';
import { sushiswap, testSushi } from './sushiswap';

const INF = 1000000000000000;

export default async (address: string, financials: {liquidationIncentive: number, slippage: number}) => {

  return await new Promise(async (resolve) => {

    const config = {
      period: 68, // around 15 mins of blocktime
      no_segments: 2900, // keep divisible of 100 for batching
      end: 13076994
    }

    // // it is possible to return either sushiswap or uniswap data in the form of point[]; currently uniswap is much faster
    let data = await uniswap(address, config);

    console.log(data)

    if (data) {
      let result = await calcTokenDown(data as point[], financials);

      resolve(result);
    } else {
      resolve(false);
    }

  })
}

const calcTokenDown = async (data: point[], financials: {liquidationIncentive: number, slippage: number}) => {

  let result = await work(data, financials);

  let TOKEN0DOWN  = result;

  return {
    TOKEN0DOWN
  } as resultSet
}

const work = async (data: any[], financials: {liquidationIncentive: number, slippage: number}) => {

  const shocks = await simulateshock(data.sort(biggerblockno), financials);
  // console.log("shocks: " + JSON.stringify(result.shocks));

  return shocks;
}

const simulateshock = async (data: point[], financials: {liquidationIncentive: number, slippage: number}) => {
 
  let shocks = new Promise( (resolve) => {
    let shocks: number = 0;

    data.forEach( async (point, index) => {
      const i: number = index;
  
      for (let j = 0; i + j + 1 < data.length; ++j) { // check whether liquidation feasible at i+j+1
        if ((data[i + j].token0Price - data[i + j + 1].token0Price) / point.token0Price < financials.liquidationIncentive - financials.slippage) { // liquidation feasible
          let token0down = (data[i].token0Price - data[i + j + 1].token0Price) / point.token0Price;
          if (token0down > shocks) {
            shocks = token0down;
          }
          break;
        }
      }
    })
    resolve(shocks);
  })

  return await shocks;
}