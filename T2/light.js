import * as THREE from '../../build/three.module.js';

export function initDefaultBasicLight(scene, castShadow = false, position = new THREE.Vector3(2, 1, 1),
   shadowSide = 16, shadowMapSize = 512, shadowNear = 0.1, shadowFar = 100) {
   const ambientLight = new THREE.HemisphereLight(
      'white', // bright sky color
      'darkslategrey', // dim ground color
      0.3, // intensity
   );

   const mainLight = new THREE.DirectionalLight('white', 0);
   mainLight.position.copy(position);
   mainLight.castShadow = castShadow;

   // Directional ligth's shadow uses an OrthographicCamera to set shadow parameteres
   // and its left, right, bottom, top, near and far parameters are, respectively,
   // (-5, 5, -5, 5, 0.5, 500).    
   const shadow = mainLight.shadow;
   shadow.mapSize.width = shadowMapSize;
   shadow.mapSize.height = shadowMapSize;
   shadow.camera.near = shadowNear;
   shadow.camera.far = shadowFar;
   shadow.camera.left = -shadowSide / 2;
   shadow.camera.right = shadowSide / 2;
   shadow.camera.bottom = -shadowSide / 2;
   shadow.camera.top = shadowSide / 2;

   scene.add(ambientLight);
   scene.add(mainLight);

   return mainLight;
};