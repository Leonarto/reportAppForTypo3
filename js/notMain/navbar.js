
/**
 * Created by Leonarto on 09-11-2017.
 */

/***********************************NAVBAR********************************************************/

function makeNavbar(template){

  // Botones del menu que muestran y esconden partes del documento principal de reportes
  var hideShowBtn = function (name, itemToHideShow, active){
    var btn = $(
        '<div class="rep-menu-btn">' +
        name +
        '</div>');
    if(active){
      hideAll();
      itemToHideShow.css('display', 'block');
      btn.addClass('active');
    }
    btn.on('click', function (){
      if(btn.hasClass('active')){
        itemToHideShow.css('display', 'none');
        btn.removeClass('active');
      } else {
        hideAll();
        itemToHideShow.css('display', 'block');
        btn.addClass('active');
      }
    });

    function hideAll(){
      $('.rep-menu-btn').removeClass('active');
      $('.rep-main-section > div').css('display', 'none');
      $('#notifications-container').css('display', 'block');
    }

    return btn;
  };

  var build = function(buildConf){
    var navCont = template.find('#navbar-btn-container')
    buildConf.forEach(function(item){
      navCont.append(hideShowBtn(item.nombre, template.find(item.container), item.shown))
    });
  }

  return {
    hideShowBtn: hideShowBtn,
    build: build
  };

}
