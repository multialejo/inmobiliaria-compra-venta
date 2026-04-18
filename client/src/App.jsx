import { useState } from 'react';

// Estos son "Datos de Prueba" (Mock Data). 
// Mañana tu líder te enseñará a borrar esto y traerlo de la Base de Datos.
const propiedadesPrueba = [
  {
    id: 1,
    titulo: 'Casa familiar en el centro de Guaranda',
    precio: 62000,
    tipo: 'Casa',
    ubicacion: 'Guanujo, Guaranda',
    imagen: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80',
    estado: 'disponible'
  },
  {
    id: 2,
    titulo: 'Terreno agrícola en Chillanes',
    precio: 18000,
    tipo: 'Terreno',
    ubicacion: 'Chillanes',
    imagen: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
    estado: 'disponible'
  },
  {
    id: 3,
    titulo: 'Local comercial Av. Eloy Alfaro',
    precio: 55000,
    tipo: 'Local',
    ubicacion: 'Guaranda',
    imagen: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80',
    estado: 'disponible'
  }
];

function App() {
  const [filtro, setFiltro] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* BARRA DE NAVEGACIÓN (HEADER) */}
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inmobiliaria Bolívar</h1>
          <div className="space-x-4">
            <button className="hover:text-blue-200">Inicio</button>
            <button className="hover:text-blue-200">Propiedades</button>
            <button className="bg-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-500">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* SECCIÓN PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-6">
        
        {/* BUSCADOR VISUAL (Aún no funciona, es solo el diseño) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Encuentra tu propiedad ideal</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Buscar por ciudad..." 
              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select className="border p-2 rounded w-full outline-none">
              <option>Cualquier Tipo</option>
              <option>Casa</option>
              <option>Terreno</option>
              <option>Local</option>
            </select>
            <select className="border p-2 rounded w-full outline-none">
              <option>Cualquier Precio</option>
              <option>Hasta $30,000</option>
              <option>Hasta $60,000</option>
            </select>
            <button className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500">
              Buscar
            </button>
          </div>
        </div>

        {/* CUADRÍCULA DE PROPIEDADES (GRID) */}
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Propiedades Destacadas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {propiedadesPrueba.map((propiedad) => (
            <div key={propiedad.id} className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-shadow">
              <img 
                src={propiedad.imagen} 
                alt={propiedad.titulo} 
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {propiedad.tipo}
                  </span>
                  <span className="text-green-600 font-bold text-xl">
                    ${propiedad.precio.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{propiedad.titulo}</h4>
                <p className="text-gray-600 text-sm mb-4 flex items-center">
                  📍 {propiedad.ubicacion}
                </p>
                <button className="w-full bg-blue-50 text-blue-700 font-semibold py-2 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

export default App;