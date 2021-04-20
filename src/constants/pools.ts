import { Pool } from "utils/poolUtils";

// Icons
import EthIcon from "static/ethicon.png";
import StableIcon from "static/stableicon.png";
import YieldIcon from "static/yieldicon.png";

export interface PoolInterface {
    type: Pool
    name: string
    title: string,
    caption: string,
    logo: any
}

export const pools: PoolInterface[] = ([
    {
        type: Pool.STABLE,
        title: "Stable",
        name: "Stable Pool",
        caption: "Safe returns on stablecoins",
        logo: StableIcon
    },
    {
        type: Pool.YIELD,
        title: "Yield",
        name: "Yield Pool",
        caption: "High risk, high reward",
        logo: YieldIcon
    },
    {
        type: Pool.ETH,
        title: "ETH",
        name: "ETH Pool",
        caption: "Safe returns on ETH",
        logo: EthIcon
    }
])
