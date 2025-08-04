from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # импорт моделей (Address, Task и т.д.)

# Пример подключения к SQLite
DATABASE_URL = "sqlite:///address_new.db"

# Или PostgreSQL (замени значениями)
# DATABASE_URL = "postgresql://user:password@host:port/dbname"

engine = create_engine(DATABASE_URL, echo=True)
Session = sessionmaker(bind=engine)

# Создаёт таблицы при необходимости (например, при работе с новой БД)
Base.metadata.create_all(engine)
