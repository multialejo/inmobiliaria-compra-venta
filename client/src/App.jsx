/**
 * @file App.jsx
 * @brief Componente raíz del Frontend y panel de administración principal.
 * 
 * @section estructura Estructura del Componente
 * Controla el flujo de navegación de la aplicación web de bienes raíces, conmutando entre:
 * - Vista de Catálogo Público (CatalogPage)
 * - Dashboard Administrativo (propiedades, clientes, usuarios/solicitudes)
 * 
 * @section api Conexión con la API Backend
 * Se comunica con la API de NestJS mediante peticiones HTTP asíncronas hacia la dirección configurada en `API_URL` (http://localhost:3000/api).
 * Para todas las peticiones que requieren autorización (gestión de inmuebles, listado de clientes, cambio de roles),
 * se adjunta el token JWT obtenido del inicio de sesión en las cabeceras:
 * `Authorization: Bearer <token>`
 * 
 * @section func Funcionalidades Principales
 * - Inicio de sesión y persistencia local del estado de autenticación (localStorage).
 * - Búsqueda, filtrado, creación, edición y eliminación (con ConfirmDialog) de inmuebles.
 * - Registro de clientes y asignación/solicitud de roles administrativos (Agente, Administrador).
 */

import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, MapPin, DollarSign, Bed, Bath, Maximize2, Search, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import './App.css';
import CatalogPage from './components/CatalogPage/CatalogPage';
import ToastContainer, { useToast } from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';

const API_URL = 'http://localhost:3000/api';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="350"><rect fill="#e5e7eb" width="500" height="350"/><text fill="#9ca3af" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">Sin imagen</text></svg>');

