/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-loop-func */

import { ChainId, Token, Pair } from '@sushiswap/sdk'
import { parse, point } from '../../src/utils/rssUtils';
import checksum from 'eth-checksum';
import sushiData from '@sushiswap/sushi-data';

const INF = 1000000000000000;

const sushiswap = async (address: string, config: {period: number, no_segments: number, end: number}) => {

  const id = fetchPairID(address);

  let blocks: number[][] = await blocknumbers(config);

  let results: point[] = await queryManySushi(blocks, id);

  return results;
}

const queryManySushi = async (blocks: number[][], id: string) => {

  let set: any[] = [];

  for (let i = 0; i < blocks.length; i++) {
    let chunk = await querySushi(blocks[i], id);
    set.push(chunk);
  } 
  
  return flatten(set) as point[];
}

const querySushi = async (blocks: number[], id: string) => {
  try {
    const data = await sushiData.timeseries({blocks: blocks, target: sushiData.exchange.pair}, {pair_address: id});
    return await parse(data);
  } catch (e) {
    console.log(e)
    return [];
  }
}
 
const blocknumbers = async (config: {period: number, no_segments: number, end: number}) => {

  const period      = config.period; // 68 blocks of 13.2 seconds is 15 min
  const no_segments = config.no_segments;
  const blockend    = config.end;

  let numbers: number[] = await new Promise(async (resolve) => {
    let array: number[] = [];
    for (let blockno = blockend - period * no_segments; blockno < blockend; blockno += period) {
      array.push(blockno);
    }
    resolve(array);
  });

  // split block number array from 500 into sets of 100
  const chunk = 100;
  const result = numbers.reduce((resultArray: any[], item, index) => { 
    const chunkIndex = Math.floor(index / chunk)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, [])

  return result;
}

const fetchPairID = (address: string) => {

    const token0 = new Token(ChainId.MAINNET, checksum.encode(address), 18);

    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const token1 = new Token(ChainId.MAINNET, checksum.encode(weth), 18);

    const pair = Pair.getAddress(token0, token1);

    return pair.toLowerCase();
  
}

const testSushi = async (address: string) => {
  const config = {
    period: 68, // around 15 mins of blocktime
    no_segments: 500, // keep divisible of 100 for batching
    end: 12635203
  }
  const id = fetchPairID(address)

  try {
    const blocks = await blocknumbers(config)
    const data = await sushiData.timeseries({blocks: blocks[0], target: sushiData.exchange.pair}, {pair_address: id});
    return data
  } catch (e) {
    console.log(e);
    return false;
  }
}

function flatten(arr: any[]) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export { sushiswap, testSushi }