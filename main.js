// For each Site, create a Star
// For each Story within a site (up to 10) create a Planet
// For each Planet, scale the size based on the number of pageviews
// For each planet, add a moon for each share on Facebook and Twitter
// For each moon, scale the size based on the engagement rate of the social post



var Config = {
  selector: 'visualization',
  fov: 60,
  near_plane: 1,
  far_plane: 1000
};

var Colors = {
  purple: '#5c4b51',
  blue: '#8dbeb2',
  cream: '#f2ebbe',
  orange: '#f3b560',
  red: '#f06361'
};

// THREEJS RELATED VARIABLES

var scene,
    camera,
    aspectRatio,
    renderer,
    container;

//SCREEN & MOUSE VARIABLES

var HEIGHT,
    WIDTH,
    mousePos = { x: 0, y: 0 };


// Create ThreeJS Scene and Camera
function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;

  camera = new THREE.PerspectiveCamera(
    Config.fov,
    aspectRatio,
    Config.near_plane,
    Config.far_plane
  );

  //scene.fog = new THREE.Fog(Colors.cream, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 0;


  // controls
  controls = new THREE.OrbitControls( camera );
  controls.minDistance = 200;
  controls.maxDistance = 1000;

  // Set up WebGL Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  // Width and Height match size of screen
  renderer.setSize(WIDTH, HEIGHT);

  // Enable Shadows
  renderer.shadowMap.enabled = true;

  // Select and Append Container
  container = document.getElementById(Config.selector);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

// Handle Resize
function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

// Light the scene
var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(Colors.blue,Colors.purple, .9)
  shadowLight = new THREE.DirectionalLight(Colors.red, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);

}

Planet = function(options){
  var geom = new THREE.IcosahedronGeometry( 50, 1 ); // PLANET RADIUS SET HERE
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: Colors.blue, // PLANET COLOR SET HERE
    transparent: false,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
}

Moon = function(options) {
  var geom = new THREE.IcosahedronGeometry(10, 0);  // MOON RADIUS SET HERE
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: Colors.orange,
    transparent: false,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
}

// 3D Models
var planet, moon, parent;

function createPlanet(){
  planet = new Planet();
  planet.mesh.position.y = 0;
  scene.add(planet.mesh);
}

function createMoon(){
  parent = new THREE.Object3D();
  scene.add( parent );

  moon = new Moon();
  moon.mesh.position.y = 80;

  var pivot1 = new THREE.Object3D();
  pivot1.rotation.z = 0;
  parent.add(pivot1)
  pivot1.add( moon.mesh );


}

function loop(){
  planet.mesh.rotation.z += .005;

  moon.mesh.rotation.z += .003
  parent.rotation.z += 0.01;
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}


function init(event){
  createScene();
  createLights();
  createMoon();
  createPlanet();
  loop();
}

window.addEventListener('load', init, false);
