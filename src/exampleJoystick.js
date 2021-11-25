import * as THREE from  '../build/three.module.js';
import {OrbitControls} from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        InfoBox,
        createGroundPlane,
        createGroundPlaneWired,
        onWindowResize, 
        initDefaultBasicLight,
        degreesToRadians} from "../libs/util/util.js";      
        
// vars
let scale = 1;
let size = 5;
let fwdValue = 0;
let bkdValue = 0;
let rgtValue = 0;
let lftValue = 0;
let tempVector = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);

// Create a renderer and add it to the DOM.
var scene = new THREE.Scene();
var renderer = initRenderer();   
  renderer.setClearColor( 0xbfd1e5 );
var camera = initCamera(new THREE.Vector3(0, 30, 60));
var light = initDefaultBasicLight(scene, true, new THREE.Vector3(-30, 15, 0), 80, 1024) ;
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Add OrbitControls so that we can pan around with the mouse.
var controls = new OrbitControls(camera, renderer.domElement);

// Add axes
var axes = new THREE.AxesHelper(50);
scene.add( axes );

// Add grid
var groundPlane = createGroundPlaneWired(200, 200, 40, 40); // width and height
scene.add(groundPlane);

// create the inner cube
var geometry = new THREE.BoxGeometry(size, size, size);
var material = new THREE.MeshLambertMaterial({color:"rgb(255,0,0)"});
var mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = size/2.0;
  mesh.scale.set(scale, scale, scale);
scene.add(mesh);

render();
addJoysticks();

// Renders the scene
function render() {
  updatePlayer();  
  controls.update();
  requestAnimationFrame( render );
  renderer.render( scene, camera );  
}

function updatePlayer(){
  // move the player
  const angle = controls.getAzimuthalAngle()
  
    if (fwdValue > 0) {
        tempVector
          .set(0, 0, -fwdValue)
          .applyAxisAngle(upVector, angle)
        mesh.position.addScaledVector(
          tempVector,
          1
        )
      }
  
      if (bkdValue > 0) {
        tempVector
          .set(0, 0, bkdValue)
          .applyAxisAngle(upVector, angle)
        mesh.position.addScaledVector(
          tempVector,
          1
        )
      }

      if (lftValue > 0) {
        tempVector
          .set(-lftValue, 0, 0)
          .applyAxisAngle(upVector, angle)
        mesh.position.addScaledVector(
          tempVector,
          1
        )
      }

      if (rgtValue > 0) {
        tempVector
          .set(rgtValue, 0, 0)
          .applyAxisAngle(upVector, angle)
        mesh.position.addScaledVector(
          tempVector,
          1
        )
      }
  
  mesh.updateMatrixWorld()

  mesh.scale.set(scale, scale, scale);
  mesh.position.y = 5 * scale /2.0;
  
  //controls.target.set( mesh.position.x, mesh.position.y, mesh.position.z );
  // reposition camera
  camera.position.sub(controls.target)
  controls.target.copy(mesh.position)
  camera.position.add(mesh.position)
};

function addJoysticks(){
   
  // Details in the link bellow:
  // https://yoannmoi.net/nipplejs/

  let joystickL = nipplejs.create({
    zone: document.getElementById('joystickWrapper1'),
    mode: 'static',
    position: { top: '160px', left: '60px' }
  });
  
  joystickL.on('move', function (evt, data) {
    const forward = data.vector.y
    const turn = data.vector.x

    if (forward > 0) {
      fwdValue = Math.abs(forward)
      bkdValue = 0
    } else if (forward < 0) {
      fwdValue = 0
      bkdValue = Math.abs(forward)
    }

    if (turn > 0) {
      lftValue = 0
      rgtValue = Math.abs(turn)
    } else if (turn < 0) {
      lftValue = Math.abs(turn)
      rgtValue = 0
    }
  })

  joystickL.on('end', function (evt) {
    bkdValue = 0
    fwdValue = 0
    lftValue = 0
    rgtValue = 0
  })

  let joystickR = nipplejs.create({
    zone: document.getElementById('joystickWrapper2'),
    mode: 'static',
    lockY: true,                 // only move on the Y axis
    position: { top: '160px', right: '60px' },
  });

  joystickR.on('move', function (evt, data) {
    const localScale = data.vector.y;

    scale += localScale;
    if(scale > 3.0) scale = 3.0;
    if(scale < 0.5) scale = 0.5;
  })
}