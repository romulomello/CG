// Mouse variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

export function mouseRotation(mesh) {
    targetX = mouseX * .001;
    targetY = mouseY * .001;
    if (mesh) {
       mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
       mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
       mesh.position.x += 0.05 * (mouseX*0.05 - mesh.position.x);
       mesh.position.y -= (0.005 * (mouseY*0.03 + mesh.position.y))-0.10;
    }
 }
 
 export function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
 }