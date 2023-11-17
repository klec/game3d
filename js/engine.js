import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var camera, scene, renderer, geometry, material, mesh;

function init() {
    var container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.x = 2.9844;
    camera.position.y = 2.0544;
    camera.position.z = 2.7973;

    var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;

    // var ambient = new THREE.AmbientLight( 0xa0a0a0 );
    // scene.add( ambient );

    // var light  = new THREE.SpotLight( 0xffeedd, 1 );
    // light.position.set( -300, 300, 210 );
    // light.target.position.set( 10, 40, 20 );
    // light.castShadow = true;

    // light.shadowCameraNear = 1200;
    // light.shadowCameraFar = 2500;
    // light.shadowCameraFov = 50;

    // //light.shadowCameraVisible = true;

    // light.shadowBias = 0.000001;
    // light.shadowDarkness = 0.5;

    // light.shadowMapWidth = SHADOW_MAP_WIDTH;
    // light.shadowMapHeight = SHADOW_MAP_HEIGHT;
    // //scene.add(light);
    
    var cube_geom = new THREE.BoxGeometry(100,100,100);
    var cube = new THREE.Mesh(cube_geom, new THREE.MeshLambertMaterial({color:0xaabbcc}));
    cube.receiveShadow = true;
    cube.castShadow = true;
    //scene.add(cube);
    
    const gltfLoader = new GLTFLoader();
    // const gltfLoader = new OBJLoader();
    const url = '../models/scene.gltf';
    
    
    gltfLoader.load(url,
        (gltf) => {
            const root = gltf.scene;
            scene.add(root);
            
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.shadows = true;
    renderer.shadowType = 1;
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    const controls = new OrbitControls( camera, renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.render(scene, camera);
    
}
function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX ) / 6;
    mouseY = ( event.clientY - windowHalfY ) / 6;

}
function animate() {

    // Include examples/js/RequestAnimationFrame.js for cross-browser compatibility.
    requestAnimationFrame( animate );
    camera.position.x += ( mouseX - camera.position.x ) * .003;
    camera.position.y += ( - mouseY - camera.position.y ) * .005;
    camera.lookAt( scene.position );
    renderer.render( scene, camera );
}
init();
animate();