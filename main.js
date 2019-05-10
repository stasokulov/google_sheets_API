'use strict'
const menu = document.querySelector('.menu');

//При загрузке страницы
/*
window.onload = () => {
    firstCreateMenu();
};
*/

function firstCreateMenu(data) {
    //Заполняем меню пунктами из базы данных
    createMenu(menu, data, 'vis');
    //Вешаем слушатель кликов на меню
    menu.addEventListener( 'click', openMenu );
};

//Заполняем блок элементами базы данных
function createMenu(parent, data, visible) {
    //Создаем обертку для пунктов меню
    const wrap = createDiv();
    wrap.classList.add(visible);
    wrap.classList.add('items');
    //Создаем шапку подменю
    const heder = createDiv();
    heder.classList.add('menu__title');
    heder.innerText = data.name;
    wrap.appendChild(heder);
    //Создаем шаблон пункта меню
    const templateMenuItem = createDiv();
    templateMenuItem.classList.add('menu__item');
    //Создаем пункты меню из элементов базы данных
     data.items.forEach(element => {
        let newMenuItem = templateMenuItem.cloneNode(true);
        newMenuItem.innerText = element.name;
        //Если у элемента массива есть свой подмассив элементов, то наполняем пункт меню пунктами подменю, рекурсивно вызывая эту же функцию.
        if (element.items) {
            createMenu(newMenuItem, element, 'invis');
        //Если элемент содержит ссылки на контент, то записываем их в пункт меню
        } else if (element.content) {
            const div = createDiv();
            div.classList.add('invis');
            div.classList.add('content');
            div.innerText = element.content;//Отсюда будем брать id контента при клике на пункт меню
            newMenuItem.appendChild(div);
        };
        wrap.appendChild(newMenuItem);
    });
    //Добавляем пустой блок в конце. Будем выводить в него подпункты при клике на пункт меню
    const div = createDiv();
    wrap.appendChild(div);
    parent.appendChild(wrap);
};

function openMenu(event) {
    const block = event.target;
    //Если клик был по пункту меню
    if ( block.classList.contains('menu__item') ) {
        const parent = block.parentNode;
        const child = block.lastElementChild;
        const output = document.querySelector('#output');
        //Очищаем область вывода
        output.innerHTML = '';
        //Удаляем нижележащее дерево меню, отображенное ранее
        parent.lastElementChild.innerHTML = '';
        //Выделяем кликнутый пункт
        toHiglight(block);
        //Если есть подпункты в этом пункте
        if ( child.classList.contains('items') ) {
        //Клонируем их, делаем видимыми и вставляем в блок для отображения
        const subItems = child.cloneNode(true);
        subItems.classList.remove('invis');
        parent.lastElementChild.appendChild(subItems);
        //Если в пункте ссылки на контент
        } else if ( child.classList.contains('content') ) {
            //Берем id контента из кликнутого пункта меню
            const idContent = '#' + child.innerText;
            //Ищем контент в базе контента по id
            const contentElement = document.querySelector([idContent]).cloneNode(true);
            //Вставляем контент в область вывода
            output.appendChild(contentElement);
        };
    };
};

function toHiglight(block) {
    //Убираем выделение с ранее выделенных пунктов меню
    const menuItems = Array.from( block.parentElement.querySelectorAll('.menu__item') );
    menuItems.forEach(element => {
        element.classList.remove('active');
    });
    //Выделяем кликнутый пункт
    block.classList.toggle('active');
};

function createDiv() {
    const div = document.createElement('div');
    return div;
};
