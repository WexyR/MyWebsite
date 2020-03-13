$(function (){

  const $cards = $(".card");
  $cards.each(function(card){
    $(this).find("article").css("width", $(this).find("img").css("width"));
  });

  $cards.on(("mouseenter", "mousemove"), function(e){
    $(this).children().addClass("activeCard");

    // $(this).children().on("click", function(e){
    //   alert("website in progress!");
    // });
  });

  $cards.on("mouseleave", function(e){
    $(this).children().removeClass("activeCard");

    // $(this).children().off("click");
  });

});
