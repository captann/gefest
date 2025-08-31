from color_settings import *
import string

import hashlib
import openpyxl
from flask import Flask, request, jsonify, render_template, json, redirect, url_for, abort, send_file
import os
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from role_settings import *
import secrets
from models import *
from flask import send_from_directory
from flask import Flask, request, jsonify, render_template, json, redirect, url_for, session, make_response
from functools import wraps
import datetime
from tasks import Session as DBsession, Polygon, User, unsuccessful, successful
from jinja2 import Template
from sqlalchemy.sql.functions import current_user, func

from app_config import *
from tasks import main, Task, make_ppr
from werkzeug.utils import secure_filename
import uuid
#from db_migration_first import syncronyce_db
import threading
import time

def sync_databases():
    # Здесь твоя логика синхронизации локальной и удалённой БД
    print("Синхронизация началась...")
    try:
        #syncronyce_db()
        print("Синхронизация завершена.")

    except Exception as e:
        print("Синхронизация не удалась. Ошибка: " + str(e.ars))

def sync_loop():
    while True:
        thread = threading.Thread(target=sync_databases)
        thread.start()
        thread.join()  # Можно убрать, если не нужно ждать завершения
        time.sleep(3600)

def start_background_sync():
    bg_thread = threading.Thread(target=sync_loop, daemon=True)
    bg_thread.start()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' in session:
            return f(*args, **kwargs)
        elif request.cookies.get('remember_token'):
            try:
                user_id = int(request.cookies.get('remember_token'))
                session['user_id'] = user_id
                return f(*args, **kwargs)
            except:
                return redirect(url_for('login', next=request.url))
        else:
            return redirect(url_for('login', next=request.url))
    return decorated_function


def update_polygon_state(polygon_id, checked):
    if polygon_id is None or checked is None:
        return {'status': 'error', 'message': 'Некорректные данные'}

    result = {'status': 'error', 'message': 'Неизвестная ошибка'}
    with DBsession() as dbsession:
        try:
            polygon = dbsession.query(PolygonModel).filter_by(polygon_id=polygon_id).first()

            if not polygon:
                result = {'status': 'error', 'message': 'Полигон не найден'}
            else:
                polygon.checked = 1 if checked else 0
                dbsession.commit()
                result = {'status': 'success'}

        except Exception as e:
            dbsession.rollback()
            result = {'status': 'error', 'message': str(e)}
    return result





app = Flask(__name__)
app.secret_key = APP_SECRET_KEY
UPLOAD_FOLDER = 'uploads'  # папка, куда сохраняем Excel
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Автоматическая перезагрузка шаблонов



import random

def generate_random_color():
    letters = '0123456789ABCDEF'
    color = '#'
    for _ in range(6):
        color += random.choice(letters)
    return color


def get_home_status(home_id):
    statuses = {(0, 0): "NPNS",
                (0, 1): "NPS",
                (1, 0): "PNS",
                (1, 1): "PS"}
    all_completed = False
    lon = lat = None
    colors = None
    status = None
    with DBsession() as dbsession:
        try:
            # Всего задач по дому

            total_tasks = dbsession.query(func.count(TaskModel.task_id)).filter_by(home_id=home_id).scalar() or 0

            # Сколько задач выполнено (blank=1)
            completed_tasks = dbsession.query(func.count(TaskModel.task_id)).filter_by(home_id=home_id, blank=1).scalar() or 0
            all_completed = (total_tasks == completed_tasks)


            # Получаем координаты
            address = dbsession.query(AddressModel).filter_by(home_id=home_id).first()

            if address:
                lon = address.lon
                lat = address.lat
                status = statuses[(address.print, address.sign)]
                colors = complited_colors[status][all_completed]


        except Exception as e:
            print(f"Ошибка в get_home_status: {str(e)}")
    if status == 'SNP':
        print(home_id)
    return {"all_completed": all_completed,
            "lon": lon,
            "lat": lat,
            "colors": colors,
            "status": status}






def uncompleted_tasks(polygon, home_ids):
    return [0, 0]
    """total = 0
    n = 0
    
    seen = set()

    with DBsession() as dbsession:
        for home_id in home_ids:
            if home_id in seen:
                continue  # пропускаем повторяющиеся дома

            address = dbsession.query(AddressModel).filter_by(home_id=home_id).first()
            if not address:
                continue

            lon, lat = address.lon, address.lat
            inside = is_point_in_area((lon, lat), [polygon.polygon_id])

            if inside:
                tasks = dbsession.query(TaskModel).filter_by(home_id=home_id, blank=0,archieved=0).all()
                task_count = len(tasks)

                if task_count > 0:
                    total += task_count
                    n += 1
                    seen.add(home_id)

    return [total, n]"""


