var fs = require('fs');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var users = fs.readFileSync('data/userid.list').toString().split("\n");
if(users.length>2) {
	users.pop();
}

function randomUser(myself) {
	var idx,
	    limit = function() {	
		var seed = Math.floor(Math.random() * 101);
		if(seed < 10) {
		  return 2;
		} else if(seed < 60) {
		  return 4;
		} else if(seed < 80) {
		  return 6;
		} else {
		  return 10;
		}
	    }(),
	    user,
	    selected = [];
	while(selected.length < limit) {	
		idx = Math.floor(Math.random() * users.length); 
		user = users[idx];
		if(selected.indexOf(user) == -1 && user != myself){
			selected.push(user);
		}
	}
		
	return selected;
}

function nextUser(myself) {
  var idx,
      last = users.lengh-1,
      selected = [];
  idx = users.indexOf('' + myself);
  if (idx == -1) return selected;
  if(idx == last) {
    idx = 0;
  }
  
  selected.push(users[++idx]);
  return selected;
}


/*
for(var i=0; i<20; i++) {
	console.log(randomUser(i));
}
*/

if(cluster.isMaster) {
	for(var i=0; i< numCPUs; i++) {
		cluster.fork();
	}
} else {

var express = require('express');
var app = express();

app.get('/friends/getFriendListFromGlobalGroup',
	function(req, res) {
		var nucleusId = req.query['nucleusId'];
		if(nucleusId) {
			var friends = nextUser(nucleusId);//randomUser(nucleusId);
//setTimeout(function() {
			var body = "<users>";
			for(var i = 0; i<friends.length; i++) {
				if(friends[i]) {
				  body += '<user><userId>' + friends[i] + '</userId></user>';	
				}	
			}
			body += '</users>';
			res.setHeader('Content-Type', 'text/xml');
			res.setHeader('Content-Length', body.length);
			res.end(body);
//}, 1);
		} else {
			res.send('miss nucleusId');
		}

	}).on('error', function(err) {
  console.log(err);
});

app.get('/friends/health_check', function(req, res) {
	res.send('OK');
});		


app.get('/friends/user/:id/visibility/friend/:friendIds', function(req, res) {
 var friendIds = req.params.friendIds.split(';');
 var out = '<users>';
 for(var i=0; i<friendIds.length;i++) {
   out += '<user>';
   out += '<userId>' + friendIds[i] + '</userId>';
   out += '<visibility>true</visibility></user>';
 }
 out += '</users>';
 res.setHeader('Content-Type', 'text/xml');
 res.setHeader('Content-Length', out.length);
 res.end(out);
});

app.get('/friends/user/:id/mutedStateWith/:friendId', function(req,res) {
  var userId = req.params.id;
  var friendId = req.params.friendId;

  var out = "<blockedState><userBlocksOther>false</userBlocksOther><otherBlocksUser>false</otherBlocksUser>";
  out += "<userId>" + userId + "</userId>";
  out += "<otherId>" + friendId + "</otherId>";
  out += "</blockedState>";

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Content-Length', out.length);
  res.send(out);
});

app.listen(3000);
} 
console.log('Listening on port 3000');
