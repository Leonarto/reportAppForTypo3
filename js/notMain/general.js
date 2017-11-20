/**
 * Created by Leonarto on 09-11-2017.
 */

/******************************GENERAL*********************************************/

function reportesApp(appDiv, conf){

  var url = window.location.origin+window.location.pathname+'?eID=';

  var connData = {
    guardarConf: {
      url: url+'tralkan_sys_empresa',
      body:{
        action: 'nuevaConfiguracion',
        uidEmpresa: '',
        jsonConfiguracion: ''
      }
    }
  };

// funcion para comenzar la aplicacion con la configuracion inicial
  var run = function (){
    if(conf.typoFullWidth){
      var parent = appDiv.parent('div').parent('div').parent('div').html('');
      parent.append(appDiv);
      var templateMake = templateMaker(appDiv,conf.data,connData);
      templateMake.build();
    }
    return this;
  };    // run function

  return {
    connData: connData,
    run: run,
    conf: conf
  };
}

