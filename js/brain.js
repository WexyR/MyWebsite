class Node {
  constructor(x, y, r, color="#0892D0", active_color="#e1eded"){
    this.x = x;
    this.y = y;
    this.r = r;
    this.illuminated = false;
    this.neighbors = new Set();
    this.lifetimeReset = 150; //millis
    this.lifetime = -1;
    this.t0 = new Date();
    this.has_given = false;
    this.n = 0;
    this.from = null;
    this.color = color;
    this.active_color = active_color;
  }

  draw(ctx){
    if(this.lifetime >= 0){
      this.lifetime -= new Date().valueOf() - this.t0;
      this.t0 = new Date().valueOf();
    }
    if(this.lifetime >= 0 && this.lifetime <= 7*this.lifetimeReset/8 && !this.has_given){
      this.travel(this.n, this.from);
      this.has_given = true;
    }else if(this.has_given && this.lifetime < 0){
      this.has_given = false;
    }
    ctx.beginPath();
    if(this.is_illuminated()){
      ctx.fillStyle = this.active_color;
    }else{
      ctx.fillStyle = this.color;
    }
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }

  is_illuminated(){
    return this.illuminated || this.lifetime>=0;
  }

  illuminate(){
    this.illuminated = true;
  }

  illuminate_neighbors(){
    this.neighbors.forEach((n, i) => {
      n.illuminate();
    });
  }

  desilluminate(){
    this.illuminated = false;
  }

  launch_travel(n, from=null){
    this.t0 = new Date().valueOf();
    this.lifetime = this.lifetimeReset;
    this.n = n;
    this.has_given = false;
    this.from = from;
  }

  travel(n, from=null){
    let ns = [...this.neighbors];
    if(from !== null){
      ns.splice(ns.indexOf(from), 1); //no U-turn
    }
    if(ns.length === 0){
      return -1;
    }
    let i = Math.floor(Math.random()*ns.length);
    let n2 = ns[i];
    if(n>0){
      n2.launch_travel(n-1, this);
    }else{
      return null;
    }
  }
}

class Connection{
  constructor(left, right, color="#0892D0", active_color="#e1eded"){
    this.nodes = new Set([left, right]);
    if(left === right){
      console.error("same node for a connection");
    }
    this.color = color;
    this.active_color = active_color;
  }

  difference(other){
    return new Set([...this.nodes].filter(x => !other.nodes.has(x)));
  }

  sign_neighbors(){
    let arrayset = [...this.nodes];
    let left = arrayset[0];
    let right = arrayset[1];
    left.neighbors.add(right);
    right.neighbors.add(left);
  }

  draw(ctx){
    ctx.beginPath();
    let arrayset = [...this.nodes];
    let left = arrayset[0];
    let right = arrayset[1];
    if(left.is_illuminated() && right.is_illuminated()){
      ctx.strokeStyle = this.active_color;
    }else{
      ctx.strokeStyle = this.color;
    }
    ctx.lineWidth = 1;
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
  }

}

class Network {
  constructor(canvas, xn=10, yn=10, x=0, y=0, w=1, h=1, vertical_offset=0.01,
  horizontal_offset=0.01, rmin=1.5, rmax=4.5, color="#0892D0", active_color="#e1eded",
  shape_func=function(n,network){return true;}){
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    this.x = x * canvas.offsetWidth;
    this.y = y * canvas.offsetHeight;
    this.w = canvas.offsetWidth*w;
    this.h = canvas.offsetHeight*h;

    this.nodes = [];
    this.connections = [];
    this.xn = xn;
    this.yn = yn;
    this.rmin = rmin;
    this.rmax = rmax;
    this.vertical_offset = vertical_offset*this.h;
    this.horizontal_offset = horizontal_offset*this.w;
    this.threshold = Math.max(this.w/this.xn, this.h/this.yn) + Math.sqrt(2)*Math.max(this.vertical_offset, this.horizontal_offset);
    // this.threshold = 2*this.vertical_offset + 2*this.horizontal_offset;
    console.log(this.threshold);
    this.shape_func = shape_func;
    this.color = color;
    this.active_color = active_color;
  }

  fill_node(){

    for(let j=0; j<this.yn; j++){
      for(let i=0; i<this.xn; i++){
        let x = 0;
        let y = 0;
        let r = Math.random()*(this.rmax-this.rmin)+this.rmin;
        if(this.xn !== 1 && this.yn !== 1){
          x = this.x + i*this.w/(this.xn-1) + (Math.random()*this.horizontal_offset*2-this.horizontal_offset);
          y = this.y + j*this.h/(this.yn-1) + (Math.random()*this.vertical_offset*2-this.vertical_offset);
        }else if(this.xn === 1 && this.yn !== 1){
          x = this.x + this.w/2 + (Math.random()*this.horizontal_offset*2-this.horizontal_offset); //center the xs
          y = this.y + j*this.h/(this.yn-1) + (Math.random()*this.vertical_offset*2-this.vertical_offset);
        }else if(this.xn !== 1 && this.yn === 1){
          x = this.x + i*this.w/(this.xn-1) + (Math.random()*this.horizontal_offset*2-this.horizontal_offset);
          y = this.y + this.h/2 + (Math.random()*this.vertical_offset*2-this.vertical_offset); //center the ys
        }else{ // unique Node
          x = this.x + this.w/2 + (Math.random()*this.horizontal_offset*2-this.horizontal_offset); //center the x
          y = this.y + this.h/2 + (Math.random()*this.vertical_offset*2-this.vertical_offset); //center the y
        }
        let n = new Node(x, y, r, this.color, this.active_color);
        if(this.shape_func(n, this)){
          this.nodes.push(n);
        }
      }
    }
  }

