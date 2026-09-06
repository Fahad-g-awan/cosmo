// import { useState, useEffect } from "react";
// import { useMap } from "@vis.gl/react-google-maps";

// export const useMapLoadState = () => {
//   const map = useMap();
//   const [ready, setReady] = useState(false);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     if (!map) return;

//     const idleListener = map.addListener("idle", () => {
//       setReady(true);
//     });
//     const errorListener = map.addListener("error", () => {
//       setError(true);
//     });

//     return () => {
//       idleListener.remove();
//       errorListener.remove();
//     };
//   }, [map]);

//   return { ready, error };
// };
