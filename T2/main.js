import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        onWindowResize,
        degreesToRadians
} from "../libs/util/util.js";

import {
  createGroundPlane,
  addTrees,
  setOpacity,
  addWalls
} from "./scenary.js";

import {
  mouseRotation,
  onDocumentMouseMove
} from "./mouse.js";

import { loadOBJFile, loadDAEFile } from './objImports.js';

let scene, renderer, camera, material, light, orbit; // Inicia as Varaiveis
scene = new THREE.Scene();    // Cria o cenario
renderer = initRenderer();    // Inicia o render
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Inicia a camera
material = setDefaultMaterial(); 
let light_dir = new THREE.DirectionalLight( 0xffffff, 1 ); // Cria uma luz direcional na cor branca
scene.add(light_dir);
light = initDefaultBasicLight(scene) //Cria uma luz padrão

orbit = new OrbitControls( camera, renderer.domElement ); // Habilita o mouse
document.addEventListener('mousemove', onDocumentMouseMove);

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Menu de configurações
const settings = {
  showHelper: true,
  distanceX: 1,
  distanceY: 1,
  sensX: 1,
  sensY: 1,
};

// create the ground plane
let planes = [];
let width = 100, length = 11, height = 50;
for (let i = 0; i < 80; i++) {
  let newPlane = createGroundPlane(width, length, 10, 10, "#356927");
  addTrees(newPlane, width, length, settings.showHelper);
  addWalls(newPlane, width, length, height, "#356927");
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  planes.push(newPlane);
  scene.add(newPlane);
}

//Variavel do indice do plano inicial
let currentPlaneIndex = 0;
//Variavel de distância maxima
let maxDistance = planes.length * length; 

const gui = new GUI()
const controller = gui.addFolder('Settings');
// Criação do subtítulo
var subtitulo = document.createElement('div');
subtitulo.innerHTML = 'Pressione 1, 2, 3 no teclado para controlar a velocidade e Esc para mostrar o cursor.</br>Use o menu abaixo para controlar os parâmetros de jogabilidade.';
subtitulo.style.fontWeight = 'bold';
subtitulo.style.marginTop = '10px';
subtitulo.style.marginBottom = '10px';
subtitulo.style.marginRight = '15px';

// Adiciona o subtítulo como um controlador personalizado
controller.__ul.insertBefore(subtitulo, controller.__ul.firstChild);
// controller.add(settings,'airplaneSpeed',1,3);
let airplaneSpeed = 1;
// controller.add(settings,'showHelper',false,true);
controller.add(settings,'distanceX',1,1.5);
controller.add(settings,'distanceY',1,1.5);
controller.add(settings,'sensX',0.2,1.8);
controller.add(settings,'sensY',0.2,1.8);
controller.open();
setupKeyControls();

//Cria o Avião
let airplane = {obj: null, box: new THREE.Box3()};
let turret1 = {obj: null, box: new THREE.Box3()};
let turret2 = {obj: null, box: new THREE.Box3()};

let promise = loadOBJFile("Arwing/", "Arwing");
promise.then(obj => {
  airplane.obj = obj;
  airplane.obj.name = "airplane";
  airplane.obj.position.set(0.0, 20, 0.0);
  airplane.box = airplane.box.setFromObject( airplane.obj );
  if(settings.showHelper) {
    let helper = new THREE.Box3Helper( airplane.box, 0xffff00 );
    scene.add( helper );
  }
  scene.add(airplane.obj);
  
  //Aponta a camera para o Avião
  camera.lookAt(airplane.obj.position);

  let turretPromise1 = loadDAEFile("Turret/", "Turret");
  turretPromise1.then(obj1 => {
    turret1.obj = obj1.scene;
    turret1.obj.name = "turret1";
    turret1.obj.scale.set(0.1, 0.1, 0.1);
    turret1.obj.position.set(20.0, 0.0, -300.0);
    turret1.obj.rotation.set(0.0, -0.1, 0.0);
    turret1.box = turret1.box.setFromObject( turret1.obj );
    if(settings.showHelper) {
      let helper = new THREE.Box3Helper( turret1.box, 0xffff00 );
      scene.add( helper );
    }
    scene.add(turret1.obj);

    let turretPromise2 = loadDAEFile("Turret/", "Turret");
    turretPromise2.then(obj2 => {
      turret2.obj = obj2.scene;
      turret2.obj.name = "turret2";
      turret2.obj.scale.set(0.1, 0.1, 0.1);
      turret2.obj.position.set(-20.0, 0.0, -300.0);
      turret2.obj.rotation.set(0.0, 0.1, 0.0);
      turret2.box = turret2.box.setFromObject( turret2.obj );
      if(settings.showHelper) {
        let helper = new THREE.Box3Helper( turret2.box, 0xffff00 );
        scene.add( helper );
      }
      scene.add(turret2.obj);

      render();
    });

  });

});

function render() {
  //Função de rotação do mouse
  mouseRotation(airplane.obj,settings);
  //Função para atualização da camera
  updateCamera();
  //Atualiza posição do plano atual
  updatePlanePosition();

  for (let i = 0; i < planes.length; i++) {
    let distance = camera.position.distanceTo(planes[i].position);
    updateOpacity(planes[i], distance);
  } 

  updateZPosition(airplane.obj, airplane.obj.position.z-airplaneSpeed, airplane.box);
  updateZPosition(turret1.obj, turret1.obj.position.z-airplaneSpeed, turret1.box);
  updateZPosition(turret2.obj, turret2.obj.position.z-airplaneSpeed, turret2.box);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function updateZPosition(object, newZ, box = null) {
  object.position.z = newZ;
  if(box != null) {
    box = box.setFromObject(object);
  }
}

function updateOpacity(object, distance) {
  let opacity;
  let maxVision = 0.8;
  if (distance < maxDistance * maxVision) {
    opacity = 1;
  } else if (distance < maxDistance) {
    var percentage = (distance - maxDistance * maxVision) / (maxDistance * (1 - maxVision));
    opacity = 1 - percentage;
  }
  setOpacity(object, opacity);
}

function updateCamera() {
  camera.position.x = airplane.obj.position.x;
  camera.position.y = (airplane.obj.position.y + (5 * settings.distanceX));
  camera.position.z = (airplane.obj.position.z + (20 * settings.distanceY));
  camera.lookAt(airplane.obj.position);
}

function updatePlanePosition() {
  if(airplane.obj.position.z < planes[currentPlaneIndex].position.z - length){
    planes[currentPlaneIndex].position.z -= length * planes.length;
    currentPlaneIndex = (currentPlaneIndex + 1) % planes.length;
  }
}

function setupKeyControls() {
  document.onkeydown = function(e) {
    console.log(e);
    switch (e.key) {
      case "1":
      airplaneSpeed = 1;
      break;
      case "2":
      airplaneSpeed = 2;
      break;
      case "3":
      airplaneSpeed = 3;
      break;
    }
  };
}