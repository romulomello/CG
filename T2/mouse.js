import {SecondaryBox
} from "../libs/util/util.js";
import * as THREE from 'three';

// Mouse variables
let pointer = new THREE.Vector2();
var mouseDelay = 0.05;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

export function controlAirplane(airplane,target,raycaster,camera,objects_rc) {
   // Atualizar a posição do Raycaster com base na posição do mouse
   raycaster.setFromCamera(pointer, camera);
   // calculate objects intersecting the picking ray
   let intersects = raycaster.intersectObjects(objects_rc);
   
   // -- Find the selected objects_rc ------------------------------
   if (intersects.length > 0) // Check if there is a intersection
   {      
      let point = intersects[0].point;
      var targetX = airplane.obj.position.x + (point.x - airplane.obj.position.x) * mouseDelay;
      var targetY = airplane.obj.position.y + (point.y - airplane.obj.position.y) * mouseDelay;
   
      targetX = Math.max(-32, Math.min(32, targetX));
      targetY = Math.max(14, Math.min(40, targetY));
   
      var positionChanged = (targetX !== airplane.obj.position.x) || (targetY !== airplane.obj.position.y);
   
      // Mover o avião para a nova posição
      airplane.obj.position.x = targetX;
      airplane.obj.position.y = targetY;
   
      target.position.x = point.x;
      target.position.y = point.y;
      //airplane.obj.position.z -= planeSpeed; // Movimentação do avião para frente no eixo Z
   
      // Rotacionar o avião com base na nova posição
      if (positionChanged){
      var angle = Math.atan2(Math.abs(point.y - airplane.obj.position.y), point.x - airplane.obj.position.x);
      //console.log("Angle: " + angle)
      var smoothness = 0.4;
      airplane.obj.rotation.z = (angle - Math.PI / 2)*smoothness;
      }
      else {
      airplane.obj.rotation.z = 0
      }
   }
}
 
 export function onMouseMove(event) 
 {
    pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
   }

 function showInterceptionCoords(point)
{
   leftBox.changeMessage("Intersection on Layer  " +  
       point.x.toFixed(2) + ", " +
       point.y.toFixed(2) + ", " + 
       point.z + "]"); 
}
