var image_tex, video, buffer, pre_video_tex, video_tex, video_mat, video_mesh, video_geo, buffer_mat, buffer_geo, buffer_mesh;
var ortho_width = 1920, ortho_height = 1080, ortho_near = -1, ortho_far = 1;
var boxSize = 20;
var allMembers = [];
var personTexture;
var stats, scene, renderer, composer;
var camera, cameraControls, material1, mesh;
var movePeopleDown = 120;
var loader2;

//COLORS
var pink = 0xfebdb7;
var teal =  0x009fc6;
var pinkDrk = 0xf68f83;
var mint = 0xa8e1d1;
var purple = 0xb9a0b1;

//////DONA LOADING VARIABLES ///////////

var loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function(item, loaded, total){

  //Loading precentage pattern
  console.log(loaded / total * 100 + '%');

}

//Signify loading done
loadingManager.onLoad = function(){

  //Start the animation when the models are done loading
      animate();
}

//call init right away
init()

//this works, so I know the image path is correct
// var img = document.createElement('img');
// img.src = '../img/leo.jpg';
// document.getElementById('container').appendChild(img);



var person, personFull;

function textureLoaded(texture) {
    material1 = new THREE.MeshStandardMaterial( { color: 0xffffff, map: texture, side: THREE.DoubleSide } );
    person = new THREE.BoxGeometry(40,40,40)
    personFull = new THREE.Mesh(person, material1)
    console.log(personFull.material)
    // scene.add(personFull)

    renderPeeps(texture);


}






  function init(){

    //create a loader
    loader2 = new THREE.TextureLoader(loadingManager);
    //load the texture, and whwen it's done, push it into a Phong material
    loader2.load("../img/leo.jpg", textureLoaded);







    //dont worry about not having WebGL
    // if( Detector.webgl ){
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias		: true	// to get smoother output
        // preserveDrawingBuffer	: true	// to allow screenshot
      });
      renderer.setClearColor( 0xbbbbbb,0 );
    // }else{
    //   Detector.addGetWebGLMessage();
    //   return true;
    // }
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
    //this is a good Z-depth to see the cubes
    camera.position.set(0, 0, 300);
    scene.add(camera);

    // create a camera contol
    cameraControls	= new THREE.TrackballControls( camera )


    // LOTS OF LIGHTS
    var light	= new THREE.AmbientLight( 0xffffff );
    scene.add( light );
    var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    scene.add( light );
    var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    // scene.add( light );
    var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    // scene.add( light );
    var light	= new THREE.PointLight( Math.random() * 0xffffff );
    light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
          .normalize().multiplyScalar(1.2);
    // scene.add( light );
    var light	= new THREE.PointLight( Math.random() * 0xffffff );
    light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
          .normalize().multiplyScalar(1.2);
    // scene.add( light );


    //does one cube load? YES!
    // var geo = new THREE.BoxGeometry(30,30,30)
    // var mat = new THREE.MeshBasicMaterial({color: 0xb2b7b7})
    // mesh = new THREE.Mesh(geo, material1)
    // scene.add(mesh)
    // mesh.position.z = -80


  // renderPeeps();

  }



  // animation loop
  function animate() {

    requestAnimationFrame( animate );

    render();

    // update stats
    stats.update();
  }

  // render the scene
  function render() {
    // increase by Math.PI every seconds - usefull for animation
    var PIseconds	= Date.now() * Math.PI;

    // update camera controls
    cameraControls.update();

    // animation of all objects
    scene.traverse(function(object3d, i){
      if( object3d instanceof THREE.Mesh === false )	return
      if (object3d.geometry.type === "BoxGeometry"){
        object3d.rotation.y = PIseconds*0.0002 * (i % 2 ? 1 : -1);
        object3d.rotation.x = PIseconds*0.0001 * (i % 2 ? 1 : -1);

      }
    })

    // actually render the scene
    renderer.render( scene, camera );
  }


//get data from server and render cubes with people's images
//for now lets just get one image mapped, to prove I cab do that.
  function renderPeeps(texture){
    console.log(texture)
  	jQuery.ajax({
  		url : '/api/get',
  		dataType : 'json',
  		success : function(response) {
  			// console.log(response.people);
  			var people = response.people;
  			for(var i=0;i<people.length;i++){
          // console.log(people[i].imageUrl)

if (people[i].imageUrl.includes('eternaltest')){
  console.log(people[i].imageUrl)
  texture = people[i].imageUrl
}


          var video_geo = new THREE.BoxGeometry( boxSize,boxSize,boxSize );

          //i need to add the image of the person here
          var video_mat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: texture
          })

          //why is thr map: undefined on this material?
          // console.log(material1)

          //make a cube for each person
          var video_mesh = new THREE.Mesh( video_geo, video_mat );

          //this did not work either
          // video_mesh.material.map = document.getElementById("yourCanvas");


          //place them in a grid
          video_mesh.position.x = -60 + ((i%3)*60)
          if (i%3 == 0){
            movePeopleDown -=60
            video_mesh.position.y = movePeopleDown
            loadfont(people[i].name, 5, -60 + ((i%3)*60),movePeopleDown+boxSize,0)
          } else {
            video_mesh.position.y = movePeopleDown
              loadfont(people[i].name, 5, -60 + ((i%3)*60),movePeopleDown+boxSize,0)
          }
          allMembers.push(video_mesh)
          // allMembers[i].material.map = people[i].imageURL
          scene.add(allMembers[i]);
  			}



  		}
  	})
  }




  function loadfont(string, textSize, xpos, ypos, zpos) {
  var loader = new THREE.FontLoader();
  //font json file loaded in header
  loader.load('js/hel.typeface.json', function(font) {

    var textGeo = new THREE.TextGeometry(string, {

      font: font,
      size: textSize,
      height: 1,
      curveSegments: 12,
      bevelThickness: 0,
      bevelSize: 0,
      bevelEnabled: true

    });

    textGeo.computeBoundingBox();
    var centerOffset = -.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    var centerOffsetY = -.5 * ( textGeo.boundingBox.max.y - textGeo.boundingBox.min.y );
    var textMaterial = new THREE.MeshPhongMaterial({
      color: pink,
      shininess: 0.0,
      // wireframe: true
      // roughness: 0.5,
      // emissive: 0x000000,
      // emissiveIntensity:.1

    });

    type = new THREE.Mesh(textGeo, textMaterial);
    type.position.x = xpos
    type.position.y = ypos
    type.position.z = zpos
    type.geometry.translate(centerOffset, centerOffsetY, 0 );

    scene.add(type);


  });
}


window.addEventListener('resize', onResize, true);

function onResize(e) {
    camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      // renderer.setSize( window.innerWidth, window.innerHeight*ThreeSceneHghtRation );
        renderer.setSize( window.innerWidth, window.innerHeight);
}
