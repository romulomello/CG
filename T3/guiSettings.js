let frameCount = 0;
let fpsContainer;
let startTime;

export function createController(gui, document, settings){
    const controller = gui.addFolder('Settings');
    // Criação do subtítulo
    var subtitulo = document.createElement('div');
    subtitulo.innerHTML = 'Pressione 1, 2, 3 no teclado para controlar a velocidade\
     e Esc para mostrar o cursor. Pressione S para ativar/desativar os efeitos sonoros. Use o menu abaixo para controlar os parâmetros de jogabilidade.';
    subtitulo.style.fontWeight = 'bold';
    subtitulo.style.marginTop = '20px';
    subtitulo.style.marginBottom = '10px';
    subtitulo.style.marginRight = '15px';

    // Adiciona o subtítulo como um controlador personalizado
    controller.__ul.insertBefore(subtitulo, controller.__ul.firstChild);

    controller.add(settings,'distanceY',1,1.5);
    controller.open();
}

export function startFPSCounter() {
    fpsContainer = document.getElementById('fps-counter');
    startTime = performance.now();
    requestAnimationFrame(updateFPSCounter);
}

function updateFPSCounter() {
    frameCount++;
    const currentTime = performance.now();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    const fps = Math.round(frameCount / elapsedSeconds);

    fpsContainer.innerHTML = `FPS: ${fps}`;

    requestAnimationFrame(updateFPSCounter);
}