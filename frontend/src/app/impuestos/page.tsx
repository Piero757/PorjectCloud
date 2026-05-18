'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { FileText, Plus, Calculator, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Impuestos() {
  const [comprobantes, setComprobantes] = useState([]);
  const [tipo, setTipo] = useState('BOLETA');
  const [serie, setSerie] = useState('');
  const [numero, setNumero] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const fetchComprobantes = async () => {
    try {
      const res = await api.get('/comprobantes/');
      setComprobantes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/comprobantes/', {
        tipo,
        serie,
        numero,
        monto_total: monto,
        fecha
      });
      setSerie('');
      setNumero('');
      setMonto('');
      fetchComprobantes();
    } catch (error) {
      alert('Error al guardar comprobante');
    }
  };

  const totalIGV = comprobantes.reduce((acc: number, curr: any) => acc + parseFloat(curr.igv), 0);
  const totalNeto = comprobantes.reduce((acc: number, curr: any) => acc + parseFloat(curr.monto_neto), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white mb-2">Impuestos e IGV</h1>
          <p className="text-gray-400">Calcula y gestiona tus boletas y facturas con el 18% de IGV.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card de Resumen */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 border-primary/20">
              <div className="flex items-center space-x-3 mb-4">
                <Calculator className="text-primary" />
                <h2 className="text-xl font-semibold">Resumen de Impuestos</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Total IGV Acumulado</p>
                  <p className="text-2xl font-bold text-primary">S/ {totalIGV.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Monto Neto</p>
                  <p className="text-2xl font-bold text-white">S/ {totalNeto.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} /> Nuevo Comprobante
              </h2>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tipo de Documento</label>
                <select className="input-field" value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="BOLETA">Boleta</option>
                  <option value="FACTURA">Factura</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Serie</label>
                  <input type="text" className="input-field" value={serie} onChange={e => setSerie(e.target.value)} placeholder="F001" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Número</label>
                  <input type="text" className="input-field" value={numero} onChange={e => setNumero(e.target.value)} placeholder="000123" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Monto Total (Inc. IGV)</label>
                <input type="number" step="0.01" className="input-field" value={monto} onChange={e => setMonto(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fecha</label>
                <input type="date" className="input-field" value={fecha} onChange={e => setFecha(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full">Guardar y Calcular</button>
            </form>
          </div>

          {/* Tabla de Comprobantes */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs text-gray-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Documento</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Monto Neto</th>
                    <th className="px-6 py-4">IGV (18%)</th>
                    <th className="px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comprobantes.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileCheck size={16} className={c.tipo === 'FACTURA' ? 'text-primary' : 'text-accent'} />
                          <span>{c.tipo} {c.serie}-{c.numero}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{c.fecha}</td>
                      <td className="px-6 py-4 text-sm font-mono">S/ {parseFloat(c.monto_neto).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-primary">S/ {parseFloat(c.igv).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold">S/ {parseFloat(c.monto_total).toFixed(2)}</td>
                    </tr>
                  ))}
                  {comprobantes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No hay comprobantes registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
