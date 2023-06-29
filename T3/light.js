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

export function initDirLight(scene){
    const light_dir = new THREE.DirectionalLight( 0xffffff, 1.5 ); // Cria uma luz direcional na cor branca
    light_dir.position.set(8*6, 14*3, 0);
    light_dir.castShadow = true;

    // Configurar a resolução das sombras
    light_dir.shadow.mapSize.width = 3000;
    light_dir.shadow.mapSize.height = 3000;

    // Definir a área de projeção das sombras
    light_dir.shadow.camera.near = 0.1;
    light_dir.shadow.camera.far = 1200;

    light_dir.shadow.camera.left = -200;
    light_dir.shadow.camera.right = 1000;
    light_dir.shadow.camera.top = 300;
    light_dir.shadow.camera.bottom = -80;
    light_dir.shadow.bias = -0.001;

    scene.add(light_dir);
    return light_dir;
}

/**
 * Initialize a simple camera and point it at the center of a scene
 *
 * @param {THREE.Vector3} [initialPosition]
 */
export function initCamera(initialPosition) {
    var position = (initialPosition !== undefined) ? initialPosition : new THREE.Vector3(-30, 40, 30);
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3500);
    camera.position.copy(position);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // or camera.lookAt(0, 0, 0);
    //camera.up.set(0, 1, 0); // That's the default value
    return camera;
 }