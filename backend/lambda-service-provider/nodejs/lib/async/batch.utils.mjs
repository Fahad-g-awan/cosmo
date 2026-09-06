export const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const runWithConcurrency = async (items, limit, worker) => {
  const queue = [...items];
  const results = [];

  const runWorker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      try {
        const result = await worker(item);
        results.push(result);
      } catch (err) {
        console.error("[runWithConcurrency] Error processing item", err);
        throw new Error("Failed to process item");
      }
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    runWorker(),
  );

  await Promise.all(workers);
  return results;
};
