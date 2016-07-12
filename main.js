// For each Site, create a Star
// For each Story within a site (up to 10) create a Planet
// For each Planet, scale the size based on the number of pageviews
// For each planet, add a moon for each share on Facebook and Twitter
// For each moon, scale the size based on the engagement rate of the social post

var Config = {
  selector: 'visualization',
  fov: 60,
  near_plane: 1,
  far_plane: 200000
};

var Colors = {
  purple: '#5c4b51',
  blue: '#8dbeb2',
  cream: '#f2ebbe',
  orange: '#f3b560',
  red: '#f06361',
  sites: {
    polygon: '#ff0052',
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
  polygon:          {name: 'Polygon', radius: 0, color: Colors.sites.polygon,  coordinates: {x: 4100, y: 0, z: -540}},
  vox:              {name: 'Vox', radius: 0, color: Colors.sites.vox,  coordinates: {x: 10000, y: 5000, z: 8000}},
  recode:           {name: 'Recode', radius: 0, color: Colors.sites.recode,  coordinates: {x: -10000, y: -5000, z: 19872}},
  verge:            {name: 'The Verge', radius: 0, color: Colors.sites.verge,  coordinates: {x: -20000, y: -14000, z: -10}},
  sbnation:         {name: 'SB Nation', radius: 0, color: Colors.sites.sbnation,  coordinates: {x: 20000, y: 12000, z: 650}},
  curbed:           {name: 'Curbed', radius: 0, color: Colors.sites.curbed,  coordinates: {x: 10000, y: -3000, z: 12345}},
  eater:            {name: 'Eater', radius: 0, color: Colors.sites.eater,  coordinates: {x: -10000, y: 680, z: -11234}},
  racked:           {name: 'Racked', radius: 0, color: Colors.sites.racked,  coordinates: {x: 20000, y: -12012, z: -2310}},
  voxcreative:      {name: 'Vox Creative', radius: 0, color: Colors.sites.voxcreative,  coordinates: {x: -20000, y: -1300, z: 1000}}
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

  //scene.fog = new THREE.Fog(Colors.cream, 10000,55000);
  camera.position.x = 0;
  camera.position.z = 50000;
  camera.position.y = 0;


  // controls
  controls = new THREE.OrbitControls( camera );
  controls.minDistance = 200;
  controls.maxDistance = 50000;

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
  console.log(this.mesh.position);
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
  scene.add(star.mesh)
}

function createPlanet(options) {

  var container = new THREE.Object3D();
  planet_pivot_containers.push (container);
  container.position.set(options.parent.coordinates.x, options.parent.coordinates.y, options.parent.coordinates.z);
  scene.add(container);

  // create a new planet
  var planet = new Planet(options);

  // add this planet to the planets array
  planets.push(planet);

  // Set the distance of the planet from the star at a random
  // integer greater than 50 + 2x the size of the star but smaller than 4x the size of the star
  // 300 is the default size for stars, then add 2x the radius so that there is some distance
  // TODO: update to be dynamic for dynamic planet sizes
  planet.mesh.position.y = 300 + getRandomInt((2*options.radius), (8*options.radius));

  // Add the planet to the container, which is in the scene
  var pivot = new THREE.Object3D();
  pivot.rotation.z = 0;
  container.add(pivot)
  pivot.add(planet.mesh);
  planet.pivot = pivot;
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
  // Set the distance of the moon from the planet at a random
  // integer greater than 50 + 2x the size of the moon but smaller than 4x the size of the moon
  // 50 is the default size for planets, then add 2x the radius so that there is some distance
  // TODO: update to be dynamic for dynamic planet sizes
  moon.mesh.position.y = 50 + getRandomInt((2*options.radius), (8*options.radius));

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

  // Iterate over the moons and rotate
  num_moon_pivots = moon_pivot_containers.length;
  for (var i = 0; i < num_moon_pivots; i++) {
    moon_pivot_containers[i].rotation.z += 0.005 / (i+1);
  }

  // Iterate over the planet containers and rotate
  num_planet_pivots = planet_pivot_containers.length;
  for (var i = 0; i < num_planet_pivots; i++) {
    planet_pivot_containers[i].rotation.z += 0.005 / (i+1);
  }

  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

// Initial render chain
function init(event){
  createScene();
  createLights();


  // Loop over sites and place the stars & each system container
  for (var key in Sites) {
    if (!Sites.hasOwnProperty(key)) continue;

    var site = Sites[key];
    site.radius = 300;//getRandomInt(300, 1000);
    // Limited to only build one for now: TODO - remove
    //if (site = Sites['polygon']) {
      //createStar({radius: site.radius, coordinates: site.coordinates, color: site.color});
    //}
    createStar({radius: site.radius, coordinates: site.coordinates, color: site.color});
  }

  createPlanet({radius: 50, coordinates: {y: 200, x: 300, z: 300}, color: Colors.blue, detail: 1, parent: Sites.polygon});
  createPlanet({radius: 50, coordinates: {y: -1000, x: -500, z: -300}, color: Colors.red, detail: 1, parent: Sites.polygon});
  createPlanet({radius: 50, coordinates: {y: -1000, x: -500, z: -300}, color: Colors.red, detail: 1, parent: Sites.recode});

  createMoon({radius: 10, color: Colors.cream, detail: 0, parent: planets[0]});
  createMoon({radius: 30, color: Colors.cream, detail: 0, parent: planets[0]});
  createMoon({radius: 20, color: Colors.cream, detail: 0, parent: planets[0]});
  createMoon({radius: 30, color: Colors.cream, detail: 0, parent: planets[1]});
  createMoon({radius: 20, color: Colors.cream, detail: 0, parent: planets[1]});



  loop();
}

// On load fire the init
window.addEventListener('load', init, false);

// UTILS
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}


// Dataset

var data = {
  sites: {
    polygon: {
      pageviews: 12610292,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    vox: {
      pageviews: 18549139,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    recode: {
      pageviews: 1460330,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    verge: {
      pageviews: 21103987,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    sbnation: {
      pageviews: 102817237,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    curbed: {
      pageviews: 4183807,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    eater: {
      pageviews: 7101163,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    racked: {
      pageviews: 1191117,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    },
    voxcreative: {
      pageviews: 109720,
      stories: [
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        },
        {
          title:
          image:
          author:
          pageviews:
          social_posts: {
            {platform: twitter, engagement: 0.03, title: ''},
            {platform: facebook, engagement: 0.11, title: ''}
          }
        }
      ]
    }
  }
};