def generate_random_string(length):
    """Генерирует случайную строку заданной длины."""
    letters = string.ascii_letters + string.digits  # буквы (a-z, A-Z) и цифры (0-9)
    return ''.join(random.choice(letters) for _ in range(length))

def hash_string(input_string):
    """Хеширует строку с помощью SHA-256 и возвращает её в hex-формате."""
    sha256_hash = hashlib.sha256(input_string.encode()).hexdigest()
    return sha256_hash

def generate_and_hash_random_string():
    """Генерирует случайную строку (8-12 символов) и возвращает её хеш."""
    length = random.randint(8, 12)  # случайная длина от 8 до 12
    random_str = generate_random_string(length)
    hashed_str = hash_string(random_str)
    return hashed_str


def save_share_code(user_id, polygon_id, confirm_code, number_of_using=1):
    hash = generate_and_hash_random_string()

    with DBsession() as dbsession:
        for _ in range(10):
            existing = dbsession.query(SharedPolygonModel).filter_by(hash=hash).first()
            if existing:
                hash = generate_and_hash_random_string()
            else:
                break

        new_entry = SharedPolygonModel(
            polygon_id=polygon_id,
            user_id=user_id,
            hash=hash,
            confirm_code=confirm_code,
            number_of_using=number_of_using,
            used=0
        )
        dbsession.add(new_entry)
        dbsession.commit()

    return hash



def is_hash_exists(hash):
    result = False
    with DBsession() as dbsession:
        existing = dbsession.query(SharedPolygonModel).filter_by(hash=hash).first()
        result = bool(existing)
    return result

def is_hash_valid(hash):
    valid = False
    with DBsession() as dbsession:
        record = dbsession.query(SharedPolygonModel).filter_by(hash=hash).first()

        if record is None:
            valid = False  # хэш не найден
        elif record.number_of_using is None:
            valid = True  # неограниченное использование
        else:
            valid = record.used < record.number_of_using

    return valid

@app.route('/share/user_id=<int:user_id>&area_id=<int:area_id>')
@login_required
def share_area(user_id, area_id):
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    # Генерируем код
    code = f"{random.randint(0, 9999):04d}"


    # Сохраняем где-то (в БД, временно в dict, зависит от тебя)
    hash = save_share_code(user_id, area_id, code)  # твоя функция
    link = f"/add_area/{hash}"
    return render_template('share.html', code=code, link=link,user={"user_id": user_id, "login": User.get_by_id(user_id).login})


def validate_share_code(hash, user_id, *code):
    if not code:
        # Проверка, не делится ли пользователь сам с собой
        with DBsession() as dbsession:
            res2 = dbsession.query(SharedPolygonModel).filter_by(hash=hash, user_id=user_id).first()

        if res2:
            return {"success": False, "message": "Нельзя поделиться областью самим с собой"}
        return {"success": True, "message": "Ok"}

    # Если передан код подтверждения и имя новой области
    code_value, name = code[0], code[1]

    with DBsession() as dbsession:
        res = dbsession.query(SharedPolygonModel).filter_by(hash=hash, confirm_code=code_value).first()
        res2 = dbsession.query(SharedPolygonModel).filter_by(hash=hash, confirm_code=code_value,
                                                             user_id=user_id).first()

    if not res:
        return {"success": False, "message": "Неверный код"}
    if res2:
        return {"success": False, "message": "Нельзя поделиться областью самим с собой"}

    # Обновление количества разрешённых использований
    with DBsession() as dbsession:
        try:
            record = dbsession.query(SharedPolygonModel).filter_by(hash=hash).first()

            if record:
                dbsession.query(SharedPolygonModel).filter(
                    SharedPolygonModel.hash == hash,
                ).update(
                    {SharedPolygonModel.number_of_using: (record.number_of_using or 0) + 1},
                    synchronize_session=False,
                )
                dbsession.commit()
        except Exception as e:
            dbsession.rollback()
            return {"success": False, "message": f"Ошибка обновления счётчика: {str(e)}"}

    # Создание копии полигона с новым цветом
    pol_id = res.polygon_id
    polygon = Polygon.get_by_id(pol_id)
    color = polygon.color

    while Polygon.check_color(color, user_id):
        color = generate_random_color()

    new_pol = Polygon(user_id, name, polygon.points, color, 0)
    return {"success": True, "message": "Область добавлена"}


