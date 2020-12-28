const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

const server = app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
	startNewGame();
	console.log(players);
});

const io = require('socket.io')(server);

io.sockets.on('connection', socket => {
	let ip = socket.handshake.address;
	//id = socket.id;
	//console.log(socket.id);
  	//console.log(socket.handshake.address);

	if(users[ip]) {
		users[ip].id = socket.id;
		users[ip].connected = true;
		//existing user
		if(users[ip].name){
			socket.emit('existinguser', users[ip]);
			console.log(users[ip].name);
		} else {
			socket.emit('newuser');
		}
		console.log(`reconnection at ip: ${ip}`);		
	} else {
		users[ip] = {id: socket.id, connected: true};
		socket.emit('newuser');
		console.log(`new player connected at ip: ${ip}`);
	}

	socket.on('disconnect', () => {
		if(users[ip])
    		users[ip].connected = false;
		console.log(`player disconnected at ip: ${ip}`);
		setTimeout(()=>{
			if(users[ip] && !users[ip].connected){
				delete users[ip];
				console.log(`player timed out at ip: ${ip}`);
			} else if (users[ip]) {
				console.log(`player avoided timeout at ip: ${ip}`);
			}
		}, 10000);
	});
	
	socket.on('setusername', (user) => {
		users[ip].name = user.name;
	});

	socket.on('chancellorNominated', chancellorNominated);
});

let users = [];
let players = [];
let liberalBoard = [];
let fascistBoard = [];
let deck, discard, candidatePres, candidateChan, running, lasthitler, president, chancellor, electionTracker;
let GAMESTATE = {PASS: 'pass', NOMINATE: 'nominate', VOTE: 'vote', POLICY: 'policy', POWER: 'power'};
let currentGamestate = '';

//start and new game and initialize
function startNewGame(){
	running = true;
	players = [];
	users.forEach(user => {
		if(user.type == 'player'){
			players.push(user)
		}
	});
	deck = ['l','l','l','l','l','l','f','f','f','f','f','f','f','f','f','f','f'];
	liberalBoard = ['','','','',''];
	fascistBoard = ['','','','','','',''];
	electionTracker = 0;
	shuffle(deck);
	discard = [];
	candidatePres = lasthitler || Object.keys(players)[0];
	candidateChan = null;
	president = null;
	chancellor = null;
	//amount of librals
	let ls = Math.floor(players.length/2) + 1;
	let roles = ['h'];
	//add librals and fascist roles
	for(let i = 0; i < ls; i++){
		roles.push('l');
		if(i < players.length - ls - 1)
		roles.push('f');
	}
	shuffle(roles);
	let j = 0;
	//assign roles and party to each player
	players.forEach(player => {
		player.role = roles[j];
		player.party = roles[j] == 'h' ? 'f' : roles[j];
		j++;
	});	
	passThePresidentialCandidacy(true);
}

function passThePresidentialCandidacy(newGame){
	currentGamestate = GAMESTATE.PASS;
	if(!newGame){
		let i = players.findIndex(candidatePres);
		i++;
		if(i >= players.length)
			i = 0;
		candidatePres = players[i];
	}	
	nominateAChancellor();
}

function nominateAChancellor(){
	currentGamestate = GAMESTATE.NOMINATE;
	if(!candidatePres) candidatePres = {};
	io.to(`${candidatePres.id}`).emit('nominateachancellor');
}

function chancellorNominated(data){
	//set candidateChan	
	voteOnTheGovernment();
}

function voteOnTheGovernment(){
	currentGamestate = GAMESTATE.VOTE;
	//emit what to vote on
}

function governmentVotedOn(){
	//socket.on cast players vote
	//if all players voted call the function allPlayersVoted
}

function allPlayersVoted(){	
	//if failed
		//increment counter
		//pass the presidency
	//if success
		//increment = 0
		//deal policy cards to pres
}

function dealPolicyCards(){
	currentGamestate = GAMESTATE.POLICY;
	//draw top 3, give to pres
}

function presidentDiscaredPolicy(){
	//give the 2 cards to the chanc
}

function chancellorPlayedPolicy(){
	//if power do power
	//else pass the pres
}


//Shuffle an array
//https://javascript.info/task/shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}