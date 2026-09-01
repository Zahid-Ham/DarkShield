import time
import sys
from pyngrok import ngrok, conf

# Set authtoken provided by user
token = "38yel3BLCbjfRMCkrV3NyuPDiiI_63ap1EgX97JNw4eStZXTW"
ngrok.set_auth_token(token)

print(f"Connecting ngrok HTTP tunnel to local port 8000...")
try:
    tunnel = ngrok.connect(8000, "http")
    public_url = tunnel.public_url
    print("\n" + "="*70)
    print(f"NGROK TUNNEL ONLINE: {public_url}")
    print(f"FASTAPI INGESTION ENDPOINT: {public_url}/api/logs/ingest")
    print(f"GITHUB STATUS ENDPOINT: {public_url}/api/github/status")
    print("="*70 + "\n")
    sys.stdout.flush()

    # Keep tunnel alive
    while True:
        time.sleep(1)
except Exception as e:
    print(f"Error starting tunnel: {e}")
    sys.stdout.flush()
