# Проверка API «Домочатцы»

API: https://api.smirnov-web.ru · Swagger: https://api.smirnov-web.ru/docs

- `openapi.yaml`: OpenAPI 3.1.
- `DATA-API.yaml`: 79 проверок, все 48 операций. Формат команды описан в `DATA-API.schema.json`.
- `test-data.json`, `fixtures/`: тестовые данные.

Положите полученный отдельно `accounts.private.json` в эту папку. Аккаунты: `resident` (автор заявок), `neighbor` (сосед), `dispatcher` (диспетчер). 

Запуск из папки `submission`:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python run_checks.py --validate-only
.venv/bin/python run_checks.py --accounts accounts.private.json --report report.json
```



`--validate-only` проверяет файлы без запросов к API. Полный запуск сохраняет результат в `report.json` и останавливается при первой ошибке. Отчёт прогона на проде: `verification.production.json`.

Прогон создаёт три заявки и одного исполнителя в тестовом доме и УК. Они сохраняются; временное правило назначения удаляется. Токены можно использовать повторно.

Для 46 операций проверяется успешный ответ. Проверяем, что нельзя войти через MAX с неверными данными. Успешные запросы в этих двух сценариях не проверяем. Проверяется создание и обработка заявки на перерасчёт. Отправка в реальную систему начислений УК пока не подключена.

Для ручных запросов нужны cookie `max_session` и, при записи, `Origin: https://app.smirnov-web.ru`. Runner подставляет их сам. 

Можно использовать простой curl:
```
curl -X 'GET' \
  'https://api.smirnov-web.ru/api/auth/session' \
  -H 'accept: application/json' \
  -H 'Cookie: max_session=qwerty'

```
