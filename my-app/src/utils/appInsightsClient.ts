import { useAzureMonitor } from "@azure/monitor-opentelemetry";
import { trace } from "@opentelemetry/api";


const connectionString = process.env.APPINSIGHTS_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("APPINSIGHTS_CONNECTION_STRING environment variable is not set.");
}

declare global {
  // eslint-disable-next-line no-var
  var __otel_initialized: boolean | undefined;
}

if (connectionString && !globalThis.__otel_initialized) {
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString,
    }
  });
  globalThis.__otel_initialized = true;
}

// Function to track custom events in Azure Application Insights
export function trackCustomEvent(tracerName: string, spanName: string, attributes?: Record<string, any>) {
  const tracer = trace.getTracer(tracerName);
  const span = tracer.startSpan(spanName);
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
  span.end();
}
