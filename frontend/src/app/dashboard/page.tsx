'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/reportes/')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">Cargando...</div>
    </DashboardLayout>
  );

  const barData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        label: 'Monto ($)',
        data: [data.total_ingresos || 0, data.total_gastos || 0],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const categorias = data.gastos_por_categoria.map((g: any) => g.categoria);
  const totalesCat = data.gastos_por_categoria.map((g: any) => g.total);

  const doughnutData = {
    labels: categorias.length ? categorias : ['Sin datos'],
    datasets: [
      {
        data: totalesCat.length ? totalesCat : [1],
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Dashboard Financiero</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-gray-400 font-medium mb-1">Ingresos Totales</h3>
            <p className="text-3xl font-bold text-accent">${data.total_ingresos || 0}</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-gray-400 font-medium mb-1">Gastos Totales</h3>
            <p className="text-3xl font-bold text-danger">${data.total_gastos || 0}</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-gray-400 font-medium mb-1">Balance</h3>
            <p className={`text-3xl font-bold ${data.balance >= 0 ? 'text-white' : 'text-danger'}`}>
              ${data.balance || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Resumen Mensual</h3>
            <Bar data={barData} options={chartOptions} />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Gastos por Categoría</h3>
            <div className="h-[300px] flex justify-center">
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
