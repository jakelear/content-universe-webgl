// For each Site, create a Star
// For each Story within a site (up to 10) create a Planet
// For each Planet, scale the size based on the number of pageviews
// For each planet, add a moon for each share on Facebook and Twitter
// For each moon, scale the size based on the engagement rate of the social post

var Config = {
  selector: 'visualization',
  fov: 60,
  near_plane: 1,
  far_plane: 20000
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
  controls.maxDistance = 5000;

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

Star = function(options) {
  var geom = new THREE.IcosahedronGeometry ( options.radius, 2 ); // Star radius goes here
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: options.color,
    transparent: false,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = false;
  this.mesh.position.y = options.coordinates.y;
};

Planet = function(options){
  var geom = new THREE.IcosahedronGeometry( options.radius, 1 );
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: options.color,
    transparent: false,
    shading: THREE.FlatShading
  });


  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.position.y = options.coordinates.y;
  this.mesh.receiveShadow = true;
};

Moon = function(options) {
  var geom = new THREE.IcosahedronGeometry(options.radius, 0);  // MOON RADIUS SET HERE
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: Colors.orange,
    transparent: false,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
};

// 3D Models
var container;
var stars = [], planets = [], moons = [];

// Container containers!
// Store all the containers into arrays
// in order to iterate over them and set up placements and orbits
var star_containers = [], moon_containers = [], planet_containers = [];

// Creator Methods:
// These instantiate the object and then do any post-creation
// manipulation and add the object to the scene
function createStar(options) {
  // Create new star
  var star = new Star(options);

  // Add this star to the stars array
  stars.push(star);

  // Add this star to the scene
  scene.add(star.mesh)
}

function createPlanet(options) {
  // create a new planet
  var planet = new Planet(options);

  // add this planet to the planets array
  planets.push(planet);

  // Add the planet to the scene
  scene.add(planet.mesh);
}

function createMoon(options){
  container = new THREE.Object3D();

  // When creating a moon, add a container that will hold it
  // and allow it to pivot around a planet
  // The container's coordinates should match those of the parent planet
  scene.add( container );
  container.position = options.parent.mesh.position

  var radius = 10;

  var moon = new Moon({radius: 10});
  moons.push(moon);
  // Set the distance of the moon from the planet at a random
  // integer greater than 50 + 2x the size of the moon but smaller than 4x the size of the moon
  // 50 is the default size for planets, then add 2x the radius so that there is some distance
  // TODO: update to be dynamic for dynamic planet sizes
  moon.mesh.position.y = 50 + getRandomInt((2*radius), (8*radius));

  var pivot = new THREE.Object3D();
  pivot.rotation.z = 0;
  container.add(pivot)
  pivot.add( moon.mesh );
}


// Main render loop - updates every animation frame tick
function loop(){
  // Iterate over stars and rotate them
  numplanets = planets.length;
  for (var i = 0; i < numplanets; i++) {
    planets[i].mesh.rotation.z += 0.005;
  }

  // Iterate over stars and rotate them
  numstars = stars.length;
  for (var i = 0; i < numstars; i++) {
    stars[i].mesh.rotation.z += 0.002;
  }

  // Iterate over the moons and rotate
  nummoons = moons.length;
  for (var i = 0; i < nummoons; i++) {
    moons[i].mesh.rotation.z += 0.003;
  }

  container.rotation.z += 0.01;

  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

// Initial render chain
function init(event){
  createScene();
  createLights();

  // TODO: Loop over data and setup stars/planets/moons for everything
  createStar({radius: 1000, coordinates: {y: -1800, x: 0, z: 0}, color: Colors.red});
  createPlanet({radius: 50, coordinates: {y: 20, x: 0, z: 0}, color: Colors.blue});
  createMoon({parent: planets[0]});

  loop();
}

// On load fire the init
window.addEventListener('load', init, false);

// UTILS
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
