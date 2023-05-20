import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        setDefaultMaterial,
        onWindowResize,
        degreesToRadians
} from "../libs/util/util.js";

import {initDefaultBasicLight, initDirLight,initCamera,} from "./light.js";

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
import { createController, startFPSCounter } from './guiSettings.js';

let scene, renderer, camera, material, light, light_dir, orbit; // Inicia as Varaiveis
scene = new THREE.Scene();    // Cria o cenario
renderer = initRenderer();    // Inicia o render
renderer.shadowMap.type = THREE.PCFShadowMap;
let slackCamera = 0;
camera = initCamera(new THREE.Vector3(0+slackCamera, 20, 20)); // Inicia a camera
material = setDefaultMaterial(); 
light = initDefaultBasicLight(scene);
light_dir = initDirLight(scene);

var raycaster = new THREE.Raycaster();

orbit = new OrbitControls( camera, renderer.domElement ); // Habilita o mouse
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
window.addEventListener('mousemove', onMouseMove, false);

let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Menu de configurações
const settings = {
  showHelper: false,
  showFPS: true,
  distanceX: 1,
  distanceY: 1,
  sensX: 1,
  sensY: 1,
};

// create the ground plane
let planes = [];
let width = 100, length = 50, height = 50;
for (let i = 0; i < 50; i++) {
  let newPlane = createGroundPlane(width, length, 10, 10, "#356927");
  addTrees(newPlane, width, length, settings.showHelper);
  addWalls(newPlane, width, length, height, "#356927");
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  newPlane.receiveShadow = true;
  planes.push(newPlane);
  scene.add(newPlane);
}

// Cria raycaster layers
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
var targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 , transparent: true, opacity: 0.5});
var target = new THREE.Mesh(targetGeometry, targetMaterial);

var targetGeometry2 = new THREE.CircleGeometry(0.5, 32);
var targetMaterial2 = new THREE.MeshBasicMaterial({ color: "#FFFFFF" , transparent: true, opacity: 1});
var smallTarget = new THREE.Mesh(targetGeometry2, targetMaterial2);
target.add(smallTarget);

// Posicionar a target no plano de fundo
target.position.z = -500; // Distância do avião ao plano de fundo
scene.add(target);

//Variavel do indice do plano inicial
let currentPlaneIndex = 0, currentTurretIndex = 0;
//Variavel de distância maxima
let maxDistance = planes.length * length; 
let airplaneSpeed = 0;
let stopGame = false;

const gui = new GUI();
createController(gui, document, settings);
setupKeyControls();

//Cria o objeto airplane
let airplane = {obj: null, box: new THREE.Box3()};

// Cria o objeto turrets
let turrets = [
  {obj: null, box: new THREE.Box3(), blinkStartTime: null},
  {obj: null, box: new THREE.Box3(), blinkStartTime: null},
  {obj: null, box: new THREE.Box3(), blinkStartTime: null}
]
let turretDistance = 500, turretScale = 0.15;

let shots = new Set();

