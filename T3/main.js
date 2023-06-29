import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from './OrbitControls.js';
import {initRenderer, 
        setDefaultMaterial,
        onWindowResize,
        degreesToRadians
} from "../libs/util/util.js";

import {initDefaultBasicLight, initDirLight, initCamera } from "./light.js";

import {
  createGroundPlane,
  setOpacity,
  addWalls,
  addElements
} from "./scenary.js";

import { loadOBJFile, loadDAEFile } from './objImports.js';
import { createController, startFPSCounter } from './guiSettings.js';
import { createTarget, fireShot } from './shotsAndTarget.js';

// TODO: add splash screen, set target on top of ground plane and walls

let scene, renderer, camera, material, light, light_dir, orbit; // Inicia as Varaiveis
scene = new THREE.Scene();    // Cria o cenario
renderer = initRenderer();    // Inicia o render
renderer.shadowMap.type = THREE.PCFShadowMap;
camera = initCamera(new THREE.Vector3(0, 30, 20)); // Inicia a camera
material = setDefaultMaterial(); 
light = initDefaultBasicLight(scene);
light_dir = initDirLight(scene);

var raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();

orbit = new OrbitControls( camera, renderer.domElement ); // Habilita o mouse
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);

let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Menu de configurações
const settings = {
  showHelper: false,
  showFPS: true,
  distanceX: 1,
  distanceY: 1,
  sensX: 0.5,
  sensY: 0.5,
};

let mouseIsDown = false;
// let cursorStyle = 'none';
let cursorStyle = true;

// create the ground plane
let planes = [];
let width = 80, length = 50, height = 30;
for (let i = 0; i < 50; i++) {
  let newPlane = createGroundPlane(width, length, 10, 10, "#356927");
  addWalls(newPlane, width, length, height, "#356927");
  addElements(newPlane, width, length, height, "#356927");
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  newPlane.receiveShadow = true;
  newPlane.material.transparent = false;
  newPlane.material.opacity = 1;
  planes.push(newPlane);
  scene.add(newPlane);
}

// Cria raycaster layers
let objects_rc = [];
let plane_rc, planeGeometry, planeMaterial;
let rc_offset = 200;
planeGeometry = new THREE.PlaneGeometry(width*5, height*5);
planeMaterial = new THREE.MeshLambertMaterial();
planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.visible = false;
plane_rc = new THREE.Mesh(planeGeometry, planeMaterial);
plane_rc.position.set(0, height/2, -rc_offset);
plane_rc.layers.set(0);

objects_rc.push(plane_rc);
raycaster.layers.enable( 0 );
scene.add(plane_rc);
camera.layers.enable( 0 );

var targetLight = new THREE.Object3D();
targetLight.position.set(0, 30, 0);
light_dir.target = targetLight;
scene.add(targetLight);

// Posicionar a target no plano de fundo
let target = createTarget(0.01 * rc_offset);
target.position.set(0, 0, -rc_offset); // Distância do avião ao plano de fundo
scene.add(target);

//Variavel do indice do plano inicial
let currentPlaneIndex = 0, currentTurretIndex = 0;
//Variavel de distância maxima
let maxDistance = planes.length * length; 
let initialSpeed = 1.5;
let airplaneSpeed = initialSpeed;
let airplaneShotSpeed = 20;
let turretShotSpeed = 15;
var mouseDelay = 0.05;
let stopGame = true;

const gui = new GUI();
createController(gui, document, settings);
setupKeyControls();

//Cria o objeto airplane
let airplane = {obj: null, box: new THREE.Box3(), life: 100};

// Cria o objeto turrets
let turrets = [
  {obj: null, box: new THREE.Box3(), blinkStartTime: null, hit: false},
  {obj: null, box: new THREE.Box3(), blinkStartTime: null, hit: false},
  {obj: null, box: new THREE.Box3(), blinkStartTime: null, hit: false}
]
let turretDistance = 500, turretScale = 0.15;

let airplaneShots = new Set();
let turretShots = new Set();

// Carrega as promessas e inicia a simulação
let promise = loadOBJFile("./Arwing/", "Arwing");
promise.then(obj => {
  //Seta posição do avião
  airplane.obj = obj;
  airplane.obj.traverse( 
    function( node ) { 
      if ( node instanceof THREE.Mesh ) { 
        node.castShadow = true; 
        node.material.color = new THREE.Color(1, 1, 1);
      } 
    } 
  );
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

        stopGame = false;
        render();
      });

    });

  });

});

