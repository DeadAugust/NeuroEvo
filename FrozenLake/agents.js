let agents = []; //the array that holds the population of agents

let nnOptions = { //remember, can only feed inputs numbers
    inputs: ['n', 'e', 's', 'w', 'g'], //should test with and without goal input
    outputs: ['up', 'right', 'down', 'left'], //really confused about why classification examples are one output
    task: 'classification',
    debug: true
}