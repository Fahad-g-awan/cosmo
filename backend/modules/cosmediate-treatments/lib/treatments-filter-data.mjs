import {
  buildFixedBinHistogram,
  getPriceFieldStats,
  HISTOGRAM_BIN_COUNT,
} from "./utils/priceData.mjs";

const aliasFor = (base, env) => `${base}-${env}`;

const aggregateSubTreatmentPrices = async (prisma) => {
  const agg = await prisma.subTreatment.aggregate({
    where: {
      deleted: false,
      available: true,
      price: { gt: 0 },
    },
    _min: { price: true },
    _max: { price: true },
    _avg: { price: true },
  });

  return {
    minPrice: Math.floor(agg._min.price ?? 0),
    maxPrice: Math.ceil(agg._max.price ?? 0),
    avgPrice: agg._avg.price ?? 0,
  };
};

const buildIndexHistogram = async ({
  opsClient,
  env,
  indexBase,
  field,
  minPrice,
  maxPrice,
}) =>
  buildFixedBinHistogram({
    opsClient,
    indexAlias: aliasFor(indexBase, env),
    field,
    minPrice,
    maxPrice,
    binCount: HISTOGRAM_BIN_COUNT,
  }).catch(() => []);

/**
 * Public browse filter metadata: price bounds + fixed-bin histograms per index.
 */
export const buildTreatmentsFilterData = async ({ prisma, opsClient, env }) => {
  const subTreatmentPrices = await aggregateSubTreatmentPrices(prisma);

  let minPrice = subTreatmentPrices.minPrice;
  let maxPrice = subTreatmentPrices.maxPrice;
  let avgPrice = subTreatmentPrices.avgPrice;

  const histograms = {
    treatment: [],
    clinic: [],
    brand: [],
  };

  if (opsClient && env) {
    const treatmentStats = await getPriceFieldStats({
      opsClient,
      indexAlias: aliasFor("treatments", env),
      field: "minPrice",
    }).catch(() => ({ minPrice: 0, maxPrice: 0 }));

    if (treatmentStats.maxPrice > 0) {
      minPrice = treatmentStats.minPrice;
      maxPrice = treatmentStats.maxPrice;
    }

    const clinicStats = await getPriceFieldStats({
      opsClient,
      indexAlias: aliasFor("clinics", env),
      field: "minPrice",
    }).catch(() => ({ minPrice: 0, maxPrice: 0 }));

    const brandStats = await getPriceFieldStats({
      opsClient,
      indexAlias: aliasFor("sub_treatments", env),
      field: "price",
    }).catch(() => ({ minPrice: 0, maxPrice: 0 }));

    const [treatment, clinic, brand] = await Promise.all([
      buildIndexHistogram({
        opsClient,
        env,
        indexBase: "treatments",
        field: "minPrice",
        minPrice,
        maxPrice,
      }),
      buildIndexHistogram({
        opsClient,
        env,
        indexBase: "clinics",
        field: "minPrice",
        minPrice: clinicStats.minPrice || minPrice,
        maxPrice: clinicStats.maxPrice || maxPrice,
      }),
      buildIndexHistogram({
        opsClient,
        env,
        indexBase: "sub_treatments",
        field: "price",
        minPrice: brandStats.minPrice || minPrice,
        maxPrice: brandStats.maxPrice || maxPrice,
      }),
    ]);

    histograms.treatment = treatment;
    histograms.clinic = clinic;
    histograms.brand = brand;
  }

  return {
    minPrice,
    maxPrice,
    avgPrice,
    binCount: HISTOGRAM_BIN_COUNT,
    histograms,
  };
};
