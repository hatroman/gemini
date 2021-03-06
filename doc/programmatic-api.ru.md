# Программный интерфейс Gemini (в разработке)

С помощью модуля `gemini/api` вы можете программно использовать Gemini в скриптах или плагинах инструментов сборки.

Для начала создайте объект Gemini со следующей конфигурацией:

```javascript
var Gemini = require('gemini/api');

var gemini = new Gemini({
    projectRoot: '/path/to/project',
    gridUrl: 'http://example.com/grid'
    ...
});
```

* `new Gemini(filePath)` загружает конфигурацию из YAML-файла по заданному пути;
* `new Gemini(filePath, overrides)` загружает конфигурацию из YAML-файла и переопределяет её свойства, используя значения, указанные в `overrides`;
* `new Gemini(options)` создаёт конфигурационный файл согласно заданным параметрам ([подробнее о конфигурации](doc/config.ru.md)). Поле `projectRoot` обязательно должно быть заполнено.

## Доступ к параметрам конфигурации

Получить значения параметров можно с помощью свойства `gemini.config`:

```javascript
var Gemini = require('gemini/api'),
    gemini = new Gemini('/path/to/config');

console.log(gemini.config.rootUrl);
```

## Чтение тестовых файлов

Функция `gemini.readTests(paths)` позволяет прочитать все тесты, расположенные по указанным путям, в составе одного мета-набора. Здесь `paths` – массив файлов и папок, содержащих Gemini-тесты.
По умолчанию поиск тестов проводится в папке `$projectRoot/gemini`.
Функция возвращает объект [`promise`](https://github.com/promises-aplus/promises-spec), разрешаемый в единый корневой набор, родительский для всех наборов верхнего уровня.

Пример функции вывода названий всех наборов, расположенных на верхнем уровне:

```javascript
var Gemini = require('gemini/api'),
    gemini = new Gemini('/path/to/config');

gemini.readTests()
    .done(function(root) {
        root.chidlren.forEach(function(suite) {
            console.log(suite.name);
        });
    });
```
### Набор (Suite-объект)

Наборы обладают следующими свойствами:

* `id` – уникальный идентификатор набора. Генерируется автоматически про загрузке набора.
* `name` – название набора.
* `children` – массив дочерних наборов.
* `states` – массив `State`-объектов, определенных в наборе.

### Состояние (State-объект)

State-объекты обладают следующими свойствами:

* `name` – имя состояния;

Методы объекта:

* `shouldSkip(browser)` – возвращает `true`, если подразумевается, что состояние будет пропущено браузером.
Браузер указывается в формате WebDriver:
```javascript
state.shouldSkip({browserName: 'firefox', version: '25.0'});
```

## Сбор эталонных изображений

Для [сбора эталонных изображений](doc/config.ru.md#ref-shots) используется метод `gemini.gather(paths, options)`, где `paths` – это массив путей к файлам и папкам, откуда запускаются тестовые наборы.

Параметры:
* `reporters` – массив инструментов создания отчёта. Каждый элемент массива может быть представлен или строкой (используется встроенный инструментарий создания отчетов), или reporter-функцией (для создания нестандартных отчетов).
* `grep` – регулярное выражение для фильтрации запускаемых тестовых наборов. По умолчанию, запускаются все тесты. Если данный параметр передан, запускаются только наборы с названиями, соответствующими заданному паттерну.

В результате возвращает `promise`, соответствующий объекту со следующими ключами:

* `total` – полное число выполненных тестов;
* `skipped` – число пропущенных тестов;
* `errored` – число тестов, выполненных с ошибками.

В случае критической ошибки `promise` отклоняется.

##  Выполнение тестов

Для [запуска тестов](doc/config.ru.md#tests-exe) используется метод `gemini.test(paths, options)`, где `paths` – это массив путей к файлам и папкам, откуда запускаются тестовые наборы.

Параметры:
* `reporters` – массив инструментов создания отчёта. Каждый элемент массива может быть представлен или строкой (используется встроенный инструментарий создания отчетов), или reporter-функцией (для создания нестандартных отчетов).
* `tempDir` – директория для хранения временных изображений (текущего состояния). По умолчанию создаётся новая временная папка.
* `grep` – регулярное выражение для фильтрации запускаемых тестовых наборов. По умолчанию, запускаются все тесты. Если данный параметр передан, запускаются только наборы с названиями, соответствующими заданному паттерну.

В результате возвращает `promise`, соответствующий объекту со следующими ключами:

* `total` – полное число выполненных тестов;
* `skipped` – число пропущенных тестов;
* `errored` – число тестов, выполненных с ошибками;
* `passed` – число успешно пройденных тестов;
* `failed` – число проваленных тестов.

В случае критической ошибки `promise` отклоняется.

## Утилиты

* `gemini.getScreenshotPath(suite, stateName, browserId)` – возвращает путь к эталонному изображению указанного состояния, для указанного браузера.
* `gemini.buildDiff(referencePath, currentPath, diffPath)` – создаёт  diff-изображение между файлами, указанными в `referencePath` и
`currentPath`, и сохраняет результат по пути `diffPath`.
* `gemini.getBrowserCapabilites(browserId)` – возвращает свойства WebDriver для указанного `browserId`.
* `gemini.browserIds` – возвращает список идентификаторов всех браузеров, используемых для тестов.

