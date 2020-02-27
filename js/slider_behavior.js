$(function (){

  const $cards = $(".card");

  $cards.on("mouseenter", function(e){
    $(this).children().addClass("activeCard");
    $(this).children("img").css("border", "3px solid rgba(8, 146, 208, 0.99)");
    $(this).children("img").css("opacity", "0.2");
    $(this).children("img").css("filter", "grayscale(100%)");
    $(this).children("article").css("opacity", '1');

    $(this).children().on("click", function(e){
      console.log(this);
      // alert("website in progress!");
    });
  });

  $cards.on("mouseleave", function(e){
    $(this).children().removeClass("activeCard");
    $(this).children("img").css("border", "none");
    $(this).children("img").css("opacity", "1");
    $(this).children("img").css("filter", "grayscale(0%)");
    $(this).children("article").css("opacity", '0');

    $(this).children().off("click");
  });

});
