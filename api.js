//В этот объект загрузим данные из гугл-таблиц.
const source = [
    {
        name: 'Библиотека',
        link: 'https://script.google.com/macros/s/AKfycbxk9i7cIGY9zk6tR2XFx1B6vhhs-z8Iz2xk6_SPYf2XfvcQXOg/exec',
        items: [],
    }, {
        name: 'Конструктор',
        link: 'https://script.google.com/macros/s/AKfycbxY5YtI66UEuLczFYDJ5gRbbZf6WjRycvqAHxtb-qEnZuM8WCzO/exec',
        items: [],
    },
];

(function requestAPI () {
    //Запрашиваем данные из гугл-таблиц для каждого элемента source.
    source.forEach(obj => {
        fetch(obj.link)
        .then(response => {
            if (response.status == 200) {
                return response.json() //Передаю дальше JSON с данными
            } else {
                alert('Гугл-таблица не доступна. Ошибка: ' + response.status)
            }
        })
        .then(json => {
            //Получаю массив (на самом деле - объект) подмассивов .
            //Каждый подмассив - строка в таблице. Пустые значения - пустые ячейки.
            //Преобразую объект в массив.
            const arrOfArrsWithHoles = Array.from(json.result);
            //Выбрасываю пустые значения из подмассивов, возвращаю массив подмассивов без дырок.
            const arrOfArrsNoHoles = arrOfArrsWithHoles.map( arrWithHoles => {
                //Возвращаю только элементы, возвращающие true (т.е. не пустые).
                const newArrNoHoles = arrWithHoles.filter(element => {
                    return element;
                });
                //Тепрь это подмассив без дырок.
                return newArrNoHoles;
            });
            //Массив подмассивов без дырок.
            return arrOfArrsNoHoles;
        })
        .then(response => {
            //Запускаю построение древовидного объекта из данных массива.
            createDataBase(response, obj);
        })
        /*
        .catch((err) => alert(
            'Не удалось запросить или обработать данные. Сделайте скриншот и обратитесь к администратору. ' + err
        ));
        */
    });
})();

function createDataBase(arrOfArrs, obj) {
    //Запускаю каждый подмассив на создание ветви в древовидном объекте. Начинаю с первого элемента подмассива.
    arrOfArrs.forEach(arr => {
        createBranch(obj, arr, 0);
    });
    //Запускаю создание итоговой базы данных, с которой будет отрисовываться меню.
    createResultBase();
};

function createBranch (obj, arr, i) {
    if ( !arr[i] ) {
        //Если элемент не существует, то останавливаемся.
        return;
    };

    if( arr[i] === 'content' ) {
        //Если натыкаемся на ячейку со значением 'content', то записываем в объект следующее за этим значение.
        //Там лежит ссылка на API Google Docs. Останавливаемся.
        obj.content = arr[i+1];
        return;
    };

    if ( !obj.items ) {
        //Если у объекта нет свойства items, то создаем его.
        addItems(obj);
    };

    if (
        //Если на этом уровне базы данных в массиве items уже есть объект с таким именем,
        obj.items.some(element => {
            return element.name === arr[i];
        })
    ) {
        //то находим его и запускаем проверку внутри этого объекта.
        //Проверяем следующий элемента подмассива(следующей ячейки из гугл-таблицы).
        //Таким образом рекурсивно вызывая функцию, проходим по цепочке вложенных друг в друга объектов,
        //создавая новые ветви, ветви ветвей и т.д.
        obj.items.forEach(element => {
            if(element.name === arr[i]) {
                createBranch(element, arr, i + 1);
                return;
            };
        });
    } else {
        //Если объекта с таким именем нет, то создаем его и добавляем в конец массива.
        addName(arr[i], obj.items);
        //Переходим в созданный объект и запускаем в нем проверку по следующему значению из строки гугл-таблицы.
        const lastObj = obj.items.length - 1;
        createBranch(obj.items[lastObj], arr, i + 1);
    };
};

function addName(name, arr) {
    const obj = {};
    obj.name = name;
    arr.push( obj );
};

function addItems(obj) {
    obj.items = [];
};

function createResultBase() {
    //Эта функция вызывается каждый раз после создания одной из баз, но должна сработать только после
    //создания всех баз. Поэтому проверяем, что все массивы items объектов в source не пустые
    //(т.е. готовы к дальнейшей обработке). Если это не так, то останавливаемся.
    if( !source.every(element => element.items.length) ) {
        return;
    };

    //В этом объекте данные библиотеки.
    const library = source[0];
    //В этом объекте данные конструктора.
    const constructor = source[1];
    //Сюда создадим результат сборки финального объекта из конструктора и библиотеки.
    const resultBase = {
        name: 'Сферы бизнеса',
        items: [],
    };
    //Переносим в итоговую базу данные конструктора.
    resultBase.items = constructor.items;
    //Потом проходимся по пунктам. При совпадении имени пункта в итоговой базе и библиотеке - наполняем
    //итоговую базу содержимым пункта библиотеки.
    //Перебираем сферы бизнеса.
    resultBase.items.forEach(sphereOfBussines => {
        //Проверка на заполненность второго столбца в конструкторе. Если он пуст, то подставляем массив-заглушку.
        if( !sphereOfBussines.items ) {
            sphereOfBussines.items = [{name: 'Нет данных'}];
        };
        //Перебираем продукты.
        sphereOfBussines.items.forEach(businessTo => {
            businessTo.items.forEach(productInConstructor => {
                /*
                if(
                    !library.items.some( productInLibrary => {
                        return (productInLibrary.name === productInConstructor.name)
                    })
                ) {
                    productInConstructor.items =  library.items.filter( (productInLibrary) => 
                        productInLibrary.name === 'Нет данных'
                    );
                };
                */

                //Перебираем библиотеку и сравниваем имена элементов с именем продукта итоговой базы.
                library.items.forEach(productInLibrary => {
                    if (productInLibrary.name === productInConstructor.name) {
                        //При совпадении - записываем массив нижележащих объектов из библиотеки в итоговую базу.
                        productInConstructor.items = productInLibrary.items;
                        //productInConstructor = productInLibrary;
                    }
                });
            });
        });
    });

    //Прячем прелоадер.
    const preloaderMain = document.querySelector('.preloader__wrap_main');
    preloaderMain.classList.add('invis');
    //Запуск построения меню в разметке страницы.
    createMenu(resultBase);
};