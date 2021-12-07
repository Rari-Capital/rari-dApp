export const getAvatarUrl = (name: string) => {
  const network = "mainnet";
  return `https://metadata.ens.domains/${network}/avatar/${name}`;
};
