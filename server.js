var http = require('http');
var FS = require("q-io/fs");
var stringify = require('node-stringify');

var express = require('express');

var app = express();
app.use('/static', express.static(__dirname + '/public'));
app.use( express.static( "static" ) );
var server = require('http').Server(app);
var io = require('socket.io')(server);
//<liste=getTree();

//console.log(liste);

app.get('/', function(req, res) {
	//getTree();
	//if (liste!=null){
		res.render('home.ejs');
	//}
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



io.sockets.on('connection', function (socket) {
	socket.root=".";
	function getTree(root){
	 FS.list(root).then(function (hello) {//tree
		//console.log(stringify(hello));
		console.log("alohaa");
		socket.liste=hello;
		console.log(hello);
		console.log(socket.liste);
	});
	}
	
	
	getTree(socket.root);
	
	socket.on("Connect",function(){
		getListDoc(socket.liste);
	});
	
	socket.on('openFold',function(foldName){
		goTo(socket.root+'/'+foldName);
	})
	
	function goTo(root){
		socket.root=root;
		getTree(socket.root);
		console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa");
		console.log('goTo='+socket.liste);
		socket.emit("clear");
		getListDoc(socket.liste);
	}
	
	function getListDoc(liste){
		console.log('root'+socket.root);
		console.log(liste);
		for (file in socket.liste){
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
	}
});

server.listen(8080);

