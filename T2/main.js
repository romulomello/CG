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

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let planes = [];
let width = 100, length = 15, height = 50;
for (let i = 0; i < 80; i++) {
  let newPlane = createGroundPlane(width, length, 10, 10, "#356927");
  addTrees(newPlane, width, length);
  addWalls(newPlane, width, length, height, "#356927");
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  planes.push(newPlane);
  scene.add(newPlane);
}

document.addEventListener('mousemove', onDocumentMouseMove);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);


//Cria o Avião
let obj = loadOBJFile("Arwing/", "Arwing");
obj.then(airplane => {
  airplane.name = "airplane";
  airplane.position.set(0.0, 20, 0.0);
  scene.add(airplane);

  let turretObj = loadDAEFile("Turret/", "Turret");
  turretObj.then(turretScene => {

    let turret = turretScene.scene;
    turret.name = "turret";
    turret.scale.set(0.1, 0.1, 0.1);
    turret.position.set(0.0, 0.0, -300.0);
    scene.add(turret);

  //Menu de configurações
  const settings = {
    airplaneSpeed: 1,
    distanceX: 1,
    distanceY: 1,
    sensX: 1,
    sensY: 1,

    }

  //Aponta a camera para o Avião
  camera.lookAt(airplane.position);

  //Variavel do indice do plano inicial
  let currentPlaneIndex = 0;
  //Variavel de distância maxima
  let maxDistance = planes.length * length; 
  //Variavel de Opacidade inicial
  let initialOpacity = 1;

  const gui = new GUI()
  const controller = gui.addFolder('Settings');
  controller.add(settings,'airplaneSpeed',1,3);
  controller.add(settings,'distanceX',1,1.5);
  controller.add(settings,'distanceY',1,1.5);
  controller.add(settings,'sensX',0.2,1.8);
  controller.add(settings,'sensY',0.2,1.8);
  controller.open()

  render();

  function render() {
    //Função de rotação do mouse
    mouseRotation(airplane,settings);
    //Função para atualização da camera
    updateCamera();
    //Atualiza posição do plano atual
    updatePlanePosition();
    
    for (let i = 0; i < planes.length; i++) {
      let distance = camera.position.distanceTo(planes[i].position);
      updateOpacity(planes[i], distance);
    } 
    
    requestAnimationFrame(render);
    airplane.position.z -= settings.airplaneSpeed;
    turret.position.z -= settings.airplaneSpeed;
    renderer.render(scene, camera);
  }

  function updateOpacity(object, distance) {
    let opacity = (distance > maxDistance) ? 0 : (1 - distance / maxDistance) * initialOpacity;
    setOpacity(object, opacity);
  }

  function updateCamera() {
    camera.position.x = airplane.position.x;
    camera.position.y = (airplane.position.y + (5 * settings.distanceX));
    camera.position.z = (airplane.position.z + (30 * settings.distanceY));
    camera.lookAt(airplane.position);
  }

  function updatePlanePosition() {
    if(airplane.position.z < planes[currentPlaneIndex].position.z - length){
      planes[currentPlaneIndex].position.z -= length * planes.length;
      currentPlaneIndex = (currentPlaneIndex + 1) % planes.length;
    }
  }

  });

});