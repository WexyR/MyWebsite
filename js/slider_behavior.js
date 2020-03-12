$(function (){

  const $cards = $(".card");

  $cards.on("mouseenter", function(e){
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
