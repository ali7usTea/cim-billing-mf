export interface Column {
  field: string;
  header: string;
  styleClass: string;
  render: boolean;
}

export interface Row {
  SHORT_CODE: string;
  CHARITY_SMS_FLAG: number;
  USERNAME: string;
  CONNECTIVITY_MODE: string;
  AO_AT: string;
  SENDER_NAME: number;
  THROUGHPUT: number;
  SHORTCODETYPE: string;
}

export interface ShortCodeDetails {
  columns: Column[];
  rows: Row[];
  actioncode: string;
  header: string;
  footer: string;
}

export type ActionReportResponseInterface = Record<string, string>[];
export interface ActionReportInterface {
  details: ActionReportResponseInterface;
}

export type Entity = {
  id: number;
  endpoint: string;
  api: string;
  request: string;
  response: string;
  status: string;
  calledAt: string;
  completedAt: string;
  errorMessage: string | null;
  reqID: string;
  callTypeID: number;
  requestDate: string;
  actionCode: string;
};
export type ActionReportType = { entities: Entity[]; actionId: string };

export interface SearchParamType {
  searches: {
    accountNumber: string | null;
    accountId: string | null;
    partyId: string | null;
    productCode: string | null;
  };
}
