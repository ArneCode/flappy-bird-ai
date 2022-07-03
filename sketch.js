let s
let starbird,starbrain
let game_speed_slider
let speed = 4
let points = 0,gen=1
let num_birds = 50
let birds = []
let show_brain=true
let show_brain_box

function draw_brain(x,y,weights,inputs,outputs){
  //print(weights)
  fill(255,0,0)
  for(let a=0;a<outputs;a++){
    p2x=100+x
    p2y=50+30*a+y
    noStroke()
    ellipse(p2x,p2y,10,10)
    for(let b=0;b<inputs;b++){
      p1x=10+x
      p1y=10+30*b+y
      noStroke()
      ellipse(p1x,p1y,10,10)
      //print((a)*inputs+b)
      strokeWeight(5)
      if((weights[a*inputs+b]>0)){
        stroke(0,(weights[a*inputs+b])*255,0)
        }else{
          //let g =(weights[a*inputs+b])*255
                  stroke(/*(weights[a*inputs+b])*255*/(weights[a*inputs+b])*-255,0,0)
          }
      line(p1x,p1y,p2x,p2y)
      }
    }
  noStroke()
  }

function mutate(_weights, amount) {

  let new_weights = []
  for (let i in _weights)
    for (let i = 0; i < _weights.length; i++) {
      new_weights[i] = _weights[i] + random(-amount, amount)
    }
  return new_weights
}

function get_inputs(a, b) {
  let inputs = [
    a.velY,
    b.x,
    a.y - b.upper,
    a.y - b.lower,
    a.y
  ]
  return inputs
}
class säule {
  constructor(x) {
    this.x = x
    this.dicke = 40
    this.lücke=120
    this.lower = random(height * 0.1, height * 0.9-this.lücke)
    this.upper = height - this.lücke - this.lower

  }
  move(amount) {
    this.x -= amount
  }
  show() {
    strokeWeight(1)
    fill(0, 255, 0)
    stroke(0)
    rect(this.x, 0, this.dicke, this.upper)
    rect(this.x, height - this.lower, this.dicke, height)
  }
}

class bird {
  constructor(x, y, size, gehirn = null, weights = null) {
    this.x = x
    this.y = y
    this.size = size
    this.velY = 0
    this.points = 0
    this.dead = false
    this.r = random(255)
    this.g = random(255)
    this.b = random(255)
    if (gehirn == null) {
      this.gehirn = new brain(5, 2, weights)
    } else {
      this.gehirn = gehirn
    }
  }
  show() {
    strokeWeight(1)
    stroke(0)
    fill(this.r, this.g, this.b)
    rect(this.x, this.y, this.size, this.size)
  }
  uptmov() {
    this.y += this.velY
    this.velY += 0.4
  }
  die() {
    this.x = this.y = this.velY = 0
    this.dead = true
  }
  flap() {
    this.velY = (-7)
    //print("flap")
  }
  has_collided(thing) {
    let result = false
    if (this.y + this.size > height) {
      return true
    }
    if (this.y < thing.upper || this.y + this.size > width - thing.lower) {
      if (this.x + this.size > thing.x && this.x < thing.x + thing.dicke) {
        result = true
      }
    }
    return result
  }
}

class brain {
  constructor(num_inputs, num_outputs, weights = null) {
    //print("new brain")
    this.num_inputs = num_inputs
    this.num_outputs = num_outputs
    if (weights == null) {
      this.weights = []
      for (let a = 0; a < num_outputs; a++) {
        for (let b = 0; b < num_inputs; b++) {
          let weight = random(-1, 1)
          this.weights.push(weight)
        }
      }
    } else {
      this.weights = weights
      //print("weights assigned")
    }
  }
  think(inputs) {
    let result = []
    for (let a = 0; a < this.num_outputs; a++) {
      result[a] = 0
      for (let b = 0; b < this.num_inputs; b++) {
        result[a] += this.weights[(a + 1) * b] * inputs[b]
      }
    }
    return result
  }
}

function setup() {
  createCanvas(400, 400).parent("canvas")
  randomSeed(Date.now())
  frameRate(1000)
  show_brain_box=createCheckbox("Gehirn zeigen?",true)
  show_brain_box.changed(show_brain_event)
  show_brain_box.parent("canvas")
  game_speed_slider=createSlider(1,100,1)
  game_speed_slider.parent("canvas")
  s = new säule(width)
  for (let i = 0; i < num_birds; i++) {
    birds[i] = new bird(20, height / 2, 40)
  }
  starbird = new bird(20, height / 2, 40)
  starbrain=starbird.gehirn.weights
}

function draw() {
  let num_speed_iter=game_speed_slider.value()
  for(let speed_iter=0;speed_iter<num_speed_iter;speed_iter++){
  background(255)
  let points_changed = false
  textSize(32)
 
    if(show_brain){
 draw_brain(200,200,starbrain,5,2)}
     fill(0, 0, 0)
  text("punkte: " + points, 10, 30)
  text("gen: "+gen,10,60)
  s.show()
  s.move(speed)
  let i = 0
  for (let b of birds) {
    if (!b.dead) {
      starbird = b
      i++
      //print(b)
      result = b.gehirn.think(get_inputs(b, s))
      if (result[0] > result[1]) {
        b.flap()
      }
      b.uptmov()
      b.show()
      if (b.has_collided(s)) {
        b.die()
        b.points = 0
      }
      if (b.x > s.x + s.dicke) {
        b.points++
        //print("tada")
        points_changed = true
        s = new säule(width)
      }
    }
  }
  if (points_changed) {
    points++
  }
  if (i == 0) {
    //print("new gen")
    gen++
    s = new säule(width)
    birds = []
    for (i = 1; i < num_birds; i++) {
      new_weights = mutate(starbird.gehirn.weights, 0.4)
     // print(starbird.gehirn.weights)
      // print(new_weights)
      let gehirn = new brain(5, 2)
        gehirn.weights = new_weights
      b = new bird(20, height / 2, 40, gehirn)
      birds[i] = b
    }
    birds[0] = starbird
    starbrain=starbird.gehirn.weights
    points=0
  }
    }
}
function show_brain_event(){
  show_brain=this.checked()
  }
