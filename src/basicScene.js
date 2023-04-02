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
        getTree
      } from "./util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
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
for (let i = 0; i < 5; i++) {
  planes.push(createGroundPlaneXZ(width, length));
  translateMesh(planes[i], 0, 0, i * (-length));
  scene.add(planes[i]);

  for (let j = 0; j < 100; j++) {
    let x = -width/2 + Math.random() * width;
    let z = length/2 + (-length) * (Math.random() + i);
    scene.add(getTree(x, z));
  }
}

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}