@app.route('/add_area/<hash>', methods=['GET', 'POST'])
@login_required
def add_area(hash):
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    user_id = current_user.user_id
    if request.method == 'POST':
        data = request.get_json()
        code = data.get('code')

        hash = data.get('link').removeprefix('/add_area/')
        name = data.get('name')
        if Polygon.check_name(name, current_user.user_id):
            return jsonify({"success": False, "message": "Такое имя уже есть. Пожалуйста, введите другое"})


        res = validate_share_code(hash, user_id, code, name)
        return jsonify(res)

    else:
        if not is_hash_exists(hash):
            return render_template('err_hash.html', message="Такой области нет")
        if not is_hash_valid(hash):
            return render_template('err_hash.html', message='Эта ссылка больше не работает')
        res = validate_share_code(hash, user_id)

        if not res['success']:
            return render_template('err_hash.html', message=res['message'])
        with DBsession() as dbsession:
            record = dbsession.query(SharedPolygonModel).filter_by(hash=hash).first()
            polygon_id = record.polygon_id if record else None
        name = Polygon.get_by_id(polygon_id).polygon_name
        name_exist = Polygon.check_name(name, current_user.user_id)
        return render_template('add_area.html', name_exist=name_exist, name=name)

@app.route('/tasks')
@app.route('/ppr')
@app.route('/')
@login_required
def index():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')

    if True:
        task_types = {"/": 0,
                      "/tasks": 1,
                      "/ppr": 2}

        task_type = task_types[request.path]
        tasks = Task.get_tasks(archieved=True, task_type=task_type)
        from tasks import is_point_in_area
        tasks_f = []
        pol = current_user.get_checked_polygons_ids()
        tasks_f = [task.__dict__() for task in tasks if
                   is_point_in_area(task.lon_lan, pol)]
        statuses = {str(task['task_id']): bool(task['blank']) for task in tasks_f}
        home_ids = [(task['home_id'],) for task in tasks_f]  # имитируем fetchall()
        houses_colors = {}
        poligons = current_user.get_polygons()
        polygonsData = {}
        for polygon in poligons:
            polygonsData[polygon.polygon_id] = {
                "points": [list(i) for i in polygon.points],
                "color": polygon.color,
                "name": polygon.polygon_name,
                "checked": polygon.checked,
                "uncompleted": uncompleted_tasks(polygon, [row[0] for row in home_ids])
            }
        for i in home_ids:
            i = i[0]
            competed = get_home_status(i)
            #color = ok_color if get_home_status(i)['all_completed'] else 'red'
            houses_colors[i] = competed['colors']
        role = current_user.role
        house_points = []
        for home_id in houses_colors:
            with DBsession() as dbsession:
                result = dbsession.query(AddressModel).filter_by(home_id=home_id).first()

            if result:
                house_points.append([
                    result.home_id,
                    result.home_name,
                    result.home_address,
                    result.lon,
                    result.lat
                ])

        home_dict = {}
        test_mode = {}
        with DBsession() as dbsession:
            settings = dbsession.query(SettingsModel).filter_by(user_id=current_user.user_id).first()

            for info in tasks_f:
                home_id = info['home_id']

                if home_id not in home_dict:
                    st = get_home_status(home_id)
                    addr = dbsession.query(AddressModel).filter_by(home_id=home_id).first()
                    if addr:
                        home_dict[home_id] = {
                            "home_id": addr.home_id,
                            "home_name": addr.home_name,
                            "home_address": addr.home_address,
                            "lon": addr.lon,
                            "lat": addr.lat,
                            "stuff_id": addr.stuff_id,
                            "status": st['status']
                        }




                if home_id not in test_mode:
                    test_mode[home_id] = [info]
                else:
                    test_mode[home_id].append(info)
            addrs = dbsession.query(AddressModel).all()
            for addr  in addrs:
                home_id = addr.home_id
                if addr.print or addr.sign:
                    if home_id not in home_dict:
                        st = get_home_status(home_id)
                        home_dict[home_id] = {
                            "home_id": addr.home_id,
                            "home_name": addr.home_name,
                            "home_address": addr.home_address,
                            "lon": addr.lon,
                            "lat": addr.lat,
                            "stuff_id": addr.stuff_id,
                            "status": st['status']
                        }
                        if home_id not in houses_colors:
                            houses_colors[home_id] = st['colors']
        return render_template(
            "main.html",
            initial_statuses=statuses,
            houses_colors=houses_colors,
            role_icons=role_icons,
            polygonsData=polygonsData,
            role=role,
            points=house_points,
            login=current_user.login,
            user={"user_id": current_user.user_id, "login": current_user.login, "role": current_user.role},
            homes=home_dict,
            tasks=test_mode,
            task_type=task_type,
            user_role_weight=role_weights.get(current_user.role, 0),
            role_name=role_names.get(current_user.role, ''),
            settings=settings
        )
    else:
        pass

    """except Exception as e:
        return f"Ошибка загрузки: {str(e)}", 500"""


