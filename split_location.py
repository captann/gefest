from pymorphy3 import MorphAnalyzer

morph = MorphAnalyzer()

address_keywords = {
    "улица", "ул", "ул.",
    "проспект", "пр-т", "пр.", "просп.",
    "переулок", "пер", "пер.",
    "набережная", "наб", "наб.",
    "шоссе", "ш.",
    "бульвар", "бул", "бул.", "б-р",
    "проезд", "пр-д",
    "тракт",
    "аллея",
    "микрорайон", "мкр", "мкр.", "мкрн", "мкрн.",
    "площадь", "пл", "пл.",
    "квартал", "кв-л",
    "территория", "тер", "тер.",
    "тупик",
    "парк",
    "город", "г", "г.",
    "посёлок", "пос", "пос.",
    "село", "деревня", "д.",
    "станция", "ст", "ст.",
    "линия",
    "просека",
    "кольцо",
    "остановка",
    "разъезд",
    "переезд",
    "платформа",
    "переулки",
    "съезд",
    "промзона",
    "дачный посёлок",
    "ж/д", "жд",
    "жилой комплекс", "жк", "ж.к.",
    "авеню"
}


def find_key_index(s):
    try:
        r = s.split()
        ind = r[0]
        raw_words = r[1:]
        commas = set()
        words = []
        for index, word in enumerate(raw_words):
            if ',' in word:
                commas.add(index)
                words.append(word.rstrip(','))
            else:
                words.append(word)
        key_index = -1
        for i, word in enumerate(words):
            if word in address_keywords:
                key_index = i
                break
        return {
            "words": words,
            "key_index": key_index,
            "index": ind,
            "success": True,
            "commas": commas
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


def parse(s):
    result = find_key_index(s)
    if not result.get("success", False):
        return {"success": False, "message": result.get("message", "ошибка разбора")}

    key_index = result.get("key_index")
    if key_index is None or key_index < 0:
        return {"success": False, "message": "ключевое слово не найдено"}

    result_index = result.get("index")
    words = result.get("words")
    commas = result.get("commas", set())

    current_index = key_index - 1
    while current_index >= 0:
        word = words[current_index]
        parses = morph.parse(word)
        nomn_adjective = next((p for p in parses if p.tag.POS == 'ADJF' and p.tag.case == 'nomn'), None)
        if nomn_adjective:
            current_index -= 1
        else:
            break

    home_name = ""
    home_address = ""

    for i, word in enumerate(words):
        if i <= current_index:
            home_name += word + (", " if i in commas else " ")
        else:
            home_address += word + (", " if i in commas else " ")
    if result_index:
        try:
            result_index = int(result_index)
        except Exception:
            result_index = 0

    return {
        "success": True,
        "home_id": result_index,
        "home_name": home_name.strip(),
        "home_address": home_address.strip()
    }


if __name__ == '__main__':
    print(parse("1 zocv город"))
