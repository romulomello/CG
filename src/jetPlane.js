import * as THREE from  'three';
import { degreesToRadians } from "../libs/util/util.js";

function createPartialEllipsoid(length, aspect, color, segments = 100, b = 10) {
    let group = new THREE.Group();
  
    for (let i = 0; i < segments; i++) {
      let h1 = Math.log10(i * aspect + b);
      let h2 = Math.log10((i + 1) * aspect + b);
      let cylinder = createCylinder(h1, h2, length / segments, 32, color);
      cylinder.rotateX(-Math.PI/2);
      cylinder.position.set(0.0, 0.0, i*(length / segments) + 0.5 * length / segments);
      group.add(cylinder);
    }
    return group;
  }

  
function createCylinder(radiusTop, radiusBottom, height, radialSegments, color, heightSegments, openEnded)
{
  var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
  var material = new THREE.MeshPhongMaterial({color: color});
  var object = new THREE.Mesh(geometry, material);
    object.castShadow = true;
  return object;
}

function createSphere(radius, widthSegments, heightSegments, color)
{
  var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI);
  var material = new THREE.MeshPhongMaterial({color: color});
  var object = new THREE.Mesh(geometry, material);
    object.castShadow = true;
    object.position.set(0.0, radius, 0.0);
  return object;
}

export function createJetPlane() {
  let body = new THREE.Group();

  let color1 = "rgb(255,0,0)";
  let color2 = "rgb(230,120,50)";

  let frontBody = createPartialEllipsoid(10, 0.75, color1);
  // frontBody.position.set(0.0, 0.0, 0.0);
  body.add(frontBody);
  console.log(body);
  
  let backBody = createPartialEllipsoid(10, 0.75, color1);
  backBody.position.set(0.0, 0.0, 20.0);
  backBody.rotateX(Math.PI);
  body.add(backBody);

  let middleBody = createCylinder(1.0, 0.3, 2.0, 32, color2);
  middleBody.rotateX(-Math.PI/2);
  middleBody.position.set(0.0, 0.0, 21.0);
  body.add(middleBody);
  
  let backBeak = createCylinder(0.3, 0.15, 0.25, 32, color1);
  backBeak.rotateX(-Math.PI/2);
  backBeak.position.set(0.0, 0.0, 22.125);
  body.add(backBeak);
  
  let frontBeak = createPartialEllipsoid(4, 0.0175, color2, 500, 1.2);
  frontBeak.position.set(0.0, 0.0, -4.0);
  // frontBeak.rotateX(degreesToRadians(5));
  // frontBeak.scale.set(1.2, 1.2, 1.0);
  body.add(frontBeak);
  
  let beak = createCylinder(0.125, 0.015, 0.2, 32, color1);
  beak.position.set(0.0, -0.0, -4.05);
  beak.rotateX(Math.PI/2);
  body.add(beak);
  
  let cockpit = createSphere(1, 16, 32, color2);
  cockpit.position.set(0.0, 1.1, 4.0);
  cockpit.scale.set(1, 1, 2);
  cockpit.rotateX(degreesToRadians(-5));
  body.add(cockpit);

  return body;

}