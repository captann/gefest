import os
import base64
REG = True
creds_path = os.getenv("GOOGLE_CREDS_FILENAME", "gefest-key.json")
YANDEX_MAPS_API_KEY = os.getenv("YANDEX_MAP_API_KEY", "cfa23d17-aa11-4937-a5b5-c2f721d08e51")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "agZtwYVo4y9KfdtJ348bhyoWkKM7Npu0At8v70-CYBg")
"""with open(creds_path, "w", encoding="utf-8") as f:
    f.write(base64.b64decode(os.getenv("GOOGLE_CREDS_JSON")).decode("utf-8"))"""
remote = False
DB_FILE = "new.db"