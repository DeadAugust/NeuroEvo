// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy bird implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&



// Mutation function to be passed into bird.brain
//effects the two weight matrices, and the two bias matrices

/* old mutate function
function mutate(x) {
  if (random(1) < 0.1) {
    let offset = randomGaussian() * 0.5;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}
*/

//now just passes the "scalar" value to add
function mutation() { //changed to mutation for clarity
  let mutationScalar = 0;
  // if (random(1) < 0.1) {
  if (random(1) < mutationSet) { //defined in settings
    let offset = randomGaussian() * 0.5;
    mutationScalar += offset;
    // console.log(mutationScalar + 'offset');
  }
  return mutationScalar;
}

class Bird {
  constructor(brain) {
    // position and size of bird
    this.x = 64;
    this.y = height / 2;
    this.r = 12;

    // Gravity, lift and velocity
    this.gravity = 0.8;
    this.lift = -12;
    this.velocity = 0;

    // Is this a copy of another Bird or a new one?
    // The Neural Network is the bird's "brain"
    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutation()); //why is it just "mutate" in the original??????
    } else {
      this.brain = new NeuralNetwork(5, hiddenSet, 2, activationSet, 'meanSquaredError', 'sgd'); //update later with other act_func options
    }

    // Score is how many frames it's been alive
    this.score = 0;
    // Fitness is normalized version of score
    this.fitness = 0;
  }

  // Create a copy of this bird
  copy() {
    return new Bird(this.brain);
  }

  // Display the bird
  show() {
    fill(255, 100);
    stroke(255);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }

  // This is the key function now that decides
  // if it should jump or not jump!
  async think(pipes) {
    // First find the closest pipe
    let closest = null;
    let record = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      let diff = pipes[i].x - this.x;
      if (diff > 0 && diff < record) {
        record = diff;
        closest = pipes[i];
      }
    }

    if (closest != null) {
      // Now create the inputs to the neural network
      let inputs = [];
      // x position of closest pipe
      inputs[0] = map(closest.x, this.x, width, 0, 1);
      // top of closest pipe opening
      inputs[1] = map(closest.top, 0, height, 0, 1);
      // bottom of closest pipe opening
      inputs[2] = map(closest.bottom, 0, height, 0, 1);
      // bird's y position
      inputs[3] = map(this.y, 0, height, 0, 1);
      // bird's y velocity
      inputs[4] = map(this.velocity, -5, 5, 0, 1);

      // Get the outputs from the network (an array of 2)
      let action = await this.brain.predict(inputs);
      if (action[1] > action[0]) {
        this.up();
      }
    }
  }

  // Jump up
  up() {
    this.velocity += this.lift;
  }

  bottomTop() {
    // Bird dies when hits bottom?
    return (this.y > height || this.y < 0);
  }

  // Update bird's position based on velocity, gravity, etc.
  update() {
    this.velocity += this.gravity;
    // this.velocity *= 0.9;
    this.y += this.velocity;

    // Every frame it is alive increases the score
    this.score++;
  }
}