from urllib.parse import urlparse, urljoin

def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    next_page = request.args.get('next')  # Сохраняем, даже если GET

    if request.method == 'POST':
        login = request.form['login']
        password = request.form['password']
        remember = request.form.get('remember')

        with DBsession() as dbsession:
            user = dbsession.query(UserModel).filter_by(login=login).first()
            user_data = (user.user_id, user.password, user.role) if user else None

        if user_data and check_password_hash(user_data[1], password):
            user_data = {'user_id': user_data[0], 'login': login, 'role': user_data[2]}
            if role_weights.get(user_data['role']) < 0:
                error = "Ваша учетная запись заблокирована"
                return render_template('login.html', error=error, reg=REG)
            session['user_id'] = user_data['user_id']
            redirect_url = next_page if next_page and is_safe_url(next_page) else url_for('index')
            resp = make_response(redirect(redirect_url))
            if remember:
                expires = datetime.datetime.now() + datetime.timedelta(weeks=1)
                resp.set_cookie('remember_token', str(user_data['user_id']), expires=expires)
            return resp
        else:
            error = "Неверный логин или пароль"

    return render_template('login.html', error=error, reg=REG)


@app.route('/logout')
def logout():
    session.clear()
    resp = make_response(redirect(url_for('login')))
    resp.set_cookie('remember_token', '', expires=0)
    return resp


@app.route('/update_task_status', methods=['POST'])
@login_required
def update_task_status():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    try:
        data = request.json
        task_id = int(data['task_id'])
        status = bool(data['status'])

        with DBsession() as dbsession:
            # Проверяем существование задачи
            task = dbsession.query(TaskModel).filter_by(task_id=task_id).first() #.filter_by(archieved=0)
            if not task:
                return jsonify({"status": "error", "message": "Task not found"}), 404

            # Обновляем статус
            task.blank = status
            should_archieved = dbsession.query(SettingsModel).filter_by(user_id=1).first()
            if should_archieved.auto_archive_done_tasks:
                task.archieved = status
            dbsession.commit()

            # Получаем home_id и пересчитываем статус
            home_id = task.home_id
            n = get_home_status(home_id)
            color = n['colors']
        return jsonify({"status": "success", "task_id": task_id, "blank": int(status), "color": color, "home_id": home_id})

    except Exception as e:
        raise e
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/update_map', methods=['POST'])
def update_map():
    data = request.json
    for point in data:
        update_polygon_state(int(point), data[point])
    return jsonify({"status": "success"})

@app.route('/save_area', methods=['POST'])
@login_required
def save_area():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    data = request.json
    name = data["name"]
    if Polygon.check_name(name, session['user_id']):
        return jsonify(success=False, message="Такое имя уже есть. Пожалуйста, введите другое")
    color = data["color"]
    while Polygon.check_color(color, session['user_id']):
        color = generate_random_color()
    points = [(i['lng'], i['lat']) for i in data['coordinates']]
    new_pol = Polygon(session['user_id'], name, points, color, 0)

    # Python (Flask) пример:
    new_pol2 = {
        "polygon_id": new_pol.polygon_id,  # Теперь polygon_id — поле, а не ключ
        "points": new_pol.points,
        "color": new_pol.color,
        "polygon_name": new_pol.polygon_name,
        "checked": new_pol.checked
    }
    return jsonify(success=True, new_pol=new_pol2)

@app.route('/delete_area', methods=['POST'])
def delete_area():
    data = request.json
    polygon_id = data['polygon_id']
    Polygon.delete(polygon_id)
    return jsonify(success=True)

@app.route('/reg', methods=['GET', 'POST'])

def register():
    if not REG:
        resp = make_response(redirect(url_for('index')))
        return resp

    error = None
    if request.method == 'POST':
        login = request.form['login'].strip()
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if not login or not password:
            error = "Пожалуйста, заполните все поля"
        elif password != confirm_password:
            error = "Пароли не совпадают"
        elif len(login) > 6:
            error = "Максимальная длина логина - 6 символов"
        else:
            with DBsession() as dbsession:
                existing_user = dbsession.query(UserModel).filter_by(login=login).first()

                if existing_user:
                    error = "Пользователь с таким логином уже существует"
                else:
                    new_user = UserModel(login=login, password=generate_password_hash(password), role='guest')
                    dbsession.add(new_user)
                    dbsession.commit()
                    dbsession.refresh(new_user)

                    session['user_id'] = new_user.user_id
                    session['user_role'] = new_user.role
                    with DBsession() as dbsession:
                        settings = dbsession.query(SettingsModel).filter_by(user_id=new_user.user_id).first()

                        if not settings:
                            settings = SettingsModel(user_id=new_user.user_id, auto_archive_done_tasks=0,
                                                     show_all_important_markers=0)
                            dbsession.add(settings)
                            dbsession.commit()

                    resp = make_response(redirect(url_for('index')))
            if not error:
                return resp

    return render_template('register.html', error=error)







