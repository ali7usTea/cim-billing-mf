import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export const useSubscriber = () => {
  const { Customers } = useSelector((state: RootState) => state.customerslice);

  const subscriberContainer = Customers[Object.keys(Customers)[0]];
  const { productType } = subscriberContainer || {};

  const isPrepaid = useMemo(() => {
    return productType === "1" || productType === "7";
  }, [productType]);
  const { ...props } = subscriberContainer || {};
  return {
    isPrepaid,
    ...props
  };
};
