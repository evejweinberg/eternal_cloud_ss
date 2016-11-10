var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// our db models
var Person = require("../models/person.js");
var Course = require("../models/course.js");

// S3 File dependencies
var AWS = require('aws-sdk');

var awsBucketName = process.env.AWS_BUCKET_NAME;
var s3Path = process.env.AWS_S3_PATH; //  - we shouldn't hard code the path, but get a temp URL dynamically using aws-sdk's getObject


// file processing dependencies
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

// require middleware to handle multipart form data
var multer = require('multer');

// create a new storage object using multer middleware to
// receive the blob as a base64 incoded data object as part of a multipart
// form that's sent from the client-side

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var newDestination = 'uploads/';
        var stat = null;
        try {
            stat = fs.statSync(newDestination);
        } catch (err) {
            fs.mkdirSync(newDestination);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }
        cb(null, newDestination);

    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
  storage: storage
});



/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

  console.log('home page requested!');

  var jsonData = {
  	'name': 'user-directory',
  	'api-status':'OK'
  }

  // res.send('hi')

  // respond with json data
  // res.json(jsonData)

  // respond by redirecting
  res.redirect('/pre-profile')

  // respond with html
  // res.render('directory.html')

});




router.get('/edit/:id', function(req,res){

  var requestedId = req.params.id;

  Person.findById(requestedId,function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(err)
    }

    console.log(data);

    var viewData = {
      pageTitle: "Edit " + data.name,
      person: data
    }

    res.render('edit.html',viewData);

  })

})




router.post('/submitProfile', upload.single('file'), function(req,res){

    console.log('attempting to submit a profile');

    var buf = new Buffer(req.body.data, 'base64');


    AWS.config.update({

      accessKeyId:process.env.AWS_ACCESS_KEY,
      secretAccessKey:process.env.AWS_SECRET_KEY
    });
    AWS.config.update({region: 'us-east-1'})

    var s3bucket = new AWS.S3({params: {Bucket: process.env.AWS_BUCKET_NAME}});

    // var s3 = new AWS.S3({params: {Bucket: awsBucketName}});

    //take out special charachters first, look at what Sam did with slug
    var tempName = req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-') + '.jpg';


    var params = {
      //Bucket: process.env.AWS_BUCKET_NAME,
      Key: tempName,
      ACL: 'public-read',
      Body: buf,
      ContentType: "image/jpeg"
    };


    s3bucket.putObject(params, function(err,data){
      if(err) console.log(err);
      else console.log('success@');
    });

    // res.json({msg: "success!"});

    var publicUrl = process.env.AWS_S3_PATH + tempName;
    console.log('public url: ' + publicUrl);

      console.log(req.body)


    // if (req.body.banker == 'yes') personObj['banker'] = true;
    // else personObj['banker'] = false;
    //
    // if (req.body.philanthropy === null )req.body.philanthropy = 0
    // if (req.body.intelligence === null )req.body.intelligence = 0
    // if (req.body.activism === null )req.body.activism = 0






    var personObj = {
      //grab your mongood schema and double it here
      name: req.body.name,
      imageUrl: publicUrl,
      // philanthropy: req.body.philanthropy,
      // banker: req.body.banker,
      // intelligence: req.body.intelligence,
      // activism: req.body.activism,
      //create a uniqur slug
      slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
    }

    //save to the database, send through the attributes as a json.
    var person = new Person(personObj);
    //mongood database operation, save to database, and have database hit this callback
    person.save(function(err,data){
      if(err){

        console.log('error')
        //this shows up to client side app
        //so we could redirect them
        // res.redirect('add/person')
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      console.log('succesfully pushed', data)

      var jsonData = {
        status: "OK",
        person: data
      }
      //respond back to the frint end. Here's the data
      return res.json(jsonData)



    })


});



/*

router.post('/api/create/image', multipartMiddleware, function(req,res){

  console.log('the incoming data >> ' + JSON.stringify(req.body));
  console.log('the incoming image file >> ' + JSON.stringify(req.files.image));

  var personObj = {
    name: req.body.name,
    imageUrl: req.body.imageUrl,
    slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
  }

  if (req.body.hasGlasses == 'yes') personObj['hasGlasses'] = true;
  else personObj['hasGlasses'] = false;


  // NOW, we need to deal with the image
  // the contents of the image will come in req.files (not req.body)
  var filename = req.files.image.name; // actual filename of file
  var path = req.files.image.path; // will be put into a temp directory
  var mimeType = req.files.image.type; // image/jpeg or actual mime type

  // create a cleaned file name to store in S3
  // see cleanFileName function below
  var cleanedFileName = cleanFileName(filename);

  // We first need to open and read the uploaded image into a buffer
  fs.readFile(path, function(err, file_buffer){

    // reference to the Amazon S3 Bucket
    var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});

    // Set the bucket object properties
    // Key == filename
    // Body == contents of file
    // ACL == Should it be public? Private?
    // ContentType == MimeType of file ie. image/jpeg.
    var params = {
      Key: cleanedFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: mimeType
    };

    // Put the above Object in the Bucket
    s3bucket.putObject(params, function(err, data) {
      if (err) {
        console.log(err)
        return;
      } else {
        console.log("Successfully uploaded data to s3 bucket");

        // now that we have the image
        // we can add the s3 url our person object from above
        personObj['imageUrl'] = s3Path + cleanedFileName;

        // now, we can create our person instance
        var person = new Person(personObj);

        person.save(function(err,data){
          if(err){
            var error = {
              status: "ERROR",
              message: err
            }
            return res.json(err)
          }

          var jsonData = {
            status: "OK",
            person: data
          }

          return res.json(jsonData);
        })

      }

    }); // end of putObject function

  });// end of read file
})

*/





// function cleanFileName (filename) {
//
//     // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
//     // will return "abc123_my_pet_dog.jpg"
//     var fileParts = filename.split(".");
//
//     //get the file extension
//     var fileExtension = fileParts[fileParts.length-1]; //get last part of file
//
//     //add time string to make filename a little more random
//     d = new Date();
//     timeStr = d.getTime();
//
//     //name without extension
//     newFileName = fileParts[0];
//
//     return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;
//
// }





// router.get('/edit/:id', function(req,res){
//
//   //get the id
//
//   var requestedId = req.params.id;
//
//
// //ask database for information
//   Person.findById(requestedId,function(err,data){
//     if(err){
//       var error = {
//         status: "ERROR",
//         message: err
//       }
//       return res.json(err)
//     }
//
//     var viewData = {
//       status: "OK",
//       person: data
//     }
// //views > edit.html
//     return res.render('edit.html',viewData);
//   })
//
// })





//was hitting this route when the form was simply going to mongoose
router.post('/api/create', function(req,res){


  console.log('in api/create, and we got data');
  console.log(req.body);

  if (req.body.career == 'yes') personObj['career'] = true;
  else personObj['career'] = false;

  if (!req.body.philanthropy)req.body.philanthropy = 0
  if (!req.body.intelligence)req.body.intelligence = 0
  if (!req.body.activism)req.body.activism = 0


//save a data object
  var personObj = {
    //grab your mongood schema and double it here
    name: req.body.name,
    imageUrl: req.body.imageUrl,
    philanthropy: req.body.philanthropy,
    career: req.body.career,
    intelligence: req.body.intelligence,
    activism: req.body.activism,
    //create a uniqur slug
    slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
  }

  //save to the database, send through the attributes as a json.
  var person = new Person(personObj);
//mongood database operation, save to database, and have database hit this callback
  person.save(function(err,data){
    if(err){
      //this shows up to client side app
      //so we could redirect them
      // res.redirect('add/person')
      var error = {
        status: "ERROR",
        message: err
      }
      // return res.json(err)
      res.redirect('/candidate')
      //redirect /third to /candidate-solo
    }

    var jsonData = {
      status: "OK",
      person: data
    }


  })
})





router.get('/api/get', function(req,res){
//find all items
  Person.find(function(err,data){

      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }

      var jsonData = {
        status: "OK",
        people: data
      }

      return res.json(jsonData);

  })

})

