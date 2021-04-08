export const convertMantissaToAPY = (mantissa: any, dayRange: number) => {
  return (Math.pow((mantissa / 1e18) * (4 * 60 * 24) + 1, dayRange) - 1) * 100;
};

export const convertMantissaToAPR = (mantissa: any) => {
  return (mantissa * 2372500) / 1e16;
};