  connect_node(){
    for(let i in this.nodes){
      let n1 = this.nodes[i];
      let co = [];
      let minus = {n:null, d:100000};
      for(let j in this.nodes){
        let n2 = this.nodes[j];
        if(n1 === n2){
          continue;
        }
        let d = Math.sqrt((n1.x-n2.x)*(n1.x-n2.x) + (n1.y-n2.y)*(n1.y-n2.y))
        // if(Math.floor(Math.random()*50) === 1){
        //   console.log(d);
        // }
        if(d < minus.d){
          minus.n = n2;
          minus.d = d;
        }
        if(d < this.threshold){
          let c = new Connection(n1, n2, this.color, this.active_color);
          co.push(c);
        }
      }
      // console.log(co.length);
      while(co.length >= 3){
        co.splice(Math.floor(Math.random()*co.length), 1);
      }
      if(co.length === 0){
        co.push(new Connection(n1, minus.n));
      }

      co.forEach((conn, k) => {
        this.connections.push(conn);
        conn.sign_neighbors();
      });

    }
  }

  update(){
    this.connections.forEach((item, i) => {

        item.draw(this.ctx);

    });

    this.nodes.forEach((item, i) => {

        item.draw(this.ctx);

    });

  }

  clear_canvas(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  auto_update(){
    this.clear_canvas();
    this.update();

    let self = this;
    requestAnimationFrame(function(){
      self.auto_update();
    });
  }

  launch_from_node(i){
    this.nodes[i].launch_travel(Math.floor(Math.random()*25+10));
  }

  random_launch(){
    let i = Math.floor(Math.random()*this.nodes.length);
    this.launch_from_node(i);
  }

  closest_node(x, y){
    let minDist = 100000;
    let minDistNode = -1;
    this.nodes.forEach((item, i) => {
      let dist = Math.sqrt((x-item.x)*(x-item.x) + (y-item.y)*(y-item.y));
      if(dist < minDist){
        minDist = dist;
        minDistNode = i;
      }
    });
    return [minDistNode, this.nodes[minDistNode]];
  }
  desilluminate(i=null){
    if(i !== null){
      this.nodes[i].desilluminate();
    }else{
      this.nodes.forEach((item, i) => {
        item.desilluminate();
      });
    }
  }
}

function inel(x, y, ox, oy, a, b){
    return (((x-ox)/a)**2)+(((y-oy)/b)**2) <= 1;
  }

function brain_shape(node, network){

      let fisrt_assert = inel(node.x, node.y, network.x+0.18*network.w*1.25, network.y+0.36*network.h*1.25, 0.16*network.w*1.25, 0.22*network.h*1.25);
      let second_assert = inel(node.x, node.y, network.x+0.40*network.w*1.25, network.y+0.38*network.h*1.25, 0.28*network.w*1.25, 0.30*network.h*1.25);
      let third_assert = inel(node.x, node.y, network.x+0.54*network.w*1.25, network.y+0.48*network.h*1.25, 0.08*network.w*1.25, 0.36*network.h*1.25);
      let fourth_assert = inel(node.x, node.y, network.x+0.64*network.w*1.25, network.y+0.44*network.h*1.25, 0.14*network.w*1.25, 0.22*network.h*1.25);

      return fisrt_assert || second_assert || third_assert || fourth_assert;
      // return true;
}

$(function(){
  ///*
  var $canvas = $("#brain-canvas");
  var $home = $("#home");

  const canvas_h = $canvas.get(0).scrollHeight

  var network = new Network($canvas.get(0), 35, 35, 0.4, 0.15, 0.45, 0.75, 0.03, 0.03, 1.5, 4.5, "#0892D0", "#e1eded", brain_shape);
  network.fill_node();
  network.connect_node();
  network.auto_update();
  setInterval(function(){
    network.random_launch();
  }, 2000);

  $home.get(0).addEventListener('mousemove', function(e){
    const rect = network.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    network.desilluminate();
    let cn = network.closest_node(mouseX, mouseY)[1];
    cn.illuminate();
    cn.illuminate_neighbors();
  });

  $home.get(0).addEventListener('click', function(e){
    const rect = network.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    network.desilluminate();
    let cn = network.closest_node(mouseX, mouseY)[1];
    cn.launch_travel(100);
  });

  var scrollOpacity = function(){
    const opacity = 1-Math.min(Math.max(0, 2*window.scrollY/canvas_h), 1)
    $canvas.css('opacity', opacity);
    $("#home h1").css('opacity', opacity);
  }

  scrollOpacity();

  window.addEventListener('scroll', function(e){
    scrollOpacity();
  });

  //*/

});
