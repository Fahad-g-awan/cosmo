// import { createClient } from "redis";

// const clientByUrl = new Map();

// export const getRedisForUrl = async (url, { tls = true } = {}) => {
//   if (!url) throw new Error("Valkey URL is required");

//   const existing = clientByUrl.get(url);

//   if (existing?.isOpen) return existing;
//   if (existing && !existing.isOpen) clientByUrl.delete(url);

//   const client = createClient({
//     url,
//     socket: {
//       tls,
//       keepAlive: 5000,
//       reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
//     },
//   });

//   client.on("error", (err) => console.error("Redis error:", err));
//   client.on("end", () => console.warn("Redis connection ended for", url));
//   client.on("reconnecting", () => console.log("Redis reconnecting:", url));

//   await client.connect();
//   clientByUrl.set(url, client);

//   return client;
// };

// export const getRedisClient = async (config) => {
//   const url = config.REDIS_URL;
//   return getRedisForUrl(url, { tls: true });
// };
