import React from "react";

export const SwitchCSS = ({
  symbol,
  color,
}: {
  symbol: string;
  color: string | undefined | null;
}) => {
  return (
    <style>
      {`  
  .${symbol + "-switch"} > .chakra-switch__track[data-checked] {
    background-color: ${
      color ? (color === "#FFFFFF" ? "#282727" : color) : "#282727"
    } !important;
  }
  .${symbol + "-switch"} .chakra-switch__input {
    /* Fixes a bug in the FusePoolPage with the switches creating bottom padding */
    position: static !important;
    height: 0px !important;
    width: 0px !important;
  }
  `}
    </style>
  );
};
