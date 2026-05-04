'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import { TrendingUp, TrendingDown, Info, BrainCircuit } from 'lucide-react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Predicciones() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/predicciones/')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">Cargando modelo predictivo...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <BrainCircuit className="mr-3 text-primary" size={32} />
          Predicciones con IA
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-gray-300 mb-2">Gastos Proyectados (Próximo Mes)</h3>
            <p className="text-5xl font-bold text-primary my-6">
              ${data?.prediccion_proximo_mes || 0}
            </p>
            
            {data?.tendencia && (
              <div className={`flex items-center text-lg ${data.tendencia === 'subiendo' ? 'text-danger' : data.tendencia === 'bajando' ? 'text-accent' : 'text-gray-400'}`}>
                {data.tendencia === 'subiendo' ? <TrendingUp className="mr-2" /> : data.tendencia === 'bajando' ? <TrendingDown className="mr-2" /> : <Info className="mr-2" />}
                Tendencia: {data.tendencia}
              </div>
            )}
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Info className="mr-2 text-accent" />
              Consejo de Ahorro
            </h3>
            <p className="text-lg leading-relaxed text-gray-300 bg-white/5 p-6 rounded-lg border border-white/10">
              {data?.consejo || data?.mensaje || 'Aún no hay suficientes datos para generar consejos personalizados.'}
            </p>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>Modelo utilizado: scikit-learn (Linear Regression)</p>
              <p>Basado en tu historial de gastos mensuales.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