function App() {
  const [currentPage, setCurrentPage] = useState('catalog');
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
  const [adminAuthTab, setAdminAuthTab] = useState('login');
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regDireccion, setRegDireccion] = useState('');


  const [imagenes, setImagenes] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', precio: '', direccion: '',
    tipo_inmueble: 'casa', superficie_m2: '', canton_id: '', parroquia_id: '',
    dormitorios: '', banos: '', estado: 'disponible',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filtroPrecio, setFiltroPrecio] = useState('');

  const [clientes, setClientes] = useState([]);
  const [formCliente, setFormCliente] = useState({ nombre: '', email: '', telefono: '', interes: '' });
  const [editandoCliente, setEditandoCliente] = useState(null);
  const [showClienteForm, setShowClienteForm] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const [usuarios, setUsuarios] = useState([]);
  const { toasts, showToast, removeToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, message: '', id: null, type: '' });

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchCantones();
      fetchPropiedades();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      if (currentUser?.rol === 'administrador') {
        fetchUsuarios();
      }
      if (currentUser?.rol === 'administrador' || currentUser?.rol === 'agente') {
        fetchClientes();
      }
    }
  }, [token, currentUser?.rol]);

  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchUserProfile();
        if (currentUser?.rol === 'administrador') {
          fetchUsuarios();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [token, currentUser?.rol]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes/perfil`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const handleSolicitarAgente = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios/solicitar-agente`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setCurrentUser({ ...currentUser, solicitudAgente: true });
        showToast('Solicitud de privilegios de Agente enviada al Administrador.', 'success');
      } else {
        showToast('Error al enviar solicitud.', 'error');
      }
    } catch (error) {
      showToast('Error de red al enviar solicitud.', 'error');
    }
  };

  const handleDismissSolicitudStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes/perfil`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estadoSolicitud: 'ninguna' })
      });
      if (response.ok) {
        setCurrentUser({ ...currentUser, estadoSolicitud: 'ninguna' });
      }
    } catch (error) {
      console.error('Error al descartar estado de solicitud:', error);
    }
  };

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${usuarioId}/rol`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rol: nuevoRol })
      });
      if (response.ok) {
        showToast('Rol actualizado con éxito.', 'success');
        fetchUsuarios();
      } else {
        const err = await response.json();
        showToast('Error: ' + (err.message || JSON.stringify(err)), 'error');
      }
    } catch (error) {
      showToast('Error de red al actualizar rol.', 'error');
    }
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

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/clientes/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          contrasena: regPassword,
          telefono: regTelefono || undefined,
          cedula: regCedula || undefined,
          direccion: regDireccion || undefined
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error en registro');
      }

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, contrasena: regPassword }),
      });
      if (!loginRes.ok) throw new Error('Error al ingresar');
      const data = await loginRes.json();
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
      estado: formData.estado,
    };

    try {
      const response = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      if (response.ok) {
        fetchPropiedades();
        cancelEdit();
        showToast(isEditing ? 'Propiedad actualizada con éxito' : 'Propiedad registrada con éxito', 'success');
      } else {
        const errorData = await response.json();
        showToast('Error: ' + JSON.stringify(errorData), 'error');
      }
    } catch (error) {
      showToast('Error al conectar con el servidor', 'error');
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
      estado: prop.estado || 'disponible',
    });
    if (prop.canton_id) fetchParroquias(prop.canton_id);
    setImagenes(prop.imagenes || []);
    setShowFormProp(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', precio: '', direccion: '', tipo_inmueble: 'casa', superficie_m2: '', canton_id: '', parroquia_id: '', dormitorios: '', banos: '', estado: 'disponible' });
    setParroquias([]);
    setImagenes([]);
    setImagenUrl('');
    setShowFormProp(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setConfirmDelete({
      isOpen: true,
      message: '¿Estás seguro de eliminar esta propiedad?',
      id,
      type: 'propiedad',
    });
  };

  const executeDelete = async () => {
    const { id, type } = confirmDelete;
    try {
      if (type === 'propiedad') {
        const response = await fetch(`${API_URL}/propiedades/${id}`, { method: 'DELETE', headers: authHeaders });
        if (response.ok) {
          fetchPropiedades();
          showToast('Propiedad eliminada con éxito.', 'success');
        }
      } else if (type === 'cliente') {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchClientes();
          showToast('Cliente de baja con éxito.', 'success');
        } else {
          showToast('Error al eliminar cliente.', 'error');
        }
      }
    } catch (error) {
      showToast('Error al eliminar.', 'error');
    }
    setConfirmDelete({ isOpen: false, message: '', id: null, type: '' });
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

  const agregarCliente = async () => {
    if (formCliente.nombre && formCliente.email) {
      try {
        const body = {
          nombre: formCliente.nombre,
          email: formCliente.email,
          telefono: formCliente.telefono || undefined,
          contrasena: 'cliente123',
        };

        const url = editandoCliente 
          ? `${API_URL}/usuarios/${editandoCliente.id}` 
          : `${API_URL}/clientes/register`;
        
        const method = editandoCliente ? 'PATCH' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          showToast(editandoCliente ? 'Cliente actualizado con éxito.' : 'Cliente registrado con éxito.', 'success');
          fetchClientes();
          setFormCliente({ nombre: '', email: '', telefono: '', interes: '' });
          setEditandoCliente(null);
          setShowClienteForm(false);
        } else {
          const err = await response.json();
          showToast('Error: ' + (err.message || 'Error en la operación'), 'error');
        }
      } catch (error) {
        showToast('Error de conexión al guardar cliente.', 'error');
      }
    }
  };

  const eliminarCliente = async (id) => {
    setConfirmDelete({
      isOpen: true,
      message: '¿Estás seguro de eliminar este cliente?',
      id,
      type: 'cliente',
    });
  };

  const editarCliente = (cliente) => {
    setFormCliente(cliente);
    setEditandoCliente(cliente);
    setShowClienteForm(true);
  };

  if (currentPage === 'catalog') {
    return (
      <CatalogPage 
        currentUser={currentUser}
        token={token}
        setToken={setToken}
        setCurrentUser={setCurrentUser}
        onNavigateToDashboard={() => setCurrentPage('dashboard')} 
      />
    );
  }

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
                <button 
                  onClick={() => setCurrentPage('catalog')} 
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg transition text-sm font-semibold flex items-center gap-1.5"
                >
                  Ver Catálogo Público
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Ingreso al Sistema</h2>
              <p className="text-slate-500 text-xs text-center mb-6">Accede a tus herramientas administrativas o de agente/cliente</p>

              <div className="form-group-custom">
                <label className="input-label-custom" htmlFor="login-email">Email</label>
                <input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-custom" required placeholder="ejemplo@correo.com" />
              </div>
              <div className="form-group-custom">
                <label className="input-label-custom" htmlFor="login-password">Contraseña</label>
                <input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="input-custom" required placeholder="••••••••" />
              </div>
              {loginError && <div className="error-alert" role="alert">{loginError}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
                Ingresar
              </button>
            </form>
          </div>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
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
                <button onClick={() => setCurrentPage('catalog')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition mr-2">
                  Ver Catálogo
                </button>
                <button onClick={() => setActiveTab('propiedades')}
                  className={`text-sm font-medium transition ${activeTab === 'propiedades' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  Propiedades
                </button>
                {currentUser?.rol !== 'cliente' && (
                  <button onClick={() => setActiveTab('clientes')}
                    className={`text-sm font-medium transition ${activeTab === 'clientes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                    Clientes
                  </button>
                )}
                {currentUser?.rol === 'administrador' && (
                  <button onClick={() => setActiveTab('usuarios')}
                    className={`text-sm font-medium transition ${activeTab === 'usuarios' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                    Usuarios/Solicitudes
                  </button>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500 border-l pl-4 ml-2">
                  <User className="w-4 h-4" />
                  {currentUser?.nombre} ({currentUser?.rol?.toUpperCase()})
                </span>
                {currentUser?.rol === 'cliente' && (
                  currentUser.solicitudAgente ? (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1.5 rounded-lg font-bold">
                      ⏳ Solicitud Agente Pendiente
                    </span>
                  ) : (
                    <button 
                      onClick={handleSolicitarAgente}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
                    >
                      🔑 Solicitar ser Agente
                    </button>
                  )
                )}
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition">
                  <LogOut className="w-4 h-4" /> Salir
                </button>
              </nav>
              <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menú de navegación">
                <Menu className="w-6 h-6" />
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden pt-4 pb-2 border-t mt-4 space-y-3">
                <button onClick={() => { setCurrentPage('catalog'); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-semibold py-2 text-blue-600">Ver Catálogo</button>
                <button onClick={() => { setActiveTab('propiedades'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left text-sm font-medium py-2 ${activeTab === 'propiedades' ? 'text-blue-600' : 'text-gray-600'}`}>Propiedades</button>
                {currentUser?.rol !== 'cliente' && (
                  <button onClick={() => { setActiveTab('clientes'); setMobileMenuOpen(false); }}
                    className={`block w-full text-left text-sm font-medium py-2 ${activeTab === 'clientes' ? 'text-blue-600' : 'text-gray-600'}`}>Clientes</button>
                )}
                {currentUser?.rol === 'administrador' && (
                  <button onClick={() => { setActiveTab('usuarios'); setMobileMenuOpen(false); }}
                    className={`block w-full text-left text-sm font-medium py-2 ${activeTab === 'usuarios' ? 'text-blue-600' : 'text-gray-600'}`}>Usuarios/Solicitudes</button>
                )}
                <div className="text-sm text-gray-500 py-2 border-t flex flex-col gap-2">
                  <span>{currentUser?.nombre} ({currentUser?.rol?.toUpperCase()})</span>
                  {currentUser?.rol === 'cliente' && (
                    currentUser.solicitudAgente ? (
                      <span className="text-xs text-yellow-600 font-bold">⏳ Solicitud Agente Pendiente</span>
                    ) : (
                      <button 
                        onClick={handleSolicitarAgente}
                        className="text-xs bg-blue-600 text-white py-1 px-2.5 rounded font-bold"
                      >
                        🔑 Solicitar ser Agente
                      </button>
                    )
                  )}
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 py-2">Salir</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {currentUser && (currentUser.estadoSolicitud === 'aprobada' || currentUser.estadoSolicitud === 'rechazada') && (
          <div className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
            {currentUser.estadoSolicitud === 'aprobada' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="text-sm font-bold text-green-900">¡Solicitud Aprobada!</h4>
                    <p className="text-xs text-green-700">Tu solicitud para ser Agente ha sido aceptada por el Administrador. Ahora tienes privilegios de Agente.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDismissSolicitudStatus()}
                  className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Solicitud Rechazada</h4>
                    <p className="text-xs text-red-700">Tu solicitud para ser Agente ha sido rechazada por el Administrador.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDismissSolicitudStatus()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'propiedades' && (
          <>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Buscar por título o ubicación..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Buscar propiedades por título o ubicación" />
                  </div>
                  <input type="number" placeholder="Precio máximo" value={filtroPrecio}
                    onChange={(e) => setFiltroPrecio(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48" aria-label="Filtrar por precio máximo" />
                  {currentUser?.rol !== 'cliente' && (
                    <button onClick={() => { cancelEdit(); setShowFormProp(!showFormProp); }}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" /> Agregar
                    </button>
                  )}
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
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar formulario"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <input type="text" name="titulo" placeholder="Título" value={formData.titulo} onChange={handleInputChange} required
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Título de la propiedad" />
                    <input type="number" name="precio" placeholder="Precio (USD)" value={formData.precio} onChange={handleInputChange} required
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Precio en dólares" />
                    <select name="tipo_inmueble" value={formData.tipo_inmueble} onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Tipo de inmueble">
                      <option value="casa">Casa</option>
                      <option value="departamento">Departamento</option>
                      <option value="terreno">Terreno</option>
                      <option value="local">Local</option>
                    </select>
                    <input type="text" name="direccion" placeholder="Ubicación / Dirección" value={formData.direccion} onChange={handleInputChange} required
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Dirección de la propiedad" />
                    <select name="canton_id" value={formData.canton_id} onChange={handleCantonChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Cantón">
                      <option value="">Seleccionar cantón</option>
                      {cantones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <select name="parroquia_id" value={formData.parroquia_id} onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Parroquia">
                      <option value="">Seleccionar parroquia</option>
                      {parroquias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <input type="number" name="dormitorios" placeholder="Dormitorios" value={formData.dormitorios} onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Número de dormitorios" />
                    <input type="number" name="banos" placeholder="Baños" value={formData.banos} onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Número de baños" />
                    <input type="number" name="superficie_m2" placeholder="Área (m²)" value={formData.superficie_m2} onChange={handleInputChange} required
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Superficie en metros cuadrados" />
                    {isEditing && (
                      <select name="estado" value={formData.estado} onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-50 font-bold" aria-label="Estado de disponibilidad">
                        <option value="disponible">🟢 Disponible</option>
                        <option value="reservada">🟡 Reservada</option>
                        <option value="vendida">🔴 Vendida</option>
                      </select>
                    )}
                      </div>
                      <div className="mb-4">
                      <textarea name="descripcion" placeholder="Descripción detallada" value={formData.descripcion} onChange={handleInputChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2" aria-label="Descripción detallada" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imagen-url">Imágenes (URLs)</label>
                        <div className="flex gap-2 mb-2">
                          <input id="imagen-url" type="text" placeholder="Pegar URL de imagen..." value={imagenUrl}
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
                                <button type="button" onClick={() => handleRemoveImagen(i)} className="text-red-500 hover:text-red-700 ml-2" aria-label="Eliminar imagen"><X className="w-4 h-4" /></button>
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
                        {prop.estado === 'vendida' ? (
                          <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold uppercase shadow">
                            Vendido
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold uppercase shadow">
                            Disponible
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-sm">{prop.titulo}</h3>
                        <div className="flex items-start gap-1 text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{prop.direccion}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{parseDescripcion(prop.descripcion)}</p>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {(currentUser?.rol === 'administrador' || 
                            (currentUser?.rol === 'agente' && prop.agente_id === currentUser.id)) && (
                            <button onClick={(e) => handleEditClick(prop, e)}
                              className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-yellow-600 transition">Editar</button>
                          )}
                          {(currentUser?.rol === 'administrador' || 
                            (currentUser?.rol === 'agente' && prop.agente_id === currentUser.id)) && (
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
              <div
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedProp(null)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-prop-title"
                onKeyDown={(e) => { if (e.key === 'Escape') setSelectedProp(null); }}
              >
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
                      className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100" aria-label="Cerrar detalle">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                      ${selectedProp.precio?.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 id="modal-prop-title" className="text-xl font-bold text-gray-900 mb-2">{selectedProp.titulo}</h2>
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
              {currentUser?.rol === 'administrador' && (
                <button onClick={() => { setEditandoCliente(null); setFormCliente({ nombre: '', email: '', telefono: '', interes: '' }); setShowClienteForm(!showClienteForm); }}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Registrar Cliente
                </button>
              )}
            </div>

            {showClienteForm && currentUser?.rol === 'administrador' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{editandoCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                  <button onClick={() => { setShowClienteForm(false); setEditandoCliente(null); }} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar formulario"><X className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Nombre completo" value={formCliente.nombre}
                    onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Nombre completo" />
                  <input type="email" placeholder="Email" value={formCliente.email}
                    onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Correo electrónico" />
                  <input type="tel" placeholder="Teléfono" value={formCliente.telefono}
                    onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Teléfono" />
                  <input type="text" placeholder="Tipo de interés" value={formCliente.interes}
                    onChange={(e) => setFormCliente({ ...formCliente, interes: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Tipo de interés" />
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
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Agente de propiedad</th>
                      {currentUser?.rol === 'administrador' && (
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-semibold text-blue-600">
                          {cliente.intereses && cliente.intereses.length > 0 
                            ? cliente.intereses.map(i => i.propiedad?.titulo || 'Propiedad').join(', ') 
                            : 'Ninguno'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {cliente.intereses && cliente.intereses.length > 0 
                            ? cliente.intereses.map(i => i.propiedad?.agente?.nombre || 'Sin agente').join(', ') 
                            : '—'}
                        </td>
                        {currentUser?.rol === 'administrador' && (
                          <td className="px-6 py-4 text-sm flex gap-2">
                            <button onClick={() => editarCliente(cliente)}
                              className="bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-yellow-600 transition">Editar</button>
                            <button onClick={() => eliminarCliente(cliente.id)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition">Eliminar</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && currentUser?.rol === 'administrador' && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios y Roles</h2>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-700">Nombre</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-700">Rol Actual</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-700">Estado Solicitud</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-700">Acciones de Transición</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-700">Cambiar Rol Manual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{usuario.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            usuario.rol === 'administrador' ? 'bg-red-100 text-red-800' :
                            usuario.rol === 'agente' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {usuario.solicitudAgente ? (
                            <div className="space-y-1.5 bg-yellow-50 border border-yellow-200 rounded-xl p-3.5 max-w-xs shadow-sm text-xs">
                              <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px] font-bold block w-fit mb-2 uppercase">
                                ⏳ Solicitud Agente
                              </span>
                              <p className="text-gray-700"><strong className="text-gray-900">Cédula:</strong> {usuario.cedula || '—'}</p>
                              <p className="text-gray-700"><strong className="text-gray-900">Teléfono:</strong> {usuario.telefono || '—'}</p>
                              <p className="text-gray-700"><strong className="text-gray-900">Dirección:</strong> {usuario.direccion || '—'}</p>
                              <div className="border-t border-yellow-200 pt-1.5 mt-1.5 space-y-1">
                                <p className="text-gray-700"><strong className="text-gray-900">Experiencia:</strong> {usuario.experienciaAgente || '—'}</p>
                                <p className="text-gray-700"><strong className="text-gray-900">Licencia:</strong> {usuario.licenciaAgente || '—'}</p>
                                <p className="text-gray-700"><strong className="text-gray-900">Motivo:</strong> {usuario.motivoAgente || '—'}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {usuario.rol === 'cliente' && usuario.solicitudAgente && (
                            <>
                              <button 
                                onClick={() => handleCambiarRol(usuario.id, 'agente')}
                                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-green-700 transition"
                              >
                                Aprobar Agente
                              </button>
                              <button 
                                onClick={() => handleCambiarRol(usuario.id, 'cliente')}
                                className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-red-600 transition"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {usuario.rol === 'agente' && (
                            <button 
                              onClick={() => handleCambiarRol(usuario.id, 'cliente')}
                              className="bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-yellow-600 transition"
                            >
                              Quitar Privilegios (Hacer Cliente)
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={usuario.rol}
                            onChange={(e) => handleCambiarRol(usuario.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                            aria-label="Cambiar rol de usuario"
                          >
                            <option value="cliente">Cliente</option>
                            <option value="agente">Agente</option>
                            <option value="administrador">Administrador</option>
                          </select>
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
          <p className="text-gray-400 text-sm">© 2026 InmoEcuador - Plataforma de Gestión Inmobiliaria</p>
        </div>
      </footer>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        message={confirmDelete.message}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, message: '', id: null, type: '' })}
      />
    </div>
  );
}

export default App;
