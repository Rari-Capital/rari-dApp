import { Box, BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBoxInner = motion<BoxProps>(Box);

const MotionBox = ({ ...boxProps }: { [x: string]: any }) => {
  return (
    <MotionBoxInner
    //   height="40px"
    //   bg="red.300"
      {...boxProps}
    />
  );
};  

export default MotionBox