var image_tex, video, buffer, pre_video_tex, video_tex, video_mat, video_mesh, video_geo, buffer_mat, buffer_geo, buffer_mesh;

var ortho_width = 1920, ortho_height = 1080, ortho_near = -1, ortho_far = 1;
var boxSize = 20;
var allMembers = [];

var get_webcam = function(){
// video = document.createElement('video');
// video.width = ortho_width;
// video.height = ortho_width;
// video.autoplay = true;
// video.muted = true; //- to prevent create feedback from mic input ***
// video_tex = new THREE.Texture( video );
    // image_tex = new THREE.TextureLoader().load('src/logo.png');
    // video_tex.minFilter = THREE.LinearFilter //- to use non powers of two image
    // image_tex.minFilter = THREE.LinearFilter

    // video_mat = new THREE.MeshPhongMaterial(
    //   {map: video_tex}
    //
    // );
if(navigator.getUserMedia){
  navigator.getUserMedia({ audio: true, video:{ width: ortho_width, height: ortho_height, facingMode: { exact: "environment" } } }, function(stream){
    // video.src = window.URL.createObjectURL(stream);
    // video.play();
  }, function(err){
    console.log('failed to get a steram : ', err );
  });
} else {
  console.log('user media is not supported');
}
};
  var stats, scene, renderer, composer;
  var camera, cameraControls;

  if( !init() )	animate();

  // init the scene
  function init(){
    // get_webcam();

    if( Detector.webgl ){
      renderer = new THREE.WebGLRenderer({
        antialias		: true,	// to get smoother output
        preserveDrawingBuffer	: true	// to allow screenshot
      });
      renderer.setClearColor( 0xbbbbbb );
    }else{
      Detector.addGetWebGLMessage();
      return true;
    }
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);

    // add Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 0, 500);
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

var box = new THREE.BoxGeometry(30,30,30)
var mat = new THREE.MeshPhongMaterial({color:0xb7b7b7})
var mesh2 = new THREE.Mesh(box,mat)
scene.add(mesh2)
//
//     video_geo = new THREE.BoxGeometry( 30,30,30 );
// video_mesh = new THREE.Mesh( video_geo, video_mat );
//
// scene.add(video_mesh);

  renderPeeps();

  }

  // animation loop
  function animate() {
    // if(video.readyState === video.HAVE_ENOUGH_DATA) { video_tex.needsUpdate = true; }

    // loop on request animation loop
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
      // object3d.rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
      // object3d.rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
    })

    // actually render the scene
    renderer.render( scene, camera );
  }



  function renderPeeps(){
  	jQuery.ajax({
  		url : '/api/get',
  		dataType : 'json',
  		success : function(response) {
  			console.log(response);
  			var people = response.people;
  			for(var i=0;i<people.length;i++){
          console.log(people[i])
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

            map: people[i].imageURL
          })
      var video_mesh = new THREE.Mesh( video_geo, video_mat );
      video_mesh.position.x = i*boxSize+60
      video_mesh.position.y = i*60
      allMembers.push(video_mesh)
      allMembers[i].material.map = people[i].imageURL

      scene.add(allMembers[i]);
  			}



  		}
  	})
  }
