const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 12345) % 2147483647;
    return (s & 0xffff) / 0xffff;
  };
};

export const generateImpressionsData = () => {
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
  const rng = seededRandom(daysSinceEpoch);

  const bins: { data: number; count: number }[] = [];
  let totalCount = 0;

  for (let i = 20; i >= 0; i--) {
    const count = Math.floor(rng() * 800) + 500;
    bins.push({ data: 30 - i, count });
    totalCount += count;
  }

  const todayCount = bins[bins.length - 1]!.count;
  return { bins, totalCount, todayCount };
};
