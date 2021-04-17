export default class SortableList {
  onPonterDownDelete = (event) => {
    if (event.target.dataset.deleteHandle !== undefined) {
      this.deleteHandler(event.target.parentNode);
    }
  }

  onPointerDown = (event) => {
    if (event.target.dataset.grabHandle !== undefined) {
      this.dragHandler(event, event.target.parentNode);
    }
  }

  constructor(data) {
    this.data = data;
    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');

    element.innerHTML = this.data.items.map(item => {
      item.classList.add('sortable-list__item');
      return item.outerHTML;
    }).join('');

    this.element = element;
  }

  dragHandler(event, item) {
    const itemHeight = item.getBoundingClientRect().height;
    const itemWidth = item.getBoundingClientRect().width;
    const draggableElement = item.cloneNode(true);
    draggableElement.classList.add('sortable-list__item_dragging');
    draggableElement.style.width = itemWidth + 'px';
    item.classList.remove('sortable-list__item');
    item.classList.add('sortable-list__placeholder');
    item.innerHTML = '';
    item.style.height = itemHeight + 'px';

    let shiftX = event.clientX - item.getBoundingClientRect().left;
    let shiftY = event.clientY - item.getBoundingClientRect().top;

    this.element.append(draggableElement);

    moveAt(event.pageX, event.pageY);
    
    function moveAt(pageX, pageY) {
      draggableElement.style.left = pageX - shiftX + 'px';
      draggableElement.style.top = pageY - shiftY + 'px';
    }

    let currentDroppable = item;
    let wasMouseMove = false;

    function onPointerMove(event) {
      wasMouseMove = true;
      moveAt(event.pageX, event.pageY);

      draggableElement.style.display = 'none';
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      draggableElement.style.display = 'flex';

      if (!elemBelow) return;

      let droppableBelow = elemBelow.closest('.sortable-list__placeholder');
      if (currentDroppable != droppableBelow) {
        if (currentDroppable) {
          const prevElem = currentDroppable.previousElementSibling;
          const nextElem = currentDroppable.nextElementSibling;

          if (prevElem) {
            const middlePrevElem = prevElem.getBoundingClientRect().top + prevElem.getBoundingClientRect().height / 2;

            if (event.clientY < middlePrevElem) {
              return prevElem.before(currentDroppable);
            }
          }

          if (nextElem) {
            const middleNextElem = nextElem.getBoundingClientRect().top + nextElem.getBoundingClientRect().height / 2;

            if (event.clientY > middleNextElem) {
              return nextElem.after(currentDroppable);
            }
          }
        }

        if (droppableBelow) {
          currentDroppable = droppableBelow;
        }
      }
    }

    document.addEventListener('pointermove', onPointerMove);


    draggableElement.onpointerup = function() {
      document.removeEventListener('pointermove', onPointerMove);
      draggableElement.onpointerup = null;
      
      currentDroppable.parentNode.replaceChild(draggableElement, currentDroppable);
      draggableElement.classList.remove('sortable-list__item_dragging');
      draggableElement.style.left = 'auto';
      draggableElement.style.top = 'auto';
    };
    
  }

  deleteHandler(item) {
    item.remove();
  }

  initEventListeners () {
    this.element.addEventListener('pointerdown', this.onPonterDownDelete);
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
