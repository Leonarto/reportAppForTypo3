/**
 * Created by Leonarto on 09-11-2017.
 */

/*********************************BASE TEMPLATE WINDOW******************************************/

/** Se igresa un elemento del DOM ya sea jQuery o normal, y el template se insertara en dentro de este elemento */
function templateMaker(appDiv, data, connData) {

// Template base donde se construye all the documento
  var templateBase = $(
      '<div class="rep-navbar-main">' +
        '<h4>Menu</h4>' +
        '<div id="navbar-btn-container"></div>' +
      '</div>' +
      '<div class="rep-main-section">' +
        '<div id="notifications-container"></div>' +
        '<div class="tipos-faenas-conf-container" style="display: none">' +
          '<h4>Configuración de Tipos de Faena ' +
            '<div id="conf-btn-container"></div>' +
          '</h4>' +
        '</div>' +
      '</div>');

  // Usa el template base y construye un template, FUNCION GENERAL!!
  var buildTemplate = function () {
    // Se inserta el template base a el documento
    $(appDiv).append(templateBase);

    // Faena confBuilder
    var faenaConfWinMaker = makeFaenaConfWin(templateBase, data, connData);
    faenaConfWinMaker.build();

    // Constructor de filtro de fechas
    var filtroFechaMaker = makeFechaWin(templateBase, data);
    filtroFechaMaker.build()

    // Constructor de ventana de graficos
    var graphMaker = makeGraphWin(templateBase, data);
    graphMaker.build(0);

    // Buttons
    var navbarMaker = makeNavbar(templateBase);
    navbarMaker.build([
        {nombre: 'Configuración', container: '.tipos-faenas-conf-container', shown: true},
        {nombre: 'Filtros', container: '.filtro-fecha-container', shown: false},
        {nombre: 'Gráficos', container: '.graphs-div-container', shown: false},
        ]);
    return templateBase;
  };

  return {
    template: templateBase,
    build: buildTemplate
  };
}

