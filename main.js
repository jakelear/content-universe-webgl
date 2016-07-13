// For each Site, create a Star
// For each Story within a site (up to 10) create a Planet
// For each Planet, scale the size based on the number of pageviews
// For each planet, add a moon for each share on 'Facebook' and 'Twitter'
// For each moon, scale the size based on the engagement rate of the social post

var Config = {
  selector: 'visualization',
  camera_base_speed: 10000,
  fov: 60,
  near_plane: 1,
  far_plane: 1500000,
  max_star_size: 100000,
  closeness_threshhold: 2000,
};

var Colors = {
  purple: '#5c4b51',
  blue: '#8dbeb2',
  cream: '#f2ebbe',
  orange: '#f3b560',
  red: '#f06361',
  twitter: '#00eaff',
  facebook: '#246bec',
  sites: {
    polygon: '#f7f56b',
    vox: '#f1e301',
    recode: '#f13901',
    verge: '#ff800f',
    sbnation: '#db0404',
    curbed: '#285986',
    eater: '#ff370f',
    racked: '#ffa289',
    voxcreative: '#8b4af7'
  }
};

var Sites = {
  polygon:          {name: 'Polygon', radius: 0, color: Colors.sites.polygon,  coordinates: {x: 0, y: 0, z: 0}},
  // voxcreative:      {name: 'Vox Creative', radius: 0, color: Colors.sites.voxcreative,   coordinates: {x: 0, y: 0, z: 0}},
  // racked:           {name: 'Racked', radius: 0, color: Colors.sites.racked,  coordinates: {x: 20000, y: -10012, z: 23100}},
  // recode:           {name: 'Recode', radius: 0, color: Colors.sites.recode,  coordinates: {x: -10000, y: -50000, z: 198072}},
  // curbed:           {name: 'Curbed', radius: 0, color: Colors.sites.curbed,  coordinates: {x: 100000, y: -30000, z: 323045}},
  // eater:            {name: 'Eater', radius: 0, color: Colors.sites.eater,  coordinates: {x: -300000, y: 6800, z: -112304}},
  // polygon:          {name: 'Polygon', radius: 0, color: Colors.sites.polygon,  coordinates: {x: -200000, y: -201300, z: -10000}},
  // vox:              {name: 'Vox', radius: 0, color: Colors.sites.vox,  coordinates: {x: 10000, y: 50000, z: 480000}},
  // verge:            {name: 'The Verge', radius: 0, color: Colors.sites.verge,  coordinates: {x: -200000, y: -104000, z: -100}},
  // sbnation:         {name: 'SB Nation', radius: 0, color: Colors.sites.sbnation,  coordinates: {x: 50000, y: 220000, z: 6500}}
};

// THREEJS RELATED VARIABLES

// Camera Vars
var radius = 6371;
var tilt = 0.41;
var rotationSpeed = 0.2;

// Objects
var scene,
    camera,
    aspectRatio,
    renderer,
    controls,
    clock,
    container,
    animframe;

// Container for scene objects (only clickable elems go in here)
var sceneObjects = [], meshcount;

var pause = false;
var control_type = 'orbital';

var HEIGHT,
    WIDTH;

// Create ThreeJS Scene and Camera
function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;

  camera = new THREE.PerspectiveCamera( Config.fov, aspectRatio, Config.near_plane, Config.far_plane );

  //scene.fog = new THREE.Fog(Colors.cream, 10000,55000);
  scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );
  camera.position.setZ(50000);

   // Set up WebGL Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  // Width and Height match size of screen
  renderer.setSize(WIDTH, HEIGHT);

  // Enable Shadows
  renderer.shadowMap.enabled = true;

  // Select and Append Container
  container = document.getElementById(Config.selector);
  container.appendChild(renderer.domElement);

  // controls

  if (control_type == 'orbital') {
    /////////////////////////////////////////////
    controls = new THREE.OrbitControls(camera);
    controls = new THREE.OrbitControls( camera );
    controls.minDistance = 200;
    controls.maxDistance = Config.far_plane / 2;
    /////////////////////////////////////////////
  } else if (control_type == 'fly') {
    /////////////////////////////////////////////
    controls = new THREE.FlyControls( camera );
    controls.movementSpeed = Config.camera_base_speed;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;
    /////////////////////////////////////////////
  }

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
  var geom = new THREE.IcosahedronGeometry ( options.radius, 1 ); // Star radius goes here
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: options.color,
    transparent: false,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = false;
  this.mesh.position.set(options.coordinates.x, options.coordinates.y, options.coordinates.z);
};

