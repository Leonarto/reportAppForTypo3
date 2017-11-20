/**
 * Created by Leonarto on 09-11-2017.
 */

/*********************************GRAPHS WINDOW******************************************/

function makeGraphWin(template, data){

  var buildGraphs = function(tipoFaenaPosition){
    var innertTemplateDiv = $(template[1]);
    tipoFaenaPosition = tipoFaenaPosition || 0;
    var graphDivsData = buildGraphsContainer(tipoFaenaPosition);
    $(innertTemplateDiv).append(graphDivsData.graphsDiv);
    graphDivsData.campos.forEach(function(item){
      buildLineGraph(tipoFaenaPosition,item);
    });
  };

  var buildGraphsContainer = function(tipoFaenaPosition){
    var camposNumericos = [];
    data.tipoFaenas[tipoFaenaPosition].jsonVarForm.forEach(function(item, i){
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

  var buildLineGraph = function(tipoFaenaIndex, campo){
    var unprocessedData = data.tipoFaenas[tipoFaenaIndex];
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


  /**************************************RETURN***************************************/

  return {
    build: buildGraphs,
    buildGraph: buildLineGraph
  };

}