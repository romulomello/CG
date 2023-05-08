// Mouse variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

export function mouseRotation(mesh,settings) {
    targetX = mouseX * .0005;
    targetY = mouseY * .0005;
    if (mesh) {
       mesh.rotation.y += 0.009 * (targetX - mesh.rotation.y);
       mesh.rotation.x += 0.08 * (targetY - mesh.rotation.x);
       mesh.rotation.z += 0.2 * (targetX - mesh.rotation.z);
       mesh.position.x += (0.1*settings.sensX) * (mouseX*0.05 - mesh.position.x);
       mesh.position.y += (0.02*settings.sensY) * (mouseY*0.03 - mesh.position.y)+0.40*settings.sensY;
    }
 }
 
 export function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
 }