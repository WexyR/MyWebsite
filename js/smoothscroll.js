//doing smoothscroll in jquery to be cross browser
$('a').click(function(e){
  if(this.hash !== ''){
    e.preventDefault();

    $("html, body").animate({
      scrollTop: $(this.hash).offset().top
    }, 650);
  }
});
