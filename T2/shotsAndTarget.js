import * as THREE from 'three';

export function createTarget(targetSize) {
    // var targetGeometry = new THREE.CircleGeometry(targetSize, 32);
    // var targetMaterial = new THREE.MeshBasicMaterial({ color: "#FFFFFF" , transparent: true, opacity: 0.5});
    // var target = new THREE.Mesh(targetGeometry, targetMaterial);

    // var targetGeometry2 = new THREE.CircleGeometry(targetSize/10, 32);
    // var targetMaterial2 = new THREE.MeshBasicMaterial({ color: "#FFFFFF" , transparent: true, opacity: 1});
    // var smallTarget = new THREE.Mesh(targetGeometry2, targetMaterial2);
    // target.add(smallTarget);

    var targetGeometry1 = new THREE.BoxGeometry(targetSize, 0.25, 0.1);
    var targetMaterial = new THREE.MeshBasicMaterial({ color: "#FFFFFF" , transparent: true, opacity: 1.0});
    var target1 = new THREE.Mesh(targetGeometry1, targetMaterial);
    target1.rotateZ(Math.PI/4);
    target1.position.x -= 1;
    target1.position.y -= 1;

    var targetGeometry2 = new THREE.BoxGeometry(targetSize, 0.25, 0.1);
    var target2 = new THREE.Mesh(targetGeometry2, targetMaterial);
    target2.rotateZ(-Math.PI/4);
    target2.position.x += 1;
    target2.position.y -= 1;

    var targetGeometry3 = new THREE.BoxGeometry(targetSize, 0.25, 0.1);
    var target3 = new THREE.Mesh(targetGeometry3, targetMaterial);
    target3.rotateZ(Math.PI/4);
    target3.position.x += 1;
    target3.position.y += 1;

    var targetGeometry4 = new THREE.BoxGeometry(targetSize, 0.25, 0.1);
    var target4 = new THREE.Mesh(targetGeometry4, targetMaterial);
    target4.rotateZ(-Math.PI/4);
    target4.position.x -= 1;
    target4.position.y += 1;

    var target = new THREE.Group();
    target.add(target1);
    target.add(target2);
    target.add(target3);
    target.add(target4);

    return target;
}

export function fireShot(airplane, target, shots, scene) {
    let bulletGeometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 4);
    let bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
    let bullet1 = new THREE.Mesh(bulletGeometry, bulletMaterial);
    // let bullet2 = new THREE.Mesh(bulletGeometry, bulletMaterial);
    let airplanePos = airplane.obj.getWorldPosition(new THREE.Vector3());
    bullet1.position.copy(airplanePos); 
    // bullet2.position.copy(airplanePos); 
    // bullet1.position.x -= 1;
    // bullet1.position.y -= 1.5;
    // bullet1.position.z -= 0.5;
  
    // bullet2.position.x += 1;
    // bullet2.position.y -= 1.5;
    // bullet2.position.z -= 0.5;
  
    let targetPosition = target.getWorldPosition(new THREE.Vector3());
    let dir1 = new THREE.Vector3();
    dir1.subVectors(targetPosition, bullet1.position).normalize();
    bullet1.lookAt(targetPosition);
  
    // let dir2 = new THREE.Vector3();
    // dir2.subVectors(targetPosition, bullet2.position).normalize();
    // bullet2.lookAt(targetPosition);
  
    let box1 = new THREE.Box3().setFromObject(bullet1);
    // let box2 = new THREE.Box3().setFromObject(bullet2);
  
    shots.add({ obj: bullet1, targetPos: targetPosition, dir: dir1, box: box1 });
    // shots.add({ obj: bullet2, targetPos: targetPosition, dir: dir2, box: box2 });
  
    scene.add(bullet1);
    // scene.add(bullet2);
  }