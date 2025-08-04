import os
REG = True
creds_path = os.getenv("GOOGLE_CREDS_FILENAME")
YANDEX_MAPS_API_KEY = os.getenv("YANDEX_MAPS_API_KEY")
with open(creds_path, "w", encoding="utf-8") as f:
    f.write(os.getenv("GOOGLE_CREDS_JSON"))
remote = False