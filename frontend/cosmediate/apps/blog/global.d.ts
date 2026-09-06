export {}; // To make it a module and avoid TS errors

declare global {
  interface Window {
    grecaptcha?: {
      getResponse: () => string;
      execute: () => void;
      reset: () => void;
    };
  }
}
