$(function(){

  $("#mediasection .arrow").on("click", function(e){
    // alert("test");
    $(this).toggleClass("clicked");
    $("#mediasection .medias").toggleClass("clicked");
  });

});
