import { BoxProps, Box } from "@chakra-ui/react";

interface Props {
  percentageFilled: number;
}

const ProgressBar = ({
  percentageFilled,

  ...others
}: Props & BoxProps) => {
  return (
    <Box bg="#4D4D4D" width="100%" height="10px" borderRadius="6px" {...others}>
      <Box
        bg="#FFFFFF"
        width={percentageFilled * 100 + "%"}
        height="10px"
        borderRadius="6px"
      />
    </Box>
  );
};

export default ProgressBar;
