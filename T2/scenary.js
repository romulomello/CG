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
    level1.castShadow = true;
    group.add(level1)
    const level2 = new THREE.Mesh(
        new THREE.ConeGeometry(2,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00, transparent: true })
    )
    level2.position.x = x
    level2.position.y = 4
    level2.position.z = z
    //level2.castShadow = true;
    group.add(level2)
    const level3 = new THREE.Mesh(
        new THREE.ConeGeometry(3,2,8),
        new THREE.MeshLambertMaterial({color:0x00ff00, transparent: true })
    )
    level3.position.x = x
    level3.position.y = 3
    level3.position.z = z
    level3.castShadow = true;
    group.add(level3)
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5,0.5,2),
        new THREE.MeshLambertMaterial({color:0xbb6600, transparent: true })
    )
    trunk.position.x = x
    trunk.position.y = 1
    trunk.position.z = z
    trunk.castShadow = true;
    group.add(trunk);

    group.name = "tree";
    return group;
  }

 export function addTrees(plane, width, length, showHelper = false) { 
    let n = Math.round(Math.random()/1.3);
    for (let j = 0; j < n; j++) {
      let x = -width/2 + 3.0 + Math.random() * (width - 6.0);
      let z = -length/2 + Math.random() * length;
      let newTree = createTree(x, z);
      newTree.rotateX(degreesToRadians(90));
      var box = new THREE.Box3().setFromObject( newTree );

      if(showHelper) {
        let helper = new THREE.Box3Helper( box, 0xffff00 );
        plane.add( helper );
      }
      //newTree.castShadow = true;
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
  let lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  let material = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, transparent: true });
  let cubeGeometry = new THREE.BoxGeometry(width, length, height);
  let cubeLeft = new THREE.Mesh(cubeGeometry, material);
  cubeLeft.position.set(-width, 0, height/2);
  cubeLeft.name = "left wall";
  let cubeRight = new THREE.Mesh(cubeGeometry, material);
  cubeRight.position.set(width, 0, height/2);
  cubeRight.name = "right wall";
  let edgesLeft = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), lineMaterial);
  let edgesRight = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), lineMaterial);
  cubeLeft.add(edgesLeft);
  cubeRight.add(edgesRight);
  cubeLeft.receiveShadow = true;
  cubeRight.receiveShadow = true;
  plane.add(cubeLeft);
  plane.add(cubeRight);
}