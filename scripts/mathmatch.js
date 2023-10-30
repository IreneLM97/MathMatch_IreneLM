/*
SCRIPT PARA DAR FUNCIONALIDAD AL JUEGO DE EMPAREJAMIENTO DE CARTAS

AUTORA: IRENE LÓPEZ MELERO
*/ 

// ----------------------------------------------------------------------
// DECLARACIÓN DE VARIABLES GLOBALES EMPLEADAS PARA GESTIONAR EL JUEGO  |
// ----------------------------------------------------------------------

// definimos variables para almacenar las dos cartas levantadas de cada jugada
var carta1 = null; 
var carta2 = null; 

// definimos una variable boolean para bloquear las acciones del usuario
var bloqueo = false; 

// definimos las variables necesarias para gestionar el tiempo del juego
var tiempo = 0;
var cartasEmparejadas = 0;
var temporizador = null;  // hace referencia a setInterval que va actualizando el tiempo

// ----------------------------------------------------------------------
// INICIALIZACIÓN DE EVENTOS                                            |
// ----------------------------------------------------------------------
$(document).ready(inicializarEventos);

// FUNCIÓN PARA INICIALIZAR EVENTOS
function inicializarEventos() {
    // Nota. Se usa la función bind() por requisitos del ejercicio, aunque existe la función on() que es más eficiente
    // También se pueden inicializar los eventos con la notación $(elemento).eventoEnCuestion(funcionQueSeDebeEjecutar)

    $("#jugador").focus();

    // cargamos los valores de localStorage y cookies
    cargarDatos();

    // definimos el evento de mostrar y ocultar el enunciado
    $("#mostrar, #ocultar").bind("click", function() {
        $("#enunciado").toggle();
        $("#mostrar, #ocultar").toggle();
    });

    // definimos el evento cuando se pierde el foco en el campo jugador
    $("#jugador").blur(comprobarExisteJugador);  // inicialización directamente con el evento, aunque se puede hacer con bind()/on()

    // definimos los eventos click de los botones
    $("#reiniciar").bind("click", reiniciarJuego);  
    $("#volver").bind("click", volverMenu);  

    // definimos como eventos delegados los eventos de las imágenes (aplicando filtro de imágenes no acertadas)
    // en el caso de delegación de eventos, es necesario usar la función on() y no bind()
    $("#tablaCartas").on("click", "img:not(.acertada)", pulsarCarta);  
    $("#tablaCartas").on("mouseenter", "img:not(.acertada)", function () {
            $(this).css({ "transform": "scale(1.1)", "opacity": 0.7 });
        }).on("mouseleave", "img", function () {
            $(this).css({ "transform": "scale(1)", "opacity": 1 });
        });
}

// ----------------------------------------------------------------------
// FUNCIONES ASOCIADAS A LOS EVENTOS                                    |
// ----------------------------------------------------------------------

// FUNCIÓN QUE CARGA LA INFORMACIÓN DE LOCALSTORAGE Y COOKIES
function cargarDatos() {
    if(localStorage.getItem("jugador") != null) $("#jugador").val(localStorage.getItem("jugador"));
    if(localStorage.getItem("mejorTiempo") != null) $("#mejorTiempo").text(localStorage.getItem("mejorTiempo"));

    // usamos la función decodeURIComponent para leer el tiempo con el formato correctamente
    if($.cookie("top1") != undefined) $("#top1").text(decodeURIComponent($.cookie("top1")));
    if($.cookie("top2") != undefined) $("#top2").text(decodeURIComponent($.cookie("top2")));
    if($.cookie("top3") != undefined) $("#top3").text(decodeURIComponent($.cookie("top3")));
}

// FUNCIÓN QUE COMPRUEBA SI HAY UN NOMBRE DE JUGADOR Y GESTIONA EVENTOS EN FUNCIÓN DE ESTO
function comprobarExisteJugador(event) {
    var jugador = $("#jugador").val().trim();

    // no se introduce ningún nombre
    if(jugador == "") {
        if(event.type === "blur") alert("Debes introducir un nombre de jugador");
        // deshabilitamos las funciones de las opciones de menú
        // usamos la función unbind() por requisitos del ejercicio, pero es más eficiente el método off() (asociado a on())
        $("div[name='opcion']").unbind("click");

    // se introduce algún nombre
    } else {
        // habilitamos las funciones de las opciones de menú
        $("div[name='opcion']").bind("click", comenzarJuego);
    }

    localStorage.setItem("jugador", jugador);  // lo guardamos en localStorage
}

