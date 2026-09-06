import { assertSearchIndexReady } from "/opt/nodejs/lib/search/search-index-ready.mjs";

import { transformToSearchDocument } from "./transform.mjs";
import { removeUndefined } from "./documents.mjs";

const isDocumentMissingError = (error) =>
  error?.meta?.statusCode === 404 ||
  error?.body?.error?.type === "document_missing_exception" ||
  error?.meta?.body?.error?.type === "document_missing_exception";

const isBulkDocumentMissing = (item) => {
  const err = item?.update?.error ?? item?.index?.error;
  return (
    err?.type === "document_missing_exception" ||
    err?.status === 404 ||
    err?.result === "not_found"
  );
};

export const indexDocument = async (opsClient, indexAlias, docId, document) => {
  await assertSearchIndexReady(opsClient, indexAlias);

  const clean = removeUndefined(document);

  try {
    const res = await opsClient.index({
      index: indexAlias,
      id: docId,
      body: clean,
      refresh: true,
    });

    return {
      index: indexAlias,
      docId,
      result: res.body?.result ?? "updated",
      message: "updated",
    };
  } catch (e) {
    console.error(`index error [${indexAlias}/${docId}]`, e);
    return {
      index: indexAlias ?? null,
      docId,
      result: "error",
      error: e?.message ?? String(e),
    };
  }
};

export const bulkIndexDocuments = async (opsClient, indexAlias, documents) => {
  await assertSearchIndexReady(opsClient, indexAlias);

  try {
    if (!documents.length) return { ok: true, indexed: 0 };

    const body = [];

    for (const { id, body: doc } of documents) {
      body.push({ index: { _index: indexAlias, _id: id } });
      body.push(removeUndefined(doc));
    }

    const res = await opsClient.bulk({ refresh: true, body });
    const errors = res.body?.errors;

    if (errors) {
      const failed = res.body.items
        .map((item, i) => {
          const action = item.index;
          return action?.error
            ? { id: documents[i].id, error: action.error }
            : null;
        })
        .filter(Boolean);

      console.error("Bulk index errors", failed);
      return {
        ok: false,
        indexed: documents.length - failed.length,
        failed,
      };
    }

    return { ok: true, indexed: documents.length };
  } catch (error) {
    console.error(`Bulk index error [${indexAlias}]`, error);
    return {
      index: indexAlias ?? null,
      result: "error",
      error: error?.message ?? String(error),
    };
  }
};

export const deleteDocumentById = async (opsClient, indexAlias, docId) => {
  await assertSearchIndexReady(opsClient, indexAlias);

  try {
    const res = await opsClient.delete({
      index: indexAlias,
      id: docId,
      refresh: true,
    });

    return {
      index: indexAlias ?? null,
      docId,
      result: res.body?.result ?? "deleted",
      message: "deleted",
    };
  } catch (e) {
    if (e?.meta?.statusCode === 404) {
      return {
        index: indexAlias ?? null,
        docId,
        result: "not_found",
        message: "not_found",
      };
    }

    console.error(`delete error [${indexAlias}/${docId}]`, e);
    return {
      index: indexAlias ?? null,
      docId,
      result: "error",
      error: e?.message ?? String(e),
    };
  }
};

export const indexSearchDocument = async ({
  opsClient,
  indexAlias,
  entityType,
  data,
  option = "single",
}) => {
  const id = data?.id;

  if (option === "single" && !id) {
    return { index: indexAlias ?? null, docId: id, message: "skipped" };
  }

  if (!entityType || entityType === "undefined") {
    return {
      index: indexAlias ?? null,
      docId: id,
      result: "skipped",
      message: "invalid entity type",
    };
  }

  if (!indexAlias) {
    return {
      index: null,
      docId: id,
      result: "skipped",
      message: "missing index",
    };
  }

  if (option === "single") {
    const doc = transformToSearchDocument(data, entityType);
    return indexDocument(opsClient, indexAlias, id, doc);
  }

  if (!Array.isArray(data) || !data.length) {
    return { index: indexAlias, result: "skipped", message: "empty bulk data" };
  }

  const docs = data
    .filter((d) => d?.id)
    .map((d) => ({
      id: d.id,
      body: transformToSearchDocument(d, entityType),
    }));

  if (!docs.length) {
    return { index: indexAlias, result: "skipped", message: "no valid docs" };
  }

  return bulkIndexDocuments(opsClient, indexAlias, docs);
};

/**
 * Partial update; on missing doc falls back to full index() with the complete mapped document
 * so no fields are dropped (same transform path as INSERT).
 */
