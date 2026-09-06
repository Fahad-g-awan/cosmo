export const DDB_GSI_KEYS = {
  // GSI1SK_ENTITY_TYPE_ENTITY_TYPE: "ENTITY_TYPE_ENTITY_TYPE", // GSI1SK is dynamic used for fetch_by_id

  GSI2SK_SEARCH_LOOKUPKEY: "SEARCH#LOOKUPKEY", // Use to search a record using there lookup key e.g. email, name
  GSI3SK_SEARCH_ENTITY_TYPE: "SEARCH#ENTITY_TYPE", // Use to get all records which have same entity type
  GSI4SK_SEARCH_SUB: "SEARCH#SUB", // Use to search a record using there sub

  // Other GSISK keys are dynamic and used for entity relations
};
