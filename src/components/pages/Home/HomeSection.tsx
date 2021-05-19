import React, { ReactNode } from "react";
import { Row } from "buttered-chakra";

const HomeSection = ({ children, ...rowProps }: { children: ReactNode[] }) => {
  return (
    <Row
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      px={{ sm: "0", md: "15%" }}
      width="100%"
      {...rowProps}
    >
      {children}
    </Row>
  );
};

export default HomeSection;
