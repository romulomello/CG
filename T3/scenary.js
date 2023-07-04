import * as THREE from 'three';

export function createGroundPlane(width, height, widthSegments = 10, heightSegments = 10, gcolor = null) {
  if (!gcolor) gcolor = "rgb(200,200,200)";
  const planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, transparent: true });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true; 

  plane.name = "plane";
  return plane;
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
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const material = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, transparent: true });
  const cubeGeometry = new THREE.BoxGeometry(width, length, height);
  const cubeLeft = new THREE.Mesh(cubeGeometry, material);
  cubeLeft.position.set(-width, 0, height/2);
  cubeLeft.name = "left wall";
  const cubeRight = new THREE.Mesh(cubeGeometry, material);
  cubeRight.position.set(width, 0, height/2);
  cubeRight.name = "right wall";
  const edgesLeft = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), lineMaterial);
  const edgesRight = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), lineMaterial);
  cubeLeft.add(edgesLeft);
  cubeRight.add(edgesRight);
  cubeLeft.receiveShadow = true;
  cubeLeft.material.transparent = false;
  cubeLeft.material.opacity = 1;
  cubeRight.receiveShadow = true;
  cubeRight.material.transparent = false;
  cubeRight.material.opacity = 1;
  plane.add(cubeLeft);
  plane.add(cubeRight);
}

function setElementPosition(element, wall, width, length, height) {
  const random_y = Math.random() * length;
  const random_z = Math.random() * height;
  const x = -wall.position.x / Math.abs(wall.position.x) * width/2;
  const y = random_y;
  const z = random_z - height/2;
  element.position.set(x, y, z);
}

function setElementPositionTop(element, wall, width, length, height) {
  const random_x = Math.random() * width;
  const random_y = Math.random() * length;
  const x = wall.position.x / Math.abs(wall.position.x) * (width/2 - random_x);
  const y = random_y;
  const z = height/2;
  element.position.set(x, y, z);
}

function setElementPositionFloor(element, width, length) {
  const random_x = Math.random() * width - width/2;
  const random_y = Math.random() * length;
  const x = random_x;
  const y = random_y;
  const z = 0;
  element.position.set(x, y, z);
}

