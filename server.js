var http = require('http');
var FS = require("q-io/fs");
var stringify = require('node-stringify');

var express = require('express');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//<liste=getTree();
liste=[];
//console.log(liste);

app.get('/', function(req, res) {
	getTree();
	if (liste!=null){
		res.render('home.ejs');
	}
});

/* FS.read("hello.txt", //lire
    flags: "r"
}).then(function (hello) {
    console.log(hello);
})
 */
// FS.write("hello", "Hello, World!\n")//creer
// .then(function () {
    // return FS.read("hello")
// })
// .then(function (hello) {
    // expect(hello).toBe("Hello, World!\n")
// });

function getTree(root){
 FS.list(root).then(function (hello) {//tree
    //console.log(stringify(hello));
	liste=hello;
})
}



io.sockets.on('connection', function (socket) {
	socket.root=".";
	getTree(socket.root);
	currentFold=liste;
	
	socket.on("Connect",function(){
		for (file in liste){
			//console.log(socket.root+'/'+liste[file]);
			dire(socket.root+"/"+liste[file],liste[file])

		}
		
		function dire(root,nom){
			console.log("root="+root)
		 FS.isDirectory(root).then(function (hello) {//tree
			
			hello ? socket.emit("yourFold", nom) : socket.emit("yourFile", nom);
				
			console.log("rep="+hello)
		})
		}
		
	});
	
	
	
});

server.listen(8080);

