import * as THREE from 'three';
import { degreesToRadians } from "../libs/util/util.js";

export function createGroundPlane(width, height, widthSegments = 10, heightSegments = 10, gcolor = null) {
    if (!gcolor) gcolor = "rgb(200,200,200)";
    let planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    let planeMaterial = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, transparent: true });
  
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true; 
  
    plane.name = "plane";
    return plane;
  }

export function createTree(x, z) {
    const group = new THREE.Group()
    const level1 = new THREE.Mesh(
        new THREE.ConeGeometry(1.5,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00, transparent: true })
    )
    level1.position.x = x
    level1.position.y = 5
    level1.position.z = z
    group.add(level1)
    const level2 = new THREE.Mesh(
        new THREE.ConeGeometry(2,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00, transparent: true })
    )
    level2.position.x = x
    level2.position.y = 4
    level2.position.z = z
    group.add(level2)
    const level3 = new THREE.Mesh(
        new THREE.ConeGeometry(3,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00, transparent: true })
    )
    level3.position.x = x
    level3.position.y = 3
    level3.position.z = z
    group.add(level3)
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5,0.5,2),
        new THREE.MeshLambertMaterial({color:0xbb6600, transparent: true })
    )
    trunk.position.x = x
    trunk.position.y = 1
    trunk.position.z = z
    group.add(trunk)

    group.name = "tree";
    return group;
  }

 export function addTrees(plane, width, length) { 
    let n = Math.round(Math.random() * 2);
    for (let j = 0; j < n; j++) {
      let x = -width/2 + 1.5 + Math.random() * (width - 3.0);
      let z = -length/2 + Math.random() * length;
      let newTree = createTree(x, z);
      newTree.rotateX(degreesToRadians(90));
      plane.add(newTree);
    }
  }

  export function setOpacity( obj, opacity ) {
    obj.children.forEach((child)=>{
      setOpacity( child, opacity );
    });
    if ( obj.material ) {
      obj.material.opacity = opacity ;
    };
  };

export function addWalls(plane, width, length, height, gcolor) {
  let material = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, transparent: true });
  let cubeGeometry = new THREE.BoxGeometry(width, length, height);
  let cubeLeft = new THREE.Mesh(cubeGeometry, material);
  cubeLeft.position.set(-width, 0, height/2);
  cubeLeft.name = "left wall";
  let cubeRight = new THREE.Mesh(cubeGeometry, material);
  cubeRight.position.set(width, 0, height/2);
  cubeRight.name = "right wall";
  plane.add(cubeLeft);
  plane.add(cubeRight);
}