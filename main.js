'use strict'
const menu = document.querySelector('.menu');

function firstCreateMenu(base) {
    //Заполняем меню пунктами из базы данных
    createMenu(menu, base, 'vis');
    //Вешаем слушатель кликов на меню
    menu.addEventListener( 'click', openMenu );
};

//Заполняем блок элементами базы данных
function createMenu(parent, base, visible) {
    //Создаем обертку для пунктов меню
    const wrap = createDiv();
    wrap.classList.add(visible);
    wrap.classList.add('items');
    //Создаем шапку подменю
    const heder = createDiv();
    heder.classList.add('menu__title');
    heder.innerText = base.name;
    wrap.appendChild(heder);
    //Создаем шаблон пункта меню
    const templateMenuItem = createDiv();
    templateMenuItem.classList.add('menu__item');
    //Создаем пункты меню из элементов базы данных
    base.items.forEach(element => {
        let newMenuItem = templateMenuItem.cloneNode(true);
        newMenuItem.innerText = element.name;

        //Если у элемента массива есть свой подмассив элементов, то наполняем пункт меню пунктами подменю,
        //рекурсивно вызывая эту же функцию.
        if (element.items) {
            createMenu(newMenuItem, element, 'invis');

        //Если элемент содержит ссылки на контент, то записываем их как дата-аттрибут.
        } else if (element.content) {
            const div = createDiv();
            div.classList.add('invis');
            div.classList.add('content');
            div.dataset.content = element.content;
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
        //Если в пункте ссылки на контент, то создаем iframe и вставляем в правую часть навигатора.
        } else if ( child.classList.contains('content') ) {
            const content = document.createElement('iframe');
            //Ссылку для фрейма берем из дата-атрибута. embedded=true убрает служебные слова.
            content.setAttribute('src', child.dataset.content + '?embedded=true');
            content.classList.add('frame');
            content.setAttribute('frameborder', 0); //Этот аттрибут убирает некрасивую рамку вокруг iframe.
            content.setAttribute('seamless', '');
            output.appendChild(content);
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
