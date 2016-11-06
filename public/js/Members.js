var image_tex, video, buffer, pre_video_tex, video_tex, video_mat, video_mesh, video_geo, buffer_mat, buffer_geo, buffer_mesh;

var ortho_width = 1920, ortho_height = 1080, ortho_near = -1, ortho_far = 1;
var boxSize = 20;
var allMembers = [];
var loadingManager = new THREE.LoadingManager();
var personTexture;
var stats, scene, renderer, composer;
var camera, cameraControls;
var movePeopleDown = 120;

loadingManager.onProgress = function(item, loaded, total){

  //Loading precentage pattern
  console.log(loaded / total * 100 + '%');

}

//Signify loading done
loadingManager.onLoad = function(){
  //Start the scene when the models are done loading
  init()

}

var loader2 = new THREE.TextureLoader(loadingManager);
//callback function
    loader2.load('../img/leo.jpg', onTextureLoaded2);

    loader2.anisotropy = 4;
    loader2.wrapS = loader2.wrapT = THREE.RepeatWrapping;
    loader2.format = THREE.RGBFormat;
    function onTextureLoaded2(texture) {

      console.log(texture)

        personTexture = new THREE.MeshPhongMaterial({
            roughness: .64,
            metalness: .81,
            transparent: false,
            opacity: 1,
            color: pink,
            map: texture,
            side: THREE.DoubleSide
        });



    } //////////DONE LOADING IMAGE//////////




  if( !init() )	animate();


  function init(){


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

    // here you add your objects
    // - you will most likely replace this part by your own
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

    // do the render
    render();

    // update stats
    stats.update();
  }

  // render the scene
  function render() {
    // variable which is increase by Math.PI every seconds - usefull for animation
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



  function renderPeeps(){
  	jQuery.ajax({
  		url : '/api/get',
  		dataType : 'json',
  		success : function(response) {
  			// console.log(response);
  			var people = response.people;
  			for(var i=0;i<people.length;i++){
          // console.log(people[i])
  				// var htmlToAdd = '<div class="col-md-4">'+
          //
  				// 	'<h1>'+people[i].name+'</h1>'+
          //
  				// 	'<a href="/edit/'+people[i]._id+'">Edit Person</a>'+
  				// '</div>';
          //
  				// jQuery("#people-holder").append(htmlToAdd);

          var video_geo = new THREE.BoxGeometry( boxSize,boxSize,boxSize );

          //i need to add the image of the person here
          var video_mat = new THREE.MeshPhongMaterial({
            color: 0xf3b7b7
            // map: people[i].imageURL
          })
          console.log(personTexture)
          // if (personTexture)
          var video_mesh = new THREE.Mesh( video_geo, personTexture );

          video_mesh.position.x = -60 + ((i%3)*60)
          if (i%3 == 0){
            movePeopleDown -=60
            video_mesh.position.y = movePeopleDown
          } else {
            video_mesh.position.y = movePeopleDown
          }
          allMembers.push(video_mesh)
          allMembers[i].material.map = people[i].imageURL
          // console.log(allMembers[i].position.x, allMembers[i].position.y)
          scene.add(allMembers[i]);
  			}



  		}
  	})
  }
