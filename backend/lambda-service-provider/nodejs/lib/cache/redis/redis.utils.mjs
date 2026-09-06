// export const deleteRedisCacheByPrefix = async (prefix) => {
//   try {
//     if (!prefix) return;

//     let cursor = "0";

//     do {
//       const reply = await redis.scan(
//         cursor,
//         "MATCH",
//         `${prefix}*`,
//         "COUNT",
//         100
//       );

//       const { cursor: nextCursor, keys } = reply;

//       if (Array.isArray(keys) && keys.length > 0) {
//         const cleanKeys = keys.map(String).filter(Boolean);
//         await redis.del(...cleanKeys);
//       }

//       cursor = nextCursor;
//     } while (cursor !== "0");
//   } catch (error) {
//     console.error("Error deleting redis keys:", error);
//   }
// };
