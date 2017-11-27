var mongoose = require("mongoose");
var hotel = require("./models/hotel");
var Comment = require("./models/comment");

var data=[
            {
               name:"Indian Creek",
                image:"https://farm9.staticflickr.com/8577/16263386718_c019b13f77.jpg",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." 
            },
            {
                name:"Four Montana State Parks " ,
                image:"https://farm9.staticflickr.com/8358/8444469474_8f4b935818.jpg ",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            },
            {
                name: "Acadia National Park- Seawall ",
                image: "https://farm5.staticflickr.com/4423/37232133702_342e447ccb.jpg ",
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.."
            }
        ];

function seedDB(){
   //Remove all hotels
   hotel.remove({}, function(err){
    if(err){
            console.log(err);
        }
        console.log("removed hotels!");
         //add a few hotels
       data.forEach(function(seed){
            hotel.create(seed, function(err, hotel){
                if(err){
                    console.log(err)
                } else {
                    console.log("added a hotel");
                    //create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there was internet",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                hotel.comments.push(comment);
                                hotel.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
   }); 
    //add a few comments
}



module.exports = seedDB; 