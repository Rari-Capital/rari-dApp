import { useEffect } from "react";
import { useState } from "react";

// Components
import { Box } from "@chakra-ui/react";
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/input";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

export default function TokenSearch({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  const [val, setVal] = useState("");

  // run onChange on value change
  useEffect(() => {
    onChange(val);
  }, [val, onChange]);

  const { t } = useTranslation();

  return (
    <Box>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="#757575" />}
        />
        <Input
          variant="filled"
          value={val}
          color="#757575"
          onChange={({ target: { value } }) => setVal(value)}
          placeholder={t("Search Assets")}
          _placeholder={{ color: "gray.500", fontWeight: "bold" }}
          _focus={{ color: "#fff", background: "transparent" }}
        />
        {/* button to clear search */}
        {val === "" ? null : (
          <InputRightElement
            role="button"
            aria-label="Clear search"
            title="Clear search"
            cursor="pointer"
            onClick={() => setVal("")}
            children={<CloseIcon color="#757575" boxSize="12px" />}
          />
        )}
      </InputGroup>
    </Box>
  );
}