@app.route("/generate_report", methods=["POST"])
@login_required
def generate_report():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    login = User.get_by_id(session['user_id']).login
    req = request.get_json()
    report_data = req['reportData']
    polygons_data = req['polygonsData']
    tp = {"/": "задач",
          "/tasks": "заявок",
          "/ppr": "ППР"}
    polygons_data = [polygons_data[i]["name"] for i in polygons_data if polygons_data[i]['checked']]
    polygons = "\n".join(polygons_data) if polygons_data else ""

    current_time = datetime.datetime.now().strftime("%d.%m.%Y %H:%M")
    keys = sorted(report_data.keys(), key=lambda k: len(report_data[k]), reverse=True)

    with open("templates/report_template.html", "r", encoding="utf-8") as f:
        template = Template(f.read())

    rendered_html = template.render(
        report_data=report_data,
        date=current_time,
        keys=keys,
        login=login,
        polygons=polygons,
        type=tp[req['report_type']]
    )

    return rendered_html

@app.route('/control_panel')
@login_required
def control_panel():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    current_user_role = current_user.role
    tasks = Task.get_tasks()
    user_role_weight = role_weights.get(current_user.role, 0)
    if user_role_weight < 0:
        return redirect('/')

    with DBsession() as dbsession:
        users = dbsession.query(UserModel).all()
        settings = dbsession.query(SettingsModel).filter_by(user_id=current_user.user_id).first()
        addresses = dbsession.query(AddressModel).all()
        data = []
        for a in addresses:
            data.append({
                'home_id': a.home_id,
                'home_name': a.home_name,
                'home_address': a.home_address,
                'lat': a.lat,
                'lon': a.lon,
                'stuff_id': a.stuff_id,
                "print": a.print,
                "sign": a.sign
            })
    tasks_done = [i.__dict__() for i in filter(lambda x: x.blank, tasks)]
    tasks_not = [i.__dict__() for i in filter(lambda x: not x.blank, tasks)]
    main_state = all([i['archieved'] for i in tasks_done])
    users_d = {
        user.user_id: {"login": user.login, "role": user.role}
        for user in users
    }
    user_role_weight = role_weights.get(current_user.role, 0)

    return render_template(
        'admin.html',
        tasks_done=tasks_done,
        tasks_not=tasks_not,
        users=users_d,
        main_state=main_state,
        current_user_role=current_user_role,
        addresses=data,
        role_weights=role_weights,
        user_role_weight=user_role_weight,
        settings=settings,  # 👈 вот это ключевое!
        role_names=role_names,
        role_icons=role_icons,
        home_button = {"icon": "🏠",
                       "title": "На главную"}
    )

@app.route('/update_role', methods=['POST'])
@login_required
def update_role():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="Пустой запрос")

        # Должен быть ровно один ключ: user_id -> new_role
        if len(data) != 1:
            return jsonify(success=False, message="Некорректный формат")

        user_id_str, new_role = next(iter(data.items()))

        try:
            user_id = int(user_id_str)
        except ValueError:
            return jsonify(success=False, message="Некорректный ID")
        for i in role_names:
            if role_names[i] == new_role:
                new_role = i
                break
        with DBsession() as dbsession:
            user = dbsession.query(UserModel).filter_by(user_id=user_id).first()
            if user:

                user.role = new_role
                dbsession.commit()
        if not user:
            return jsonify(success=False, message="Пользователь не найден")
        return jsonify(success=True)

    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/submit_address', methods=['POST'])
