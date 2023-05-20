import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        SecondaryBox,
        setDefaultMaterial,
        onWindowResize,
        degreesToRadians
} from "../libs/util/util.js";

import {initDefaultBasicLight,} from "./light.js";

import {
  createGroundPlane,
  addTrees,
  setOpacity,
  addWalls
} from "./scenary.js";

import {
  controlAirplane,
  onMouseMove
} from "./mouse.js";

import { loadOBJFile, loadDAEFile } from './objImports.js';

let scene, renderer, camera, material, light, orbit; // Inicia as Varaiveis
scene = new THREE.Scene();    // Cria o cenario
renderer = initRenderer();    // Inicia o render
renderer.shadowMap.type = THREE.PCFShadowMap;
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Inicia a camera
material = setDefaultMaterial(); 
light = initDefaultBasicLight(scene);
let light_dir = new THREE.DirectionalLight( 0xffffff, 1.5 ); // Cria uma luz direcional na cor branca
light_dir.position.set(20, 30, 0);
light_dir.castShadow = true;

const settingsSh = {
  width: 1024,
  height: 1024,
  near: 1,
  far: 1,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  bias: 0.001,
};
// Configurar a resolução das sombras
light_dir.shadow.mapSize.width = 512;
light_dir.shadow.mapSize.height = 512;

// Definir a área de projeção das sombras
light_dir.shadow.camera.near = 1;
light_dir.shadow.camera.far = 80;

light_dir.shadow.camera.left = 10;
light_dir.shadow.camera.right = 500;
light_dir.shadow.camera.top = 30;
light_dir.shadow.camera.bottom = -70;
light_dir.shadow.bias = -0.0001;

scene.add(light_dir);
//light = initDefaultBasicLight(scene) //Cria uma luz padrão

var mouse = new THREE.Vector2();

var raycaster = new THREE.Raycaster();

var planeDistance = -100;


orbit = new OrbitControls( camera, renderer.domElement ); // Habilita o mouse
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
window.addEventListener('mousemove', onMouseMove, false);


let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Menu de configurações
const settings = {
  showHelper: false,
  distanceX: 1,
  distanceY: 1,
  sensX: 1,
  sensY: 1,
};

// create the ground plane
let planes = [];
let width = 100, length = 25, height = 50;
for (let i = 0; i < 40; i++) {
  let newPlane = createGroundPlane(width, length, 10, 10, "#356927");
  addTrees(newPlane, width, length, settings.showHelper);
  addWalls(newPlane, width, length, height, "#356927");
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  newPlane.receiveShadow = true;
  planes.push(newPlane);
  scene.add(newPlane);
}

let objects_rc = [];
let planerc, planeGeometry, planeMaterial;
planeGeometry = new THREE.PlaneGeometry(width+20, height);
planeMaterial = new THREE.MeshLambertMaterial();
planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 0;
planerc = new THREE.Mesh(planeGeometry, planeMaterial);
planerc.position.set(0,25,-10);
planerc.layers.set(0);
scene.add(planerc);
objects_rc.push(planerc);
raycaster.layers.enable( 0 );



var targetLight = new THREE.Object3D();
targetLight.position.set(0, 25, 0);
light_dir.target = targetLight;
scene.add(targetLight);

var targetGeometry = new THREE.CircleGeometry(5, 32);
var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var target = new THREE.Mesh(targetGeometry, targetMaterial);
// Posicionar a target no plano de fundo
target.position.z = -500; // Distância do avião ao plano de fundo
scene.add(target);

//Variavel do indice do plano inicial
let currentPlaneIndex = 0, currentTurretIndex = 0;
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
let airplaneSpeed = 0;
// controller.add(settings,'showHelper',false,true);
controller.add(settings,'distanceX',1,1.5);
controller.add(settings,'distanceY',1,1.5);
controller.add(settings,'sensX',0.2,1.8);
controller.add(settings,'sensY',0.2,1.8);
controller.open();
setupKeyControls();

//Cria o Avião
let airplane = {obj: null, box: new THREE.Box3()};
let turrets = [
  {obj: null, box: new THREE.Box3()},
  {obj: null, box: new THREE.Box3()},
  {obj: null, box: new THREE.Box3()}
]
let turretDistance = 500;

//Cria a esfera
let intersectionSphere = new THREE.Mesh(
  new THREE.SphereGeometry(.2, 30, 30, 0, Math.PI * 2, 0, Math.PI),
  new THREE.MeshPhongMaterial({color:"orange", shininess:"200"}));
scene.add

let shots = new Set();
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

  let turretPromise1 = loadDAEFile("Turret/", "turret");
  turretPromise1.then(obj1 => {
    turrets[0].obj = obj1.scene;
    turrets[0].obj.name = "turret1";
    turrets[0].obj.scale.set(0.1, 0.1, 0.1);
    turrets[0].obj.position.set(20.0, 0.0, -turretDistance);
    turrets[0].obj.rotation.set(0.0, -0.1, 0.0);
    turrets[0].box = turrets[0].box.setFromObject( turrets[0].obj );
    if(settings.showHelper) {
      let helper = new THREE.Box3Helper( turrets[0].box, 0xffff00 );
      scene.add( helper );
    }
    scene.add(turrets[0].obj);

    let turretPromise2 = loadDAEFile("Turret/", "turret");
    turretPromise2.then(obj2 => {
      turrets[1].obj = obj2.scene;
      turrets[1].obj.name = "turret2";
      turrets[1].obj.scale.set(0.1, 0.1, 0.1);
      turrets[1].obj.position.set(-20.0, 0.0, -2 * turretDistance);
      turrets[1].obj.rotation.set(0.0, 0.1, 0.0);
      turrets[1].box = turrets[1].box.setFromObject( turrets[1].obj );
      if(settings.showHelper) {
        let helper = new THREE.Box3Helper( turrets[1].box, 0xffff00 );
        scene.add( helper );
      }
      scene.add(turrets[1].obj);

      let turretPromise3 = loadDAEFile("Turret/", "turret");
      turretPromise3.then(obj3 => {
        turrets[2].obj = obj3.scene;
        turrets[2].obj.name = "turret3";
        turrets[2].obj.scale.set(0.1, 0.1, 0.1);
        turrets[2].obj.position.set(20.0, 0.0, -3 * turretDistance);
        turrets[2].obj.rotation.set(0.0, -0.1, 0.0);
        turrets[2].box = turrets[2].box.setFromObject( turrets[2].obj );
        if(settings.showHelper) {
          let helper = new THREE.Box3Helper( turrets[2].box, 0xffff00 );
          scene.add( helper );
        }
        scene.add(turrets[2].obj);

        fireShot();

        render();
      });

    });

  });

});

