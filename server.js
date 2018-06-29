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
	socket.root=".";//point de depart de l'application
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
		FS.isDirectory(socket.root+'/'+foldName).then(function (hello) {//tree	
			hello ? goTo(socket.root+'/'+foldName) : openFile(foldName);
		})
	});
	
	socket.on('saveFile',function(file,value){
		FS.write(socket.root+'/'+file, value).then(function () {//creer
				
		})
	});
	
	function openFile(name){
		FS.read(socket.root+'/'+name, //lire
			{flags: "r"}
		).then(function (hello) {
    console.log(hello);
	socket.emit('openFile',name,hello);
	})

	}
	socket.on('closeFolder',function(){
		listeLien=socket.root.split("/");
		listeLien.pop();
		res="";
		for (elem in listeLien){
			res+=listeLien[elem]+'/';
		}
		goTo(res.substring(0, res.length - 1));
	});
	
	socket.on('rename',function(fold,newFold){//rename a folder
		listeLien=socket.root.split("/");
		//listeLien.slice(0,listeLien.length-1);
		newLien="";
		for (elem in listeLien){
			newLien+=listeLien[elem]+'/';
		}
		newLien+=newFold;
		FS.rename(socket.root+'/'+fold,newLien).then(function () {//renaming
				goTo(socket.root);
		});
		console.log('renomage fini')
	});
	
	socket.on('createFolder',function(nom){
		FS.makeDirectory(socket.root+'/'+nom).then(function () {//tree
			//console.log(stringify(hello));
		});
		goTo(socket.root);
	});
	
	socket.on('delete',function(nom){
		FS.removeTree(socket.root+'/'+nom).then(function () {//tree
			goTo(socket.root);
		});
	});
	
	socket.on('createFile',function(nom){
		FS.write(socket.root+'/'+nom, "").then(function () {//creer
				//FS.read("hello")//lire
				goTo(socket.root);
		})
	});
	
	function goTo(root){
		socket.root=root;
		lis=root.split("/");
		if(lis[0]!=".." || root[0]!="/" || lis[0]!="~"){
			socket.emit("clear");
			FS.list(root).then(function (nListe) {//tree
				socket.liste=nListe;
				console.log(nListe);
				//getListDoc();
				for (file in socket.liste){
				direc(socket.root+"/"+socket.liste[file],socket.liste[file]);
			}
			for (file in socket.liste){
				isfile(socket.root+"/"+socket.liste[file],socket.liste[file]);
			}
			function direc(root,nom){
			 FS.isDirectory(root).then(function (hello) {//tree	
				hello ? socket.emit("yourFold", nom) : console.log('un file');
			})
			}
			function isfile(root,nom){
			 FS.isFile(root).then(function (hello) {//tree	
				hello ? socket.emit("yourFile", nom) : console.log('un direct');
			})
			}
			});
		}
	}
	
	function getListDoc(){
		//console.log('YOU='+socket.liste);
		for (file in socket.liste){
			direc(socket.root+"/"+socket.liste[file],socket.liste[file]);
		}
		for (file in socket.liste){
			isfile(socket.root+"/"+socket.liste[file],socket.liste[file]);
		}
		function direc(root,nom){
		 FS.isDirectory(root).then(function (hello) {//tree	
			hello ? socket.emit("yourFold", nom) : console.log('un file');
		})
		}
		function isfile(root,nom){
		 FS.isFile(root).then(function (hello) {//tree	
			hello ? socket.emit("yourFile", nom) : console.log('un direct');
		})
		}
	}
});

server.listen(8080);