def submit_address():
    data = request.get_json()
    home_id = data.get("home_id")
    home_name = data.get("home_name")
    address = data.get("address")
    lonlat = data.get("lonlat")
    print2 = (data.get("print", False))
    sign = (data.get("sign", False))
    if not home_id:
        return jsonify(unsuccessful("нет ID здания"))
    if not home_name:
        return jsonify(unsuccessful("нет названия здания"))
    if not address:
        return jsonify(unsuccessful("нет адреса здания"))
    if not lonlat:
        return jsonify(unsuccessful("не указаны координаты здания"))

    try:
        lat, lon = [float(i) for i in lonlat.split(',')]
    except Exception:
        return jsonify(unsuccessful("указаны некорректные координаты"))

    with DBsession() as db:
        home = db.query(AddressModel).filter_by(home_id=home_id).first()
        if home:
            # Обновляем существующий
            home.home_name = home_name
            home.home_address = address
            home.lat = lat
            home.lon = lon
            home.print = print2
            home.sign = sign
            message = "Объект обновлён"

        else:
            # Создаём новый
            new_home = AddressModel(
                home_id=home_id,
                home_name=home_name,
                home_address=address,
                lat=lat,
                lon=lon,
                print=print2,
                sign=sign
            )
            db.add(new_home)
            message = "Объект создан"

        db.commit()

    return jsonify(successful(message))

@app.route('/show_all_important_markers', methods=['POST'])
@login_required
def show_all_important_markers():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 2:
        return redirect('/logout')
    data = request.get_json()

    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if 'state' not in data:
        return jsonify(success=False, message="Не передано состояние чекбокса")

    new_state = bool(data['state'])

    with DBsession() as dbsession:
        settings = dbsession.query(SettingsModel).filter_by(user_id=current_user.user_id).first()

        if not settings:
            settings = SettingsModel(user_id=current_user.user_id, auto_archive_done_tasks=0, show_all_important_markers=new_state)
            dbsession.add(settings)
        else:
            settings.show_all_important_markers = new_state
        dbsession.commit()
    return jsonify(status='success')
@app.route('/from_file', methods=['POST'])
def download_excel():
    global last_uploaded_sheet_name
    if 'file' not in request.files or 'sheet' not in request.form:
        return jsonify(success=False, message="Файл или название листа не переданы")

    file = request.files['file']
    sheet_name = request.form['sheet']

    if file.filename == '':
        return jsonify(success=False, message="Имя файла пустое")

    if not file.filename.endswith('.xlsx'):
        return jsonify(success=False, message="Разрешены только .xlsx файлы")

    filename = file.filename
    ext = os.path.splitext(filename)[1] or '.xlsx'
    safe_name = f"{uuid.uuid4().hex}{ext}"

    save_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)
    file.save(save_path)

    last_uploaded_sheet_name = sheet_name

    result = main(from_exel=True,
                           file=save_path,
                           sheet=sheet_name,
                           task_id='A',
                           date='D',
                           raw_location='E',
                           problem="G",
                           solution="H",
                           blank='N'

        )
    os.remove(save_path)
    return jsonify(result)

@app.route('/from_link', methods=['POST'])
def from_link():
    if 'link' not in request.form or 'sheet' not in request.form:
        return jsonify(success=False, message="ссылка или название листа не переданы")

    sheet_name = request.form['sheet']
    link = request.form['link']

    if link == '':
        return jsonify(success=False, message="пустая ссылка")
    if request.form.get('type') == 'ppr':
        result = make_ppr(from_link=link,
                          sheet=sheet_name,
                          ppr_ID1=request.form.get('ppr_ID1', 'E'),
                          ppr_ID2=request.form.get('ppr_ID2', 'F'),
                          ppr_short_name=request.form.get('ppr_short_name', 'C'),
                          ppr_address=request.form.get('ppr_address', 'D')
        )
    else:
        result = main(from_link=link,
                               sheet=sheet_name,
                               task_id=request.form.get('col_task_id', 'A'),
                               date=request.form.get('col_date', 'C'),
                               raw_location=request.form.get('col_address', 'D'),
                               problem=request.form.get('col_problem', 'E'),
                               solution=request.form.get('col_solution', 'F'),
                               blank=request.form.get('col_signed', 'H'),
                                checked_value=request.form.get('signed_value', 'Да')

            )
    return jsonify(result)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'compass.png', mimetype='image/vnd.microsoft.icon')





@app.route('/toggle_auto_archive', methods=['POST'])
@login_required
def toggle_auto_archive():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 2:
        return redirect('/logout')
    data = request.get_json()

    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')


    if 'state' not in data:
        return jsonify(success=False, message="Не передано состояние чекбокса")

    new_state = bool(data['state'])

    with DBsession() as dbsession:
        settings = dbsession.query(SettingsModel).filter_by(user_id=current_user.user_id).first()

        if not settings:
            settings = SettingsModel(user_id=current_user.user_id, auto_archive_done_tasks=new_state,show_all_important_markers=0)
            dbsession.add(settings)
        else:
            settings.auto_archive_done_tasks = new_state
        dbsession.commit()
    return jsonify(success=True)

