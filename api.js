//Родительский объект.
const base = {
    name: 'Сферы бизнеса',
};

//Запрашиваю данные из гугл-таблицы.
fetch('https://script.google.com/macros/s/AKfycbzFTZTdYPzgd-UZ3S7933FRzzkJtasfSYUPDKvqQnDZdxk9tQMQ/exec')
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
    //Пропускаю данные из таблицы через алгоритм построения древовидного объекта.
    createDataBase(response);
    //Запускаю отрисовку меню на странице.
    firstCreateMenu(base);
});

function createDataBase(objOfArrs) {
    //Преобразую объект в массив, чтобы использовать методы массива для обработкию
    const arrOfArrs = [...objOfArrs];
    //Запускаю каждый подмассив на проверку первого элемента подмассива.
    arrOfArrs.forEach(arr => {
        check(base, arr, 0);
    });
};

function check (base, arr, i) {
    if (arr[i]) {
        //Если элемент существует, то идем дальше.
    } else {
        //А если нет, но останавливаемся.
        return;
    };

    if (base.items) {
        //Если у объекта есть свойство items, то идем дальше.
    } else {
        //Иначе - создаем его.
        addItems(base);
    };

    if (
        //Если на этом уровне базы данных уже есть объект с таким именем,
        base.items.some(element => {
            return element.name === arr[i];
        }) 
    ) {
        //то находим его и запускаем проверку внутри этого объекта.
        //Проверяем по значению следующего элемента подмассива(следующей ячейки из гугл-таблицы).
        //Таким образом рекурсивно вызывая функцию, проходим по цепочке вложенных друг в друга объектов.
        base.items.forEach(element => {
            if(element.name === arr[i]) {
                check(element, arr, i + 1);
                return;
            };
        });
    } else {
        //Если объекта с таким именем нет, то создаем его и добавляем в конец массива.
        addName(arr[i], base.items);
        //Переходим в созданный объект и запускаем в нем проверку по следующему значению из строки гугл-таблицы.
        const lastObj = base.items.length - 1;
        check(base.items[lastObj], arr, i + 1);
    };
};

function addName(name, base) {
    const obj = {};
    obj.name = name;
    base.push( obj );
};

function addItems(obj) {
    obj.items = [];
};