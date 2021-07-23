const canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d');

let rects = [],
    mouseMoveData = {};

window.onload = function() {
    if (localStorage.getItem('rects')) {
        rects = JSON.parse(localStorage.getItem('rects'));
        addFigureToCanvas();
    }
}

function saveCanvasToLS() {
    localStorage.setItem('rects', JSON.stringify(rects));
}

document.addEventListener('mousemove', event => {
    const target = event.target;

    if (target.className !== 'canvas' && mouseMoveData.type === 'canvas') {
        removeFigureToCanvas();
        changePositionFigure(event);
    }
    switch (mouseMoveData.type) {
        case 'windowFigure':
            mouseMoveData.figure.style.top = `${event.pageY - mouseMoveData.y}px`;
            mouseMoveData.figure.style.left = `${event.pageX - mouseMoveData.x}px`;
            break;

        case 'canvas':
            rects.forEach(item => {
                if (item === mouseMoveData.figure) {
                    item.x = borderCanvas(event).x;
                    item.y = borderCanvas(event).y;
                    addFigureToCanvas();
                }
            });
            break;
    }
});

document.addEventListener('mousedown', event => {
    const target = event.target;

    switch (target.className) {
        case 'task__figures_circle':
        case 'task__figures_square':
            mouseMoveData.class = target.className;
            mouseMoveData.y = event.pageY - target.getBoundingClientRect().y;
            mouseMoveData.x = event.pageX - target.getBoundingClientRect().x;
            changePositionFigure(event);
            break;

        case 'canvas':
            clickFigureToCanvas(event);
            break;
    }

    target.ondragstart = function() {
        return false;
    };
});

document.addEventListener('mouseup', event => {
    const target = event.target;

    target.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    target.hidden = false;

    if (!elemBelow) return;

    let droppableBelow = elemBelow.closest('.canvas');

    if(droppableBelow) saveCoordsToCanvas(event);

    if (mouseMoveData.type === 'windowFigure') mouseMoveData.figure.remove();
    mouseMoveData.type = '';
    saveCanvasToLS();

});

document.addEventListener('keydown', function(event) {
    if (event.code === 'Delete') {
        removeFigureToCanvas();
    }
});

function changePositionFigure(e) {
    const figure = document.getElementsByClassName(mouseMoveData.class);

    if (figure.length !== 2) {
        figure[0].insertAdjacentHTML('afterend', `<div class="${mouseMoveData.class}"></div>`);
    }

    figure[0].style.top = `${e.pageY - mouseMoveData.y}px`;
    figure[0].style.left = `${e.pageX - mouseMoveData.x}px`;
    figure[0].style.position = 'absolute';

    mouseMoveData.type = 'windowFigure';
    mouseMoveData.figure = figure[0];
}

function saveCoordsToCanvas(event) {
    switch (mouseMoveData.class) {
        case 'task__figures_square':
            rects.push({'name': 'square', 'x' : borderCanvas(event).x, 'y' : borderCanvas(event).y});
            addFigureToCanvas();
            break;

        case 'task__figures_circle':
            rects.push({'name': 'circle', 'x' : borderCanvas(event).x, 'y' : borderCanvas(event).y});
            addFigureToCanvas();
            break;
    }
}

function borderCanvas(event) {
    let X = event.pageX - (canvas.getBoundingClientRect().x + mouseMoveData.x),
        Y = event.pageY - (canvas.getBoundingClientRect().y + mouseMoveData.y);

    if (canvas.getBoundingClientRect().top > event.pageY - mouseMoveData.y) Y = 0;
    if (canvas.getBoundingClientRect().bottom < event.pageY - mouseMoveData.y + 50) Y = canvas.height - 50;
    if (canvas.getBoundingClientRect().left > event.pageX - mouseMoveData.x) X = 0;
    if (canvas.getBoundingClientRect().right < event.pageX - mouseMoveData.x + 50) X = canvas.width - 50;
    return {'x':X, 'y':Y};
}

function addFigureToCanvas() {
    ctx.clearRect(0,0, canvas.width, canvas.height);

    rects.forEach(item => {
        switch (item.name) {
            case 'square':
                ctx.fillStyle = 'green';
                ctx.strokeStyle = 'black';
                ctx.fillRect(item.x, item.y, 50, 50);
                ctx.strokeRect(item.x,item.y,50,50);
                break;

            case 'circle':
                ctx.beginPath ();
                ctx.arc(item.x + 25, item.y + 25, 25, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'blue';
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.stroke();
                break;
        }
    });
}

function clickFigureToCanvas(event) {
    let X = event.pageX - canvas.getBoundingClientRect().x,
        Y = event.pageY - canvas.getBoundingClientRect().y;

    const figureActive = [...rects].reverse().find(item => {
        return X > item.x && X < item.x + 50 && Y > item.y && Y < item.y + 50;
    });

    rects.forEach((item, index) => {
        if (item === figureActive) {
            mouseMoveData.x = X - item.x;
            mouseMoveData.y = Y - item.y;
            mouseMoveData.figure = item;
            mouseMoveData.type = 'canvas';

            rects.splice(index, 1);
            rects.push(figureActive);
            addFigureToCanvas()

            ctx.strokeStyle = 'red';
            switch (item.name) {
                case 'circle':
                    mouseMoveData.class = 'task__figures_circle';
                    ctx.beginPath ();
                    ctx.arc(figureActive.x + 25, figureActive.y + 25, 26, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    break;

                case 'square':
                    mouseMoveData.class = 'task__figures_square';
                    ctx.strokeRect(figureActive.x-1, figureActive.y-1, 52, 52);
                    break;
            }
        }
    });
}

function removeFigureToCanvas() {
    rects = rects.filter(item => {
        return item !== mouseMoveData.figure;
    });
    addFigureToCanvas();
}