import React, { useEffect, useState } from "react";
// @ts-ignore
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Avatar as AvatarUI } from "@chakra-ui/react";
import { getAvatarUrl } from "../../utils/ens";

const Avatar = ({
  ensName,
  address,
}: {
  ensName?: string;
  address: string;
}) => {
  const [avatarURL, setAvatarURL] = useState<string>();

  useEffect(() => {
    setAvatarURL(ensName ? getAvatarUrl(ensName) : undefined);
  }, [ensName]);

  return (
    <AvatarUI
      size="sm"
      src={avatarURL}
      icon={<Jazzicon diameter={32} seed={jsNumberForAddress(address)} />}
    />
  );
};

export default Avatar;
