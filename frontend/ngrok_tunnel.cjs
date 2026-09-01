const ngrok = require('@ngrok/ngrok');

async function main() {
  try {
    console.log("Initializing official @ngrok/ngrok SDK listener...");
    const listener = await ngrok.forward({
      addr: "127.0.0.1:8000",
      authtoken: "38yel3BLCbjfRMCkrV3NyuPDiiI_63ap1EgX97JNw4eStZXTW"
    });
    
    const url = listener.url();
    console.log("\n=================================================================");
    console.log(`NGROK TUNNEL ONLINE: ${url}`);
    console.log(`SENTINEL INGESTION ENDPOINT: ${url}/api/logs/ingest`);
    console.log(`GITHUB STATUS ENDPOINT: ${url}/api/github/status`);
    console.log("=================================================================\n");
  } catch (err) {
    console.error("ngrok error:", err);
  }
}

main();
