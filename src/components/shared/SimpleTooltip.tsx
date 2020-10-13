import { Tooltip } from "@chakra-ui/core";
import React, { ReactNode } from "react";

export const SimpleTooltip = React.memo(
  ({ label, children }: { label: string; children: ReactNode }) => {
    return (
      <Tooltip
        hasArrow
        bg="#000"
        placement="top"
        aria-label={label}
        label={label}
      >
        {children}
      </Tooltip>
    );
  }
);
