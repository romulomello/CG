import * as THREE from 'three';
import { degreesToRadians } from "../libs/util/util.js";

/**
 * Create a simple XZ plane.
 */
export function createGroundPlaneXZ(width, height, widthSegments = 10, heightSegments = 10, gcolor = null) {
    if (!gcolor) gcolor = "rgb(200,200,200)";
    let planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    let planeMaterial = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, wireframe: true });
  
    let mat4 = new THREE.Matrix4(); // Aux mat4 matrix   
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true; 
  
    return plane;
  }

export function createTree(x, z) {
    const group = new THREE.Group()
    const level1 = new THREE.Mesh(
        new THREE.ConeGeometry(1.5,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00})
    )
    level1.position.x = x
    level1.position.y = 5
    level1.position.z = z
    group.add(level1)
    const level2 = new THREE.Mesh(
        new THREE.ConeGeometry(2,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00})
    )
    level2.position.x = x
    level2.position.y = 4
    level2.position.z = z
    group.add(level2)
    const level3 = new THREE.Mesh(
        new THREE.ConeGeometry(3,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00})
    )
    level3.position.x = x
    level3.position.y = 3
    level3.position.z = z
    group.add(level3)
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5,0.5,2),
        new THREE.MeshLambertMaterial({color:0xbb6600})
    )
    trunk.position.x = x
    trunk.position.y = 1
    trunk.position.z = z
    group.add(trunk)
    return group;
  }

 export function addTrees(plane, width, length) {
    for (let j = 0; j < 100; j++) {
      let x = -width/2 + Math.random() * width;
      let z = -length/2 + Math.random() * length;
      let newTree = createTree(x, z);
      newTree.rotateX(degreesToRadians(90));
      plane.add(newTree);
    }
  }