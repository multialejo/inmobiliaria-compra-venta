import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, MapPin, DollarSign, Bed, Bath, Maximize2, Search, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="350"><rect fill="#e5e7eb" width="500" height="350"/><text fill="#9ca3af" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">Sin imagen</text></svg>');

function App() {
  const [activeTab, setActiveTab] = useState('propiedades');
  const [showFormProp, setShowFormProp] = useState(false);
  const [showFormCliente, setShowFormCliente] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [imagenUrl, setImagenUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');


  const [imagenes, setImagenes] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', precio: '', direccion: '',
    tipo_inmueble: 'casa', superficie_m2: '', canton_id: '', parroquia_id: '',
    dormitorios: '', banos: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filtroPrecio, setFiltroPrecio] = useState('');

  const [clientes, setClientes] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '0987654321', interes: 'Casa' },
    { id: 2, nombre: 'María García', email: 'maria@email.com', telefono: '0987654322', interes: 'Departamento' },
  ]);
  const [formCliente, setFormCliente] = useState({ nombre: '', email: '', telefono: '', interes: '' });
  const [editandoCliente, setEditandoCliente] = useState(null);
  const [showClienteForm, setShowClienteForm] = useState(false);

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

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/propiedades`, { headers: authHeaders });
      const data = await response.json();
      setPropiedades(data);
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, contrasena: loginPassword }),
      });
      if (!response.ok) throw new Error('Credenciales inválidas');
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

  const handleCantonChange = (e) => {
    const cantonId = e.target.value;
    setFormData({ ...formData, canton_id: cantonId, parroquia_id: '' });
    if (cantonId) fetchParroquias(cantonId);
    else setParroquias([]);
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${API_URL}/propiedades/${editingId}` : `${API_URL}/propiedades`;
    const method = isEditing ? 'PATCH' : 'POST';

    const descripcionCompleta = JSON.stringify({
      texto: formData.descripcion,
      dormitorios: formData.dormitorios || '0',
      banos: formData.banos || '0',
      superficie_m2: formData.superficie_m2,
    });

    const payload = {
      titulo: formData.titulo,
      descripcion: descripcionCompleta,
      precio: Number(formData.precio),
      direccion: formData.direccion,
      tipo_inmueble: formData.tipo_inmueble,
      superficie_m2: Number(formData.superficie_m2),
      canton_id: Number(formData.canton_id),
      parroquia_id: formData.parroquia_id ? Number(formData.parroquia_id) : undefined,
      agente_id: currentUser?.id,
      imagenes: imagenes.length > 0 ? imagenes : undefined,
    };

    try {
      const response = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
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

  const handleEditClick = (prop, e) => {
    e.stopPropagation();
    let descData = {};
    try { descData = JSON.parse(prop.descripcion); } catch { descData = { texto: prop.descripcion }; }
    setIsEditing(true);
    setEditingId(prop.id);
    setFormData({
      titulo: prop.titulo,
      descripcion: descData.texto || '',
      precio: prop.precio,
      direccion: prop.direccion,
      tipo_inmueble: prop.tipo_inmueble,
      superficie_m2: prop.superficie_m2 || descData.superficie_m2 || '',
      canton_id: prop.canton_id,
      parroquia_id: prop.parroquia_id,
      dormitorios: descData.dormitorios || '',
      banos: descData.banos || '',
    });
    if (prop.canton_id) fetchParroquias(prop.canton_id);
    setImagenes(prop.imagenes || []);
    setShowFormProp(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', precio: '', direccion: '', tipo_inmueble: 'casa', superficie_m2: '', canton_id: '', parroquia_id: '', dormitorios: '', banos: '' });
    setParroquias([]);
    setImagenes([]);
    setImagenUrl('');
    setShowFormProp(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar esta propiedad?')) return;
    try {
      const response = await fetch(`${API_URL}/propiedades/${id}`, { method: 'DELETE', headers: authHeaders });
      if (response.ok) fetchPropiedades();
    } catch (error) {
      alert('Error al eliminar la propiedad');
    }
  };

  const propiedadesFiltradas = propiedades.filter(p => {
    const cumpleTitulo = !searchTerm || p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const cumpleDireccion = !searchTerm || (p.direccion && p.direccion.toLowerCase().includes(searchTerm.toLowerCase()));
    const cumplePrecio = !filtroPrecio || p.precio <= parseInt(filtroPrecio);
    return (cumpleTitulo || cumpleDireccion) && cumplePrecio;
  });

  const obtenerPrimeraImagen = (imagenes) => {
    if (!imagenes || imagenes.length === 0) return '';
    return imagenes[0];
  };

  const parseDescripcion = (desc) => {
    try { const d = JSON.parse(desc); return d.texto || desc; } catch { return desc; }
  };

  const agregarCliente = () => {
    if (formCliente.nombre && formCliente.email) {
      if (editandoCliente) {
        setClientes(clientes.map(c => c.id === editandoCliente.id ? { ...formCliente, id: editandoCliente.id } : c));
        setEditandoCliente(null);
      } else {
        setClientes([...clientes, { ...formCliente, id: Date.now() }]);
      }
      setFormCliente({ nombre: '', email: '', telefono: '', interes: '' });
      setShowClienteForm(false);
    }
  };

  const eliminarCliente = (id) => {
    setClientes(clientes.filter(c => c.id !== id));
  };

  const editarCliente = (cliente) => {
    setFormCliente(cliente);
    setEditandoCliente(cliente);
    setShowClienteForm(true);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">RE</div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">InmoEcuador</h1>
                    <p className="text-xs text-gray-500">Bolívar, Ecuador</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Ingresa con tus credenciales</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">Ingresar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">RE</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">InmoEcuador</h1>
                  <p className="text-xs text-gray-500">Bolívar, Ecuador</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <button onClick={() => setActiveTab('propiedades')}
                  className={`text-sm font-medium transition ${activeTab === 'propiedades' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  Propiedades
                </button>
                <button onClick={() => setActiveTab('clientes')}
                  className={`text-sm font-medium transition ${activeTab === 'clientes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  Clientes
                </button>
                <span className="flex items-center gap-1.5 text-sm text-gray-500 border-l pl-4 ml-2">
                  <User className="w-4 h-4" />
                  {currentUser?.nombre} ({currentUser?.rol})
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition">
                  <LogOut className="w-4 h-4" /> Salir
                </button>
              </nav>
              <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden pt-4 pb-2 border-t mt-4 space-y-3">
                <button onClick={() => { setActiveTab('propiedades'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left text-sm font-medium py-2 ${activeTab === 'propiedades' ? 'text-blue-600' : 'text-gray-600'}`}>Propiedades</button>
                <button onClick={() => { setActiveTab('clientes'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left text-sm font-medium py-2 ${activeTab === 'clientes' ? 'text-blue-600' : 'text-gray-600'}`}>Clientes</button>
                <div className="text-sm text-gray-500 py-2 border-t">{currentUser?.nombre} ({currentUser?.rol})</div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 py-2">Salir</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {activeTab === 'propiedades' && (
          <>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Buscar por título o ubicación..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <input type="number" placeholder="Precio máximo" value={filtroPrecio}
                    onChange={(e) => setFiltroPrecio(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48" />
                  <button onClick={() => { cancelEdit(); setShowFormProp(!showFormProp); }}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Agregar
                  </button>
                </div>
              </div>
            </div>

            {showFormProp && (
              <div className="bg-blue-50 border-b border-blue-200">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
                      </h3>
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <input type="text" name="titulo" placeholder="Título" value={formData.titulo} onChange={handleInputChange} required
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" name="precio" placeholder="Precio (USD)" value={formData.precio} onChange={handleInputChange} required
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <select name="tipo_inmueble" value={formData.tipo_inmueble} onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="casa">Casa</option>
                          <option value="departamento">Departamento</option>
                          <option value="terreno">Terreno</option>
                          <option value="local">Local</option>
                        </select>
                        <input type="text" name="direccion" placeholder="Ubicación / Dirección" value={formData.direccion} onChange={handleInputChange} required
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <select name="canton_id" value={formData.canton_id} onChange={handleCantonChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Seleccionar cantón</option>
                          {cantones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                        <select name="parroquia_id" value={formData.parroquia_id} onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Seleccionar parroquia</option>
                          {parroquias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                        <input type="number" name="dormitorios" placeholder="Dormitorios" value={formData.dormitorios} onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" name="banos" placeholder="Baños" value={formData.banos} onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" name="superficie_m2" placeholder="Área (m²)" value={formData.superficie_m2} onChange={handleInputChange} required
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div className="mb-4">
                        <textarea name="descripcion" placeholder="Descripción detallada" value={formData.descripcion} onChange={handleInputChange} required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes (URLs)</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" placeholder="Pegar URL de imagen..." value={imagenUrl}
                            onChange={(e) => setImagenUrl(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <button type="button" onClick={handleAddImagen}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium">Agregar</button>
                        </div>
                        {imagenes.length > 0 && (
                          <ul className="space-y-1">
                            {imagenes.map((url, i) => (
                              <li key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded text-sm">
                                <span className="truncate text-gray-600">{url}</span>
                                <button type="button" onClick={() => handleRemoveImagen(i)} className="text-red-500 hover:text-red-700 ml-2"><X className="w-4 h-4" /></button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                          {isEditing ? 'Actualizar' : 'Agregar Propiedad'}
                        </button>
                        <button type="button" onClick={cancelEdit}
                          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm">Cancelar</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600 text-sm">{propiedadesFiltradas.length} propiedades encontradas</p>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando propiedades...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propiedadesFiltradas.length > 0 ? propiedadesFiltradas.map((prop) => (
                    <div key={prop.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                      onClick={() => setSelectedProp(prop)}>
                      <div className="relative h-52 overflow-hidden bg-gray-200">
                        {obtenerPrimeraImagen(prop.imagenes) ? (
                          <img src={obtenerPrimeraImagen(prop.imagenes)} alt={prop.titulo}
                            className="w-full h-full object-cover hover:scale-105 transition"
                            onError={(e) => { e.target.src = PLACEHOLDER; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-gray-400" />
                              </div>
                              <span className="text-sm">Sin imagen</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                          ${prop.precio?.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-sm">{prop.titulo}</h3>
                        <div className="flex items-start gap-1 text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{prop.direccion}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{parseDescripcion(prop.descripcion)}</p>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => handleEditClick(prop, e)}
                            className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-yellow-600 transition">Editar</button>
                          {currentUser?.rol === 'administrador' && (
                            <button onClick={(e) => handleDelete(prop.id, e)}
                              className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-600 transition">Eliminar</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No se encontraron propiedades. Agrega la primera.
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedProp && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProp(null)}>
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    {obtenerPrimeraImagen(selectedProp.imagenes) ? (
                      <img src={obtenerPrimeraImagen(selectedProp.imagenes)} alt={selectedProp.titulo}
                        className="w-full h-64 object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER; }} />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
                    )}
                    <button onClick={() => setSelectedProp(null)}
                      className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                      ${selectedProp.precio?.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedProp.titulo}</h2>
                    <div className="flex items-center gap-1 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{selectedProp.direccion}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{parseDescripcion(selectedProp.descripcion)}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'clientes' && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Clientes Registrados</h2>
              <button onClick={() => { setEditandoCliente(null); setFormCliente({ nombre: '', email: '', telefono: '', interes: '' }); setShowClienteForm(!showClienteForm); }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
                <Plus className="w-5 h-5" /> Registrar Cliente
              </button>
            </div>

            {showClienteForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{editandoCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                  <button onClick={() => { setShowClienteForm(false); setEditandoCliente(null); }} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Nombre completo" value={formCliente.nombre}
                    onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input type="email" placeholder="Email" value={formCliente.email}
                    onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input type="tel" placeholder="Teléfono" value={formCliente.telefono}
                    onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <input type="text" placeholder="Tipo de interés" value={formCliente.interes}
                    onChange={(e) => setFormCliente({ ...formCliente, interes: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex gap-3">
                  <button onClick={agregarCliente}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">{editandoCliente ? 'Actualizar' : 'Registrar'}</button>
                  <button onClick={() => { setShowClienteForm(false); setEditandoCliente(null); }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium">Cancelar</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Interés</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.interes}</td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button onClick={() => editarCliente(cliente)}
                            className="bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-yellow-600 transition">Editar</button>
                          <button onClick={() => eliminarCliente(cliente.id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-400 text-sm">© 2024 InmoEcuador - Plataforma de Gestión Inmobiliaria</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
