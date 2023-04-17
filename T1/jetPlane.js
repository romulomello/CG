import * as THREE from  'three';
import { degreesToRadians } from "../libs/util/util.js";

function createCylinder(radiusTop, radiusBottom, height, radialSegments, color, heightSegments, openEnded)
{
  var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
  var material = new THREE.MeshPhongMaterial({color: color});
  var object = new THREE.Mesh(geometry, material);
    object.castShadow = true;
  return object;
}

function createCircle(radius, segments, color){
  var geometry = new THREE.CircleGeometry( radius, segments );
  var material = new THREE.MeshBasicMaterial( { color: color } );
  var circle = new THREE.Mesh( geometry, material );
  return circle;
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

export function createPartialEllipsoid(length, aspect, color, segments = 100, b = 10) {
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

function createTorus(){
  var geometry = new THREE.TorusGeometry( 3, 1.7, 30, 100 );
  var material = new THREE.MeshBasicMaterial( { color: 'black' } );
  var torus = new THREE.Mesh( geometry, material );
  return torus
}

export function createRetangular (x, y, z, color){
  var geometry = new THREE.BoxGeometry(x, y, z);
  var material = new THREE.MeshBasicMaterial( {color: color} );
  var retangular = new THREE.Mesh( geometry, material );
  return retangular;
}

export function createJetPlane() {
  let body = new THREE.Group();

  let color3 = "#525254";
  let color1 = "#0B165A";
  let color2 = "rgb(180,180,180)";

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

  let tailplane = createRetangular(6, 0.1, 2, color3);
  tailplane.position.set(0.0, 0.0, 22.0);
  body.add(tailplane);

  let wing_left = createRetangular(20, 0.3, 3, color3);
  wing_left.position.set(0, 2, 10.0);
  body.add(wing_left);

  let aste_l = createRetangular(6, 0.1, 0.1, color3);
  aste_l.position.set(2, 0, 10.0);
  aste_l.rotation.set(0,0,0.6)
  body.add(aste_l);

  let aste_r = createRetangular(6, 0.1, 0.1, color3);
  aste_r.position.set(-2, 0, 10.0);
  aste_r.rotation.set(0,0,-0.6)
  body.add(aste_r);

  let wing_right = createRetangular(8, 0.3, 3, color3);
  wing_right.position.set(-5, 0, 10.0);
  //body.add(wing_right);

  let leme = createRetangular(3, 0.1, 2, color3);
  leme.position.set(0, 1.5, 22);
  leme.rotation.set(0,0,Math.PI/2)
  body.add(leme);

  let trem_p_l = createRetangular(2, 0.2, 0.2, color3);
  trem_p_l.position.set(-1, -2, 10.0);
  trem_p_l.rotation.set(0,0,1)
  body.add(trem_p_l);

  let trem_p_r = createRetangular(2, 0.2, 0.2, color3);
  trem_p_r.position.set(1, -2, 10.0);
  trem_p_r.rotation.set(0,0,-1)
  body.add(trem_p_r);

  let wheel_l = createTorus();
  wheel_l.position.set(-1.5, -2.6, 10.0);
  wheel_l.scale.set(0.1,0.1,0.1);
  wheel_l.rotation.set(0,1.5,0);
  body.add(wheel_l);

  let wheel_r = createTorus();
  wheel_r.position.set(1.5, -2.6, 10.0);
  wheel_r.scale.set(0.1,0.1,0.1);
  wheel_r.rotation.set(0,1.5,0);
  body.add(wheel_r);
   
  let frontBeak = createPartialEllipsoid(4, 0.0175, color2, 500, 1.2);
  frontBeak.position.set(0.0, 0.0, -4.0);
  body.add(frontBeak);
  
  let beak = createCylinder(0.125, 0.015, 0.2, 32, color1);
  beak.position.set(0.0, -0.0, -4.05);
  beak.rotateX(Math.PI/2);
  body.add(beak);
  
  let cockpit = createSphere(1, 16, 32, "#D8DCF9");
  cockpit.position.set(0.0, 1.1, 4.0);
  cockpit.scale.set(1, 1, 2);
  cockpit.rotateX(degreesToRadians(-5));
  body.add(cockpit);

  let circle_r = createCircle(1, 4, 'yellow');
  circle_r.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_r.position.set(6, 2.153, 10);
  body.add(circle_r);

  let circle_l = createCircle(1, 4, 'yellow');
  circle_l.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_l.position.set(-6, 2.153, 10);
  body.add(circle_l);

  let circle_r_out = createCircle(1.3, 32, 'red');
  circle_r_out.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_r_out.position.set(6, 2.151, 10);
  body.add(circle_r_out);

  let circle_l_out = createCircle(1.3, 32, 'red');
  circle_l_out.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_l_out.position.set(-6, 2.151, 10);
  body.add(circle_l_out);

  let circle_r_back = createCircle(0.4, 4, 'yellow');
  circle_r_back.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_r_back.position.set(1.7, 0.12, 22);
  body.add(circle_r_back);

  let circle_l_back = createCircle(0.4, 4, 'yellow');
  circle_l_back.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_l_back.position.set(-1.7, 0.12, 22);
  body.add(circle_l_back);

  let circle_r_out_back = createCircle(0.6, 32, 'red');
  circle_r_out_back.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_r_out_back.position.set(1.7, 0.11, 22);
  body.add(circle_r_out_back);

  let circle_l_out_back = createCircle(0.6, 32, 'red');
  circle_l_out_back.rotation.set(-Math.PI/2,0,0,"XYZ");
  circle_l_out_back.position.set(-1.7, 0.11, 22);
  body.add(circle_l_out_back);
  return body;  

}

export function createHelix()
{
  let helix_l = createPartialEllipsoid(4, 0.5, "rgb(200,200,200)");
  let helix_r = createPartialEllipsoid(4, 0.5, "rgb(200,200,200)");
  helix_l.scale.set(0.1,0.1, 1);
  helix_l.rotation.set(0, Math.PI/2, 0, 'XYZ');
  helix_l.position.set(-4, 0, -3);
  helix_r.scale.set(0.1,0.1, 1);
  helix_r.rotation.set(0, -Math.PI/2, 0, 'XYZ');
  helix_r.position.set(4, 0, -3);
  let helix = new THREE.Group();
  helix.add(helix_l);
  helix.add(helix_r);
  return helix;
}