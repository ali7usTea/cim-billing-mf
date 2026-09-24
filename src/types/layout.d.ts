import React, {
  ReactElement,
  Dispatch,
  SetStateAction,
  HTMLAttributeAnchorTarget,
  ReactNode
} from "react";
import { NextPage } from "next";

/* Context Types */
export type LayoutState = {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
};

export type LayoutConfig = {
  ripple: boolean;
  inputStyle: string;
  colorScheme: string;
  theme: string;
  scale: number;
};

export interface LayoutContextProps {
  // layoutConfig: LayoutConfig;
  // setLayoutConfig: Dispatch<SetStateAction<LayoutConfig>>;
  // layoutState: LayoutState;
  // setLayoutState: Dispatch<SetStateAction<LayoutState>>;
  jwtToken: string;
  setJwtToken: (token: string) => void;
  // JWT token is now managed in Redux only, not in Context
  // showProfileSidebar: () => void;
  // theme: string,
  // toggleTheme: (newTheme:string) => void
}
/* AppConfig Types */
export interface AppConfigProps {
  simple?: boolean;
}

/* AppMenu Types */
type CommandProps = {
  originalEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>;
  item: MenuModelItem;
};

export interface MenuModel {
  label: string;
  icon?: string;
  items?: MenuModel[];
  to?: string;
  url?: string;
  target?: HTMLAttributeAnchorTarget;
  seperator?: boolean;
}

export interface AppMenuItem extends MenuModel {
  items?: AppMenuItem[];
  badge?: "UPDATED" | "NEW";
  badgeClass?: string;
  class?: string;
  preventExact?: boolean;
  visible?: boolean;
  disabled?: boolean;
  replaceUrl?: boolean;
  command?: ({ originalEvent, item }: CommandProps) => void;
}

export interface AppMenuItemProps {
  item?: AppMenuItem;
  parentKey?: string;
  index?: number;
  root?: boolean;
  className?: string;
}