// Obtenha o elemento do canvas
var gameCanvas = document.getElementById('webgl-output');
// Ocultar o cursor do mouse
gameCanvas.style.cursor = 'none';
light_dir.target.position.set(0,12,0);
let frameCount = 0;
let fpsContainer;
let startTime;

startFPSCounter();

function render() {
  console.log(turrets[0].obj.position, turrets[1].obj.position, turrets[2].obj.position);
  controlAirplane(airplane,target,raycaster,camera,objects_rc)
  //Função para atualização da camera
  updateCamera();
  //Atualiza posição do plano atual
  updatePlanePosition();
  updateTurretPosition();

  for (let i = 0; i < planes.length; i++) {
    let distance = camera.position.distanceTo(planes[i].position);
    updateOpacity(planes[i], distance);
  } 
  //showInterceptionCoords(mouse);
  updateZPosition(airplane.obj, airplane.obj.position.z-airplaneSpeed, airplane.box);
  updateZPosition(planerc, airplane.obj.position.z);
  updateZPosition(target, airplane.obj.position.z-200);
  updateZPosition(light_dir, airplane.obj.position.z)
  targetLight.position.z = airplane.obj.position.z;
  light_dir.target = targetLight;
  controlBullets(10);

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
  camera.position.y = (airplane.obj.position.y + (3 * settings.distanceX));
  camera.position.z = (airplane.obj.position.z + (13 * settings.distanceY));
  camera.lookAt(airplane.obj.position);
}

function updatePlanePosition() {
  if(airplane.obj.position.z < planes[currentPlaneIndex].position.z - length){
    planes[currentPlaneIndex].position.z -= length * planes.length;
    currentPlaneIndex = (currentPlaneIndex + 1) % planes.length;
  }
}

function updateTurretPosition() {
  if(airplane.obj.position.z < turrets[currentTurretIndex].obj.position.z){
    turrets[currentTurretIndex].obj.position.z -= 3 * turretDistance;
    let posX = turrets[currentTurretIndex].obj.position.x;
    turrets[currentTurretIndex].obj.position.x = -posX;
    turrets[currentTurretIndex].obj.rotation.set(0.0, posX/(Math.abs(posX)) * 0.2, 0.0);
    turrets[currentTurretIndex].obj.visible = true;
    currentTurretIndex = (currentTurretIndex + 1) % turrets.length;
  }
}

function setupKeyControls() {
  document.onkeydown = function(e) {
    console.log(e);
    switch (e.key) {
      case "0":
      airplaneSpeed = 0;
      break;
      case "1":
      airplaneSpeed = 1;
      break;
      case "2":
      airplaneSpeed = 2;
      break;
      case "3":
      airplaneSpeed = 3;
      break;
      case "Escape":
      if(gameCanvas.style.cursor=='none'){
        gameCanvas.style.cursor = '';
      } else {
        gameCanvas.style.cursor = 'none';
      break;
    }
  }
  };
}

function startFPSCounter() {
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

function fireShot() {
  let bulletGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 4);
  let bulletMaterial = new THREE.MeshBasicMaterial("0xffffff");
  let bullet1 = new THREE.Mesh(bulletGeometry, bulletMaterial);
  let bullet2 = new THREE.Mesh(bulletGeometry, bulletMaterial);
  let airplanePos = airplane.obj.getWorldPosition(new THREE.Vector3());
  bullet1.position.x = airplanePos.x-1;
  bullet1.position.y = airplanePos.y-1.5;
  bullet1.position.z = airplanePos.z-0.5;

  bullet2.position.x = airplanePos.x+1;
  bullet2.position.y = airplanePos.y-1.5;
  bullet2.position.z = airplanePos.z-0.5;

  let targetPosition = target.getWorldPosition(new THREE.Vector3());
  let dir1 = new THREE.Vector3();
  dir1.subVectors( targetPosition, bullet1.position ).normalize();
  bullet1.lookAt(dir1);

  let dir2 = new THREE.Vector3();
  dir2.subVectors( targetPosition, bullet2.position ).normalize();
  bullet2.lookAt(dir2);

  shots.add({obj: bullet1, dir: dir1});
  shots.add({obj: bullet2, dir: dir2});

  scene.add(bullet1);
  scene.add(bullet2);
}

// Move the object towards the target at a constant speed
function controlBullets(speed) {
  var dist;
  shots.forEach(element => {
    if(element.obj.position.z > -length * planes.length){
      dist = element.dir.clone().multiplyScalar(speed);
      element.obj.position.add(dist);
    }
    else{
      shots.delete(element);
      scene.remove(element.obj);
    }
  })
}