import { Tooltip } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export const SimpleTooltip = ({
  label,
  children,
  placement,
}: {
  label: string;
  placement?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
}) => {
  return (
    <Tooltip
      p={1}
      hasArrow
      bg="#000"
      textAlign="center"
      zIndex={999999999}
      placement={placement ?? "top"}
      aria-label={label}
      label={label}
    >
      {children}
    </Tooltip>
  );
};
