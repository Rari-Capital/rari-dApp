import React from "react";
import { Select, SelectProps } from "@chakra-ui/react";

import { useTranslation } from "react-i18next";

export const LanguageSelect = (extraProps: SelectProps) => {
  const { i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onChange={(event) => {
        i18n.changeLanguage(event.target.value);
        localStorage.setItem("rariLang", event.target.value);
      }}
      fontWeight="bold"
      width="100%"
      {...extraProps}
    >
      <option className="black-bg-option" value="en">
        English
      </option>
      <option className="black-bg-option" value="zh-CN">
        简体中文
      </option>
      <option className="black-bg-option" value="zh-TW">
        中國傳統的
      </option>
    </Select>
  );
};
