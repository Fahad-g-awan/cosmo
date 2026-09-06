import { SHARDS, REPLICAS } from "./constants.mjs";

export const indexSettings = () => {
  return {
    number_of_shards: SHARDS,
    number_of_replicas: REPLICAS,
    analysis: {
      filter: {
        phonetic_filter: {
          type: "phonetic",
          encoder: "double_metaphone",
        },
      },
      normalizer: {
        lowercase_trim: {
          type: "custom",
          filter: ["lowercase", "asciifolding", "trim"],
        },
      },
      analyzer: {
        auto_complete: {
          type: "custom",
          tokenizer: "edge_ngram_tokenizer",
          filter: ["lowercase", "phonetic_filter"],
        },
        auto_search: {
          type: "custom",
          tokenizer: "standard",
          filter: ["lowercase", "phonetic_filter"],
        },
      },
      tokenizer: {
        edge_ngram_tokenizer: {
          type: "edge_ngram",
          min_gram: 2,
          max_gram: 10,
          token_chars: ["letter", "digit"],
        },
      },
    },
  };
};