export function addElements(plane, width, length, height, gcolor) {
  const material = new THREE.MeshLambertMaterial({ color: gcolor, side: THREE.DoubleSide, transparent: true });
  for (let i = 0; i < plane.children.length; i++) {
    const wall = plane.children[i];
    for (let j = 0; j < 4; j++) {
      const k = Math.random();
      if (k < 0.5) {
        const cubeWidth = 2 + Math.random() * 3;
        const cubeLength = 2 + Math.random() * 3;
        const cubeHeight = 2 + Math.random() * 3;
        const cubeGeometry = new THREE.BoxGeometry(cubeWidth, cubeLength, cubeHeight);
        const cube = new THREE.Mesh(cubeGeometry, material);
        setElementPosition(cube, wall, width, length, height);
        wall.add(cube);

        const cubeTopWidth = 2 + Math.random() * 3;
        const cubeTopLength = 2 + Math.random() * 3;
        const cubeTopHeight = 2 + Math.random() * 3;
        const cubeTopGeometry = new THREE.BoxGeometry(cubeTopWidth, cubeTopLength, cubeTopHeight);
        const cubeTop = new THREE.Mesh(cubeTopGeometry, material);
        setElementPositionTop(cubeTop, wall, width, length, height);
        wall.add(cubeTop);
      }
      else if (k < 0.75) {
        const radius = 1.5 + Math.random();
        const scaleYFactor = 1 + Math.random();
        const scaleZFactor = 1 + Math.random();
        const sphereGeometry = new THREE.SphereGeometry(radius, 32, 16);
        sphereGeometry.scale(1, scaleYFactor, scaleZFactor);
        const sphere = new THREE.Mesh(sphereGeometry, material);
        setElementPosition(sphere, wall, width, length, height);
        wall.add(sphere);

        const radiusTop = 1.5 + Math.random();
        const scaleTopXFactor = 1 + Math.random();
        const scaleTopYFactor = 1 + Math.random();
        const sphereTopGeometry = new THREE.SphereGeometry(radiusTop, 32, 16);
        sphereTopGeometry.scale(scaleTopXFactor, scaleTopYFactor, 1);
        const sphereTop = new THREE.Mesh(sphereTopGeometry, material);
        setElementPositionTop(sphereTop, wall, width, length, height);
        wall.add(sphereTop);
      }
      else {
        const radius = 1 + Math.random();
        const cylinderHeight = 2 + Math.random() * 3;
        let rotateCylinder = 0;
        if (Math.random() < 0.5) {
          rotateCylinder = Math.PI/2;
        }
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight);
        cylinderGeometry.rotateZ(rotateCylinder);
        const cylinder = new THREE.Mesh(cylinderGeometry, material);
        setElementPosition(cylinder, wall, width, length, height);
        wall.add(cylinder);

        const radiusTop = 1 + Math.random();
        const cylinderTopHeight = 2 + Math.random() * 3;
        let rotateCylinderTop = 0;
        if (Math.random() < 0.5) {
          rotateCylinderTop = Math.PI/2;
        }
        const cylinderTopGeometry = new THREE.CylinderGeometry(radiusTop, radiusTop, cylinderTopHeight);
        cylinderTopGeometry.rotateX(rotateCylinderTop);
        const cylinderTop = new THREE.Mesh(cylinderTopGeometry, material);
        setElementPositionTop(cylinderTop, wall, width, length, height);
        wall.add(cylinderTop);
      }
    }
  }
  for (let j = 0; j < 2; j++) {
    const k = Math.random();
    if (k < 0.5) {
      const cubeFloorWidth = 2 + Math.random() * 3;
      const cubeFloorLength = 2 + Math.random() * 3;
      const cubeFloorHeight = 2 + Math.random() * 3;
      const cubeFloorGeometry = new THREE.BoxGeometry(cubeFloorWidth, cubeFloorLength, cubeFloorHeight);
      const cubeFloor = new THREE.Mesh(cubeFloorGeometry, material);
      setElementPositionFloor(cubeFloor, width, length);
      plane.add(cubeFloor);
    }
    else if (k < 0.75) {
      const radiusFloor = 1.5 + Math.random();
      const scaleFloorXFactor = 1 + Math.random();
      const scaleFloorYFactor = 1 + Math.random();
      const sphereFloorGeometry = new THREE.SphereGeometry(radiusFloor, 32, 16);
      sphereFloorGeometry.scale(scaleFloorXFactor, scaleFloorYFactor, 1);
      const sphereFloor = new THREE.Mesh(sphereFloorGeometry, material);
      setElementPositionFloor(sphereFloor, width, length);
      plane.add(sphereFloor);
    }
    else {
      const radiusFloor = 1 + Math.random();
      const cylinderFloorHeight = 2 + Math.random() * 3;
      let rotateCylinderFloor = 0;
      if (Math.random() < 0.5) {
        rotateCylinderFloor = Math.PI/2;
      }
      const cylinderFloorGeometry = new THREE.CylinderGeometry(radiusFloor, radiusFloor, cylinderFloorHeight);
      cylinderFloorGeometry.rotateZ(rotateCylinderFloor);
      const cylinderFloor = new THREE.Mesh(cylinderFloorGeometry, material);
      setElementPositionFloor(cylinderFloor, width, length);
      plane.add(cylinderFloor);
    }
  }
}

export function applyTexture(texture, plane) {
  plane.traverse( function( node ) {
    if ( node instanceof THREE.Mesh ) { 
      node.material.map = texture;
    }
  })
}

export function playAudio(audioFile, camera, volume, detune) {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const audioLoader = new THREE.AudioLoader();
  
  audioLoader.load(audioFile, function(buffer) {
    const sound = new THREE.Audio(listener);
    sound.setBuffer(buffer);
    sound.setVolume(volume);
    sound.detune = detune;
    sound.play();
  });
}
