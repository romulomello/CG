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
   
      targetX = Math.max(-40, Math.min(40, targetX));
      targetY = Math.max(19, Math.min(40, targetY));
   
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



 
export function onMouseMove(event) 
{
   pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
