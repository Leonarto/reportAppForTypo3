/**
 * Created by Leonarto on 09-11-2017.
 */

/*********************************FILTRAR POR FECHA WINDOW******************************************/

function makeFechaWin(template){

  var buildFiltroPorFecha = function (){
    var container = $(
        '<div class="filtro-fecha-container" style="display: none">' +
          '<div class="filtro-fecha-rango">' +
            '<div class="input-group-fecha-inicial">' +
              '<label for="filtro-fecha-inicial">Fecha Inicial</label>' +
              '<div class="input-group-calendar">' +
                '<span><span class="glyphicon glyphicon-calendar"></span></span>' +
              '</div>' +
            '</div>' +
            '<div class="input-group-fecha-final">' +
              '<label for="filtro-fecha-final">Fecha Final</label>' +
              '<div class="input-group-calendar">' +
                '<span><span class="glyphicon glyphicon-calendar"></span></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>');
    var fluidForm = $('#crearReporteExcelLinkFechaForm');
    var innerContainer = container.html();
    container.html('').append($(
        '<div class="linea-separadora-hor"></div>' +
        '<h4>Filtros por Fechas <div id="fecha-btn-container"></div></h4>' +
        '<div class="filtros-rapidos"></div>'
        ))
        .append(fluidForm);
    fluidForm.append(innerContainer);
    fluidForm.find('#fechaInicial, #fechaFinal').datetimepicker({
      format: "DD-MM-YYYY, hh:mm",
      locale: "es"
    });
    container.find('.input-group-fecha-inicial .input-group-calendar').append(fluidForm.find('#fechaInicial'));
    container.find('.input-group-fecha-final .input-group-calendar').append(fluidForm.find('#fechaFinal'));
    container.find('.filtro-fecha-rango')
        .append(fluidForm.find('.filtros-group-div'))
        .append(fluidForm.find('#crearReporteRangoSubmit'));
    container.find('#tipoFaena').select2({placeholder: 'Seleccione Opción'});
    container.find('#faena').select2({placeholder: 'Seleccione Opción'});
    container.find('.filtros-rapidos').append(makeFiltrosRapidos());
    // container.find('#fecha-btn-container').append(this.buildFechaExcelBtn());

    //Append to the template
    $(template[1])
        .append(container)        // make on change mes select
        .find('#mes-select').on('change',
            function(){
              if($('#ano-select').val() && $('#ano-select').val() != 'Seleccione Año'){
                var thisYear = parseInt($('#ano-select').val());
              } else {
                var thisYear = moment(Date.now()).year();
              }
              var i = $(this).val();
              if(i == '00'){
                return $('#ano-select').trigger('change');
              }
              var ini = $('#fechaInicial');
              var end = $('#fechaFinal');
              ini.val('01-'+i+'-'+thisYear+', 0:00');
              var n = parseInt(i) + 1;
              if(n < 10){
                n = "0"+n;
              }
              if(i == "12"){
                end.val('01-01-'+(thisYear+1)+', 0:00');
              } else {
                end.val('01-'+n+'-'+thisYear+', 0:00');
              }
            });
    $(template[1]).find('#ano-select').on('change',
        function(){
          var ini = $('#fechaInicial');
          var end = $('#fechaFinal');
          if($('#mes-select').val() && $('#mes-select').val() != '00'){
            return $('#mes-select').trigger('change');
          } else {
            var i = $(this).val();
            ini.val('01-01-'+i+', 0:00');
            var n = parseInt(i) + 1;
            end.val('01-01-'+n+', 0:00');
            if($(this).val() == 'Seleccione Año'){
              ini.val('');
              end.val('');
            }
          }
        });
    return container;
  };

  var makeFiltrosRapidos = function(){
    var mesFiltro = $(
        '<div class="form-group f-1>' +
          '<label for="mes-select">Mes</label>' +
          '<select id="mes-select" class="form-control" placeholder="Seleccione Mes"></select>' +
        '</div>');
    var anoFiltro = $(
        '<div class="form-group f-1>' +
          '<label for="ano-select">Año</label>' +
          '<select id="ano-select" class="form-control" placeholder="Seleccione Año"></select>' +
        '</div>');
    meses = ['Seleccione Mes','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    anos = ['Seleccione Año'];
    var thisYear = moment(Date.now()).year();
    for(i=0; i<30; i++){
      anos.push(thisYear-i);
    }
    meses.forEach(function(item, i){
      var n = i;
      if (n < 10) n = '0'+i;
      mesFiltro.find('select').append($('<option value="'+n+'">'+item+'</option>'));
    });
    anos.forEach(function(item, i){
      anoFiltro.find('select').append($('<option value="'+item+'">'+item+'</option>'));
    });

    anoFiltro.on('change', function(){

    });

    container = $('<div></div>');
    container.append(anoFiltro).append(mesFiltro);
    return $(container.html());
  }

 /*************************BUTTONS**************************/

  var buildFechaExcelBtn = function (){
    var repLink = $('#crearReporteExcelLinkFecha');
    repLink.html('');
    var btn = $(
        '<div class="conf-btn conf-excel-btn" onclick="document.getElementById(\'crearReporteExcelLinkFechaForm\').submit()">' +
          '<span class="glyphicon glyphicon glyphicon-download-alt"></span>' +
          '<div class="conf-btn-text conf-excel-text" style="display: none">' +
            'Descargar Excel' +
          '</div>' +
        '</div>');
    repLink.append(btn);
    btn.on('mouseover', function(){
      btn.find('.conf-excel-text').css('display', 'block');
    });
    btn.on('mouseout', function(){
      btn.find('.conf-excel-text').css('display', 'none');
    });
    return repLink;
  };


  /**************************************RETURN***************************************/

  return {
    build: buildFiltroPorFecha
  };

}