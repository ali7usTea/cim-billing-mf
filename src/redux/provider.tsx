// Provider Integrate react app to Redux
import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode } from "react";

interface ProviderProbs {
  children: ReactNode;
}
export function Providers({ children }: ProviderProbs) {
  return <Provider store={store}>{children}</Provider>;
}
