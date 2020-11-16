import { Tooltip } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export const SimpleTooltip = React.memo(
  ({ label, children }: { label: string; children: ReactNode }) => {
    return (
      <Tooltip
        p={1}
        hasArrow
        bg="#000"
        textAlign="center"
        zIndex={999999999}
        placement="top"
        aria-label={label}
        label={label}
      >
        {children}
      </Tooltip>
    );
  }
);
