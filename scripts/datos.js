/*
SCRIPT PARA CREAR LOS ARRAYS CON LOS SRC DE LAS IMÁGENES USADAS EN EL JUEGO PARA LAS DISTINTAS CATEGORÍAS

AUTORA: IRENE LÓPEZ MELERO
*/

// FUNCIÓN PARA CREAR ARRAY DE EJERCICIOS Y SOLUCIONES
function crearArraysCategoria(categoria, numEjercicios) {
    var ejercicios = [];
    var soluciones = [];
    for (var i = 1; i <= numEjercicios; i++) {
        ejercicios.push(`imagenes/${categoria}/ej${i}.jpg`);
        soluciones.push(`imagenes/${categoria}/sol${i}.jpg`);
    }
    return [...ejercicios, ...soluciones];
}

// definimos los arrays con las categorías
var multiplicar = crearArraysCategoria("multiplicar", 6);
var aritmetica = crearArraysCategoria("aritmetica", 6);
var fracciones = crearArraysCategoria("fracciones", 6);
var algebra = crearArraysCategoria("algebra", 6);
var geometria = crearArraysCategoria("geometria", 6);