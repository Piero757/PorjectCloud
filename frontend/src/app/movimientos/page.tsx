'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [movRes, presRes] = await Promise.all([
        api.get('/movimientos/'),
        api.get('/presupuestos/')
      ]);
      setMovimientos(movRes.data);
      setPresupuestos(presRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/movimientos/', {
        monto, tipo, categoria, fecha, descripcion
      });
      loadData();
      setMonto(''); setCategoria(''); setDescripcion('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este movimiento?')) {
      await api.delete(`/movimientos/${id}/`);
      loadData();
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Gestión de Movimientos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-card p-6 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Nuevo Registro</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select className="input-field" value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monto ($)</label>
                <input type="number" step="0.01" className="input-field" value={monto} onChange={e => setMonto(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input 
                  type="text" 
                  list="categorias-list"
                  className="input-field" 
                  value={categoria} 
                  onChange={e => setCategoria(e.target.value)} 
                  required 
                  placeholder="Selecciona o escribe..." 
                />
                <datalist id="categorias-list">
                  {presupuestos.map(p => (
                    <option key={p.id} value={p.categoria} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input type="date" className="input-field" value={fecha} onChange={e => setFecha(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input type="text" className="input-field" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">
                <Plus size={18} className="mr-2" />
                Registrar
              </button>
            </form>
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 bg-accent/20 text-accent rounded-lg flex items-center"
                >
                  <CheckCircle2 size={18} className="mr-2" />
                  Registro guardado con éxito
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Historial</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-gray-400">Fecha</th>
                    <th className="p-3 text-gray-400">Categoría</th>
                    <th className="p-3 text-gray-400">Tipo</th>
                    <th className="p-3 text-gray-400">Monto</th>
                    <th className="p-3 text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m, i) => (
                    <motion.tr 
                      key={m.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-3">{m.fecha}</td>
                      <td className="p-3">{m.categoria}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${m.tipo === 'ingreso' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="p-3 font-medium">${m.monto}</td>
                      <td className="p-3">
                        <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-danger transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {movimientos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">No hay movimientos registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
