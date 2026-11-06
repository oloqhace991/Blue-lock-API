const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Puerto dinámico para Render, por defecto 3000 si estás en local
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Leer el JSON agrupado
function obtenerCategorias() {
  const data = fs.readFileSync(path.join(__dirname, 'jugadores.json'), 'utf8');
  return JSON.parse(data);
}

// Función auxiliar para obtener TODOS los jugadores en una sola lista plana
function obtenerTodosLosJugadores() {
  const categorias = obtenerCategorias();
  return Object.values(categorias).flat();
}

// Endpoint 1: Obtener la base de datos completa agrupada por categorías
app.get('/api/categorias', (req, res) => {
  const categorias = obtenerCategorias();
  res.json(categorias);
});

// Endpoint 2: Obtener todos los jugadores en una sola lista (para selectores y búsquedas)
app.get('/api/jugadores', (req, res) => {
  const jugadores = obtenerTodosLosJugadores();
  res.json(jugadores);
});

// Endpoint 3: Buscar un jugador por su ID
app.get('/api/jugadores/:id', (req, res) => {
  const jugadores = obtenerTodosLosJugadores();
  const jugador = jugadores.find(j => j.id === req.params.id.toLowerCase());

  if (!jugador) {
    return res.status(404).json({ error: "Jugador no encontrado" });
  }

  res.json(jugador);
});

// Endpoint 4: Consultar la química entre dos jugadores
app.get('/api/quimica', (req, res) => {
  const { j1, j2 } = req.query;
  const jugadores = obtenerTodosLosJugadores();

  const jugador1 = jugadores.find(j => j.id === j1);
  const jugador2 = jugadores.find(j => j.id === j2);

  if (!jugador1 || !jugador2) {
    return res.status(400).json({ error: "Uno o ambos jugadores no existen" });
  }

  let tipoQuimica = "NEUTRA";
  let detalle = "No tienen interacciones especiales registradas.";

  if (jugador1.quimica_negativa.includes(j2) || jugador2.quimica_negativa.includes(j1)) {
    tipoQuimica = "MALA / CHOQUE DE EGOS";
    detalle = `⚠️ ¡Conflicto! ${jugador1.nombre} y ${jugador2.nombre} chocan en el campo. Sus estadísticas podrían bajar.`;
  } else if (jugador1.quimica_positiva.includes(j2) || jugador2.quimica_positiva.includes(j1)) {
    tipoQuimica = "EXCELENTE / REACCIÓN QUÍMICA";
    detalle = `🔥 ¡Gran Sinergia! ${jugador1.nombre} y ${jugador2.nombre} potencian su rendimiento.`;
  }

  res.json({
    jugador_1: jugador1.nombre,
    jugador_2: jugador2.nombre,
    resultado: tipoQuimica,
    descripcion: detalle
  });
});

app.listen(PORT, () => {
  console.log(`⚽ API de Blue Lock corriendo en el puerto ${PORT}`);
});