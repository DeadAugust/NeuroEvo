let agents = []; //the array that holds the population of agents

let nnOptions = { //remember, can only feed inputs numbers
    //do i need to label these with numbers instead?
    inputs: ['n', 'e', 's', 'w'], //should test with and without goal input as 5th
    outputs: ['up', 'right', 'down', 'left'], //really confused about why classification examples are one output
    task: 'classification',
    debug: true
}

class Agent {
    constructor(nn){
        this.nn = nn;
        this.fitness = 0;
    }

    takeStep(flEnv){
        //read surroundings -- good 1, bad -1, hmm. could it be a normalized ratio of distance to goal if go that direction?
        //kind of pointless since southeast is always best then, but try for now
        let spot = flEnv.pos; //redundant, fix later TODO
        let northVal, eastVal, southVal, westVal;
        let north, east, south, west;
        //ugh x and y flipped because row/col, and biased towards moving down
        //north sensor
        if (flEnv.pos.y == 0){
            north = "OFF"
        } else {
            north = flEnv.map[spot.y-1][spot.x];
        }
        if (north == "H" || north == "OFF") { //if hole
            northVal = 0;
        } else {
            northVal = ((flEnv.pos.x + 1) * (flEnv.pos.y)) / (flEnv.size * flEnv.size);
            //hopefully is normalizing where 1 is goal and 0 is start
        }
        //east sensor
        if (flEnv.pos.x == flEnv.size-1){
            east = "OFF"
        } else {
            east = flEnv.map[spot.y][spot.x + 1];
        }
        if (east == "H" || east == "OFF") { //if hole
            eastVal = 0;
        } else {
            eastVal = ((flEnv.pos.x + 2) * (flEnv.pos.y +1)) / (flEnv.size * flEnv.size);
        }
        //south sensor
        if (flEnv.pos.y == flEnv.size-1){
            south = "OFF"
        } else {
            south = flEnv.map[spot.y+1][spot.x];
        }
        if (south == "H" || south == "OFF") { //if hole
            southVal = 0;
        } else {
            southVal = ((flEnv.pos.x + 1) * (flEnv.pos.y+2)) / (flEnv.size * flEnv.size);
        }
        //west sensor
        if (flEnv.pos.x == 0){
            west = "OFF"
        } else {
            west = flEnv.map[spot.y][spot.x-1];
        }
        if (west == "H" || west == "OFF") { //if hole
            westVal = 0;
        } else {
            westVal = ((flEnv.pos.x) * (flEnv.pos.y+1)) / (flEnv.size * flEnv.size);
        }

        console.log({
            n: north, northVal,
            e: east, eastVal,
            s: south, southVal,
            w: west, westVal
        })

        let dirInputs = [northVal, eastVal, southVal, westVal];
        //feed forward
        for (let i = 0; i < 100; i++){ //testing
            let rand1 = random(1);
            let rand2 = random(1);
            this.nn.addData({n: 0, e: rand1, s: rand2, w: 0}, {up: 0, right: .3, down: .7, left: 0})
        }
        this.nn.normalizeData();
        this.nn.train({ epochs: 20 }, finishedTraining(this));
    
        // this.nn.classify(dirInputs, gotAction);
        


        //get action
        //take action
        //update flEnv
        //get reward
        //check if end

    }
    
}

 //finished training call back
 function finishedTraining(agent) {
    console.log('finished training: ');
    console.log(agent.nn);
    // this.nn.classify(dirInputs, gotAction);
}

function gotAction(error, results) {
    console.log(results);
    if (error) {
      console.error(error);
      return;
    }
}