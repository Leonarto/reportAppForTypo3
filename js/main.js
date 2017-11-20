/**
 * Created by Leonarto on 18-10-2017.
 */
$(document).ready(function (){if($('#aplicacionDeReportes')[0]){
  var appDiv = $('#aplicacionDeReportes');
  var data = JSON.parse($('#appData').text());
  var conf = {typoFullWidth: true, data: data};

  // Entregar la configuracion a la App
  var app = reportesApp(appDiv, conf);

  // correr la aplicacion
  app.run();


}});