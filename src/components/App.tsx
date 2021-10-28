// import { Navigate, Outlet, Route, Routes } from "react-router-dom";
// import { Heading } from "@chakra-ui/react";
// import loadable from "@loadable/component";
// import FullPageSpinner from "./shared/FullPageSpinner";
// import { Pool } from "../utils/poolUtils";
// import Layout from "./shared/Layout/Layout";

// const MultiPoolPortal = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/MultiPoolPortal"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const PoolPortal = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/PoolPortal"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const TranchesPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Tranches/TranchesPage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const FusePoolsPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolsPage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const FusePoolPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolPage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const FusePoolInfoPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolInfoPage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const FusePoolEditPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolEditPage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const FusePoolCreatePage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Fuse/FusePoolCreatePage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const FuseLiquidationsPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Fuse/FuseLiquidationsPage"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const Pool2Page = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Pool2/Pool2Page"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const StatsPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Stats"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const HomePage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Home/Home"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const TokenDetailsPage = loadable(
//   () => import(/* webpackPrefetch: true */ "./pages/Tokens/TokenDetails"),
//   {
//     fallback: <FullPageSpinner />,
//   }
// );

// const PageNotFound = memo(() => {
//   return (
//     <Heading
//       color="#FFF"
//       style={{
//         position: "fixed",
//         left: "50%",
//         top: "50%",
//         marginTop: "-15px",
//         marginLeft: "-114px",
//       }}
//     >
//       404: Not Found
//     </Heading>
//   );
// });

// const App = memo(() => {
//   return (
//     <Layout>
//       <Routes>
//         <Route path="/pools" element={<Outlet />}>
//           {Object.values(Pool).map((pool) => {
//             return (
//               <Route
//                 key={pool}
//                 path={pool}
//                 element={<PoolPortal pool={pool} />}
//               />
//             );
//           })}

//           <Route path="/" element={<Navigate to="/" replace={true} />} />
//         </Route>

//         <Route path="/tranches" element={<TranchesPage />} />

//         <Route path="/pool2" element={<Pool2Page />} />

//         <Route path="/positions" element={<StatsPage />} />

//         <Route path="/fuse" element={<FusePoolsPage />} />
//         <Route path="/fuse/liquidations" element={<FuseLiquidationsPage />} />
//         <Route path="/fuse/new-pool" element={<FusePoolCreatePage />} />
//         <Route path="/fuse/pool/:poolId" element={<FusePoolPage />} />
//         <Route path="/fuse/pool/:poolId/info" element={<FusePoolInfoPage />} />
//         <Route path="/fuse/pool/:poolId/edit" element={<FusePoolEditPage />} />

//         <Route path="/home" element={<HomePage />} />

//         <Route path="/token/:symbol" element={<TokenDetailsPage />} />

//         <Route path="/" element={<MultiPoolPortal />} />

//         <Route path="*" element={<PageNotFound />} />
//       </Routes>
//     </Layout>
//   );
// });

import { memo } from "react";
const App = memo(() => (<div/>))
export default App;
