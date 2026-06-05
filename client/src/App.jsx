import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [imagenUrl, setImagenUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    direccion: '',
    tipo_inmueble: 'casa',
    superficie_m2: '',
    canton_id: '',
    parroquia_id: '',
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    if (token) {
      fetchCantones();
      fetchPropiedades();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, contrasena: loginPassword }),
      });
      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setCurrentUser(data.usuario);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setPropiedades([]);
  };

  const fetchCantones = async () => {
    try {
      const response = await fetch(`${API_URL}/cantones`);
      const data = await response.json();
      setCantones(data);
    } catch (error) {
      console.error('Error al obtener cantones:', error);
    }
  };

  const fetchParroquias = async (cantonId) => {
    try {
      const response = await fetch(`${API_URL}/parroquias/canton/${cantonId}`);
      const data = await response.json();
      setParroquias(data);
    } catch (error) {
      console.error('Error al obtener parroquias:', error);
    }
  };

  const handleCantonChange = (e) => {
    const cantonId = e.target.value;
    setFormData({ ...formData, canton_id: cantonId });
    if (cantonId) {
      fetchParroquias(cantonId);
    } else {
      setParroquias([]);
    }
  };

  const handleAddImagen = () => {
    if (imagenUrl.trim()) {
      setImagenes([...imagenes, imagenUrl.trim()]);
      setImagenUrl('');
    }
  };

  const handleRemoveImagen = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const fetchPropiedades = async () => {
    try {
      const response = await fetch(`${API_URL}/propiedades`, {
        headers: authHeaders,
      });
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
      tipo_inmueble: prop.tipo_inmueble,
      superficie_m2: prop.superficie_m2,
      canton_id: prop.canton_id,
      parroquia_id: prop.parroquia_id,
    });
    if (prop.canton_id) {
      fetchParroquias(prop.canton_id);
    }
    setImagenes(prop.imagenes || []);
    document.getElementById('registro').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${API_URL}/propiedades/${editingId}` : `${API_URL}/propiedades`;
    const method = isEditing ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      precio: Number(formData.precio),
      superficie_m2: Number(formData.superficie_m2),
      canton_id: Number(formData.canton_id),
      agente_id: currentUser?.id,
      imagenes: imagenes.length > 0 ? imagenes : undefined,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchPropiedades();
        cancelEdit();
        alert(isEditing ? 'Propiedad actualizada con éxito' : 'Propiedad registrada con éxito');
      } else {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      titulo: '',
      descripcion: '',
      precio: '',
      direccion: '',
      tipo_inmueble: 'casa',
      superficie_m2: '',
      canton_id: '',
      parroquia_id: '',
    });
    setParroquias([]);
    setImagenes([]);
    setImagenUrl('');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar esta propiedad de la base de datos?')) return;

    try {
      const response = await fetch(`${API_URL}/propiedades/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
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

  if (!token) {
    return (
      <div className="app-wrapper">
        <header className="navbar">
          <div className="logo">Mundo <span>Inmobiliario</span></div>
        </header>
        <section className="hero">
          <div className="hero-content">
            <h1>Inicia Sesión</h1>
            <p>Ingresa con tus credenciales para acceder al sistema.</p>
          </div>
        </section>
        <main className="container">
          <section className="registration-section">
            <div className="form-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <h2>Acceso al Sistema</h2>
              <form onSubmit={handleLogin} className="styled-form">
                <div className="input-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
                <button type="submit" className="btn-submit">Ingresar</button>
              </form>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="navbar">
        <div className="logo">Mundo <span>Inmobiliario</span></div>
        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#propiedades">Catálogo</a>
          <a href="#registro">{isEditing ? 'Editar' : 'Registrar'}</a>
          <span className="user-info">
            {currentUser?.nombre} ({currentUser?.rol})
          </span>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
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
                      <p className="location">{prop.direccion}</p>
                      <div className="card-actions">
                        <button className="btn-outline" onClick={(e) => handleEditClick(prop, e)}>
                          Editar
                        </button>
                        {currentUser?.rol === 'administrador' && (
                          <button className="btn-danger" onClick={(e) => handleDelete(prop.id, e)}>
                            Eliminar
                          </button>
                        )}
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
                  <label>Tipo de Inmueble</label>
                  <select
                    name="tipo_inmueble"
                    value={formData.tipo_inmueble}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="local">Local</option>
                  </select>
                </div>
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
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Cantón</label>
                  <select
                    name="canton_id"
                    value={formData.canton_id}
                    onChange={handleCantonChange}
                    required
                  >
                    <option value="">Seleccionar cantón</option>
                    {cantones.map(canton => (
                      <option key={canton.id} value={canton.id}>{canton.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Parroquia</label>
                  <select
                    name="parroquia_id"
                    value={formData.parroquia_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar parroquia</option>
                    {parroquias.map(parroquia => (
                      <option key={parroquia.id} value={parroquia.id}>{parroquia.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-row">
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
                <div className="input-group">
                  <label>Superficie (m²)</label>
                  <input
                    type="number"
                    name="superficie_m2"
                    value={formData.superficie_m2}
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

              <div className="input-group">
                <label>Imágenes (URLs)</label>
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="Pegar URL de imagen..."
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                  />
                  <button type="button" onClick={handleAddImagen}>Agregar</button>
                </div>
                {imagenes.length > 0 && (
                  <ul className="imagenes-list">
                    {imagenes.map((url, index) => (
                      <li key={index}>
                        <span>{url}</span>
                        <button type="button" onClick={() => handleRemoveImagen(index)}>X</button>
                      </li>
                    ))}
                  </ul>
                )}
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
              <p className="modal-location">{selectedProp.direccion}</p>
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