// FUNCIÓN AL PULSAR ALGUNA OPCIÓN DE MENÚ
function comenzarJuego() {
    // hacemos scroll al inicio de la página
    $("#juego").scrollTop(0);

    // ocultamos el menú de juego y mostramos el juego
    $("#menu").fadeOut('slow', function(){
        $("#juego").fadeIn('slow');
    });

    // reiniciamos las variables del juego
    reiniciarVariables();

    // guardamos con data() la categoría seleccionada por el jugador en el elemento juego
    $("#juego").data("categoria", $(this).attr("id"));

    // generamos las cartas aleatorias
    generarCartas();

    // programamos la actualización del tiempo a cada segundo
    if(temporizador != null) clearInterval(temporizador);  // limpiamos el temporizador si estuviese iniciado
    temporizador = setInterval(actualizarTiempo, 1000);
}

// FUNCIÓN AL PULSAR EL BOTÓN DE REINICIAR JUEGO
function reiniciarJuego() {
    // reiniciamos las variables del juego
    reiniciarVariables();

    // volvemos a comenzar el juego
    comenzarJuego();
}

// FUNCIÓN AL PULSAR EL BOTÓN DE VOLVER AL MENÚ
function volverMenu() {
    // hacemos scroll al inicio de la página
    $("#menu").scrollTop(0);

    // ocultamos el juego y mostramos el menú del juego
    $("#juego").fadeOut('slow', function(){
        $("#menu").fadeIn('slow');
    }); 
}

// FUNCIÓN QUE SE EJECUTA AL PULSAR UNA CARTA
function pulsarCarta() {
    if (bloqueo) return; // si el usuario no puede no se hace nada

    // comprobamos si la imagen pulsada está invertida
    if ($(this).attr("src") === "imagenes/inverso.jpg") {
        // volteamos la imagen
        var imgName = $(this).attr("name");
        $(this).attr("src", imgName);  

        // Nota. En el siguiente código, para guardar el nombre y comprobar si las cartas son iguales, cogemos como nombre 
        // imgName.charAt(imgName.length - 5), que corresponde al número de la imagen en cuestión; se resta -5 porque la 
        // expresión es del tipo ...1.jpg, luego restando -5 quitamos la terminación .jpg y nos quedamos con el número

        // no hay ninguna carta levantada
        if (!carta1) {  
            carta1 = { nombre: imgName.charAt(imgName.length - 5), elemento: this };  // crea carta1
        // hay una carta levantada
        } else if (!carta2) {  
            carta2 = { nombre: imgName.charAt(imgName.length - 5), elemento: this };  // crea carta2
            bloqueo = true; // bloqueamos acciones de usuario
            setTimeout(verificarCartas, 500);  // comprobamos si las dos cartas son iguales con una breve pausa
        }
    }
}

// ----------------------------------------------------------------------
// FUNCIONES AUXILIARES USADAS EN LAS FUNCIONES PRINCIPALES             |
// ----------------------------------------------------------------------

// FUNCIÓN PARA REINICIAR LAS VARIABLES DEL JUEGO
function reiniciarVariables() {
    carta1 = null; 
    carta2 = null; 
    bloqueo = false; 
    $("#tiempo").text("00:00");
    tiempo = 0;
    cartasEmparejadas = 0;
}

// FUNCIÓN PARA GENERAR CARTAS DE FORMA ALEATORIA EN FUNCIÓN DE LA CATEGORÍA ELEGIDA
function generarCartas() {
    // reiniciamos la tabla de cartas
    var tablaCartas = $("#tablaCartas");
    tablaCartas.empty();

    // mapeamos los nombres de las categorías a sus correspondientes arrays del fichero datos.js
    var categorias = { 
        'multiplicar': multiplicar,
        'aritmetica': aritmetica,
        'fracciones': fracciones,
        'algebra': algebra,
        'geometria': geometria
    };
    // obtenemos el array de cartas en función de la categoría que ha elegido el jugador
    var cartas = categorias[$("#juego").data("categoria")]; 
    $("#juego").data("cartas", cartas);  // guardamos las cartas con data

    // creamos una copia del array de cartas
    var cartasDisponibles = cartas.slice();

    // recorremos las cartas
    for (var i = 0; i < cartas.length; i++) {
        // si ya se han utilizado todas las cartas salimos
        if (cartasDisponibles.length === 0) break;
        
        // cogemos un índice aleatorio del array de cartas
        var randomIndex = Math.floor(Math.random() * cartasDisponibles.length); 
        var carta = cartasDisponibles[randomIndex];
        cartasDisponibles.splice(randomIndex, 1);  // eliminamos la carta del array de cartas disponibles

        // creamos la imagen con name el src de la imagen y mostrando la interrogación
        var td = $("<td>").append("<img name='" + carta + "' src='imagenes/inverso.jpg'></img>");
        var tr = tablaCartas.find("tr").eq(Math.floor(i / 6));  // buscamos la fila en que se debe colocar la imagen
        if (tr.length === 0) {  // si no se encuentra fila, entonces crea una nueva
            tr = $("<tr>");
            tablaCartas.append(tr);
        }
        tr.append(td);  // añadimos la carta a la fila correspondiente
    }
}

