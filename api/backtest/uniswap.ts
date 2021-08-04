/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-loop-func */
import fetch from 'node-fetch';

import { ChainId, Token, Pair } from '@uniswap/sdk'
import { point } from '../../src/utils/rssUtils';

import checksum from 'eth-checksum';

import {queue}  from '../rss';

const createQuery = async (id: string, config) => {

  const blockend    = config.end;
  const period      = config.period;
  const no_segments = config.no_segments;

  const uniswapMax = 100;

  const segmentNumber = no_segments / uniswapMax;

  let sets: string[] = await new Promise ( async (resolve) => {
    let segments: string[] = [];

    for (let i = 0; i < segmentNumber; i++) {
    
        let query: string = ``;
  
        let x: number = (segmentNumber - i);
  
        let startingBlock = period * x * uniswapMax;
        let endingBlock = period * (x - 1) * uniswapMax;
    
        for (let blockno = blockend - startingBlock; blockno < blockend - endingBlock; blockno += period) {
    
          let str = `
          set_${blockno}: pair(
            id: "${id}"
            block: {number: ${blockno}}
          ){
            token0Price
            token1Price
            reserve0
            reserve1
          }
          `;
    
          query = query + str;
        }
    
        segments.push(query);
    }
    resolve(segments as string[])
  });
  
  return sets.map( (set) => {
    return `{ ${set} }`;
  });
}

const queryUniswap = async (sets: string[]) => {

  const points = await Promise.all(sets.map( async (set) => {
    
    let bufferObj = Buffer.from(set, "utf8");
    const key = bufferObj.toString('base64');
    
    // request balancer
    const data = async () => {
      return await fetch(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
        {
          method: "post",
          body: JSON.stringify({ query: set }),
          headers: { "Content-Type": "application/json" },
          timeout: 50000,
        }
      ).then((res) => res.json());
    }

    queue.request((retry) => data()
    .then(response => response.data)
    .catch(error => {
      if (error.response.status === 429) {
        return retry(error.response.data.parameters.retry_after)
      }
      throw error;
    }), key, 'uniswap')
    .then(response => console.log(response))
    .catch(error => console.error(error));

    let final = await addBlocknumber(data);

    return final as any;

  }))

  // flatten array
  let p: point[] = [].concat.apply([], points);
  return p;
};

const addBlocknumber = async (data: Object) => {
  const keys = Object.keys(data);
  const values = Object.values(data)

  const points: point[] = values.map((value, index) => {
    let blocknumber = keys[index].slice(4);
    value.blocknumber = parseFloat(blocknumber);
    value.token0Price = parseFloat(value.token0Price);
    value.token1Price = parseFloat(value.token1Price);
    value.reserve0 = parseFloat(value.reserve0);
    value.reserve1 = parseFloat(value.reserve1);

    return value;
  })

  return points;
}


const fetchPairID = (address: string) => {
  const token0 = new Token(ChainId.MAINNET, checksum.encode(address), 18);

  const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const token1 = new Token(ChainId.MAINNET, checksum.encode(weth), 18);

  const pair = Pair.getAddress(token0, token1);

  return pair;
}


const uniswap = async (address: string, config: {period: number, no_segments: number, end: number}) => {

  const id = fetchPairID(address).toLowerCase();

  const sets: string[] = await createQuery(id, config);

  const results: point[] = await queryUniswap(sets);

  return results
}

const testUni = async (address: string) => {

  const id = fetchPairID(address).toLowerCase();

  const query = `{
    pair(id: "${id}") {
      id
    }
  }
  `
  let data = await fetch(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    {
      method: "post",
      body: JSON.stringify({ query: query }),
      headers: { "Content-Type": "application/json" },
      timeout: 50000,
    }
  ).then((res) => res.json());

  if (data.data.pair.id) {
    return true;
  } else {
    return false;
  }

}

export {uniswap, testUni};
