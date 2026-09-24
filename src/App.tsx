import { useContext, useEffect } from "react";
import BillingTab from "./app/main/page";
import { LayoutContext } from "./layout/context/layoutcontext";

export default function App({ token }: { token?: string }) {
  const { setJwtToken } = useContext(LayoutContext);

  useEffect(() => {
    if (!token) return;
    setJwtToken(token);
  }, [token]);

  return <BillingTab />;
}
