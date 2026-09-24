import { register, Counter, Histogram } from "prom-client";
import {
  CounterLogDetailsType,
  HistogramLogDetailsType
} from "../types/prometheus";
// import { clientLogger } from "../clientLogger";

const counter = new Counter({
  name: "web_server_events",
  help: "web_server_events server api counter",
  labelNames: ["event", "statusCode"]
});

const histogram = new Histogram({
  name: "web_server_processing_time",
  help: "web_server data fetching and processing time",
  labelNames: ["event", "statusCode"],
  buckets: [
    0.1, 5, 15, 50, 100, 250, 500, 750, 1000, 1500, 2000, 5000, 10000, 15000,
    20000
  ]
});
register.registerMetric(counter);

export const sendPrometheus = (logDetails: CounterLogDetailsType) => {
  try {
    const { event, statusCode } = logDetails || {};
    counter.labels(event, statusCode).inc();
  } catch (error) {
    // clientLogger.error(
    //   "app.utils.prometheus::sendPrometheus : Error in sendPrometheus - Prometheus counter event error: " +
    //     error
    // );
    console.log("Prometheus counter event error", error);
  }
};

export const sendPrometheusResponseTime = (
  logDetails: HistogramLogDetailsType
) => {
  try {
    const { event, statusCode, responseTime } = logDetails || {};
    histogram.labels(event, statusCode).observe(responseTime);
  } catch (error) {
    // clientLogger.error(
    //   "app.utils.prometheus::sendPrometheusResponseTime : Error in sendPrometheusResponseTime - Prometheus Histogram event error: " +
    //     error
    // );
    console.log("Prometheus Histogram event error", error);
  }
};
