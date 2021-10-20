



export const FUSE_POOLS = [
  {address: "0x1a0286192301bc8ab4843ed1b7582487342d6301", label: "Fuse 11",},
  {address: "0x2a1bf27578c14e868e42a49f0d87de45d29f7efa", label: "Fuse 5",},
  {address: "0x35de88f04ad31a396aedb33f19aebe7787c02560", label: "Fuse 27",},
  {address: "0x3cb4f05061749497187b7ab4ef6f6f6018b2ee67", label: "Fuse 19",},
  {address: "0x433dc921e8603e3fb8e67c46bfce7d118b7e9b12", label: "Fuse 20",},
  {address: "0x479bf43a41202e9954038b53dbec5f3d14b677ea", label: "Fuse 21",},
  {address: "0x4dd657e0ac3d6eac84b1b3be6da0018d2aa1dbc8", label: "Fuse 0",},
  {address: "0x5c868e0a1dc08fcbb64fa29560d3e08cbbfcef71", label: "Fuse 13",},
  {address: "0x5d313ca01fcb11eb549dcffeea5472664b02cd55", label: "Fuse 12",},
  {address: "0x621579dd26774022f33147d3852ef4e00024b763", label: "Fuse 18",},
  {address: "0x64858bac30f4cc223ea07adc09a51acdcd225998", label: "Fuse 24",},
  {address: "0x64fcabe3dbb99d8427194a83f0f4af20ee7d739e", label: "Fuse 4",},
  {address: "0x6a79b7e490b4d3769f48e1f7b3965bba80ab740e", label: "Fuse 15",},
  {address: "0x6e7fb6c5865e8533d5ed31b6d43fd95f4c411834", label: "Fuse 3",},
  {address: "0x767842f4a46e3e475fca97862d290dd880d868aa", label: "Fuse 25",},
  {address: "0x8107304cb6c821e3f4ae026116a627818acee26c", label: "Fuse 16",},
  {address: "0x814b02c1ebc9164972d888495927fe1697f0fb4c", label: "Fuse 6",},
  {address: "0x8560b9839e10766ebfdbc901605b5cc72ce4afd8", label: "Fuse 1",},
  {address: "0x8583fdff34ddc3744a46eabc1503769af0bc6604", label: "Fuse 10",},
  {address: "0x859cdd811b3ff7c11ade4e6f18e6b31da2124320", label: "Fuse 17",},
  {address: "0xad8d41d3e8f0f3ae07bf165d8cc522ddba0e775e", label: "Fuse 14",},
  {address: "0xc18057f85f752f1ce181aead1f081d116333d02c", label: "Fuse 2",},
  {address: "0xc202be8ebaf758a7dc8f227e6de88be5d28c69dd", label: "Fuse 26",},
  {address: "0xc54172e34046c1653d1920d40333dd358c7a1af4", label: "Fuse 8",},
  {address: "0xd4bdcca1ca76ced6fc8bb1ba91c5d7c0ca4fe567", label: "Fuse 9",},
  {address: "0xe3952d770fb26cc61877cd34fbc3a3750881e9a1", label: "Fuse 22",},
  {address: "0xf53c73332459b0dbd14d8e073319e585f7a46434", label: "Fuse 23",},
  {address: "0xfb558ecd2d24886e8d2956775c619deb22f154ef", label: "Fuse 7"},


  //others
  {address: "0xb8f02248d53f7edfa38e79263e743e9390f81942", label: "Rari Capital: Deployer 2"},
  {address: "0xc6bf8c8a55f77686720e0a88e2fd1feef58ddf4a", label: "Rari Capital: RSPT Fund Manager"},
  {address: "0x1e87ebbe2e02037dd4697d443c5507ff97959c99", label: "Rari Capital: Old REPT Fund Controller"},
  {address: "0xEe7162bB5191E8EC803F7635dE9A920159F1F40C", label: "Rari Capital: RSPT Fund Controller"},
  {address: "0xe592427a0aece92de3edee1f18e0157c05861564", label: "Uniswap V3: Router"},
  {address: "0xd291e7a03283640fdc51b121ac401383a46cc623", label: "Rari Capital: RGT Token"},
  {address: "0x835482fe0532f169024d5e9410199369aad5c77e", label: "Fuse Pool Directory"},
  {address: "0xa731585ab05fc9f83555cf9bff8f58ee94e18f85", label: "Fuse Fee Distributor"},
  //{address: "", label: ""},
]


//im assuming we only care about transfer transactions??




/*
export const mostCommonTreasuryTransactions = (transactions) => {
  const sortedTsx = transactions.sort((a, b) => (a.to) < (b.to) ? 1 : -1)
  const addrs = transactions.map(t => t.to)
  console.log("addrs", addrs)

  const occurrences = addrs.reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
  }, {});


  console.log(occurrences) // => {2: 5, 4: 1, 5: 3, 9: 1}
} */
