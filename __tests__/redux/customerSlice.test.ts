import { configureStore } from '@reduxjs/toolkit';
import customerReducer, { addCustomers } from '../../src/redux/customer/customerSlice';

describe('customerSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({ reducer: { customerslice: customerReducer } });
    });

    it('has correct initial state', () => {
        const state = store.getState().customerslice;
        expect(state.Customers).toEqual({});
    });

    describe('addCustomers', () => {
        it('adds a customer to the state', () => {
            const customer = {
                key: '',
                value: '',
                accountNumber: '12345',
                accountID: 'ACC001',
                partyID: 'P001',
                productCode: 'MOB',
                productDescription: 'Mobile Service',
                productGroup: 'Mobile',
                productGroupCode: 'MG',
                productGroupCodeDesc: 'Mobile Group',
                customerSegment: 'Retail',
                customerSegmentGroup: 'Consumer',
                customerCategory: 'Individual',
                productType: 'Postpaid',
                regionCode: 'DXB',
                profileID: 'PR001',
                isMaxSuffix: 'N',
                customerID: 'C001',
                isLandLine: 'N',
                isMobile: 'Y',
                customerName: 'John Doe',
                partyProfileId: 'PP001',
                accountStatus: 'Active',
                valueSegment: 'Gold',
                preferredLanguage: 'EN',
                productDesc: 'Mobile Postpaid',
                businessSegmentValue: 'B2C',
                contactSearchId: 'CS001',
                domainName: '',
                userName: '',
                subRequestProductCode: '',
                subRequestProductGroupDesc: '',
                subRequestTypeCode: '',
                subRequestProductGroupCode: '',
                subRequestProductGroup: '',
                noOfRecords: '',
                debugReport: '',
                customerEmail: '',
                ebillEmail: '',
                contactNumber: '0501234567',
                serialNumber: '',
                overrideFlag: '',
                isWasel: '',
                agentName: '',
                agentLocation: '',
                accountActivationDate: ''
            };

            store.dispatch(addCustomers({ key: 'ACC001', Customer: customer }));
            const state = store.getState().customerslice;
            expect(state.Customers['ACC001']).toEqual(customer);
        });

        it('can add multiple customers', () => {
            const customer1 = { accountID: 'ACC001' } as any;
            const customer2 = { accountID: 'ACC002' } as any;

            store.dispatch(addCustomers({ key: 'ACC001', Customer: customer1 }));
            store.dispatch(addCustomers({ key: 'ACC002', Customer: customer2 }));

            const state = store.getState().customerslice;
            expect(Object.keys(state.Customers).length).toBe(2);
        });

        it('overwrites existing customer with same key', () => {
            const customer1 = { accountID: 'ACC001', customerName: 'First' } as any;
            const customer2 = { accountID: 'ACC001', customerName: 'Second' } as any;

            store.dispatch(addCustomers({ key: 'ACC001', Customer: customer1 }));
            store.dispatch(addCustomers({ key: 'ACC001', Customer: customer2 }));

            const state = store.getState().customerslice;
            expect(state.Customers['ACC001'].customerName).toBe('Second');
        });
    });
});
