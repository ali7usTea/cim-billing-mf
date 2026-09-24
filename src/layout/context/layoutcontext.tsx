import { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Toaster, toast } from "sonner";
import { RootState } from "../../redux/store";
import { ChildContainerProps, LayoutContextProps } from "../../types/types";
export const LayoutContext = createContext({} as LayoutContextProps);

export const LayoutProvider = ({ children }: ChildContainerProps) => {
  const [jwtToken, setJwtToken] = useState<string>("");
  const { notificationType, infoText, notificationHeader } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    if (!notificationHeader) return;
    const severityMap = {
      success: toast.success,
      info: toast.info,
      warn: toast.warning,
      error: toast.error
    };
    severityMap[notificationType](notificationHeader, {
      description: infoText || "Message Content"
    });
  }, [notificationType, notificationHeader, infoText]);

  const value: LayoutContextProps = {
    jwtToken,
    setJwtToken
  };

  return (
    <LayoutContext.Provider value={value}>
      <Toaster
        position="top-right"
        richColors
        expand={true}
        duration={5000}
        closeButton
      />
      {children}
    </LayoutContext.Provider>
  );
};
