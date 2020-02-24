class Node {
  constructor(x, y, r){
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
      ctx.fillStyle = '#e1eded';
    }else{
      ctx.fillStyle = '#0892D0';
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
      ns.splice(ns.indexOf(from), 1);
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
  constructor(left, right){
    this.nodes = new Set([left, right]);
    if(left === right){
      console.error("same node for a connection");
    }
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
      ctx.strokeStyle = '#e1eded';
    }else{
      ctx.strokeStyle = '#0892D0';
    }
    ctx.lineWidth = 1;
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
  }

}

class Network {
  constructor(canvas, xn=10, yn=10, x=0, y=0, w=1, h=1){
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
    this.offset = 20;
    this.threshold = 2.5*this.offset;

    var self = this;
  }

  fill_node(){
    for(let j=0; j<this.yn; j++){
      for(let i=0; i<this.xn; i++){
        let n = new Node(this.x + i*this.w/this.xn + (Math.random()*this.offset*2-this.offset), this.y + j*this.h/this.yn + (Math.random()*this.offset*2-this.offset), Math.random()*3+1.5);
        if(this.inTheBrain(n)){
          this.nodes.push(n);
        }
      }
    }
  }

  inel(x, y, ox, oy, a, b){
    return (((x-ox)/a)**2)+(((y-oy)/b)**2) <= 1;
  }

  inTheBrain(n){
        // let n = this.nodes[j*this.xn + i];
        // let a=this.w/2;
        // let b=this.h/3;
        // let ox = this.x + this.w/2;
        // let oy = this.y + this.h/2;
        //
        // return (((n.x-ox)/a)**2 + ((n.y-oy)/b)**2 -1 <= 0.2) || (n.x>(ox+2*(a/5)) && n.x<(ox+3*(a/5)) && n.y>oy && n.y<oy+2*b);


        //
        // return true;

        let fisrt_assert = this.inel(n.x, n.y, this.x+0.18*this.w*1.25, this.y+0.36*this.h*1.25, 0.16*this.w*1.25, 0.22*this.h*1.25);
        let second_assert = this.inel(n.x, n.y, this.x+0.40*this.w*1.25, this.y+0.38*this.h*1.25, 0.28*this.w*1.25, 0.30*this.h*1.25);
        let third_assert = this.inel(n.x, n.y, this.x+0.54*this.w*1.25, this.y+0.48*this.h*1.25, 0.08*this.w*1.25, 0.36*this.h*1.25);
        let fourth_assert = this.inel(n.x, n.y, this.x+0.64*this.w*1.25, this.y+0.44*this.h*1.25, 0.14*this.w*1.25, 0.22*this.h*1.25);

        return fisrt_assert || second_assert || third_assert || fourth_assert;
        // return true;
  }


  connectNode(){
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
          // console.log("coucou");
          let c = new Connection(n1, n2);
          let ok = true;
          if(ok){
            co.push(c);
          }
        }
      }
      // console.log(co.length);
      while(co.length >= 3){
        // console.log("coucou");
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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.nodes.forEach((item, i) => {

        item.draw(this.ctx);

    });
    this.connections.forEach((item, i) => {

        item.draw(this.ctx);

    });
    let self = this;
    requestAnimationFrame(function(){
      self.update();
    });
  }

  mouseHandler(e){
    let rect = this.canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    let minDist = 100000;
    let minDistNode = -1;
    this.nodes.forEach((item, i) => {
      let dist = Math.sqrt((mouseX-item.x)*(mouseX-item.x) + (mouseY-item.y)*(mouseY-item.y));
      if(dist < minDist){
        minDist = dist;
        minDistNode = i;
      }
      item.desilluminate();
    });
    if(e.type === 'mousemove'){
      this.nodes[minDistNode].illuminate();
      this.nodes[minDistNode].illuminate_neighbors();
    }else if(e.type === 'click'){
      // this.nodes[minDistNode].illuminate();
      this.nodes[minDistNode].launch_travel(100);
    }
    // this.update();
  }

  random_launch(){
    let i = Math.floor(Math.random()*this.nodes.length);
    this.nodes[i].launch_travel(Math.floor(Math.random()*25+5));
  }
}

$(function(){
  var $canvas = $("#brain-canvas");
  var $home = $("#home");

  const canvas_h = $canvas.get(0).scrollHeight

  var network = new Network($canvas.get(0), 35, 35, 0.4, 0.15, 0.45, 0.75);
  network.fill_node();
  network.connectNode();
  network.update();
  setInterval(function(){
    network.random_launch();
  }, 2000);

  $home.get(0).addEventListener('mousemove', function(e){
    network.mouseHandler(e);
  });

  $home.get(0).addEventListener('click', function(e){
    network.mouseHandler(e);
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


});