@app.route('/complete_all_holding', methods=['POST'])
@login_required
def complete_all_holding():
    data = request.json
    home_ids = [int(i) for i in data['home_ids']]
    status = 1
    not_available = []
    with DBsession() as dbsession:
        should_archieved = dbsession.query(SettingsModel).filter_by(user_id=1).first()
        for home_id in home_ids:
            tasks = dbsession.query(TaskModel).filter_by(home_id=home_id, is_ppr=0, archieved=0).all()
            for task in tasks:
                task.blank = status
                if should_archieved.auto_archive_done_tasks:
                    task.archieved = 1
                dbsession.commit()
    return jsonify({"status": "success",
                    "not_available": not_available}
                   )


@app.route('/set_task_archived', methods=['POST'])
@login_required
def set_task_archived():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    data = request.get_json()
    task_id = data.get("task_id")
    archieved = data.get("archieved")

    if task_id is None or archieved is None:
        return jsonify(success=False, message="Некорректные данные")

    try:
        with DBsession() as db:
            task = db.query(TaskModel).filter_by(task_id=task_id).first()
            if not task:
                return jsonify(success=False, message="Задача не найдена")

            task.archieved = bool(archieved)
            db.commit()
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/bulk_update_archived', methods=['POST'])
@login_required
def bulk_update_archived():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    data = request.get_json()
    task_ids = data.get("task_ids")
    archieved = data.get("archieved")

    if not isinstance(task_ids, list) or archieved is None:
        return jsonify(success=False, message="Неверные данные")

    try:
        with DBsession() as db:
            db.query(TaskModel).filter(TaskModel.task_id.in_(task_ids)).update(
                {TaskModel.archieved: bool(archieved)},
                synchronize_session=False
            )
            db.commit()
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, message=str(e))



def read_db_data():
    with DBsession() as dbsession:
        tasks = dbsession.query(TaskModel.task_id, TaskModel.blank).all()
    return {int(task_id): bool(blank) for task_id, blank in tasks}

def write_db_data(task_id: int):
    with DBsession() as dbsession:
        task = dbsession.query(TaskModel).filter_by(task_id=task_id).first()
        if task:
            task.blank = True
            dbsession.commit()
    if task:
        return {"success": True, "message": f"Статус задачи {task_id} обновлён"}
    else:
        return {"success": False, "message": f"Задача {task_id} не найдена"}

@app.route('/synchronice', methods=['POST'])
@login_required
def synchronice():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    sheet = request.form.get('sheet')
    link = request.form.get('link')

    # Достаем столбцы
    col_task_id = request.form.get('sync_col_task_id')
    col_signed = request.form.get('sync_col_signed')
    signed_value = request.form.get('sync_signed_value')

    from work_with_google_sheets import read_google_sheet_data, write_google_sheet_data

    tables = read_google_sheet_data(sheet_url=link,
                                    sheet_name=sheet,
                                    task_id=col_task_id,
                                    blank=col_signed,
                                    creds_path=creds_path)
    if not tables['success']:
        return jsonify(success=False, message=tables['message'])
    google_data = {}
    for i in tables['data']:
        google_data[int(i['task_id'])] = i['blank'] == signed_value

    db_data = read_db_data()

    updated_into_db = 0
    updated_into_sheet = 0
    for task_id in google_data:
        from_db = db_data.get(task_id)
        from_google = google_data.get(task_id)
        if from_db is None or from_google is None:
            continue  # такого ID нет в БД — пропускаем
        if from_db and not from_google:
            # Обновить таблицу
            result = write_google_sheet_data(
                sheet_url=link,
                sheet_name=sheet,
                creds_path=creds_path,
                task_id=task_id,
                task_id_column=col_task_id,
                target_column=col_signed,
                new_value=signed_value
            )
            if result.get("success"):
                updated_into_sheet += 1
            else:
                return jsonify(success=False, message=result['message'])

        elif not from_db and from_google:
            # Обновить БД
            result = write_db_data(task_id)
            if result.get("success"):
                updated_into_db += 1
            else:
                return jsonify(success=False, message=result['message'])

    return jsonify(
        success=True,
        updated_into_db= updated_into_db,
        updated_into_sheet=updated_into_sheet,
        message=f"Обновлено в БД: {updated_into_db}, в таблице: {updated_into_sheet}"
    )
@app.route("/update_existing_tasks", methods=["POST"])
def update_existing_tasks():
    data = request.get_json()
    tasks = data.get("tasks", [])
    try:
        with DBsession() as dbsession:
            for item in tasks:
                task = dbsession.query(TaskModel).filter_by(task_id=item["task_id"]).first()
                if task:
                    task.blank = item["blank"]
                    task.archieved = item["archieved"]
            dbsession.commit()
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500

