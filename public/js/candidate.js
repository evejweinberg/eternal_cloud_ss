var image_tex, video, buffer, pre_video_tex, video_tex, video_mat, video_mesh, video_geo, buffer_mat, buffer_geo, buffer_mesh;
var ortho_width = 1920, ortho_height = 1080, ortho_near = -1, ortho_far = 1;
var boxSize = 50;
var allMembers = [];
var personTexture;
var stats, scene, renderer, composer;
var camera, cameraControls, material1, mesh;
var movePeopleDown = 120;
var loader2;

var personId; // we will use this to know which person to update

//COLORS
var pink = 0xfebdb7;
var teal =  0x009fc6;
var pinkDrk = 0xf68f83;
var mint = 0xa8e1d1;
var purple = 0xb9a0b1;
var glitchPass, composer;

//////DONA LOADING VARIABLES ///////////

var loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function(item, loaded, total){

  //Loading precentage pattern
  console.log(loaded / total * 100 + '%');

}

//Signify loading done
loadingManager.onLoad = function(){

  //Start the animation when the models are done loading

}

//call init right away
init()




var canvas = document.getElementById('three-canvas')

var person, personFull;
var group = new THREE.Group();



  function init(){


      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias		: true	// to get smoother output
        // preserveDrawingBuffer	: true	// to allow screenshot
      });
      renderer.setClearColor( 0xbbbbbb,0 );

      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild(renderer.domElement);

      // canvas.appendChild(renderer.domElement);


    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
    //this is a good Z-depth to see the cubes
    camera.position.set(0, 0, 300);
    scene.add(camera);

    // create a camera contol
    // cameraControls	= new THREE.TrackballControls( camera )


    // LOTS OF LIGHTS
    var light	= new THREE.AmbientLight( pink );
    scene.add( light );
    var light	= new THREE.DirectionalLight( pink );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    // scene.add( light );
    var light	= new THREE.DirectionalLight( mint );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    // scene.add( light );
    var light	= new THREE.DirectionalLight( pink );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    // scene.add( light );
    var light	= new THREE.PointLight(purple );
    light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
          .normalize().multiplyScalar(1.2);
    scene.add( light );
    var light	= new THREE.PointLight( mint );
    light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
          .normalize().multiplyScalar(1.2);
    // scene.add( light );


    //does one cube load? YES!
    var geo = new THREE.BoxGeometry(130,30,30)
    var mat = new THREE.MeshBasicMaterial({color: 0xb2b7b7})
    mesh = new THREE.Mesh(geo, material1)
    scene.add(mesh)
    mesh.position.z = -80

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    composer.addPass( glitchPass );



  renderCandidate();
  animate();


  }



  // animation loop
  function animate() {

    requestAnimationFrame( animate );

    render();

    // update stats
    // stats.update();
  }

  // render the scene
  function render() {
    // increase by Math.PI every seconds - usefull for animation
    var PIseconds	= Date.now() * Math.PI;

    // update camera controls
    // cameraControls.update();

    // animation of all objects
    scene.traverse(function(object3d, i){
      if( object3d instanceof THREE.Mesh === false )	return
      if (object3d.geometry.type === "BoxGeometry"){
        object3d.rotation.y = PIseconds*0.0002 * (i % 2 ? 1 : -1);
        object3d.rotation.x = PIseconds*0.0001 * (i % 2 ? 1 : -1);

      }
    })

    // actually render the scene
    // renderer.render( scene, camera );
    composer.render();
  }


//get data from server and render cubes with people's images
//for now lets just get one image mapped, to prove I cab do that.
  function renderCandidate(texture){



//get thr person from the database

  	jQuery.ajax({
  		url : '/api/get',
  		dataType : 'json',
  		success : function(response) {
  			console.log(response.people);
  			var person = response.people[response.people.length-1];
        console.log(person)
        personId = person._id;
        console.log('we are updating person with ID ' + personId);
        var loader = new THREE.TextureLoader();
        // console.log(person)
          var video_geo = new THREE.BoxGeometry( boxSize,boxSize,boxSize );


          if (person.imageUrl.includes('eternalcloudbucket')){
            console.log('valid image')

            //create a loader
            var loader2 = new THREE.TextureLoader();
            //load the texture, and whwen it's done, push it into a Phong material
            loader2.load(person.imageUrl, textureLoaded);
          }

        function  textureLoaded(texture){
              console.log(texture)
            var video_mat = new THREE.MeshPhongMaterial({
                color: 0xb7b7b7,
                map: texture
                  })
            var video_mesh = new THREE.Mesh( video_geo, video_mat );
            group.add(video_mesh)
            loadfont(person.name, 11, 0,boxSize,0)
            // console.log(loadfont(person.name, 11, 0,boxSize*1.3,0))
            scene.add(group);
            group.position.y = 30;


          }//texture loader


          }//success function
        });//ajax request over

    }//render candidate over







  function loadfont(string, textSize, xpos, ypos, zpos) {
  var loader = new THREE.FontLoader();
  //font json file loaded in header
  loader.load('js/hel.typeface.json', function(font) {

    var textGeo = new THREE.TextGeometry(string, {

      font: font,
      size: textSize,
      height: 2,
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
      shininess: 30,
      emissive: 0x000000,
      reflectivity: .2
      // specular: purple


    });

    type = new THREE.Mesh(textGeo, textMaterial);
    type.position.x = xpos
    type.position.y = ypos
    type.position.z = zpos
    type.geometry.translate(centerOffset, centerOffsetY, 0 );

    group.add(type)

    // console.log(type)
    // return type;


  }); //font over
}//font loader funcyion over


window.addEventListener('resize', onResize, true);

function onResize(e) {
    camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      // renderer.setSize( window.innerWidth, window.innerHeight*ThreeSceneHghtRation );
        renderer.setSize( window.innerWidth, window.innerHeight);
        	composer.setSize( window.innerWidth, window.innerHeight );
}



jQuery("#candidateForm").submit(function(e){
  var philanthropy = parseInt($('#philanthropy').val());

  jQuery.ajax({
  	url : '/api/update/'+personId,
  	dataType : 'json',
  	type : 'POST',
  	// we send the data in a data object (with key/value pairs)
  	data : {
  		philanthropy: philanthropy,
  	},
  	success : function(response){
	  		// success
	  		console.log(response);
	  		// now, clear the input fields
	  		jQuery("#candidateForm input").val('');
  	},
  	error : function(err){
  		// do error checking
  		alert("something went wrong");
  		console.error(err);
  	}
  });

  // prevents the form from submitting normally
  e.preventDefault();
  return false;
  
})
