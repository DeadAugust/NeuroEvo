/*
Frozen Lake Test
ml5.NeuralNetwork + Genetic Algorithms
August Luhrs Oct. 2019

based on:
https://github.com/AidanNelson/reinforcement-learning-experiments/tree/master/simple-rl-tutorials/0-q-learning-agents
Aidan Nelson, Spring 2019
and 
https://natureofcode.com/book/chapter-9-the-evolution-of-code/
Dan Shiffman's Nature of Code G.A. tutorials
*/


//aidan's
// let qAgent;
// let logBenchmarks = false;

let testParameters = {
  populationSize: 20,
  mutationRate: .03
};


function setup(){
    createCanvas(800,800);
    background(0,100,100);

    //init population of agents
    for (let i = 0; i < testParameters.populationSize; i++){
      let newAgentNN = ml5.neuralNetwork(nnOptions); //no callback because no .init url?
      newAgentNN.model = newAgentNN.createModel(); //since not called in training
      let newAgent = new Agent(newAgentNN);
      agents.push(newAgent);
    }
    checkAgents();

    //set up FL environment/map
    resetEnv(4);

    //training interface
    let resetEnvButton = createButton('New Frozen Lake').mousePressed(() =>{ resetEnv(4)});
    let startTrainingButton = createButton('Start Training').mousePressed(()=>{startTraining()});
    let pauseTrainingButton = createButton('Pause Training').mousePressed(()=>{pauseTraining()});
    let genCountSpan = createSpan('Generation: 0');
    let genCount = 0;
    let agentCountSpan = createSpan('Agent#: 0');
    let agentCount = 0;
    //TODO training parameters, highest reward agent

    // let testButt = createButton('test').mousePressed(()=>{
    //   agentCount++;
    //   agentCountSpan.html('Agent#: ' + agentCount);
    // });
    // console.log(agentCountSpan.html());
  
  
    //NOTES
    //needs train on random data? 
    //might be easier to just generate random json data for train then to try and
    //directly manipulate the weights/biases / layers or w/e since the model functions are so interlinked...
    //but then how do we manipulate them for mutation???? hmmmmm
    //prob need to find the layers manipulation stuff... hmmm......

    //okay so .defineModelLayers() and .createModelInternal() seem to be where to look

    //defineModelLayers
    //wtf why is it !this.config... > w/e and not !> ?
    //tf.layers.dense() -- activations array? no, that's just sigmoid

    //createModelInternal
    //okay, so maybe just need to call .createModel on my own since I'm not training
    //YES THAT WORKED

    //now need to find weights/biases tensors
    //.model.layers[0] -- X
    //.model.weights[] -- this array of both weights/biases? they match the 5/16/4 pattern
    //.model.model
    //.model.model.layers
    //can i just use .getWeights()? need weights[i].clone()? randomGaussian() 36:00


    //so.... not sure if models start with random values, need to test
    //then, if so, i'll be able to mutate the same way as flappy bird.
    // if not, will need to go back to the funcitons and see where to create them.
    //END NOTES


    
    
    /* //aidan's
    // qAgent = new QAgent(4);
    qAgent = new QNetwork(4);
    // qAgent = new QNetworkLayers(4);

    let trainButton = createButton('Train Q Agent');
    trainButton.mousePressed(() =>{ console.log('Training Q Agent!'); qAgent.train()});
    let runButton = createButton('Run Q Agent');
    runButton.mousePressed(() =>{ qAgent.stepThrough()});
    let showButton = createButton('Show Q Table (ONLY WORKS FOR Q TABLE AGENT)');
    showButton.mousePressed(() =>{ qAgent.env.showTable = true; qAgent.env.render();});
    */

    //TODO: 
    //create setup parameters for the intial population
    //population size
    //mutation rate
    //rewards (for failing, stepping, finishing)
    //for now, starting with 20, .03, {0, .01, 1} or something
    //button to set params and start
  }
  
  //wow, no draw, nice

function resetEnv(size){
  flEnv = new FrozenLake(size);
  flEnv.render();
  console.log(flEnv);
}

function startTraining(){
  //needs to init agents -- in this version, already done in setup
  //then take one at a time, step through the env, count rewards for each
  //then repopulate and go again
  //so lets start with just getting one agent to step through

  //for
  // flEnv.reset();
  flEnv.render();
  agents[0].takeStep(flEnv);
}

function pauseTraining(){

}

function checkAgents(){
  console.log(agents);
  // testing copy
  // const modelCopy = agents[0].createModel();
  // const weights = agents[0].model.getWeights();
  // modelCopy.setWeights(weights);
  // console.log(weights);
  // console.log(modelCopy);

  // console.log(ml5);
}
function makeModel(){
  //no data
  //no training
  //do i even need the callback? not used in .init if no URL
}
