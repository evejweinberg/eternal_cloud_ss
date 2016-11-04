// CUSTOM JS FILE //
var stats, scene, renderer, composer;
var camera, cameraControls;
var allMembers = [];
var boxSize = 20;

if( !init() )	animate();

// init the scene
function init(){

  if( Detector.webgl ){
    renderer = new THREE.WebGLRenderer({
      antialias		: true,	// to get smoother output
      alpha: true,

      preserveDrawingBuffer	: true	// to allow screenshot
    });
    renderer.setClearColor( 0xbbbbbb,0 );
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
  camera.position.set(0, 0, 150);
  scene.add(camera);
  cameraControls	= new THREE.TrackballControls( camera )


  renderPeeps();

}

function animate() {
  // if(video.readyState === video.HAVE_ENOUGH_DATA) { video_tex.needsUpdate = true; }

  requestAnimationFrame( animate );

  // do the render
  render();

  // update stats
  stats.update();
}


function render() {
  // variable which is increase by Math.PI every seconds - usefull for animation
  var PIseconds	= Date.now() * Math.PI;

  // update camera controls
  cameraControls.update();

  // animation of all objects
  scene.traverse(function(object3d, i){
    if( object3d instanceof THREE.Mesh === false )	return
    object3d.rotation.y = PIseconds*0.0001 * (i % 2 ? 1 : -1);
    object3d.rotation.x = PIseconds*0.0001 * (i % 2 ? 1 : -1);
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
				// var htmlToAdd = '<div class="col-md-4">'+
        //
				// 	'<h1>'+people[i].name+'</h1>'+
        //
				// 	'<a href="/edit/'+people[i]._id+'">Edit Person</a>'+
				// '</div>';
        //
				// jQuery("#people-holder").append(htmlToAdd);


        var video_geo = new THREE.BoxGeometry( boxSize,boxSize,boxSize );
        var video_mat = new THREE.MeshPhongMaterial({
          color: 0xf3b7b7

          // map: people[i].imageURL
        })
    var video_mesh = new THREE.Mesh( video_geo, video_mat );
video_mesh.position.x = i*boxSize
    allMembers.push(video_mesh)

    scene.add(allMembers[i]);
			}



		}
	})
}

window.addEventListener('load', init())