// Carrega as promessas e inicia a simulação
let promise = loadOBJFile("Arwing/", "Arwing");
promise.then(obj => {
  //Seta posição do avião
  airplane.obj = obj;
  airplane.obj.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
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

  let turretPromise1 = loadDAEFile("./Turret/", "turret");
  turretPromise1.then(obj1 => {
    //Seta escala, rotação e posição da torreta
    turrets[0].obj = obj1.scene;
    turrets[0].obj.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
    turrets[0].obj.name = "turret1";
    turrets[0].obj.scale.set(turretScale, turretScale, turretScale);
    turrets[0].obj.position.set(20.0, 0.0, -turretDistance);
    turrets[0].obj.rotation.set(0.0, -0.1, 0.0);
    turrets[0].box = turrets[0].box.setFromObject( turrets[0].obj );
    if(settings.showHelper) {
      let helper = new THREE.Box3Helper( turrets[0].box, 0xffff00 );
      scene.add( helper );
    }
    scene.add(turrets[0].obj);

    let turretPromise2 = loadDAEFile("./Turret/", "turret");
    turretPromise2.then(obj2 => {
      turrets[1].obj = obj2.scene;
      turrets[1].obj.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
      turrets[1].obj.name = "turret2";
      turrets[1].obj.scale.set(turretScale, turretScale, turretScale);
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
        turrets[2].obj.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
        turrets[2].obj.name = "turret3";
        turrets[2].obj.scale.set(turretScale, turretScale, turretScale);
        turrets[2].obj.position.set(20.0, 0.0, -3 * turretDistance);
        turrets[2].obj.rotation.set(0.0, -0.1, 0.0);
        turrets[2].box = turrets[2].box.setFromObject( turrets[2].obj );
        if(settings.showHelper) {
          let helper = new THREE.Box3Helper( turrets[2].box, 0xffff00 );
          scene.add( helper );
        }
        scene.add(turrets[2].obj);

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

if(settings.showFPS){
  startFPSCounter();
}

function render() {
  if (!stopGame){
    //Função para controlar o avião
    controlAirplane(airplane,target,raycaster,camera,objects_rc,slackCamera)
    //Função para atualização da camera
    updateCamera();
    //Atualiza posição do plano atual
    updatePlanePosition();
    //Atualiza posição das torretas
    updateTurretPosition();

    for (let i = 0; i < planes.length; i++) {
      let distance = camera.position.distanceTo(planes[i].position);
      updateOpacity(planes[i], distance);
    }
    //showInterceptionCoords(mouse);
    updateObjectPosition(airplane.obj, 
      airplane.box,
      new THREE.Vector3(airplane.obj.position.x, airplane.obj.position.y, airplane.obj.position.z-airplaneSpeed), 
    );

    //Atualiza luzes, plano do raycaster e target
    planerc.position.z = airplane.obj.position.z;
    target.position.z = airplane.obj.position.z-200;
    light_dir.position.z = airplane.obj.position.z;
    targetLight.position.z = airplane.obj.position.z;
    light_dir.target = targetLight;

    //Atualiza posição dos tiros
    controlBullets(10);

    //Animação da torreta se ela foi atingida
    turretAnimation();

    //Rotaciona a camera nas margens
    rotateCamera();

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function rotateCamera(){
  if(Math.abs(camera.rotation._z) < 1){
    // If airplane is in the corner left, rotate positive degrees in z
    if(airplane.obj.position.x < -30){
      // camera.rotation._z += 0.1;
      camera.rotateZ(0.01);
    }
    else if(airplane.obj.position.x > 30){ // If airplane is in the corner right, rotate negative degrees in z
      // camera.rotation._z -= 0.1;
      camera.rotateZ(-0.01);
    }
    else {
      // Restore default rotation
      camera.rotation._z += camera.rotation._z/Math.abs(camera.rotation._z) * 0.01;
      if(Math.abs(camera.rotation._z) < 0.1){
        camera.rotation._z = 0;
      }
    }
  }
}

function turretAnimation() {
  turrets.forEach(turret => {
    if (turret.blinkStartTime !== null) {
      var currentTime = Date.now();
      var elapsedTime = currentTime - turret.blinkStartTime;
  
      // Check if the elapsed time is less than 500 milliseconds
      if (elapsedTime < 500) {
        // Toggle visibility of the mesh based on the elapsed time
        turret.obj.visible = Math.floor(elapsedTime / 100) % 2 === 0;
      } else {
        // Disable the blink animation after 500 milliseconds
        turret.blinkStartTime = null;
        turret.obj.visible = false;
      }
    }
  });
}
}

function updateObjectPosition(object, box, newPosition, rotation = null) {
  object.position.x = newPosition.x;
  object.position.y = newPosition.y;
  object.position.z = newPosition.z;
  if(rotation != null){
    object.rotation.set(rotation.x, rotation.y, rotation.z);
  }
  box = box.setFromObject(object);
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
  var turret = turrets[currentTurretIndex];
  if(airplane.obj.position.z < turret.obj.position.z){
    updateObjectPosition(turret.obj, 
      turret.box, 
      new THREE.Vector3(-turret.obj.position.x, turret.obj.position.y, turret.obj.position.z - 3 * turretDistance),
      new THREE.Vector3(turret.obj.rotation.x, -2 * turret.obj.rotation.y, turret.obj.rotation.z)
    );
    turret.obj.visible = true;
    turret.obj.blinkStartTime = null;
    currentTurretIndex = (currentTurretIndex + 1) % turrets.length;
  }
}

// Event listener for mouse click
document.addEventListener('mousedown', function(event) {
  if (event.button === 0) {
    if(stopGame){
      // Resume the simulation if it was paused
      stopGame = false;
      gameCanvas.style.cursor = 'none';
    }
    else{
      fireShot();
    }
  }
});

function setupKeyControls() {
  document.onkeydown = function(e) {
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
      stopGame = true;
      gameCanvas.style.cursor = '';
      break;
  }
  };
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

  let box1 = new THREE.Box3();
  let box2 = new THREE.Box3();

  shots.add({obj: bullet1, targetPos: targetPosition, dir: dir1, box: box1.setFromObject(bullet1)});
  shots.add({obj: bullet2, targetPos: targetPosition, dir: dir2, box: box2.setFromObject(bullet2)});

  scene.add(bullet1);
  scene.add(bullet2);
}

// Move os tiros na direção do target com velocidade constante
function controlBullets(speed) {
  shots.forEach(bullet => {
    var removeBullet = false;
    var increment = bullet.dir.clone().multiplyScalar(speed);
    var distance = camera.position.distanceTo(bullet.obj.position);
    if(bullet.obj.position.z < -length * planes.length/2 | bullet.obj.position.y < 0){
      removeBullet = true;
    }
    else{
      turrets.forEach(turret => {
        if(turret.box.intersectsBox(bullet.box)){
          console.log(turret.obj.position);
          turret.blinkStartTime = Date.now();
          removeBullet = true;
        }
      })
    }
    if(removeBullet){
      shots.delete(bullet);
      scene.remove(bullet.obj);
    }
    else{
      bullet.obj.position.add(increment);
      let dir = new THREE.Vector3();
      dir.subVectors( bullet.targetPos, bullet.obj.position ).normalize();
      bullet.obj.lookAt(dir);
      bullet.obj.rotateX(-Math.PI/2);
      updateOpacity(bullet.obj, distance);
      bullet.box = bullet.box.setFromObject(bullet.obj);
    }
  })
}