// Obtenha o elemento do canvas
var gameCanvas = document.getElementById('webgl-output');
// Ocultar o cursor do mouse
gameCanvas.style.cursor = cursorStyle;
light_dir.target.position.set(0,15,0);

if(settings.showFPS){
  startFPSCounter();
}

let airplaneShotclock = new THREE.Clock();
let turretShotClock = new THREE.Clock();

function render() {
  if (!stopGame){
    //Função para controlar o avião
    controlAirplane(pointer, camera);
    // controlAirplane(airplane,target,raycaster,camera,objects_rc)
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
    plane_rc.position.z = airplane.obj.position.z-rc_offset;
    target.position.z = airplane.obj.position.z-rc_offset;
    light_dir.position.z = airplane.obj.position.z;
    targetLight.position.z = airplane.obj.position.z-10*3;
    light_dir.target = targetLight;

    airplaneShotclock.getDelta();
    turretShotClock.getDelta();

    if (turretShotClock.elapsedTime >= 4-airplaneSpeed/3) {
      turrets.forEach(turret => {
        // console.log(turret.obj.position.z - airplane.obj.position.z)
        if (!turret.hit && airplane.obj.position.z - turret.obj.position.z > 100) {
          fireShot(turret.obj, airplane.obj, turretShots, scene);
        }
      })
      turretShotClock.start();
    }
    
    if (mouseIsDown && airplaneShotclock.elapsedTime >= 0.2) {
      fireShot(airplane.obj, target, airplaneShots, scene);
      airplaneShotclock.start();
    }
    //Atualiza posição dos tiros
    controlAirplaneBullets(airplaneShotSpeed);
    controlTurretBullets(turretShotSpeed);
    // console.log(airplane.life);

    //Animação da torreta se ela foi atingida
    turretAnimation();

    //Rotaciona a camera nas margens
    rotateCamera();
  }
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function rotateCamera(){
  if(Math.abs(camera.rotation._z) < 1){
    // If airplane is in the corner left, rotate positive degrees in z
    if(airplane.obj.position.x < -20){
      // camera.rotation._z += 0.1;
      camera.rotateZ(0.01);
    }
    else if(airplane.obj.position.x > 20){ // If airplane is in the corner right, rotate negative degrees in z
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


function updateObjectPosition(object, box, newPosition, rotation = null) {
  object.position.x = newPosition.x;
  object.position.y = newPosition.y;
  object.position.z = newPosition.z;
  if(rotation != null){
    object.rotation.set(rotation.x, rotation.y, rotation.z);
  }
  box = box.setFromObject(object);
}

function updateAirplaneColor(airplane) {
  airplane.obj.traverse(function(child){
    if (child instanceof THREE.Mesh) {
      let color = new THREE.Color(1, airplane.life/100, airplane.life/100);
      child.material.color = color;
    }
});
}

function updateOpacity(object, distance) {
  let opacity;
  let maxVision = 0.75;
  if (distance < maxDistance * maxVision) {
    opacity = 1;
    object.material.transparent = false;
  } else if (distance < maxDistance) {
    object.material.transparent = true;
    var percentage = (distance - maxDistance * maxVision) / (maxDistance * (1 - maxVision));
    opacity = 1 - percentage;
  }
  setOpacity(object, opacity);
}

function updateCamera() {
  camera.position.x = airplane.obj.position.x + (airplane.obj.position.x/20)*-1;
  var maxY = (airplane.obj.position.y + (8))+((airplane.obj.position.y/8)*-1);
  camera.position.y = maxY;
  camera.position.z = (airplane.obj.position.z + (20 * settings.distanceY));
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
      new THREE.Vector3(turret.obj.rotation.x, -turret.obj.rotation.y, turret.obj.rotation.z)
    );
    turret.obj.visible = true;
    turret.obj.blinkStartTime = null;
    turret.hit = false;
    currentTurretIndex = (currentTurretIndex + 1) % turrets.length;
  }
}

function setupKeyControls() {
  document.onkeydown = function(e) {
    switch (e.key) {
      case "0":
      airplaneSpeed = 0;
      break;
      case "1":
      airplaneSpeed = initialSpeed;
      break;
      case "2":
      airplaneSpeed = 2 * initialSpeed;
      break;
      case "3":
      airplaneSpeed = 3 * initialSpeed;
      break;
      case "Escape":
      stopGame = true;
      gameCanvas.style.cursor = '';
      break;
  }
  };
}

function controlTurretBullets(speed) {
  turretShots.forEach(bullet => {
    var removeBullet = false;
    var increment = bullet.dir.clone().multiplyScalar(speed);
    var distance = camera.position.distanceTo(bullet.obj.position);
    if (bullet.obj.position.z > camera.position.x || bullet.obj.position.y < 0) { 
      removeBullet = true;
    } else {
      if (airplane.life > 0 && airplane.box.intersectsBox(bullet.box))
      // if (airplane.box.intersectsBox(bullet.box)) // JUST for testing
      {
        removeBullet = true;
        airplane.life -= 20;
        updateAirplaneColor(airplane);
      }
    }
    if (removeBullet) {
      turretShots.delete(bullet);
      scene.remove(bullet.obj);
    } else {
      bullet.obj.position.add(increment);
      let dir = new THREE.Vector3();
      dir.subVectors(bullet.targetPos, bullet.obj.position).normalize();
      bullet.obj.lookAt(bullet.targetPos);
      bullet.obj.rotateX(-Math.PI / 2);
      updateOpacity(bullet.obj, distance);
      bullet.box = bullet.box.setFromObject(bullet.obj);
    }
  });
}

// Move os tiros na direção do target com velocidade constante
function controlAirplaneBullets(speed) {
  airplaneShots.forEach(bullet => {
    var removeBullet = false;
    var increment = bullet.dir.clone().multiplyScalar(speed);
    var distance = camera.position.distanceTo(bullet.obj.position);
    if (distance > 1500 || bullet.obj.position.y < 0) { 
      removeBullet = true;
    } else {
      turrets.forEach(turret => {
        if (!turret.hit && turret.box.intersectsBox(bullet.box)) {
          turret.blinkStartTime = Date.now();
          removeBullet = true;
          turret.hit = true;
        }
      });
    }
    if (removeBullet) {
      airplaneShots.delete(bullet);
      scene.remove(bullet.obj);
    } else {
      bullet.obj.position.add(increment);
      let dir = new THREE.Vector3();
      dir.subVectors(bullet.targetPos, bullet.obj.position).normalize();
      bullet.obj.lookAt(bullet.targetPos);
      bullet.obj.rotateX(-Math.PI / 2);
      updateOpacity(bullet.obj, distance);
      bullet.box = bullet.box.setFromObject(bullet.obj);
    }
  });
}

function controlAirplane(pointer, camera) {
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);
  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(objects_rc, true);
  // console.log(intersects)
  if (intersects.length > 0) // Check if there is a intersection
  {
      // console.log(target.position.x, target.position.y)
      let point = intersects[0].point; // Pick the point where interception occurrs
      var targetX = airplane.obj.position.x + (point.x - airplane.obj.position.x) * mouseDelay;
      var targetY = airplane.obj.position.y + (point.y - airplane.obj.position.y) * mouseDelay;
      
      targetX = Math.max(-width/2+10, Math.min(width/2-10, targetX));
      targetY = Math.max(18, Math.min(height+10, targetY));
      
      var positionChanged = (targetX !== airplane.obj.position.x) || (targetY !== airplane.obj.position.y);
      
      airplane.obj.position.x = targetX;
      airplane.obj.position.y = targetY;
      
      target.position.x = point.x;
      target.position.y = point.y;
      
      if (positionChanged) {
        var angle = Math.atan2(Math.abs(point.y - airplane.obj.position.y), point.x - airplane.obj.position.x);
        var angleX = Math.atan2(point.y - airplane.obj.position.y, Math.abs(point.x - airplane.obj.position.x));
        var smoothness = 0.4;
        var rotationZ = (angle - Math.PI / 2) * smoothness;
        var rotationY = Math.atan2(point.x - airplane.obj.position.x, Math.abs(point.y - airplane.obj.position.y)) * -1 / 10; 
        var rotationX = angleX * 0.15;
        
        // Criar quaternions para as rotações em cada eixo
        var quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotationX);
        var quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
        var quaternionZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotationZ);
        
        // Multiplicar os quaternions em ordem para combinar as rotações
        var quaternion = quaternionZ.multiply(quaternionY).multiply(quaternionX);
        
      // Aplicar o quaternion de rotação ao avião
      airplane.obj.quaternion.copy(quaternion);
      } else {
        // Rotação nula quando não houver mudança de posição
        airplane.obj.rotation.set(0, 0, 0);
      }
  }
}

function onMouseMove(event) 
{
  event.preventDefault();
  if (!stopGame) {
    pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1.1;
  }
}

function onMouseDown(event)
{
  event.preventDefault();
  if (stopGame){
    // Resume the simulation if it was paused
    stopGame = false;
    gameCanvas.style.cursor = cursorStyle;
  } else {
    mouseIsDown = true;
  }
}

function onMouseUp(event)
{
  event.preventDefault();
  mouseIsDown = false;
}