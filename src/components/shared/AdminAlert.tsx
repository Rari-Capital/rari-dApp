import { Alert, AlertIcon } from "@chakra-ui/alert";
import { EditIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/layout";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const AdminAlert = ({
  isAdmin = false,
  isAdminText = "You are the admin!",
  isNotAdminText = "You are not the admin!!",
  rightAdornment,
  ...alertProps
}: {
  isAdmin: boolean;
  isAdminText?: string;
  isNotAdminText?: string;
  rightAdornment?: ReactNode;
  [x: string]: any;
}) => {
  const { t } = useTranslation();

  return (
    <Alert
      colorScheme={isAdmin ? "green" : "red"}
      borderRadius={5}
      mt="5"
      {...alertProps}
    >
      <AlertIcon />
      <span style={{ color: "black" }}>
        {t(isAdmin ? isAdminText : isNotAdminText)}
      </span>
      <Box h="100%" ml="auto">
        {rightAdornment}
      </Box>
    </Alert>
  );
};
