//updated to use tf.js
class NeuralNetwork {
  constructor(in_nodes, hid_nodes, out_nodes, act_func, loss_func, optimizer_) {
    if (in_nodes instanceof NeuralNetwork) {
      tf.tidy(() => { //need?
        let oldBrain = in_nodes;
        //need all this repetition?
        this.input_nodes = oldBrain.input_nodes;
        this.hidden_nodes = oldBrain.hidden_nodes;
        this.output_nodes = oldBrain.output_nodes;
        this.activation_function = oldBrain.activation_function;
        this.loss_function = oldBrain.activation_function;
        this.optimizer = oldBrain.optimizer;
        //really just this, right?
        this.model = oldBrain.model;
      });

    } else { //new NN
      tf.tidy(() => {
        this.input_nodes = in_nodes; //why the repetition? to copy
        this.hidden_nodes = hid_nodes;
        this.output_nodes = out_nodes;
        this.activation_function = act_func;
        this.loss_function = loss_func;
        this.optimizer = optimizer_;

        const model = tf.sequential();
        //adding hidden layer fed from input layer
        model.add(tf.layers.dense({
          units: this.hidden_nodes,
          inputShape: [this.input_nodes],
          activation: this.activation_function
          //kernel - weights?
          //bias? useBias = true;
        }));
        //adding output layer fed from hidden layer
        model.add(tf.layers.dense({
          units: this.output_nodes,
          activation: this.activation_function
        }));
        //already randomized, so no need to call .randomize();
        //prepare the model
        model.compile({
          loss: this.loss_function,
          optimizer: this.optimizer
        });
        //no need to fit, because that's what the GA is for

        this.model = model;
      });
    }
  }

  async predict(input_array) {
    const actionOutputs = tf.tidy(() => {
      console.log('inside tidy ' + tf.memory().numTensors);
      const inputs = tf.tensor2d([input_array]);
      return this.model.predict(inputs); //await?
      console.log('after return in tidy ' + tf.memory().numTensors);

    });
    console.log('after tidy ' + tf.memory().numTensors);

    let actionArray = await actionOutputs.array();
    tf.dispose(actionOutputs);
    console.log('after dispose after tidy ' + tf.memory().numTensors);

    return actionArray[0];
  }

  // still need this? yes, for bird.js line 35
  copy() {
    return new NeuralNetwork(this);
  }

  //mutation (bird.js line 10)
  mutate(m) {
    if (m != 0) {
      console.log("mutating");
      //super big thanks to Shanqing Cai for help with weights and bias:
      //https://groups.google.com/a/tensorflow.org/forum/#!topic/tfjs/ORkUHg_k_fU
      tf.tidy(() => {
        //get weights and biases as tensor
        const ih_weights = this.model.layers[0].getWeights()[0]; //tensor shape 2 [5,8]
        const ho_weights = this.model.layers[1].getWeights()[0]; //tensor shape 2 [8,2]
        const h_bias = this.model.layers[0].getWeights()[1]; //tensor shape [8]
        const o_bias = this.model.layers[1].getWeights()[1]; //tensor shape [2]

        //mutate by adding scalar to each tensor
        // const mutationTensor = tf.scalar(mutationScalar); //needs to be number
        //have to do weird 1d tensor because can't make tf.scalar with a variable ***
        //mutate ih_weights and h_bias
        let hidden_array = [];
        for (let i = 0; i < this.hidden_nodes; i++) {
          hidden_array.push(m);
        }
        const hidden_mutationTensor = tf.tensor1d(hidden_array);
        const ih_w_mutated = ih_weights.add(hidden_mutationTensor);
        const h_b_mutated = h_bias.add(hidden_mutationTensor);
        //mutate ho_weights and o_bias;
        let output_array = [];
        for (let i = 0; i < this.output_nodes; i++) {
          output_array.push(m);
        }
        const output_mutationTensor = tf.tensor1d(output_array);
        const ho_w_mutated = ho_weights.add(output_mutationTensor);
        const o_b_mutated = o_bias.add(output_mutationTensor);

        // console.log('weights');
        // ih_weights.print();
        // ih_w_mutated.print();
        // console.log('bias');
        // h_bias.print();
        // h_b_mutated.print();

        //now set the weights and bias of layers
        this.model.layers[0].setWeights([ih_w_mutated, h_b_mutated]);
        this.model.layers[1].setWeights([ho_w_mutated, o_b_mutated]);



      });
    }

    // this.model.layers[0].getWeights()[0].print();
  }
}


// async function pred(brain, inputs) {
//   console.log('pred');
//   return await brain.model.predict(inputs).array; //await?
// }
/*
//from example

//config model
const model = tf.sequential();

//config each layer
const configHidden = {
  inputShape: [5],
  units: 4,
  activation: 'sigmoid'
}
const hidden = tf.layers.dense(configHidden);

const configOutput = {
  units: 2,
  activation: 'sigmoid'
}
const output = tf.layers.dense(configOutput);

//add layers to the model
model.add(hidden);
model.add(output);

console.log(hidden);
// hidden.print();
console.log(output);

const sgdOpt = tf.train.sgd(0.1);
const config = {
  optimizer: sgdOpt,
  loss: 'meanSquaredError'
}
model.compile(config);

console.log(model);
tf.print(model);
//don't need predict for NeurEvo
let outputs = model.predict(tf.tensor2d([
  [0.25, 0.92, 0.3, 0.23, 0.11]
]));
console.log(outputs);

//tensors tracked
console.log(tf.memory());

//which  backend -- webGL
// console.log(tf.getBackend());
*/
