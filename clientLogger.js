export const sendLogToServer = (level, message) => {
  fetch("/billing/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ level, message })
  }).catch((err) => console.error("Failed to send log:", err));
};
// Simple client-side logger function
export const clientLogger = {
  info: (message) => {
    console.log(`[INFO]: ${message}`); // Optionally log to the console
    sendLogToServer("info", message);
  },
  error: (message) => {
    console.error(`[ERROR]: ${message}`); // Optionally log to the console
    sendLogToServer("error", message);
  },
  warn: (message) => {
    console.warn(`[WARN]: ${message}`); // Optionally log to the console
    sendLogToServer("warn", message);
  }
};
