'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [reporte, setReporte] = useState<any>(null);
  
  const [categoria, setCategoria] = useState('');
  const [limite, setLimite] = useState('');
  
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  const loadData = async () => {
    try {
      const [presRes, repRes] = await Promise.all([
        api.get('/presupuestos/'),
        api.get(`/reportes/?mes=${mesActual}&anio=${anioActual}`)
      ]);
      setPresupuestos(presRes.data);
      setReporte(repRes.data);
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
      await api.post('/presupuestos/', {
        categoria, limite, mes: mesActual, anio: anioActual
      });
      setCategoria(''); setLimite('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/presupuestos/${id}/`);
    loadData();
  };

  const getGastoPorCategoria = (cat: string) => {
    if (!reporte) return 0;
    const gastos = reporte.gastos_por_categoria.filter((g: any) => g.categoria.toLowerCase() === cat.toLowerCase());
    return gastos.reduce((sum: number, g: any) => sum + parseFloat(g.total), 0);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Presupuestos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-card p-6 lg:col-span-1 h-fit">
            <h3 className="text-xl font-bold mb-4">Nuevo Presupuesto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input type="text" className="input-field" value={categoria} onChange={e => setCategoria(e.target.value)} required placeholder="Ej. Comida, Transporte" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Límite ($)</label>
                <input type="number" step="0.01" className="input-field" value={limite} onChange={e => setLimite(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full">Guardar</button>
            </form>
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Estado Actual</h3>
            <div className="space-y-6">
              {presupuestos.map((p, i) => {
                const gastado = getGastoPorCategoria(p.categoria);
                const porcentaje = Math.min((gastado / p.limite) * 100, 100);
                const excedido = gastado > p.limite;

                return (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium flex items-center">
                        {p.categoria}
                        {excedido && <AlertTriangle size={16} className="text-danger ml-2" />}
                      </span>
                      <span className="text-sm">
                        ${gastado.toFixed(2)} / ${parseFloat(p.limite).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 mb-2 relative overflow-hidden">
                      <motion.div 
                        className={`absolute top-0 left-0 h-2.5 rounded-full ${porcentaje > 75 ? 'bg-red-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentaje}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{porcentaje.toFixed(1)}% utilizado</span>
                      <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {presupuestos.length === 0 && (
                <div className="text-gray-400 text-center py-4">No hay presupuestos configurados</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
