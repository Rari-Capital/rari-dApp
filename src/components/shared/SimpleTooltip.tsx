import { Tooltip } from "@chakra-ui/react";
import { ReactNode } from "react";

export const SimpleTooltip = ({
  label,
  children,
  placement,
}: {
  label: string;
  placement?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "auto"
    | "auto-start"
    | "auto-end"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "right-start"
    | "right-end"
    | "left-start"
    | "left-end";
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
