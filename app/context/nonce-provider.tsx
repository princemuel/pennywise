import { createContext, useContext } from "react";

const NonceContext = createContext("");

export const [NonceProvider, useNonce] = [
  NonceContext.Provider,
  () => useContext(NonceContext),
];
