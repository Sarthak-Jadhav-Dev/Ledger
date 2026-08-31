import cron from "node-cron";
import https from "https";
import http from "http";

/**
 * Cron job to ping the server every 14 minutes
 * Prevents Render free tier from shutting down due to inactivity
 */
export const startKeepAliveCron = () => {
    // Run every 14 minutes (at minute 0 and 14 of every hour)
    cron.schedule("*/14 * * * *", async () => {
        const timestamp = new Date().toISOString();
        console.log(`[KEEP-ALIVE CRON] Pinging server at ${timestamp}`);

        try {
            const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
            const protocol = serverUrl.startsWith("https") ? https : http;

            const req = protocol.get(`${serverUrl}/api/health`, (res) => {
                console.log(`[KEEP-ALIVE CRON] Server responded with status: ${res.statusCode}`);
            });

            req.on("error", (error) => {
                console.error(`[KEEP-ALIVE CRON] Error pinging server:`, error.message);
            });

            req.setTimeout(5000); // 5 second timeout
        } catch (error) {
            console.error(`[KEEP-ALIVE CRON] Unexpected error:`, error);
        }
    });

    console.log("[KEEP-ALIVE CRON] Started - will ping server every 14 minutes");
};
