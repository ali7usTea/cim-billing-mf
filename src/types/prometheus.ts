// types.ts

// Type definition for the Counter log details
export interface CounterLogDetailsType {
  event: string;
  statusCode: string;
}

// Type definition for the Histogram log details
export interface HistogramLogDetailsType {
  event: string;
  statusCode: string;
  responseTime: number; // Response time in milliseconds
}
