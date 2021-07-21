import { NextPage } from "next";
import { useRouter } from "next/router";
import PoolPortal from "components/pages/PoolPortal";
import { Pool } from "utils/poolUtils";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

function getEnumKeyByEnumValue(myEnum: any, enumValue: any) {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : null;
}

const PoolPage: NextPage = () => {
  const router = useRouter();
  const { poolId } = router.query;
  const pool: Pool = getEnumKeyByEnumValue(Pool, poolId) as Pool;
  return <PoolPortal pool={pool} />;
};

export default PoolPage;