// router.get('/api/get/year/:itpYear',function(req,res){
//
//   var requestedITPYear = req.params.itpYear;
//
//   console.log(requestedITPYear);
//
//   Person.find({itpYear:requestedITPYear},function(err,data){
//       if(err){
//         var error = {
//           status: "ERROR",
//           message: err
//         }
//         return res.json(err)
//       }
//
//       var jsonData = {
//         status: "OK",
//         people: data
//       }
//
//       return res.json(jsonData);
//   })
//
// })

// router.get('/api/person/:slug'), function(req,res){
//   var reqestedSlug = req.params.slug;
//   console.log(reqestedSlug)
//   Person.findOne({slug:reqestedSlug}, function(err,data){
//     if (err){
//       return res.json({status: error})
//     }
//
//     if (!data || data ==null || data==''){
//
//     }
//
//     console.log('found that person')
//     console.log(data)
//     res.json(data)
//
//   })
// }


// router.get('/api/get/query',function(req,res){
//
//   console.log(req.query);
//
//   var searchQuery = {};
//
//   if(req.query.itpYear){
//     searchQuery['itpYear'] =  req.query.itpYear
//   }
//
//   if(req.query.name){
//     searchQuery['name'] =  req.query.name
//   }
//
//   if(req.query.hasGlasses){
//     searchQuery['hasGlasses'] =  req.query.hasGlasses
//   }
//
//   Person.find(searchQuery,function(err,data){
//     res.json(data);
//   })
//
//   // Person.find(searchQuery).sort('-name').exec(function(err,data){
//   //   res.json(data);
//   // })
//
//
// })




//staging front end website
router.get('/pre-profile', function(req,res){
  res.render('pre-profile.html')
})

router.get('/add-person', function(req,res){
  res.render('add.html')
})

router.get('/login', function(req,res){
  res.render('login.html')
})

router.get('/candidate', function(req,res){
  res.render('candidate.html')
})



router.get('/directory', function(req,res){
  res.render('directory.html')
})


router.get('/third', function(req,res){
  // if ()
  res.render('blank.html')
  // else{
  // res.render('/candidate-solo.html')
// }
})


router.post('/api/update/:id', function(req,res){
  var idToUpdate = req.params.id;

  // console.log(idToUpdate);
  var dataToUpdate = {};

  if(req.body.philanthropy) dataToUpdate.philanthropy = req.body.philanthropy;
  if(req.body.career) console.log(req.body.career); dataToUpdate.career = req.body.career;
  if(req.body.intelligence) dataToUpdate.intelligence = req.body.intelligence;
  if(req.body.activism) dataToUpdate.activism = req.body.activism;




  Person.findByIdAndUpdate(idToUpdate, dataToUpdate, function(err,data){
    if (err){
      alert("There was an error updating your profile. Eternal Cloud might be at maximum capacity.")
    } else{
        res.json(data);
    }
  });

})





module.exports = router;
