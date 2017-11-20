/**
 * Created by Leonarto on 09-11-2017.
 */

/***************************************TIPO FAENA CONF WINDOW**********************************************/

function makeFaenaConfWin(template, data, connData){
  //Esta es una funcion que construye toda la pestaña de configuracion de faenas
  var buildTipoFaenaConfMain = function (){
    buildTipoFaenasCards(data.tipoFaenas)
        .find('#conf-btn-container')
        .append(buildConfHelpBtn())
        .append(buildConfSaveBtn())
        .append(buildConfExcelBtn());
  };

// construye la configuracion de tipos de faena
  var buildConfTipoFaena = function (tiposFaenaCards){
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


// Recive el arreglo de tipos de faenas para construirlo en el template y retorna el template
  var buildTipoFaenasCards = function (tipoFaeArr){
    var cards = $('<div id="tipos-faenas-cards"></div>');
    var empresaConf = data.empresa.configuracion;

    // Si existe configuracion comienza el proceso de llenado de campos
    if (empresaConf != null && empresaConf != '' && empresaConf != '{}' && empresaConf != undefined){
      var cardsConf = JSON.parse(empresaConf).tipoFaenaConfig;
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
    var bctf = buildConfTipoFaena;
    cards.on('change', function(){
      bctf(cards);
    });
    // Unir al templateBase
    template.find('.tipos-faenas-conf-container').append($(cards));
    return template;
  };


// Funcion que guarda la configuracion en la empresa a traves del servicio
  var guardarConfServ = function(){
    console.log('Saving...');
    var url = connData.guardarConf.url;
    var body = connData.guardarConf.body;
    var empresaConf = data.empresa.configuracion;
    body.uidEmpresa = data.empresa.uid;
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
          console.log('Saved!');
          var notification = $(
              '<div class="rep-alert">' +
              '   <div class="alert alert-success alert-dismissable fade in">' +
              '     <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
              data.data +
              '   </div>' +
              '</div>');
          console.log($('#notifications-container'));
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

/*******************************************************BUTTONS*******************************************************/

  var buildConfExcelBtn = function (){
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
  var buildConfSaveBtn = function (){
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
    btn.on('click', function(){
      guardarConfServ();
    });
    return btn;
  };

  // Funcion que construye el boton de ayuda en la configuracion de tipos de faena
  var buildConfHelpBtn = function (){
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
        '<p>En el caso de que exista una columna con numero único, esta será una columna aparte de las demás, y ' +
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

  return {
    build: buildTipoFaenaConfMain
  };

}