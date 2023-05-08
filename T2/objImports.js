import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import {ColladaLoader} from '../build/jsm/loaders/ColladaLoader.js';

export function loadOBJFile( path, name ){
 
   return new Promise(function( resolve, reject ){
   
     var mtlLoader = new MTLLoader();
     
     mtlLoader.setPath( path );
     mtlLoader.load( name + ".mtl", function( materials ){
     
         materials.preload();
         
         var objLoader = new OBJLoader();
         
         objLoader.setMaterials( materials );
         objLoader.setPath( path );
         objLoader.load( name + ".obj", resolve );
         
     });
    
   });
   
}

export function loadDAEFile( path, name ){
 
   return new Promise(function( resolve, reject ){
            
      var objLoader = new ColladaLoader();
      
      objLoader.setPath( path );
      objLoader.load( name + ".dae", resolve );
    
   });
   
}