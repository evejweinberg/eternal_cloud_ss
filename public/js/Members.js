var image_tex, video, buffer, pre_video_tex, video_tex, video_mat, video_mesh, video_geo, buffer_mat, buffer_geo, buffer_mesh;
var ortho_width = 1920, ortho_height = 1080, ortho_near = -1, ortho_far = 1;
var boxSize = 20;
var allMembers = [];
var personTexture;
var stats, scene, renderer, composer;
var camera, cameraControls, material1;
var movePeopleDown = 120;

//////DONA LOADING VARIABLES ///////////

var loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function(item, loaded, total){

  //Loading precentage pattern
  console.log(loaded / total * 100 + '%');

}

//Signify loading done
loadingManager.onLoad = function(){
  console.log('all elements loaded')

  //Start the scene when the models are done loading
  init()

}

//this works, so I know the image path is correct
// var img = document.createElement('img');
// img.src = '../img/leo.jpg';
// document.getElementById('container').appendChild(img);






//first I tried this, but didn't work, so now i'm trying to do it in init()

    // function onTextureLoaded2(texture) {
    //
    //   // console.log(texture)
    //
    //     personTexture = new THREE.MeshPhongMaterial({
    //         roughness: .64,
    //         metalness: .81,
    //         transparent: false,
    //         opacity: 1,
    //         color: 0xffffff,
    //         map: texture,
    //         // map: '..img/leo.jpg',
    //         side: THREE.DoubleSide
    //     });
    //
    //
    //
    // } //////////DONE LOADING IMAGE//////////




  if( !init() )	animate();


  function init(){
    //create a loader
    var loader2 = new THREE.TextureLoader(loadingManager);
    //load the texture, and whwen it's done, push it into a Phong material
    var texture1 = loader2.load( "../img/leo.jpg", function(){
      //why is this texture 1 not coming through?
      console.log(texture1)
      material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1 } );

    })




    if( Detector.webgl ){
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias		: true,	// to get smoother output
        preserveDrawingBuffer	: true	// to allow screenshot
      });
      renderer.setClearColor( 0xbbbbbb,0 );
    }else{
      Detector.addGetWebGLMessage();
      return true;
    }
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 0, 300);
    scene.add(camera);

    // create a camera contol
    cameraControls	= new THREE.TrackballControls( camera )

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if( THREEx.FullScreen.available() ){
      THREEx.FullScreen.bindKey();
      // document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
    }

    // LOTS OF LIGHTS
    var light	= new THREE.AmbientLight( Math.random() * 0xffffff );
    scene.add( light );
    var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    scene.add( light );
    var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    scene.add( light );
    var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
    light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    scene.add( light );
    var light	= new THREE.PointLight( Math.random() * 0xffffff );
    light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
          .normalize().multiplyScalar(1.2);
    scene.add( light );
    var light	= new THREE.PointLight( Math.random() * 0xffffff );
    light.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
          .normalize().multiplyScalar(1.2);
    scene.add( light );


  renderPeeps();

  }



  // animation loop
  function animate() {
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
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
      object3d.rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
      object3d.rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
    })

    // actually render the scene
    renderer.render( scene, camera );
  }


//get data from server and render cubes with people's images
//for now lets just get one image mapped, to prove I cab do that.
  function renderPeeps(){
  	jQuery.ajax({
  		url : '/api/get',
  		dataType : 'json',
  		success : function(response) {
  			// console.log(response);
  			var people = response.people;
  			for(var i=0;i<people.length;i++){

          var video_geo = new THREE.BoxGeometry( boxSize,boxSize,boxSize );

          //i need to add the image of the person here
          var video_mat = new THREE.MeshPhongMaterial({
            color: 0xf3b7b7
            // map: people[i].imageURL
          })

          //why is thr map: undefined on this material?
          console.log(material1)

          //make a cube for each person
          var video_mesh = new THREE.Mesh( video_geo, material1 );

          //place them in a grid
          video_mesh.position.x = -60 + ((i%3)*60)
          if (i%3 == 0){
            movePeopleDown -=60
            video_mesh.position.y = movePeopleDown
          } else {
            video_mesh.position.y = movePeopleDown
          }
          allMembers.push(video_mesh)
          allMembers[i].material.map = people[i].imageURL
          scene.add(allMembers[i]);
  			}



  		}
  	})
  }
