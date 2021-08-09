import { Avatar, AvatarBadge, Image, Stack } from "@chakra-ui/react";

const AvatarWithBadge = ({
  outerImage,
  badgeImage,
}: {
  outerImage: string;
  badgeImage: string;
}) => {
  return (
    <Stack direction="row" spacing={4}>
      <Avatar src={outerImage} boxSize={8}>
        <AvatarBadge boxSize={6} borderColor="transparent" bg="white border">
          <Image src={badgeImage} />
        </AvatarBadge>
      </Avatar>
    </Stack>
  );
};

export default AvatarWithBadge;
