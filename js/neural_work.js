

$(function(){
  const $work_canvas = $("#works canvas")

  var work_network = new Network($work_canvas.get(0), 5, 1, 0.1, 0.1, 0.8, 0.8, 0.4, 0, 10, 20);
  work_network.fill_node();
  work_network.connectNode();
  work_network.update();
  setInterval(function(){
    work_network.launch_from_node(0);
  }, 2000);

  $work_canvas.get(0).addEventListener('mousemove', function(e){
    const rect = work_network.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    work_network.desilluminate();
    let cn = work_network.closest_node(mouseX, mouseY);
    cn.illuminate();
  });

  $work_canvas.get(0).addEventListener('click', function(e){
    work_network.mouseHandler(e);
  });

});
