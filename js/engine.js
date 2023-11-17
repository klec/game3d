import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var camera, scene, renderer, geometry, material, mesh;
var car;

function init() {
    var container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 10, 20);

	{
		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = .2;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );
	}

	{
		const color = 0xFFFFFF;
		const intensity = 2.5;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}
    
    const gltfLoader = new GLTFLoader();
    const url = '../models/scene.gltf';
    
  
    gltfLoader.load(url,
        (gltf) => {
            const root = gltf.scene;
            scene.add(root);
            var cars = root.getObjectByName('Cars');
            // for (var car of cars) { 
            //     car.removeFromParent();
            // }
            cars.removeFromParent();
            console.log(dumpObject(root).join('\n'));
            console.log("cars count", cars.length);
            car = root.getObjectByName('CAR_03_1');
            // вычисляем коробку, содержащую все содержимое
            // от корня и ниже
            const box = new THREE.Box3().setFromObject(root);
        
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());
        
            // устанавливаем камеру для кадрирования коробки
            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
        
            // обновляем элементы управления трекболом для обработки нового размера
            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
                    controls.update();
                    
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
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set( 0, 5, 0 );
    controls.update();

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
    if (car) 
        car.position.x += (mouseX - car.position.x) * .3;
    // camera.position.x += ( mouseX - camera.position.x ) * .003;
    // camera.position.y += ( - mouseY - camera.position.y ) * .005;
    // camera.lookAt( scene.position );
    renderer.render( scene, camera );
}

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
   
    // вычисляем единичный вектор, который указывает в том направлении, в котором сейчас находится камера
    // из центра коробки
    const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
   
    // перемещаем камеру на расстояние в единицу расстояния от центра
    // в каком направлении камера уже была из центра
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
   
    // выбираем несколько ближних и дальних значений для усеченной пирамиды, которая
    // будет содержать поле.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
   
    camera.updateProjectionMatrix();
   
    // наводим камеру так, чтобы она смотрела в центр коробки
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}
  
init();
animate();