const updateOrFullIndexDocument = async (
  opsClient,
  indexAlias,
  docId,
  fullDoc,
) => {
  try {
    const response = await opsClient.update({
      index: indexAlias,
      id: docId,
      body: { doc: fullDoc, doc_as_upsert: false },
      retry_on_conflict: 3,
      refresh: true,
    });

    return {
      index: indexAlias,
      docId,
      result: response.body?.result || "updated",
      strategy: "partial_update",
    };
  } catch (error) {
    if (!isDocumentMissingError(error)) {
      throw error;
    }

    console.log(
      `[updateSearchDocument] doc missing, full index fallback [${indexAlias}/${docId}]`,
    );

    const indexed = await indexDocument(opsClient, indexAlias, docId, fullDoc);
    return {
      ...indexed,
      strategy: "full_index_fallback",
    };
  }
};

export const updateSearchDocument = async ({
  opsClient,
  indexAlias,
  entityType,
  data,
  option = "single",
}) => {
  const id = data?.id;

  if (option === "single" && !id) {
    return { index: indexAlias ?? null, docId: id, message: "skipped" };
  }

  if (!entityType || entityType === "undefined" || !indexAlias) {
    return {
      index: indexAlias ?? null,
      docId: id,
      result: "skipped",
      message: "invalid entity type or index",
    };
  }

  if (option === "single") {
    await assertSearchIndexReady(opsClient, indexAlias);
    const doc = transformToSearchDocument(data, entityType);
    return updateOrFullIndexDocument(opsClient, indexAlias, id, doc);
  }

  if (!Array.isArray(data) || !data.length) {
    return { index: indexAlias, result: "skipped", message: "empty bulk data" };
  }

  await assertSearchIndexReady(opsClient, indexAlias);

  const rows = data.filter((d) => d?.id);
  const bulkOps = [];
  const rowById = new Map();

  rows.forEach((d) => {
    const doc = transformToSearchDocument(d, entityType);
    rowById.set(d.id, doc);
    bulkOps.push({
      update: { _index: indexAlias, _id: d.id, retry_on_conflict: 3 },
    });
    bulkOps.push({ doc, doc_as_upsert: false });
  });

  if (!bulkOps.length) {
    return { index: indexAlias, result: "skipped", message: "no valid docs" };
  }

  const response = await opsClient.bulk({ body: bulkOps, refresh: true });
  const result = {
    index: indexAlias,
    total: data.length,
    errors: response.body?.errors || false,
    fullIndexFallbacks: 0,
  };

  if (response.body?.errors) {
    const missingIds = [];
    const items = response.body.items ?? [];

    items.forEach((item) => {
      if (item.update && isBulkDocumentMissing(item)) {
        const docId = item.update._id;
        if (docId) missingIds.push(docId);
      }
    });

    if (missingIds.length) {
      const fallbackDocs = missingIds
        .map((docId) => ({
          id: docId,
          body: rowById.get(docId),
        }))
        .filter((entry) => entry.body);

      const fallback = await bulkIndexDocuments(
        opsClient,
        indexAlias,
        fallbackDocs,
      );
      result.fullIndexFallbacks = fallback.indexed ?? fallbackDocs.length;
      result.fallback = fallback;
    }

    result.failed = items.filter((item) => item.update?.error).length;
  }

  return result;
};

export const removeSearchDocument = async ({ opsClient, indexAlias, data }) => {
  const id = data?.id;
  if (!id || !indexAlias) {
    return { index: indexAlias ?? null, docId: id, result: "skipped" };
  }
  return deleteDocumentById(opsClient, indexAlias, id);
};

/** Partial field update without full document transform (e.g. searchClicks). */
export const patchSearchDocumentFields = async ({
  opsClient,
  indexAlias,
  docId,
  fields,
}) => {
  if (!docId || !indexAlias || !fields || !Object.keys(fields).length) {
    return {
      index: indexAlias ?? null,
      docId,
      result: "skipped",
      message: "missing patch target or fields",
    };
  }

  await assertSearchIndexReady(opsClient, indexAlias);

  try {
    const response = await opsClient.update({
      index: indexAlias,
      id: docId,
      body: { doc: removeUndefined(fields), doc_as_upsert: false },
      retry_on_conflict: 3,
      refresh: true,
    });

    return {
      index: indexAlias,
      docId,
      result: response.body?.result || "updated",
    };
  } catch (error) {
    if (error?.meta?.statusCode === 404) {
      console.log(
        `[patchSearchDocumentFields] not found [${indexAlias}/${docId}] — full document required`,
      );
      return { index: indexAlias, docId, result: "not_found" };
    }

    console.error(`patch error [${indexAlias}/${docId}]`, error);
    throw error;
  }
};
