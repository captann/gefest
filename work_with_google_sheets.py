import gspread
from oauth2client.service_account import ServiceAccountCredentials
import string

def column_letter_to_index(col_letter: str) -> int:
    """Преобразует буквы (например, A, B, AA) в индекс (0-based)"""
    col_letter = col_letter.upper()
    result = 0
    for c in col_letter:
        if c in string.ascii_uppercase:
            result = result * 26 + (ord(c) - ord('A') + 1)
        else:
            raise ValueError(f"Недопустимый символ в названии столбца: {c}")
    return result - 1  # Приводим к 0-based

def read_google_sheet_data(**kwargs) -> dict:
    """
    Считывает выбранные столбцы из Google Sheets.
    Аргументы через kwargs:
        - sheet_url: ссылка на таблицу
        - sheet_name: имя листа
        - creds_path: путь к JSON (по умолчанию 'credentials.json')
        - start_row: с какой строки читать (по умолчанию 2)
        - task_id, date, raw_location, problem, solution, blank: буквенные имена столбцов (например, "A", "C", "E")
    """

    # Настройки по умолчанию
    creds_path = kwargs.get("creds_path", "credentials.json")
    sheet_url = kwargs.get("sheet_url")
    sheet_name = kwargs.get("sheet_name")
    start_row = kwargs.get("start_row", 2)

    # Проверка обязательных параметров
    if not sheet_url or not sheet_name:
        return {"success": False, "message": "Отсутствует sheet_url или sheet_name"}

    # Обработка словаря столбцов
    columns_to_read = {
        "task_id": kwargs.get("task_id"),
        "blank": kwargs.get("blank")
    }

    if not all(columns_to_read.values()):
        return {
            "success": False,
            "message": "Некорректно указаны столбцы: все поля (task_id, date и т.д.) должны быть заданы"
        }
    # Конвертация букв в индексы
    try:
        col_indices = {
            key: column_letter_to_index(val)
            for key, val in columns_to_read.items()
        }
    except Exception as e:
        return {"success": False, "message": f"Ошибка при обработке буквенных названий столбцов: {e}"}

    # Авторизация
    try:
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive"
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
        client = gspread.authorize(creds)
    except Exception as e:
        return {"success": False, "message": f"Ошибка авторизации: {e}"}

    # Открытие листа
    try:
        sheet = client.open_by_url(sheet_url).worksheet(sheet_name)
    except gspread.exceptions.WorksheetNotFound as e:
        return {"success": False, "message": f"Лист '{sheet_name}' не найден: {e}"}
    except Exception as e:
        return {"success": False, "message": f"Ошибка открытия таблицы: {e}"}

    # Получение всех данных
    try:
        all_data = sheet.get_all_values()
    except Exception as e:
        return {"success": False, "message": f"Ошибка получения данных с листа: {e}"}

    if len(all_data) < start_row:
        return {"success": False, "message": "Недостаточно строк на листе"}

    # Сбор нужных данных
    selected_data = []
    try:
        for row in all_data[start_row - 1:]:  # -1 т.к. индексация с 0
            if all(cell == "" for cell in row):
                break
            row_data = {
                key: row[col_indices[key]] if col_indices[key] < len(row) else ""
                for key in col_indices
            }
            selected_data.append(row_data)
    except Exception as e:
        return {"success": False, "message": f"Ошибка обработки данных: {e}"}

    return {"success": True, "data": selected_data}

def write_google_sheet_data(**kwargs) -> dict:
    """
    Обновляет значение в указанной колонке (например, 'blank') по заданному task_id в Google Таблице.
    Аргументы:
        - sheet_url: ссылка на таблицу
        - sheet_name: имя листа +
        - creds_path: путь к JSON (по умолчанию 'credentials.json') +
        - task_id: ID задачи для поиска
        - task_id_column: буквенное имя столбца ID задачи (например, "A")
        - target_column: буквенное имя столбца, который надо обновить (например, "H")
        - new_value: новое значение для записи (например, "Да")
    """

    # 1. Проверка аргументов
    sheet_url = kwargs.get("sheet_url")
    sheet_name = kwargs.get("sheet_name")
    creds_path = kwargs.get("creds_path", "credentials.json")
    task_id = str(kwargs.get("task_id")).strip()
    task_id_col = kwargs.get("task_id_column")
    target_col = kwargs.get("target_column")
    new_value = kwargs.get("new_value")

    if not all([sheet_url, sheet_name, task_id, task_id_col, target_col, new_value]):
        return {"success": False, "message": "Некоторые обязательные поля отсутствуют"}

    try:
        col_task_idx = column_letter_to_index(task_id_col)
        col_target_idx = column_letter_to_index(target_col)
    except Exception as e:
        return {"success": False, "message": f"Ошибка обработки названий столбцов: {e}"}

    # 2. Авторизация
    try:
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive"
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
        client = gspread.authorize(creds)
    except Exception as e:
        return {"success": False, "message": f"Ошибка авторизации: {e}"}

    # 3. Открытие таблицы
    try:
        sheet = client.open_by_url(sheet_url).worksheet(sheet_name)
        all_data = sheet.get_all_values()
    except Exception as e:
        return {"success": False, "message": f"Ошибка открытия таблицы: {e}"}

    # 4. Поиск строки и обновление
    try:
        for i, row in enumerate(all_data):
            if not row or col_task_idx >= len(row):
                continue
            if str(row[col_task_idx]).strip() == task_id:
                row_index = i + 1  # строки с 1

                # Обновляем значение в целевой колонке
                sheet.update_cell(row_index, col_target_idx + 1, new_value)

                # Автоопределение диапазона для подсветки (по заполненным ячейкам)
                filled_columns = len([cell for cell in row if cell.strip() != ""])
                range_str = f"A{row_index}:{chr(64 + filled_columns + 1)}{row_index}"

                # Применяем зелёный фон
                sheet.format(range_str, {
                    "backgroundColor": {
                        "red": 0.85,
                        "green": 1,
                        "blue": 0.85
                    }
                })

                return {"success": True, "message": f"Обновлено и выделено в строке {row_index}"}
    except Exception as e:
        return {"success": False, "message": f"Ошибка обновления строки: {e}"}

    return {"success": False, "message": "ID не найден в таблице"}

