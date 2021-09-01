import { useState, useEffect, MouseEventHandler, ReactNode } from "react";

// Components
import { Button, ButtonGroup } from "@chakra-ui/react";

// TODO (Zane): change "any" type to something else?
export default function MultiPicker({
  options,
  onChange,
}: {
  options: any;
  onChange: (state: string) => any;
}) {
  // start with first option as default
  const [selectedKey, setSelectedKey] = useState<string>(
    Object.keys(options)[0]
  );

  useEffect(() => {
    onChange(selectedKey);
  }, [onChange, selectedKey]);

  return (
    <ButtonGroup spacing="0" borderRadius="full" bgColor="#2D3748">
      {Object.keys(options).map((key) => (
        <MultiPickerButton
          selected={key === selectedKey}
          onClick={() => setSelectedKey(key)}
          key={key}
        >
          {options[key]}
        </MultiPickerButton>
      ))}
    </ButtonGroup>
  );
}

function MultiPickerButton({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Button
      colorScheme="black"
      variant={selected ? "solid" : "ghost"}
      borderRadius="full"
      onClick={onClick}
      bgColor={selected ? "#00C628" : "transparent"}
    >
      {children}
    </Button>
  );
}
