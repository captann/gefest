from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class AddressModel(Base):
    __tablename__ = 'addresses'

    home_id = Column(String(30), primary_key=True)

    home_name = Column(Text, nullable=False)
    home_address = Column(Text, nullable=False)
    lon = Column(Float, nullable=False)
    lat = Column(Float, nullable=False)

    # Связь: один адрес → много задач
    tasks = relationship("TaskModel", back_populates="address")


class TaskModel(Base):
    __tablename__ = 'tasks'

    task_id = Column(Integer, primary_key=True)
    date = Column(Text, nullable=False)
    home_id = Column(String(30), ForeignKey('addresses.home_id'), nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text)
    blank = Column(Boolean, default=False)
    archieved = Column(Boolean, default=False)  # 🆕 Добавлено

    # Обратная связь: задача → адрес
    address = relationship("AddressModel", back_populates="tasks")


class UserModel(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    login = Column(String(255), nullable=False, unique=True)
    password = Column(Text, nullable=False)
    role = Column(Text)

    # Связь: пользователь → много полигонов
    polygons = relationship("PolygonModel", back_populates="user")

    # Связь: пользователь участвует в совместных полигонах
    shared_polygons = relationship("SharedPolygonModel", back_populates="user")


class PolygonModel(Base):
    __tablename__ = 'polygons'

    polygon_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    polygon_name = Column(Text, nullable=False)
    color = Column(Text)
    lon_points = Column(Text, nullable=False)
    lat_points = Column(Text, nullable=False)
    deleted = Column(Integer)
    checked = Column(Integer)

    # Обратная связь: полигон → пользователь
    user = relationship("UserModel", back_populates="polygons")

    # Связь: полигон может быть расшарен
    shared_entries = relationship("SharedPolygonModel", back_populates="polygon")


class SharedPolygonModel(Base):
    __tablename__ = 'shared_polygons'

    polygon_id = Column(Integer, ForeignKey('polygons.polygon_id'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), primary_key=True)
    hash = Column(Text)
    confirm_code = Column(Integer)
    used = Column(Integer)
    number_of_using = Column(Integer)

    # Связь: shared → user
    user = relationship("UserModel", back_populates="shared_polygons")

    # Связь: shared → polygon
    polygon = relationship("PolygonModel", back_populates="shared_entries")

class SettingsModel(Base):
    __tablename__ = 'settings'

    user_id = Column(Integer, ForeignKey('users.user_id'), primary_key=True)
    auto_archive_done_tasks = Column(Boolean, default=False)

    user = relationship("UserModel", backref="settings")



