function graph_toggle(from_name, to_name){
  let $graph1 = $("#skills figure ul[name='"+from_name+"']");
  $graph1.css("opacity", 0);
  setTimeout(function(){
    $graph1.css("display", "none");
    let $graph2 = $("#skills figure ul[name='"+to_name+"']");
    $graph2.css("display", "flex");
    setTimeout(function(){

      $graph2.css("opacity", 1);
    }, 200);
  }, 400);
}


$(function(){
  $tabsel = $("#skills .tab-select ul li");
  let active_graph = $tabsel.first().attr("value");
  $tabsel.on("click", function(e){
    $tabsel.removeClass("selected");
    $(this).addClass("selected");
    let new_graph = $(this).attr("value");
    if(new_graph !== active_graph){
      graph_toggle(active_graph, new_graph);
      active_graph = new_graph;
    }
  });

});
