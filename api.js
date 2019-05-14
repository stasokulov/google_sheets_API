//В этом объекте создадим библиотеку компонентов, которые можно повторно использовать для создания базы данных.
//Берем их из Гугл таблицы.
const library = {
    name: 'Библиотека',
};
//В этом объекте будут данные конструктора.
const constructor = {
    name: 'Конструктор',
};
//Сюда создадим результат сборки финального объекта из конструктора и библиотеки.
const resultBase = {
    name: 'Сферы бизнеса',
};

//Ссылки на гугл-таблицы с данными.
const linkToGoogleSheetLibrary = 'https://script.google.com/macros/s/AKfycbzFTZTdYPzgd-UZ3S7933FRzzkJtasfSYUPDKvqQnDZdxk9tQMQ/exec';
const linkToGoogleSheetConstructor = 'https://script.google.com/macros/s/AKfycbzX6KRUeNuRd6_2BYLDdLr7N2npznJJ8pOtM3AperetKqGm8wkW/exec';

//Запрашиваю параллельно данные из гугл-таблицы.
Promise.all([
    fetch(linkToGoogleSheetLibrary),
    fetch(linkToGoogleSheetConstructor),
])
.then(results => {
    //Запускаю обработку данных первой таблицы для наполнения библиотеки.
    request(results[0], library, results);
})

function request(data, obj, results) {
    new Promise((resolve, reject) => {
        resolve(data);
    })
    .then(response => {
        if (response.status == 200) {
            return response.json() //Передаю дальше JSON с данными
        } else {
            alert('Запрос не удался. Ошибка: ' + response.status)
        }
    })
    .then(json => {
        const arrOfArrsWithHoles = [...json.result]; //Получаю массив подмассивов. Каждый подмассив - строка в таблице. Пустые значения - пустые ячейки.
        //Выбрасываю пустые значения из подмассивов, возвращаю массив подмассивов без дырок.
        const arrOfArrs = arrOfArrsWithHoles.map( arrWithHoles => {
            //Фильтрую только элементы, возвращающие true (т.е. не пустые).
            const newArr = arrWithHoles.filter(element => {
                return element;
            });
            //Тепрь это подмассив без дырок.
            return newArr;
        });
        //Массив подмассивов без дырок.
        return arrOfArrs;
    })
    .then(response => {
        //Пропускаю данные из таблицы через алгоритм построения древовидного объекта. Наполняю объект данными.
        createDataBase(response, obj);
    })
    .then( () => {
        //Если обработалась библиотека, запускаю обработку конструктора.
        if (obj.name === 'Библиотека') {
            request(results[1], constructor);
        //Если нет, значит обработался и конструктор. Теперь и библиотека и конструктор готовы.
        //Запускаю построение меню.
        } else {
            //firstCreateMenu(library);
            createResultBase()
        };                
    })
};

function createResultBase() {
    //Копируем в итоговую базу данные конструктора, потом проходимся по пунктам, при совпадении имени пункта 
    //в итоговой базе и библиотеке - наполняем итоговую базу содержимым пункта библиотеки.
    resultBase.items = constructor.items;
    //Перебираем сферы бизнеса.
    resultBase.items.forEach(element => {
        //Перебираем продукты.
        element.items.forEach(costrElement => {
            //Перебираем библиотеку и сравниваем имена элементов с именем продукта итоговой базы.
            library.items.forEach(libElement => {
                if (libElement.name === costrElement.name) {
                    //При совпадении - записываем массив нижележащих объектов из библиотеки в итоговую базу.
                    costrElement.items = libElement.items;
                }
            })
        });
    });
    console.log(resultBase);
    //Запуск построения меню в разметке страницы.
    firstCreateMenu(resultBase);
};

function createDataBase(objOfArrs, obj) {
    //Преобразую объект в массив, чтобы использовать методы массива для обработки.
    const arrOfArrs = [...objOfArrs];
    //Запускаю каждый подмассив на проверку первого элемента подмассива.
    arrOfArrs.forEach(arr => {
        check(obj, arr, 0);
    });
};

function check (library, arr, i) {
    if (arr[i]) {
        //Если элемент существует, то идем дальше.
    } else {
        //А если нет, но останавливаемся.
        return;
    };

    if(arr[i] === 'content') {
        library.content = arr[i+1];
        return;
    };

    if (library.items) {
        //Если у объекта есть свойство items, то идем дальше.
    } else {
        //Иначе - создаем его.
        addItems(library);
    };

    if (
        //Если на этом уровне базы данных уже есть объект с таким именем,
        library.items.some(element => {
            return element.name === arr[i];
        }) 
    ) {
        //то находим его и запускаем проверку внутри этого объекта.
        //Проверяем по значению следующего элемента подмассива(следующей ячейки из гугл-таблицы).
        //Таким образом рекурсивно вызывая функцию, проходим по цепочке вложенных друг в друга объектов.
        library.items.forEach(element => {
            if(element.name === arr[i]) {
                check(element, arr, i + 1);
                return;
            };
        });
    } else {
        //Если объекта с таким именем нет, то создаем его и добавляем в конец массива.
        addName(arr[i], library.items);
        //Переходим в созданный объект и запускаем в нем проверку по следующему значению из строки гугл-таблицы.
        const lastObj = library.items.length - 1;
        check(library.items[lastObj], arr, i + 1);
    };
};

function addName(name, library) {
    const obj = {};
    obj.name = name;
    library.push( obj );
};

function addItems(obj) {
    obj.items = [];
};

