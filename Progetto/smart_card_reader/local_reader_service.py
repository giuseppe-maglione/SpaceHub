import time
import requests
import os
from crypto_utils_reader import *
from dotenv import load_dotenv
from SmartCardReader import SmartCardReader
import urllib3

# --- ENV CONFIG ---
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '..', '.env')
loaded = load_dotenv(dotenv_path=dotenv_path)
if not loaded:
    print(f"[WARNING] could not load .env from path: {os.path.abspath(dotenv_path)}")
else:
    print(f"[INFO] .env uploaded successfully from path: {os.path.abspath(dotenv_path)}")

BACKEND_URL = os.getenv("BACKEND_URL", "https://localhost:3000/api/check-access")
READER_UID = os.getenv("READER_UID", "READER001")
READER_PRIVATE_KEY_PATH = os.getenv("READER_PRIVATE_KEY", "/keys/reader_private.pem")
SERVER_PUBLIC_KEY_PATH = os.getenv("SERVER_PUBLIC_KEY", "/keys/server_public.pem")

# --- SMART CARD READER CONFIG ---
KEY_A = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]
KEY_SLOT = 0
DATA_BLOCK = 4 # block with card uid

# --- MAIN LOGIC ---

def main_loop():
    print(f"--- READER SERVICE STARTED ({READER_UID}) ---")
    print(f"target backend: {BACKEND_URL}")
    print("-----------------------------------------------")
    
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)       # disable "not secure request" warning
    reader_private_key = load_reader_private_key(READER_PRIVATE_KEY_PATH)
    server_public_key = load_server_public_key(SERVER_PUBLIC_KEY_PATH)
    last_card_uid = None
    
    while True:
        try:            # for keyboard interrupt
            try:            # for smart card reader exceptions
                with SmartCardReader(key_a=KEY_A, key_slot=KEY_SLOT) as reader:
                    
                    # 1. read card id
                    raw_data = reader.read_block(DATA_BLOCK)
                    
                    if raw_data:

                        card_id_str = raw_data.rstrip(b'\x00').decode(errors='ignore')      # decode card id (remove padding)
                        
                        # debounce logic
                        if card_id_str == last_card_uid:
                            time.sleep(1)
                            continue 
                        
                        print(f"\n[DETECTED] card id: {card_id_str}")
                        
                        # 2. prepare payload
                        payload = {"card_uid": card_id_str, "reader_uid": READER_UID}
                        
                        # 3. sign payload
                        signature = sign_payload(reader_private_key, payload)
                        
                        # add signed payload to request body
                        full_body = {"card_uid": card_id_str, "reader_uid": READER_UID, "signature": signature}
                        
                        # 4. send request
                        print("[NETWORK] sending POST request to the backend API...")
                        try:
                            res = requests.post(BACKEND_URL, json=full_body, timeout=2, verify=False)   # verify=False to ignore SSL certificate verification
                                                                                                        # because the certificate is self-signed
                            if res.status_code in [200, 401, 403]:
                                response_data = res.json()
                                
                                # 5. verify server signed data
                                if verify_server_response(server_public_key, response_data):
                                    if response_data.get('access') is True:
                                        print(f"[ACCESS GRANTED] {response_data.get('message')}")
                                        reader.signal_success()
                                    else:
                                        print(f"[ACCESS DENIED] {response_data.get('message')}")
                                        reader.signal_error()
                                else:
                                    print("[SECURITY FAIL] server signature invalid!")
                                    reader.signal_error()
                            else:
                                print(f"[HTTP ERROR] {res.status_code}")
                                reader.signal_error()
                                
                        except requests.exceptions.ConnectionError:
                            print("[ERROR] unable to contact backend server!")
                            reader.signal_error(reader.connection)
                            
                        # 6. update last card id
                        last_card_uid = card_id_str
                        
                    else:               # reading failed
                        last_card_uid = None

            except Exception as e:      # handles the case where no card has been scanned yet
                last_card_uid = None
                time.sleep(1)  

        except KeyboardInterrupt:
            print("")
            print("-----------------------------------------------")
            print("--- READER SERVICE ENDED ({READER_UID}) ---")
            break

if __name__ == "__main__":
    main_loop()