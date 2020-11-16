import React, { useCallback } from "react";
import { Select, SelectProps } from "@chakra-ui/react";

import { useTranslation } from "react-i18next";

export const LanguageSelect = React.memo((extraProps: SelectProps) => {
  const { i18n } = useTranslation();

  const onSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      i18n.changeLanguage(event.target.value);
      localStorage.setItem("rariLang", event.target.value);
    },
    [i18n]
  );

  return (
    <Select
      value={i18n.language}
      onChange={onSelect}
      fontWeight="bold"
      width="100%"
      {...extraProps}
    >
      <option value="en">English</option>
      <option value="zh-CN">简体中文</option>
      <option value="zh-TW">中國傳統的</option>
    </Select>
  );
});
