import * as THREE from 'three';

// Mouse variables
let pointer = new THREE.Vector2();
var mouseDelay = 0.1;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

export function controlAirplane(airplane, target, raycaster, camera, objects_rc) {
   // Atualizar a posição do Raycaster com base na posição do mouse
   raycaster.setFromCamera(pointer, camera);
   // calculate objects intersecting the picking ray
   let intersects = raycaster.intersectObjects(objects_rc);
   
   if (intersects.length > 0) {      
      let point = intersects[0].point;
      var targetX = airplane.obj.position.x + (point.x - airplane.obj.position.x) * mouseDelay;
      var targetY = airplane.obj.position.y + (point.y - airplane.obj.position.y) * mouseDelay;
   
      targetX = Math.max(-32, Math.min(32, targetX));
      targetY = Math.max(14, Math.min(40, targetY));
   
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
         var rotationY = 0; 
         var rotationX = angleX * 0.15;

         airplane.obj.rotation.set(rotationX, rotationY, rotationZ);
      } else {
         airplane.obj.rotation.set(0, 0, 0);
      }
   }
}

 
export function onMouseMove(event) 
{
   pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
