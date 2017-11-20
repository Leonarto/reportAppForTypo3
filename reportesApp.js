/**
 * Created by Leonarto on 18-10-2017.
 */
$(document).ready(function (){if($('#aplicacionDeReportes')[0]){
  var appDiv = $('#aplicacionDeReportes');
  var data = JSON.parse($('#appData').text());
  var conf = {typoFullWidth: true, data: data};
  var app = reportApp (appDiv, conf);
  // correr la aplicacion
  app.run();


}});

/**
 * appDiv // es un div jquery donde se correra la aplicacion
 * conf // es donde va toda la configuracion
 * */
function reportApp(appDiv, conf) {


  function ReportApp(){


/******************************GENERAL*********************************************/

    this.url = window.location.origin+window.location.pathname+'?eID=';

    this.connData = {
      guardarConf: {
        url: this.url+'tralkan_sys_empresa',
        body:{
          action: 'nuevaConfiguracion',
          uidEmpresa: '',
          jsonConfiguracion: ''
        }
      }
    };

    // Template base donde se construye all the documento
    this.templateBase = $(
        '<div class="rep-navbar-main">' +
        '   <h4>Menu</h4>' +
        '   <div id="navbar-btn-container"></div>' +
        '' +
        '</div>' +
        '<div class="rep-main-section">' +
        '   <div id="notifications-container"></div>' +
        '   <div class="tipos-faenas-conf-container" style="display: none">' +
        '     <h4>Configuración de Tipos de Faena ' +
        '       <div id="conf-btn-container"></div>' +
        '     </h4>' +
        '   </div>' +
        '</div>' +
        '' +
        '' +
        '');

    // funcion para comenzar la aplicacion con la configuracion inicial
    this.run = function (){
      if(conf.typoFullWidth){
        var parent = appDiv.parent('div').parent('div').parent('div').html('');
        parent.append(appDiv);
        this.buildTemplate(conf.data);
      }
      return this;
    };    // run function

    // Usa el template base y construye un template, FUNCION GENERAL!!
    this.buildTemplate = function (data) {
      var template = this.buildTipoFaenaConf(data.tipoFaenas);
      appDiv.append(template);
      $(template[1]).append(this.buildFiltroPorFecha());
      // Graph
      this.buildGraphs($(template[1]));
      this.buildLineGraph(0,0);
      // Buttons
      template.find('#navbar-btn-container')
          .append(this.hideShowBtn('Configuración', template.find('.tipos-faenas-conf-container'), false))
          .append(this.hideShowBtn('Filtro por Fechas', template.find('.filtro-fecha-container'), false))
          .append(this.hideShowBtn('Gráficos', template.find('.graphs-div-container'), true));
      return template;
    };

/***********************************NAVBAR********************************************************/

    // Botones del menu que muestran y esconden partes del documento principal de reportes
    this.hideShowBtn = function (name, itemToHideShow, active){
      var btn = $(
          '<div class="rep-menu-btn">' +
            name +
          '</div>');
      if(active){
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
      }

      return btn;
    };

/*********************************GRAPHS WINDOW******************************************/

    this.buildGraphs = function(innertTemplateDiv, tipoFaenaPosition){
      tipoFaenaPosition = tipoFaenaPosition || 0;
      var graphDivsData = this.buildGraphsContainer(tipoFaenaPosition);
      $(innertTemplateDiv).append(graphDivsData.graphsDiv);
      var self = this;
      graphDivsData.campos.forEach(function(item){
        self.buildLineGraph(tipoFaenaPosition,item);
      });
    };

    this.buildGraphsContainer = function(tipoFaenaPosition){
      var camposNumericos = [];
      conf.data.tipoFaenas[tipoFaenaPosition].jsonVarForm.forEach(function(item, i){
        if(item.tipo == 'number' || item.tipo == 'decimal'){
          camposNumericos.push({i:i, tipo: item.tipo});
        }
      });
      var graphsDiv = $(
          '<div class="graphs-div">' +
            '<h4>Gráficos</h4>' +
          '</div>');
      camposNumericos.forEach(function(item){
        graphsDiv.append($(
            '<div class="nvd3-chart" id="chart-'+tipoFaenaPosition+'-'+item.i+'">' +
              '<svg></svg>' +
            '</div>'));
      });
      var graphsDivContainer = $('<div class="graphs-div-container"></div>').append(graphsDiv);
      return {graphsDiv: graphsDivContainer, campos: camposNumericos};
    };

    this.buildLineGraph = function(tipoFaenaIndex, campo){
      var unprocessedData = conf.data.tipoFaenas[tipoFaenaIndex];
      nv.addGraph(function() {

        // Encuentra el dato con maximo valor, este dato es del eje Y, porque en el X esta el tiempo
        function max(factor){
          var maxim = 0;
          unprocessedData.registros.forEach(function(v){
            if(v.jsonVarValues[campo.i]){
              if(maxim < parseInt(v.jsonVarValues[campo.i].value)){
                maxim = parseInt(v.jsonVarValues[campo.i].value);
              }
            }
          });
          return parseInt(maxim*(1+factor));
        }

        // Genera la estructura para entregar la data a nvd3
        function data(){
          var values = [];
          var operarios = [];
          // Iteracion para separar todos los values por operario
          unprocessedData.registros.forEach(function(item){
            // Le quita las horas minutos y segundos a las fechas
            var fechaInicio = moment(item.fechaInicio*1000).hours(0).minutes(0).seconds(0)._i;
            // validando que everything exista
            if(item.jsonVarValues[campo.i]){
              if ((fechaInicio != 0) && (item.jsonVarValues[campo.i].value)){
                if(values[item.operario.feUser.username]){
                  values[item.operario.feUser.username].push([fechaInicio, item.jsonVarValues[campo.i].value]);
                } else {
                  values[item.operario.feUser.username] = [[fechaInicio, item.jsonVarValues[campo.i].value]];
                  operarios.push(item.operario)
                }
              }
            }
          });
          var returnData = [];
          operarios.forEach(function(item){
            returnData.push({
              'key': item.feUser.username,
              'values': values[item.feUser.username],
              'area': true
            });
          });
          return returnData;
        }  // function data();

        var chart = nv.models.lineChart()
                .x(function(d) { return d[0] })
                .y(function(d) { return d[1] })
                .forceY([0,max(.05)])
                .clipEdge(true)
                .useInteractiveGuideline(false);

        chart.xAxis
            .axisLabel(unprocessedData.nombre)
            .showMaxMin(false)
            .tickFormat(function(d){return d3.time.format("%d/%m/%Y")(new Date(d))});

        // Si es que el tipo de campo es numero entonces enumera el eje Y con numeros enteros
        // si es que el tipo de campo es decimal, enumera el eje Y con dos decimales
        if (campo.tipo == 'number'){
          chart.yAxis
              .axisLabel(unprocessedData.jsonVarForm[campo.i].nombre)
        } else if (campo.tipo == 'decimal'){
          chart.yAxis
              .axisLabel(unprocessedData.jsonVarForm[campo.i].nombre)
           .tickFormat(d3.format(',.2f'));
        }

        // Selecciona el chartDiv por el id generado por la posicion del tipo de faena y
        // el campo variable que se esta graficando
        d3.select('#chart-'+tipoFaenaIndex+'-'+campo.i+' svg')
            .datum(data())
            .transition().duration(500)
            .call(chart);


        nv.utils.windowResize(chart.update);

        return chart;
      });
    }; // buildLineGraph();

/*********************************FILTRAR POR FECHA WINDOW******************************************/

    this.buildFiltroPorFecha = function (){
      var container = $(
          '<div class="filtro-fecha-container" style="display: none">' +
          '   <div class="linea-separadora-hor"></div>' +
          '   <h4>Filtros por Fechas <div id="fecha-btn-container"></div></h4>' +
          '   <div class="filtro-fecha-rango">' +
          '     <div class="input-group-fecha-inicial">' +
          '       <label for="filtro-fecha-inicial">Fecha Inicial</label>' +
          '       <div class="input-group-calendar">' +
          '         <span><span class="glyphicon glyphicon-calendar"></span></span>' +
          '       </div>' +
          '     </div>' +
          '     <div class="input-group-fecha-final">' +
          '       <label for="filtro-fecha-final">Fecha Final</label>' +
          '       <div class="input-group-calendar">' +
          '         <span><span class="glyphicon glyphicon-calendar"></span></span>' +
          '       </div>' +
          '     </div>' +
          '   </div>' +
          '</div>');
      container.find('input').datetimepicker({
        format: "D-MM-YYYY, h:mm",
        locale: "es"
      });
      var fluidForm = $('#crearReporteExcelLinkFechaForm');
      var innerContainer = container.html();
      container.html('').append(fluidForm);
      fluidForm.append(innerContainer);
      fluidForm.find('#fechaInicial, #fechaFinal').datetimepicker({
        format: "D-MM-YYYY, h:mm",
        locale: "es"
      });
      container.find('.input-group-fecha-inicial .input-group-calendar').append(fluidForm.find('#fechaInicial'));
      container.find('.input-group-fecha-final .input-group-calendar').append(fluidForm.find('#fechaFinal'));
      container.find('.filtro-fecha-rango')
          .append(fluidForm.find('.filtros-group-div'))
          .append(fluidForm.find('#crearReporteRangoSubmit'));
      container.find('#tipoFaena').select2({placeholder: 'Seleccione Opción'});
      container.find('#faena').select2({placeholder: 'Seleccione Opción'});
      // container.find('#fecha-btn-container').append(this.buildFechaExcelBtn());
      return container;
    };

    this.buildFechaExcelBtn = function (){
      var repLink = $('#crearReporteExcelLinkFecha');
      repLink.html('');
      var btn = $(
          '<div class="conf-btn conf-excel-btn" onclick="document.getElementById(\'crearReporteExcelLinkFechaForm\').submit()">' +
          '   <span class="glyphicon glyphicon glyphicon-download-alt"></span>' +
          '   <div class="conf-btn-text conf-excel-text" style="display: none">' +
          '     Descargar Excel' +
          '   </div>' +
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

/*********************************TIPO FAENA CONF WINDOW**********************************************/

    //Esta es una funcion que construye toda la pestaña de configuracion de faenas
    this.buildTipoFaenaConf = function (tipoFaeArr){
      var template = this.buildTipoFaenasCards(tipoFaeArr);
      template.find('#conf-btn-container')
          .append(this.buildConfHelpBtn())
          .append(this.buildConfSaveBtn())
          .append(this.buildConfExcelBtn());
      return template;
    };

    this.buildConfExcelBtn = function (){
      var repLink = $('#crearReporteExcelLink');
      repLink.html('');
      var btn = $(
          '<div class="conf-btn conf-excel-btn">' +
          '   <span class="glyphicon glyphicon glyphicon-download-alt"></span>' +
          '   <div class="conf-btn-text conf-excel-text" style="display: none">' +
          '     Descargar Excel' +
          '   </div>' +
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

    // Este boton es el encargado de enviar la configuración de tipos de faenas a la base de datos.
    this.buildConfSaveBtn = function (){
      var btn = $(
          '<div class="conf-btn conf-save-btn">' +
          '   <span class="glyphicon glyphicon-floppy-disk"></span>' +
          '   <div class="conf-btn-text conf-save-text" style="display: none">' +
          '     Guardar Configuración' +
          '   </div>' +
          '</div>');
      btn.on('mouseover', function(){
        btn.find('.conf-save-text').css('display', 'block');
      });
      btn.on('mouseout', function(){
        btn.find('.conf-save-text').css('display', 'none');
      });
      var self = this;
      btn.on('click', function(){
        self.guardarConfServ(self);
      });
      return btn;
    };

    // construye la configuracion de tipos de faena
    this.buildConfTipoFaena = function (tiposFaenaCards){
      var tipFaeConf = [];
      $.each(tiposFaenaCards.children(), function(i, item){
        var uid = $(item).attr('data-uid');
        var tfPostition = i;
        tipFaeConf[i] = {uid: uid, campos:[]};
        $.each($(item).find('input'), function(i, item){
          tipFaeConf[tfPostition].campos.push({number: $(item).val()});
        });
      });
      sessionStorage.setItem('tipoFaenaConf', JSON.stringify(tipFaeConf));
    };

    // Funcion que construye el boton de ayuda en la configuracion de tipos de faena
    this.buildConfHelpBtn = function (){
      var btn = $(
          '<div class="conf-help-btn">?' +
            '<div class="conf-help-text" style="display: none">' +
              '<h4>¿Por qué y cómo configuro los tipos de faena?</h4>' +
              '<p>Los tipos de faena se configuran para que al obtener un reporte en donde esten todos los tipos de ' +
                'faena juntos no se repitan columnas. El problema es que cada campo variable de cada faena creará ' +
                'una columna nueva, y se quiere que datos de las columnas que correspondan al mismo concepto esten en una ' +
                'sola columna</p>' +
              '<br>' +
              '<p>Para poder explicitar que columnas deberían ser una sola columna, deben ingresar un numero entero ' +
                'mayor a -1 cualquiera, al lado derecho del nombre de la columna, y este numero debe ser el mismo ' +
                'para cada columna que deseen unir.</p>' +
              '<br>' +
              '<p>En el caso de que exista una columna con numero único, esta será una columna aparte de las demás, y' +
                'en el caso de que no se ingrese valor, no se desplegará la columna</p>' +
            '</div>' +
          '</div>');
      btn.on('click', function(){
        btn.find('.conf-help-text').css('display', 'block');
      });
      btn.find('.conf-help-text').on('mouseout', function(){
        btn.find('.conf-help-text').css('display', 'none');
      });
      return btn;
    };

    // Recive el arreglo de tipos de faenas para construirlo en el template y retorna el template
    this.buildTipoFaenasCards = function (tipoFaeArr){
      var cards = $('<div id="tipos-faenas-cards"></div>');
      var empresaConf = conf.data.empresa.configuracion;
      // Si existe configuracion comienza el proceso de llenado de campos
      if (empresaConf != null && empresaConf != '' && empresaConf != '{}' && empresaConf != undefined){
        var cardsConf = JSON.parse(conf.data.empresa.configuracion).tipoFaenaConfig;
      }
      // Crea cada una de las tarjetas de tipos de faena
      tipoFaeArr.forEach(function(item, i){
        var id = item.uid;
        if(cardsConf){
          var cardConf = cardsConf.filter(function( obj ) {
            return obj.uid == id;
          })[0];
        }
        var card = $(
            '<div class="tipo-faena-conf-card" id="tf-card-'+id+'" data-uid="'+id+'">' +
              '<div class="tipo-faena-conf-card-header">' +
                '<h4>'+item.nombre+'</h4>' +
              '</div>' +
              '<div class="tipo-faena-conf-card-body">' +
                '<div class="tipo-faena-campos-headers">' +
                  '<p>Columnas</p>' +
                  '<div class="nu-header-container">NU<div class="conf-btn-text" style="display: none">Número Unificador</div></p>' +
                '</div>' +
              '</div>' +
            '</div>');
        card.find('.nu-header-container').on('mouseover', function(){
          $(this).find('.conf-btn-text').css('display', 'block');
        });
        card.find('.nu-header-container').on('mouseout', function(){
          $(this).find('.conf-btn-text').css('display', 'none');
        });
        // Crea cada uno de los campos para ingresar en las tarjetas
        item.jsonVarForm.forEach(function (item, i){
          var campo = $(
              '<div class="tipo-faena-card-campo">' +
              '   <label for="tf-card-campo-input'+id+'-'+i+'">' + item.nombre + ' (' + item.tipo +')</label>' +
              '   <input class="tf-card-campo-input" id="tf-card-campo-input'+id+'-'+i+'" data-position="'+i+'" type="number" step="1" min="0" max="99">'+
              '</div>');
          if(cardConf){
            campo.find('input').val(cardConf.campos[i].number);
          }
          card.find('.tipo-faena-conf-card-body').append(campo);
        });
        cards.append(card);
      });
      // Para construir el json de configuracion por cada cambio en la vista de configuracion
      var bctf = this.buildConfTipoFaena;
      cards.on('change', function(){
        bctf(cards);
      });
      // Unir al templateBase
      this.templateBase.find('.tipos-faenas-conf-container').append($(cards));
      return this.templateBase;
    };


    // Funcion que guarda la configuracion en la empresa a traves del servicio
    this.guardarConfServ = function(self){
      var url = self.connData.guardarConf.url;
      var body = self.connData.guardarConf.body;
      var empresaConf = conf.data.empresa.configuracion;
      body.uidEmpresa = conf.data.empresa.uid;
      // Extraer la configuracion del sessionStorage
      var tipoFaenaConf = JSON.parse(sessionStorage.tipoFaenaConf);
      // Si es que no existen configuracion entonces la crea de cero, si es que existe, sobreescribe solamente
      // la parte de tipoFaenaConfig.
      if(empresaConf != '' && empresaConf != null && empresaConf != undefined){
        var oldConfig = JSON.parse(empresaConf);
        oldConfig.tipoFaenaConfig = tipoFaenaConf;
        body.jsonConfiguracion = JSON.stringify(oldConfig);
      } else {
        body.jsonConfiguracion = JSON.stringify({tipoFaenaConfig: tipoFaenaConf});
      }

      // Coneccion al servicio
      $.post(url, JSON.stringify(body))
          .done(function(data){
            var notification = $(
                '<div class="rep-alert">' +
                '   <div class="alert alert-success alert-dismissable fade in">' +
                '     <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                      data.data +
                '   </div>' +
                '</div>');
            $('#notifications-container').append(notification);
          })
          .fail(function(error){
            var notification = $(
                '<div class="alert alert-danger alert-dismissable fade in">' +
                '   <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                    error.data +
                '</div>');
            $('#notifications-container').append(notification);
          });
    };



  }


  return new ReportApp();
}