@app.route('/download_db')
@login_required
def download_db():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    uid = session.get('user_id', 0)
    if uid == 0:

        return redirect('/')
    if role_weights[User.get_by_id(uid).role] <= 2:
        return redirect('/')
    db_path = os.path.abspath(DB_FILE)  # получаем абсолютный путь

    if not os.path.isfile(db_path):
        abort(404, description="База данных не найдена.")

    # Отправляем файл напрямую
    return send_file(db_path, as_attachment=True)


@app.route('/about')
def about():
    return render_template('about_2.html',
                           home_button={"icon": "🚀",
                                        "title": "Вперёд!"},

                           role_names=role_names,
                           role_icons=role_icons,
                           role_weights=role_weights
                           )
@app.route('/profile')
@login_required
def profile():
    current_user = User.get_by_id(session['user_id'])
    if current_user is None:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    return "Скоро здесь будет информация о профиле"

@app.route('/feed')
def feed():
    return 'Здесь будет лента с полезными адресами'

@app.route('/update_activation_number', methods=["POST"])
def update_activation_number():
    data = request.get_json(force=True)  # принудительно парсим JSON

    hash = data.get("linkSuffix", "").removeprefix('/add_area/')
    user_id = data.get("user_id", False)
    activation_number = data.get("activationNumber", False)


    if not hash or not activation_number  or not user_id:
        return jsonify({"error": "Недостаточно данных"}), 400

    # защита от некорректных значений
    try:
        activation_number = min(int(activation_number), 1000)
    except ValueError:
        return jsonify({"error": "activationNumber должно быть числом"}), 400

    if activation_number < 0:
        return jsonify({"error": "activationNumber не может быть отрицательным"}), 400
    try:
        with DBsession() as dbsession:
            shared_list = (
                dbsession.query(SharedPolygonModel)
                .filter(SharedPolygonModel.hash == hash)
                .all()
            )


            if len(shared_list) == 0:
                return jsonify({"error": "Запись не найдена"}), 404

            if len(shared_list) > 1:
                return jsonify({"error": f"Найдено несколько записей ({len(shared_list)}) для hash={hash}"}), 500

            shared = shared_list[0]

            if shared.user_id != int(user_id):
                return jsonify({"error": "Доступ запрещен"}), 403
            dbsession.query(SharedPolygonModel).filter(
                SharedPolygonModel.hash == hash,
            ).update(
                {SharedPolygonModel.number_of_using: activation_number},
                synchronize_session=False,
            )
            dbsession.commit()

        return jsonify(
                {
                    "success": True
                }
            )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/delete_address', methods=['POST'])
def delete_address():
    """
    Удаляет запись адреса и все связанные с ней задачи из базы данных.
    """
    current_user = User.get_by_id(session.get('user_id'))
    if current_user is None:
        return redirect('/logout')

    # Проверка прав доступа пользователя на основе его роли
    if role_weights.get(current_user.role, -100) < 0:
        return redirect('/logout')
    if role_weights.get(current_user.role, -100) < 2:
        return redirect('/')

    data = request.get_json()
    stuff_id = data.get('stuff_id')

    if not stuff_id:
        return jsonify({'success': False, 'message': 'stuff_id не был предоставлен'}), 400

    try:
        # Использование конструкции 'with' для управления сессией базы данных
        with DBsession() as dbsession:
            # Находим запись адреса по stuff_id
            address_to_delete = dbsession.query(AddressModel).filter_by(stuff_id=stuff_id).first()

            if address_to_delete:
                # Получаем home_id из найденного адреса
                home_id = address_to_delete.home_id

                # Удаляем все задачи, связанные с этим home_id
                # Мы предполагаем, что у модели TasksModel есть поле home_id
                tasks_to_delete = dbsession.query(TaskModel).filter_by(home_id=home_id).all()
                for task in tasks_to_delete:
                    dbsession.delete(task)

                # Затем удаляем сам адрес
                dbsession.delete(address_to_delete)

                # Фиксируем изменения в базе данных
                dbsession.commit()
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'message': 'Адрес не найден'}), 404
    except Exception as e:
        # Обработка любых ошибок, которые могут возникнуть во время выполнения запроса
        print(f"Ошибка при удалении адреса или задач: {e}")
        dbsession.rollback()  # Откат сессии в случае ошибки
        return jsonify({'success': False, 'message': 'Произошла ошибка сервера'}), 500


if __name__ == '__main__':
    import os
    app.run(host='0.0.0.0', port=8080)