/** Recognized DLQ payload shapes after analysis. */
export const DLQ_MESSAGE_KIND = Object.freeze({
  EMAIL: "EMAIL",
  EVENTBRIDGE: "EVENTBRIDGE",
  SNS: "SNS",
  JSON: "JSON",
  TEXT: "TEXT",
});
