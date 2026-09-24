import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Inteface follow similar naming conventions to those used for classes
export interface Customer {
  key: any;
  value: any;
  accountNumber: string;
  accountID: string;
  partyID: string;
  productCode: string;
  productDescription: string;
  productGroup: string;
  productGroupCode: string;
  productGroupCodeDesc: string;
  customerSegment: string;
  customerSegmentGroup: string;
  customerCategory: string;
  productType: string;
  regionCode: string;
  profileID: string;
  isMaxSuffix: string;
  customerID: string;
  isLandLine: string;
  isMobile: string;
  customerName: string;
  partyProfileId: string;
  accountStatus: string;
  valueSegment: string;
  preferredLanguage: string;
  productDesc: string;
  businessSegmentValue: string;
  contactSearchId: string;
  domainName: string;
  userName: string;
  subRequestProductCode: string;
  subRequestProductGroupDesc: string;
  subRequestTypeCode: string;
  subRequestProductGroupCode: string;
  subRequestProductGroup: string;
  customerEmail: string;
  ebillEmail: string;
  contactNumber: string;
  serialNumber?: string;
  noOfRecords: string;
  overrideFlag: string;
  debugReport?: string;
  isWasel: string;
  agentName?: string;
  agentLocation?: string;
  accountActivationDate?: string;
}

interface CustomerState {
  Customers: { [key: string]: Customer };
}

const initialState: CustomerState = {
  Customers: {}
};

const Customerslice = createSlice({
  name: "Customer",
  initialState,
  reducers: {
    addCustomers: (
      state,
      action: PayloadAction<{ key: string; Customer: Customer }>
    ) => {
      const { key, Customer } = action.payload;
      state.Customers[key] = Customer;
    },
    updateCustomers: (
      state,
      action: PayloadAction<{ key: string; updatedCustomer: Customer }>
    ) => {
      const { key, updatedCustomer } = action.payload;
      if (state.Customers[key]) {
        state.Customers[key] = {
          ...state.Customers[key],
          ...updatedCustomer
        };
      }
    },
    // Action to delete data
    deleteCustomers: (state, action: PayloadAction<string>) => {
      const keyTobeDelted = action.payload;
      delete state.Customers[keyTobeDelted];
    },
    getCustomer: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      const Customer = state.Customers[key];
      if (Customer) {
        console.log(Customer);
      } else {
        console.log(`Customer with key ${key} not found.`);
      }
    }
  }
});
export const selectCustomer = (state: RootState) => state.customerslice;
export const { addCustomers, updateCustomers, deleteCustomers, getCustomer } =
  Customerslice.actions;
export default Customerslice.reducer;