Planet = function(options){
  var geom = new THREE.IcosahedronGeometry( options.radius, options.detail );
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  var mat = new THREE.MeshPhongMaterial({
    color: options.color,
    transparent: false,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
  if (options.coordinates != null) {
    this.mesh.position.set(options.coordinates.x, options.coordinates.y, options.coordinates.z);
  }
};

// 3D Models
var stars = [], planets = [], moons = [];

// Orbital containers
var moon_pivot_containers = [], planet_pivot_containers = [];

// Creator Methods:
// These instantiate the object and then do any post-creation
// manipulation and add the object to the scene
function createStar(options) {
  // Create new star
  var star = new Star(options);

  // Add this star to the stars array
  stars.push(star);

  // Add this star to the scene
  scene.add(star.mesh);
  sceneObjects.push(star.mesh);
}

function createPlanet(options) {

  var container = new THREE.Object3D();
  planet_pivot_containers.push (container);
  container.position.set(options.parent.coordinates.x, options.parent.coordinates.y, options.parent.coordinates.z);
  scene.add(container);

  // create a new planet
  console.log(options.coordinates);
  var planet = new Planet(options);

  // add this planet to the planets array
  planets.push(planet);

  // Add the planet to the container, which is in the scene
  var pivot = new THREE.Object3D();
  pivot.rotation.z = 0;
  container.add(pivot)
  pivot.add(planet.mesh);
  sceneObjects.push(planet.mesh);
  planet.pivot = pivot;

  return planet;
}

function createMoon(options){
  var container = new THREE.Object3D();
  moon_pivot_containers.push (container);

  // When creating a moon, add a container that will hold it
  // and allow it to pivot around a planet
  // The container's coordinates should match those of the parent planet - so that the moon orbits the appropriate planet
  container.position.set(options.parent.mesh.position.x, options.parent.mesh.position.y, options.parent.mesh.position.z);

  options.parent.pivot.add(container);

  var moon = new Planet(options);
  moons.push(moon);

  var pivot = new THREE.Object3D();
  pivot.rotation.z = 0;
  container.add(pivot)
  pivot.add( moon.mesh );
}

function distanceToNearestMesh() {
  var distances = [];
  for (var i=0; i < meshcount; i++) {
    distances.push(camera.position.distanceTo(sceneObjects[i].position))
  }
   return Math.min.apply( Math, distances );
}

// Main render loop - updates every animation frame tick
function loop(){
  if (control_type == 'fly') {
    var delta = clock.getDelta();
    controls.update(delta);
  }

  if ( pause ) {
    return;
  }

  var d = distanceToNearestMesh();
  // Slow down when we get closer than Config.closeness_threshhold to a body
  if (d < Config.closeness_threshhold) {
    controls.movementSpeed = 1500;
  } else {
    controls.movementSpeed = Config.camera_base_speed;

  }

  //console.log('distance:', d);
  //console.log('Speed:', controls.movementSpeed);

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

  // Iterate over the moons and rotate
  num_moon_pivots = moon_pivot_containers.length;
  for (var i = 0; i < num_moon_pivots; i++) {
    moon_pivot_containers[i].rotation.z += 0.2 / (i+1);
  }

  // Iterate over the planet containers and rotate
  num_planet_pivots = planet_pivot_containers.length;
  for (var i = 0; i < num_planet_pivots; i++) {
    planet_pivot_containers[i].rotation.z += 0.005 / (i+1);
  }

  renderer.render(scene, camera);

  animframe = requestAnimationFrame(loop);
}

// function for destroying and resetting
function destroy() {
    cancelAnimationFrame(animframe);// Stop the animation
    scene = null;
    camera = null;
    controls = null;
    container = document.getElementById(Config.selector);
    while (container.lastChild) container.removeChild(container.lastChild);
}

function reset() {
  destroy();
  init();
}

function changeControlType(type) {
  control_type = type;
  reset();
}


// Initial render chain
function init(event){
  clock = new THREE.Clock();
  createScene();
  createLights();

  // Iterate through sites and normalize the size (determined by pageviews)
  // to a max of Config.max_star_size
  var site_sizes = [];

  for (var key in data.sites) {
    var site = data.sites[key];
    site_sizes.push(site.pageviews);
  }

  // Discover the max site size and create a ratio
  // to normalize the star sizes
  var max_site_size = Math.max.apply(Math, site_sizes);
  var ratio = max_site_size / Config.max_star_size;

  // Loop over data.sites and set the sizes to the normalized values
   for (var key in data.sites) {
    var site = data.sites[key];
    site.size = Math.round(site.pageviews / ratio);
    //console.log(key, 'size: ', site.size);
  }

  // Loop over sites and set the site radius to the correct normalized size
  // and then create the stars
  for (var key in Sites) {
    if (!Sites.hasOwnProperty(key)) continue;

    var site = Sites[key];
    site.radius = data.sites[key].size;

    // create star for each site
    createStar({radius: site.radius, coordinates: site.coordinates, color: site.color});

    var planet_sizes = [];
    var stories = data.sites[key].stories;

    // Iterate over stories and add the pageviews to the planet_sizes array
    // so we can normalize it
    stories.forEach(function(story) {
      planet_sizes.push(story.pageviews);
    });

    // Discover the max story size and create a ratio
    // to normalize the planet sizes
    // Should be no larger than 50% of the parent star
    var max_planet_size = Math.max.apply(Math, planet_sizes);
    var planet_ratio = max_planet_size / (data.sites[key].size / 2);

    var planet_counter = 1;
    // Iterate over stories again and build planets for each
    stories.forEach(function(story) {
      planet_counter++;
      var size = Math.round(story.pageviews / planet_ratio);
      var coordinates =  {
        x: ((getRandom(site.radius * -1, site.radius * 3.5)) * (planet_counter)),
        y: ((getRandom(site.radius * -1, site.radius * 5.2)) * (planet_counter)),
        z: ((getRandom(site.radius * -1, site.radius * 2.5)) * (planet_counter))
      }

      // Make sure the planet coordinate isn't inside the star
      for (var coord in coordinates) {
        coord < 0 ? coord -= site.radius : coord += site.radius;
      }

      var planet = createPlanet({radius: size, coordinates: coordinates, color: pastelColors(), detail: 1, parent: Sites.polygon});

      var moon_sizes = [];
      story.social_posts.forEach(function(post) {
        var moon_size = post.engagement * 1000;
        moon_sizes.push(moon_size);
      });
      // Discover the max social post size and create a ratio
      // to normalize the moon sizes
      // Should be no larger than 33% of the parent planet
      var max_moon_size = Math.max.apply(Math, moon_sizes);
      var moon_ratio = max_moon_size / (size / 3);
      var moon_counter = 1;
      story.social_posts.forEach(function(post) {
        var moon_radius = (post.engagement * 1000) / moon_ratio;
        var color;
        if (post.platform == 'twitter') {
          color = Colors.twitter;
        } else if (post.platform == 'facebook') {
          color = Colors.facebook;
        } else {
          color = Colors.cream;
        }

        moon_counter++;
        var moon_coordinates =  {
          x: ((getRandom(size * -1, size * 1.5)) * (moon_counter)),
          y: ((getRandom(size * -1, size * 2)) * (moon_counter)),
          z: ((getRandom(size * -1, size * 1.5)) * (moon_counter))
        };

        // Make sure the planet coordinate isn't inside the star
        for (var coord in moon_coordinates) {
          coord <= 0 ? coord -= size : coord += size;
        }

        var moon = createMoon({radius: moon_radius, coordinates: moon_coordinates, color: color, detail: 0, parent: planet});
      });
    });
  }

  meshcount = sceneObjects.length;
  loop();
}

// On load fire the init
window.addEventListener('load', init, false);
document.addEventListener("keydown", function(event) {

    if ( event.altKey ) {
      return;
    }

    switch ( event.keyCode ) {

      case 32: pause = !pause; loop(); break;

    }

});
//window.document.addEventListener('click', onDocumentMouseDown, false);

// UTILS
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function pastelColors(){
    var r = (Math.round(Math.random()* 127) + 127).toString(16);
    var g = (Math.round(Math.random()* 127) + 127).toString(16);
    var b = (Math.round(Math.random()* 127) + 127).toString(16);
    return '#' + r + g + b;
}


// Dataset

var data = {
  sites: {
    polygon: {
      pageviews: 12610292,
      stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 197719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    },
    sbnation: {
      pageviews: 102817237,
      stories: [
        {
          title: '',
          image: '',
          author: '',
          pageviews: '',
          social_posts: [
            {platform: 'twitter', engagement: 0.03, title: ''},
            {platform: 'facebook', engagement: 0.11, title: ''}
          ]
        },
        {
          title: '',
          image: '',
          author: '',
          pageviews: '',
          social_posts: [
            {platform: 'twitter', engagement: 0.03, title: ''},
            {platform: 'facebook', engagement: 0.11, title: ''}
          ]
        },
        {
          title: '',
          image: '',
          author: '',
          pageviews: '',
          social_posts: [
            {platform: 'twitter', engagement: 0.03, title: ''},
            {platform: 'facebook', engagement: 0.11, title: ''}
          ]
        }
      ]
    },
    recode: {
      pageviews: 1460330,
       stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]

    },
    verge: {
      pageviews: 21103987,
       stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    },
    curbed: {
      pageviews: 4183807,
       stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    },
    eater: {
      pageviews: 7101163,
       stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    },
    racked: {
      pageviews: 1191117,
       stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    },
    voxcreative: {
      pageviews: 109720,
       stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 397719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 107719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 1997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    },
    vox: {
      pageviews: 18549139,
      stories: [
        {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        },
         {
          title: 'Pokémon Go, explained',
          image: 'https://cdn0.vox-cdn.com/thumbor/4ue0mnagslvrYqQKG7bKtDsQxjE=/250x250/cdn2.vox-cdn.com/uploads/chorus_image/image/50071681/GettyImages-453583790.0.jpg',
          author: 'German Lopez',
          pageviews: 997719,
          social_posts: [
            {platform: 'twitter', engagement: 0.0610, title: 'Pokémon Go, explained', account: 'voxdotcom'},
            {platform: 'twitter', engagement: 0.0613, title: 'The Pokémon Go explainer I\'ve been waiting for', account: 'mattyglesias'},
            {platform: 'facebook', engagement: 0.123, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Vox'},
            {platform: 'facebook', engagement: 0.11, title: 'Everyone is suddenly catching Pokémon fever again. Here’s what’s going on.', account: 'Ezra Klein'}
          ]
        }
      ]
    }
  }
};


