// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S18

// This flappy bird implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&

// Attempt to switch over to tf.js by August Luhrs

// How big is the population
let totalPopulation = 500; //low for debug
// All active birds (not yet collided with pipe)
let activeBirds = [];
// All birds for any given population
let allBirds = [];
// Pipes
let pipes = [];
// A frame counter to determine when to add a pipe
let counter = 0;

// Interface elements
let speedSlider;
let speedSpan;
let highScoreSpan;
let allTimeHighScoreSpan;
let generationSpan;
let openingSlider;
let openingSpan;

// All time high score
let highScore = 0;

//generation count
let genCount = 0;

// Evolving or just showing the current best
let runBest = false;
let runBestButton;

//NN set up stuff
//button and bool start the sketch
let ready = false;
let readyButt;
//NN settings
let settings;
let hiddenP, hiddenSpan, popP, popSpan, mutationP, mutationSpan;
let hiddenSlider, popSlider, mutationSlider;
let activationP;
let activationRadio, lossRadio, optimizerRadio;
let hiddenSet, popSet, mutationSet, activationSet;


function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('canvascontainer');
  // frameRate(1); //for debugging

  //set up set up set up
  settings = createDiv('SETTINGS')
    .parent('settingsPapa')
    .id('settings');
  //hidden node setting
  hiddenP = createP('Number of Hidden Nodes: ')
    .parent('settings')
    .id('hidden');
  hiddenSpan = createSpan()
    .parent('hidden');
  hiddenSlider = createSlider(1, 12, 8) //number of hidden nodes
    .parent('settings');
  //population setting
  popP = createP('Number of Birds: ')
    .parent('settings')
    .id('pop');
  popSpan = createSpan()
    .parent('pop');
  popSlider = createSlider(50, 600, 400, 50) //population size
    .parent('settings');
  //mutation rate setting
  mutationP = createP('Mutation Rate: ')
    .parent('settings')
    .id('mutation');
  mutationSpan = createSpan()
    .parent('mutation');
  mutationSlider = createSlider(0, 100, 10) //mutation rate -- needs to be adjusted
    .parent('settings');
  //activation function setting
  activationP = createP('Activation Function:')
    .parent('settings')
    .id('activation');
  activationRadio = createRadio() //still with 1.0.0?
    .parent('activation');
  activationRadio.option('elu');
  activationRadio.option('linear');
  activationRadio.option('sigmoid');
  activationRadio.option('softmax');
  activationRadio.option('tanh');

  // lossRadio = createRadio()
  //   .parent('settings');
  // lossRadio.option('meanSquaredError');

  // optimizerRadio = createRadio() //is this doing anything if no learning? need learning rate?
  //   .parent('settings');
  // optimizerRadio.option('sgd');

  readyButt = createButton('Press When Ready To Start')
    .parent('settings')
    .mousePressed(function() {
      hiddenSet = hiddenSlider.value();
      popSet = popSlider.value();
      mutationSet = (mutationSlider.value() / 100);
      if (activationRadio.value() == "") {
        activationSet = 'sigmoid';
      } else {
        activationSet = activationRadio.value();
      }
      settings.hide();

      // Create a population
      for (let i = 0; i < popSet; i++) {
        let bird = new Bird();
        activeBirds[i] = bird;
        allBirds[i] = bird;
      }

      ready = true;
    });

  // Access the interface elements
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');
  openingSlider = select('#openingSlider');
  openingSpan = select('#opening');
  highScoreSpan = select('#hs');
  generationSpan = select('#gen');
  allTimeHighScoreSpan = select('#ahs');
  runBestButton = select('#best');
  runBestButton.mousePressed(toggleState);

  // Create a population
  // for (let i = 0; i < totalPopulation; i++) {
  //   let bird = new Bird();
  //   activeBirds[i] = bird;
  //   allBirds[i] = bird;
  // }
}

// Toggle the state of the simulation
function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    resetGame();
    runBestButton.html('continue training');
    // Go evolve some more
  } else {
    nextGeneration();
    runBestButton.html('run best');
  }
}

function draw() {
  background(0);
  if (!ready) {
    hiddenSpan.html(hiddenSlider.value());
    popSpan.html(popSlider.value());
    mutationSpan.html((mutationSlider.value() / 100));
  } else {
    // Should we speed up cycles per frame
    let cycles = speedSlider.value();
    speedSpan.html(cycles);

    //
    let openingWidth = openingSlider.value();
    openingSpan.html(openingWidth);

    // How many times to advance the game
    for (let n = 0; n < cycles; n++) {

      // Show all the pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].update();
        if (pipes[i].offscreen()) {
          pipes.splice(i, 1);
        }
      }
      // Are we just running the best bird
      if (runBest) {
        bestBird.think(pipes);
        bestBird.update();
        for (let j = 0; j < pipes.length; j++) {
          // Start over, bird hit pipe
          if (pipes[j].hits(bestBird)) {
            resetGame();
            break;
          }
        }

        if (bestBird.bottomTop()) {
          resetGame();
        }
        // Or are we running all the active birds
      } else {
        for (let i = activeBirds.length - 1; i >= 0; i--) {
          let bird = activeBirds[i];
          // Bird uses its brain!
          //output array determines whether to jump or not
          bird.think(pipes);
          bird.update();


          // Check all the pipes
          for (let j = 0; j < pipes.length; j++) {
            // It's hit a pipe
            if (pipes[j].hits(activeBirds[i])) {
              // Remove this bird
              activeBirds.splice(i, 1);
              break;
            }
          }

          if (bird.bottomTop()) {
            activeBirds.splice(i, 1);
          }

        }
      }

      // Add a new pipe every so often
      if (counter % 75 == 0) {
        pipes.push(new Pipe(openingWidth));
      }
      counter++;
    }

    // What is highest score of the current population
    let tempHighScore = 0;
    // If we're training
    if (!runBest) {
      // Which is the best bird?
      let tempBestBird = null;
      for (let i = 0; i < activeBirds.length; i++) {
        let s = activeBirds[i].score;
        if (s > tempHighScore) {
          tempHighScore = s;
          tempBestBird = activeBirds[i];
        }
      }

      // Is it the all time high scorer?
      if (tempHighScore > highScore) {
        highScore = tempHighScore;
        bestBird = tempBestBird;
      }
    } else {
      // Just one bird, the best one so far
      tempHighScore = bestBird.score;
      if (tempHighScore > highScore) {
        highScore = tempHighScore;
      }
    }


    // Update DOM Elements
    highScoreSpan.html(tempHighScore);
    allTimeHighScoreSpan.html(highScore);
    generationSpan.html(genCount);

    // Draw everything!
    for (let i = 0; i < pipes.length; i++) {
      pipes[i].show();
    }

    if (runBest) {
      bestBird.show();
    } else {
      for (let i = 0; i < activeBirds.length; i++) {
        activeBirds[i].show();
      }
      // If we're out of birds go to the next generation
      if (activeBirds.length == 0) {
        nextGeneration();
        genCount++;
      }
    }
  }
}
