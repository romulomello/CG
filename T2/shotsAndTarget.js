import * as THREE from 'three';

export function createTarget(targetSize) {
    var targetGeometry1 = new THREE.BoxGeometry(targetSize, 0.25 * targetSize, 0.1 * targetSize);
    var targetMaterial = new THREE.MeshBasicMaterial({ color: "#FFFFFF" , transparent: true, opacity: 1.0});
    var target1 = new THREE.Mesh(targetGeometry1, targetMaterial);
    target1.rotateZ(Math.PI/4);
    target1.position.x -= targetSize;
    target1.position.y -= targetSize;

    var targetGeometry2 = new THREE.BoxGeometry(targetSize, 0.25 * targetSize, 0.1 * targetSize);
    var target2 = new THREE.Mesh(targetGeometry2, targetMaterial);
    target2.rotateZ(-Math.PI/4);
    target2.position.x += targetSize;
    target2.position.y -= targetSize;

    var targetGeometry3 = new THREE.BoxGeometry(targetSize, 0.25 * targetSize, 0.1 * targetSize);
    var target3 = new THREE.Mesh(targetGeometry3, targetMaterial);
    target3.rotateZ(Math.PI/4);
    target3.position.x += targetSize;
    target3.position.y += targetSize;

    var targetGeometry4 = new THREE.BoxGeometry(targetSize, 0.25 * targetSize, 0.1 * targetSize);
    var target4 = new THREE.Mesh(targetGeometry4, targetMaterial);
    target4.rotateZ(-Math.PI/4);
    target4.position.x -= targetSize;
    target4.position.y += targetSize;

    var target = new THREE.Group();
    target.add(target1);
    target.add(target2);
    target.add(target3);
    target.add(target4);

    return target;
}

export function fireShot(source, target, shots, scene) {
    let bulletGeometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 4);
    let bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
    let bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    let position = source.getWorldPosition(new THREE.Vector3());
    bullet.position.copy(position);
  
    let targetPosition = target.getWorldPosition(new THREE.Vector3());
    let dir = new THREE.Vector3();
    dir.subVectors(targetPosition, bullet.position).normalize();
    bullet.lookAt(targetPosition);
  
    let box = new THREE.Box3().setFromObject(bullet);
  
    shots.add({ obj: bullet, targetPos: targetPosition, dir: dir, box: box });
    scene.add(bullet);

  }