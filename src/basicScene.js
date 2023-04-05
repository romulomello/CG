import * as THREE from 'three';
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
  setOpacity
} from "./scenary.js";

import {
  mouseRotation,
  onDocumentMouseMove
} from "./mouse.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let planes = [];
let width = 100, length = 100;
for (let i = 0; i < 8; i++) {
  let newPlane = createGroundPlane(width, length);
  addTrees(newPlane, width, length);
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  planes.push(newPlane);
  scene.add(newPlane);
}

document.addEventListener('mousemove', onDocumentMouseMove);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// create a cube
let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let mesh = new THREE.Mesh(cubeGeometry, material);
// position the cube
mesh.position.set(0.0, 20, 0.0);
// add the cube to the scene
scene.add(mesh);

// define mesh speed
let meshSpeed = 0.5;

camera.lookAt(mesh.position);

let currentPlaneIndex = 0;
let maxDistance = planes.length * length; 
let initialOpacity = 1;

render();

function render() {
   mouseRotation(mesh);
   updateCamera();

   if(mesh.position.z < planes[currentPlaneIndex].position.z - length){
    planes[currentPlaneIndex].position.z -= length * planes.length;
    currentPlaneIndex = (currentPlaneIndex + 1) % planes.length;
   }
   for (let i = 0; i < planes.length; i++) {
    let distance = camera.position.distanceTo(planes[i].position);
    console.log(distance);
    updateOpacity(planes[i], distance);
  } 

   requestAnimationFrame(render);
   mesh.position.z -= meshSpeed ;
   renderer.render(scene, camera)
}

function updateOpacity(object, distance) {
  let opacity = (distance > maxDistance) ? 1 : (1 - distance / maxDistance) * initialOpacity;
  setOpacity(object, opacity);
  // object.material.opacity = opacity;
}

function updateCamera() {
    camera.position.x = mesh.position.x;
    camera.position.y = mesh.position.y + 15;
    camera.position.z = mesh.position.z + 40;
    camera.lookAt(mesh.position);
}