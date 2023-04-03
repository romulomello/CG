import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        onWindowResize,
        createGroundPlaneXZ,
        translateMesh,
        rotateMesh,
        getTree,
        degreesToRadians
      } from "./util.js";

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

function getGroupOfTrees(offset) {
  let group = new THREE.Group();
  for (let j = 0; j < 100; j++) {
    let x = -width/2 + Math.random() * width;
    let z = length/2 + (-length) * Math.random();
    group.add(getTree(x, z+offset));
  }
  return group;
}

// create the ground plane
let planes = [];
let trees = [];
let width = 100, length = 100;
for (let i = 0; i < 5; i++) {
  let newPlane = createGroundPlaneXZ(width, length);
  // newPlane.position.z = i * (-length);
  newPlane.translateZ(i * (-length));
  newPlane.rotateX(degreesToRadians(-90));
  planes.push(newPlane);
  scene.add(newPlane);

  let newTrees = getGroupOfTrees(-i * length);
  trees.push(newTrees);
  scene.add(newTrees);
}

// Mouse variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
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

camera.lookAt(mesh.position);

let currentPlaneIndex = 0;
planes.forEach(function(plane) {
  console.log(plane.position);
});

render();
function render() {
   mouseRotation();
   updateCamera();
   console.log("Mesh position: ", mesh.position.z);
   console.log("Current plane position: ", planes[currentPlaneIndex].position.z);

   if(mesh.position.z < planes[currentPlaneIndex].position.z - length/2){
     planes[currentPlaneIndex].position.z -= length * planes.length;
     console.log("Current plane position after translation: ", planes[currentPlaneIndex].position.z);
     trees[currentPlaneIndex] = getGroupOfTrees(planes[currentPlaneIndex].position.z);
     trees[currentPlaneIndex].position.z = trees[currentPlaneIndex].position.z - 500;
     console.log("Trees position: ", trees[currentPlaneIndex].position);
     currentPlaneIndex = (currentPlaneIndex + 1) % planes.length;
   }

   requestAnimationFrame(render);
   mesh.position.z -= 0.5 ;
   renderer.render(scene, camera) // Render scene
}

function mouseRotation() {
   targetX = mouseX * .001;
   targetY = mouseY * .001;
   if (mesh) {
      mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
      mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
      mesh.position.x += 0.05 * (mouseX*0.05 - mesh.position.x);
      mesh.position.y -= (0.005 * (mouseY*0.03 + mesh.position.y))-0.10;
   }
}

function onDocumentMouseMove(event) {
   mouseX = (event.clientX - windowHalfX);
   mouseY = (event.clientY - windowHalfY);
}


function updateCamera() {
    camera.position.x = mesh.position.x;
    camera.position.y = mesh.position.y + 15;
    camera.position.z = mesh.position.z + 40;
    camera.lookAt(mesh.position);
}