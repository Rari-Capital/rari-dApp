import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router"

// Components
import PoolPortal from "components/pages/PoolPortal";
import { Pool } from "utils/poolUtils";

function getEnumKeyByEnumValue(myEnum: any, enumValue: any) {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}


const PoolPage: NextPage = () => {
    const router = useRouter()
    const { poolId } = router.query
    const pool: Pool = getEnumKeyByEnumValue(Pool, poolId) as Pool

    return (
        <PoolPortal pool={pool}/>
    )
}

export default PoolPage


export const getStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
      props: {
        ...(await serverSideTranslations(locale!)),
        // Will be passed to the page component as props
      },
    };
  };