// FUNCIÓN QUE VERIFICA SI DOS CARTAS SON IGUALES
function verificarCartas() {
    if (carta1.nombre === carta2.nombre) {  // cartas iguales
        // añadimos la clase 'acertada' a esas cartas
        $(carta1.elemento).addClass("acertada");
        $(carta2.elemento).addClass("acertada");

        // actualizamos cartas emparejadas
        cartasEmparejadas += 2;  // sumamos 2 porque se han emparejado 2

        // se han emparejado todas las cartas 
        if (cartasEmparejadas == $("#juego").data("cartas").length) {
            clearInterval(temporizador);  // paramos el temporizador
            almacenarTiempo();  // almacenamos el tiempo si es de los mejores tiempo
        }
    } else {  // cartas no iguales
        // volteamos las cartas
        $(carta1.elemento).attr("src", "imagenes/inverso.jpg");
        $(carta2.elemento).attr("src", "imagenes/inverso.jpg");
    }

    bloqueo = false; // desbloqueamos las acciones del usuario
    carta1 = null;  // reiniciamos las cartas
    carta2 = null;
}

// FUNCIÓN PARA ACTUALIZAR EL TIEMPO DE JUEGO
function actualizarTiempo() {
    // formateamos el tiempo
    var minutos = Math.floor(tiempo / 60);
    var segundos = tiempo % 60;
    var tiempoFormateado = (minutos < 10 ? "0" : "") + minutos + ":" + (segundos < 10 ? "0" : "") + segundos;
    
    // actualizamos el contenedor del tiempo y el tiempo
    $("#tiempo").text(tiempoFormateado);  
    tiempo++;
}

// FUNCIÓN PARA ALMACENAR LOS TIEMPOS (MEJOR TIEMPO EN LOCALSTORAGE, TRES MEJORES TIEMPOS EN COOKIES)
function almacenarTiempo() {
    // cogemos el tiempo conseguido en la jugada
    var tiempoJugada = $("#tiempo").text();
    
    // comprobamos si es el mejor tiempo conseguido
    var mejorTiempo = localStorage.getItem("mejorTiempo");
    if (mejorTiempo === null || tiempoEnSegundos(tiempoJugada) < tiempoEnSegundos(mejorTiempo)) {
        // si no hay un mejor tiempo guardado o el tiempo actual es mejor, actualizamos el mejor tiempo en LocalStorage
        localStorage.setItem("mejorTiempo", tiempoJugada);
    }

    // comprobamos si está entre los tres mejores tiempos 
    // usamos operador ternario para dar valor a los top y la función decodeURIComponent para leer bien las cookies
    var topTiempos = [
        $.cookie("top1") != undefined ? tiempoEnSegundos(decodeURIComponent($.cookie("top1"))) : Infinity,
        $.cookie("top2") != undefined ? tiempoEnSegundos(decodeURIComponent($.cookie("top2"))) : Infinity,
        $.cookie("top3") != undefined ? tiempoEnSegundos(decodeURIComponent($.cookie("top3"))) : Infinity
    ];

    // vemos cuál sería la posición en el top 3 (uso de una función lambda para optimizar código)
    var posicionTiempo = topTiempos.findIndex(t => tiempoEnSegundos(tiempoJugada) < t);

    // actualizamos el top 3 en función de la posición obtenida
    // usamos la función encodeURIComponent para mantener el formato del tiempo correctamente
    if (posicionTiempo >= 0) {  // está en top 3
        if (posicionTiempo == 0) {  // hay que actualizar top1 top2 top3
            $.cookie("top3", $.cookie("top2"), { expires: 7 });
            $.cookie("top2", $.cookie("top1"), { expires: 7 });
            $.cookie("top1", encodeURIComponent(tiempoJugada), { expires: 7 });
        } else if (posicionTiempo == 1) {  // hay que actualizar top2 top3
            $.cookie("top3", $.cookie("top2"), { expires: 7 });
            $.cookie("top2", encodeURIComponent(tiempoJugada), { expires: 7 });
        } else if (posicionTiempo == 2) {  // hay que actualizar top3
            $.cookie("top3", encodeURIComponent(tiempoJugada), { expires: 7 });
        }
    } 

    // cargamos los datos de localStorage y de las cookies
    cargarDatos();
}

// FUNCIÓN PARA PARSEAR EL TIEMPO CON FORMATO min:seg A SEGUNDOS
function tiempoEnSegundos(tiempoEnFormato) {
    var [minutos, segundos] = tiempoEnFormato.split(":");
    return parseInt(minutos, 10) * 60 + parseInt(segundos, 10);
}

