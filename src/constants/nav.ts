import {
  MenuItemInterface,
  MenuItemType,
} from "components/shared/Header2/HeaderLink";

export const  PRODUCTS_DROPDOWN_ITEMS: MenuItemInterface[] = [
  { type: MenuItemType.LINK, link: { name: "Fuse", route: "/fuse" } },
  { type: MenuItemType.LINK, link: { name: "Pool2", route: "/pool2" } },
  { type: MenuItemType.LINK, link: { name: "Tranches", route: "/tranches" } },
  { type: MenuItemType.LINK, link: { name: "Overview", route: "/overview" } },
  {
    type: MenuItemType.MENUGROUP,
    title: "Vaults",
    links: [
      { name: "DAI", route: "/pools/dai" },
      { name: "USDC", route: "/pools/usdc" },
    ],
  },
];

export const GOVERNANCE_DROPDOWN_ITEMS: MenuItemInterface[] = [
  {
    type: MenuItemType.LINK,
    link: { name: "Snapshot", route: "https://vote.rari.capital/" },
  },
  {
    type: MenuItemType.LINK,
    link: { name: "Forums", route: "https://forums.rari.capital/" },
  },
  {
    type: MenuItemType.LINK,
    link: { name: "Governance", route: "/governance" },
  },
];

export const UTILS_DROPDOWN_ITEMS: MenuItemInterface[] = [
    {
      type: MenuItemType.LINK,
      link: { name: "Positions", route: "/positions" },
    },
    {
      type: MenuItemType.LINK,
      link: { name: "Interest Rates", route: "/utils/interest-rates" },
    },
  ];
