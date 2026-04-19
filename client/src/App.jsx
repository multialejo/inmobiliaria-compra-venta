import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/propiedades';

function App() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    direccion: '',
  });

  useEffect(() => {
    fetchPropiedades();
  }, []);

  const fetchPropiedades = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPropiedades(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (prop, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingId(prop.id);
    setFormData({
      titulo: prop.titulo,
      descripcion: prop.descripcion,
      precio: prop.precio,
      direccion: prop.direccion,
    });
    document.getElementById('registro').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
    const method = isEditing ? 'PATCH' : 'POST'; 

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, precio: Number(formData.precio) }),
      });
      
      if (response.ok) {
        fetchPropiedades();
        cancelEdit();
        alert(isEditing ? 'Propiedad actualizada con éxito' : 'Propiedad registrada con éxito');
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', precio: '', direccion: '' });
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar esta propiedad de la base de datos?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPropiedades();
      }
    } catch (error) {
      alert('Error al eliminar la propiedad');
    }
  };

  const filteredPropiedades = propiedades.filter(prop => 
    prop.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      <header className="navbar">
        <div className="logo">Mundo <span>Inmobiliario</span></div>
        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#propiedades">Catálogo</a>
          <a href="#registro">{isEditing ? 'Editar' : 'Registrar'}</a>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-content">
          <h1>Encuentra la casa de tus sueños</h1>
          <p>Conectamos personas con hogares de forma rápida y segura.</p>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Buscar por ciudad, sector o título..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="container">
        <section id="propiedades" className="properties-section">
          <div className="section-header">
            <h2>Propiedades Disponibles</h2>
            <div className="underline"></div>
          </div>

          {loading ? (
            <div className="loader">Cargando catálogo desde el servidor...</div>
          ) : (
            <div className="properties-grid">
              {filteredPropiedades.length > 0 ? (
                filteredPropiedades.map((prop) => (
                  <div key={prop.id} className="property-card" onClick={() => setSelectedProp(prop)}>
                    <div className="card-image">
                      <div className="price-tag">${prop.precio.toLocaleString()}</div>
                    </div>
                    <div className="card-info">
                      <h3>{prop.titulo}</h3>
                      <p className="location">📍 {prop.direccion}</p>
                      <div className="card-actions">
                        <button className="btn-outline" onClick={(e) => handleEditClick(prop, e)}>
                          Editar
                        </button>
                        <button className="btn-danger" onClick={(e) => handleDelete(prop.id, e)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-results">No se encontraron propiedades conectadas.</p>
              )}
            </div>
          )}
        </section>

        <section id="registro" className="registration-section">
          <div className="form-container">
            <h2>{isEditing ? 'Editar Propiedad' : 'Publicar Nueva Propiedad'}</h2>
            <p>
              {isEditing 
                ? 'Modifica los datos y guarda los cambios en el servidor.' 
                : 'Completa los datos para subir tu propiedad al servidor.'}
            </p>
            <form onSubmit={handleSubmit} className="styled-form">
              <div className="input-group">
                <label>Nombre de la Propiedad</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Precio de Venta (USD)</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Ubicación Exacta</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Descripción Detallada</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {isEditing ? 'Actualizar en Servidor' : 'Guardar en Servidor'}
                </button>
                {isEditing && (
                  <button type="button" className="btn-danger" onClick={cancelEdit}>
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      {selectedProp && (
        <div className="modal-overlay" onClick={() => setSelectedProp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProp(null)}>✖</button>
            <div className="modal-image"></div>
            <div className="modal-body">
              <h2>{selectedProp.titulo}</h2>
              <h3 className="modal-price">${selectedProp.precio.toLocaleString()}</h3>
              <p className="modal-location">📍 {selectedProp.direccion}</p>
              <div className="modal-desc">
                <h4>Descripción:</h4>
                <p>{selectedProp.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;