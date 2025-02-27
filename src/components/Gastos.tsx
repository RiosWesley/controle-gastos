// src/components/Gastos.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartOptions,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import styles from '../styles/Gastos.module.css';
import {
  FaWallet,
  FaChartPie,
  FaFilter,
  FaFileExport,
  FaTrash,
  FaPlusCircle,
  FaMoon,
  FaSun,
  FaMoneyBillWave,
  FaPiggyBank,
  FaCalendarAlt,
  FaSearch,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

interface Gasto {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  prioridade: 'essencial' | 'naoEssencial';
}

const categorias: { [key: string]: string[] } = {
  alimentacao: ['restaurante', 'mercado', 'café', 'comida', 'delivery'],
  transporte: ['uber', 'ônibus', 'metrô', 'combustível', 'taxi', 'estacionamento'],
  compras: ['roupa', 'eletrônicos', 'livro', 'presente', 'loja'],
  lazer: ['cinema', 'show', 'parque', 'viagem', 'hotel', 'jogo'],
  saude: ['farmácia', 'médico', 'hospital', 'plano', 'consulta', 'exame'],
  educacao: ['escola', 'faculdade', 'curso', 'material', 'livro'],
  moradia: ['aluguel', 'condomínio', 'conta', 'luz', 'água', 'internet'],
  servicos: ['assinatura', 'streaming', 'academia', 'manutenção'],
  outros: [],
};

function categorizarGasto(descricao: string): string {
  const descLower = descricao.toLowerCase();
  for (const cat in categorias) {
    if (categorias[cat].some((palavra) => descLower.includes(palavra))) {
      return cat;
    }
  }
  return 'outros';
}

const Gastos: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [novoGasto, setNovoGasto] = useState('');
  const [valorGasto, setValorGasto] = useState('');
  const [dataGasto, setDataGasto] = useState(new Date().toISOString().split('T')[0]);
  const [categoriaPrevista, setCategoriaPrevista] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );
  const [metaEconomiaMensal, setMetaEconomiaMensal] = useState<number>(1000);
  const [prioridadeGasto, setPrioridadeGasto] = useState<'essencial' | 'naoEssencial'>('naoEssencial');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const initialExpenses: Gasto[] = [
      // Janeiro de 2023
      { id: 1, descricao: 'Supermercado Local', valor: 300.50, categoria: 'alimentacao', data: '2023-01-05', prioridade: 'essencial' },
      { id: 2, descricao: 'Ônibus - Transporte diário', valor: 45.00, categoria: 'transporte', data: '2023-01-10', prioridade: 'essencial' },
      { id: 3, descricao: 'Cinema com amigos', valor: 80.00, categoria: 'lazer', data: '2023-01-15', prioridade: 'naoEssencial' },
      { id: 4, descricao: 'Farmácia - Medicamentos', valor: 110.20, categoria: 'saude', data: '2023-01-20', prioridade: 'essencial' },
      { id: 5, descricao: 'Aluguel do apartamento', valor: 1200.00, categoria: 'moradia', data: '2023-01-25', prioridade: 'essencial' },
      { id: 6, descricao: 'Livro de história', valor: 50.00, categoria: 'compras', data: '2023-01-30', prioridade: 'naoEssencial' },
  
      // Fevereiro de 2023
      { id: 7, descricao: 'Mercado semanal', valor: 250.00, categoria: 'alimentacao', data: '2023-02-03', prioridade: 'essencial' },
      { id: 8, descricao: 'Uber - Viagem ao trabalho', valor: 35.00, categoria: 'transporte', data: '2023-02-08', prioridade: 'naoEssencial' },
      { id: 9, descricao: 'Show de rock', valor: 150.00, categoria: 'lazer', data: '2023-02-12', prioridade: 'naoEssencial' },
      { id: 10, descricao: 'Consulta médica', valor: 140.00, categoria: 'saude', data: '2023-02-18', prioridade: 'essencial' },
      { id: 11, descricao: 'Condomínio', valor: 380.00, categoria: 'moradia', data: '2023-02-22', prioridade: 'essencial' },
      { id: 12, descricao: 'Assinatura Spotify', valor: 39.90, categoria: 'servicos', data: '2023-02-28', prioridade: 'naoEssencial' },
  
      // Março de 2023
      { id: 13, descricao: 'Supermercado Extra', valor: 320.00, categoria: 'alimentacao', data: '2023-03-02', prioridade: 'essencial' },
      { id: 14, descricao: 'Gasolina - Posto Shell', valor: 180.00, categoria: 'transporte', data: '2023-03-07', prioridade: 'essencial' },
      { id: 15, descricao: 'Parque de diversões', valor: 200.00, categoria: 'lazer', data: '2023-03-12', prioridade: 'naoEssencial' },
      { id: 16, descricao: 'Exame laboratorial', valor: 190.00, categoria: 'saude', data: '2023-03-15', prioridade: 'essencial' },
      { id: 17, descricao: 'Conta de luz', valor: 170.50, categoria: 'moradia', data: '2023-03-20', prioridade: 'essencial' },
      { id: 18, descricao: 'Curso de inglês', valor: 280.00, categoria: 'educacao', data: '2023-03-25', prioridade: 'naoEssencial' },
  
      // Abril de 2023
      { id: 19, descricao: 'Restaurante Japonês', valor: 160.00, categoria: 'alimentacao', data: '2023-04-05', prioridade: 'naoEssencial' },
      { id: 20, descricao: 'Taxi - Emergência', valor: 40.00, categoria: 'transporte', data: '2023-04-10', prioridade: 'essencial' },
      { id: 21, descricao: 'Teatro ao vivo', valor: 120.00, categoria: 'lazer', data: '2023-04-15', prioridade: 'naoEssencial' },
      { id: 22, descricao: 'Consulta odontológica', valor: 150.00, categoria: 'saude', data: '2023-04-20', prioridade: 'essencial' },
      { id: 23, descricao: 'Internet mensal', valor: 140.00, categoria: 'moradia', data: '2023-04-25', prioridade: 'essencial' },
      { id: 24, descricao: 'Roupas novas', valor: 200.00, categoria: 'compras', data: '2023-04-30', prioridade: 'naoEssencial' },
  
      // Maio de 2023
      { id: 25, descricao: 'Café da manhã', valor: 20.00, categoria: 'alimentacao', data: '2023-05-05', prioridade: 'naoEssencial' },
      { id: 26, descricao: 'Metrô - Transporte diário', valor: 60.00, categoria: 'transporte', data: '2023-05-10', prioridade: 'essencial' },
      { id: 27, descricao: 'Viagem de fim de semana', valor: 350.00, categoria: 'lazer', data: '2023-05-15', prioridade: 'naoEssencial' },
      { id: 28, descricao: 'Plano de saúde anual', valor: 300.00, categoria: 'saude', data: '2023-05-20', prioridade: 'essencial' },
      { id: 29, descricao: 'Água mensal', valor: 90.00, categoria: 'moradia', data: '2023-05-25', prioridade: 'essencial' },
      { id: 30, descricao: 'Academia mensal', valor: 100.00, categoria: 'servicos', data: '2023-05-31', prioridade: 'naoEssencial' },
  
      // Junho de 2023
      { id: 31, descricao: 'Mercado mensal', valor: 270.00, categoria: 'alimentacao', data: '2023-06-02', prioridade: 'essencial' },
      { id: 32, descricao: 'Uber - Trabalho', valor: 30.00, categoria: 'transporte', data: '2023-06-05', prioridade: 'naoEssencial' },
      { id: 33, descricao: 'Festival de música', valor: 180.00, categoria: 'lazer', data: '2023-06-10', prioridade: 'naoEssencial' },
      { id: 34, descricao: 'Vacina anual', valor: 120.00, categoria: 'saude', data: '2023-06-15', prioridade: 'essencial' },
      { id: 35, descricao: 'Manutenção elétrica', valor: 450.00, categoria: 'moradia', data: '2023-06-20', prioridade: 'essencial' },
      { id: 36, descricao: 'Material escolar', valor: 130.00, categoria: 'educacao', data: '2023-06-25', prioridade: 'naoEssencial' },
  
      // Julho de 2023
      { id: 37, descricao: 'Supermercado Pão de Açúcar', valor: 310.00, categoria: 'alimentacao', data: '2023-07-03', prioridade: 'essencial' },
      { id: 38, descricao: 'Ônibus - Trabalho', valor: 55.00, categoria: 'transporte', data: '2023-07-08', prioridade: 'essencial' },
      { id: 39, descricao: 'Parque aquático', valor: 150.00, categoria: 'lazer', data: '2023-07-12', prioridade: 'naoEssencial' },
      { id: 40, descricao: 'Remédios genéricos', valor: 90.00, categoria: 'saude', data: '2023-07-18', prioridade: 'essencial' },
      { id: 41, descricao: 'Conta de gás', valor: 120.00, categoria: 'moradia', data: '2023-07-22', prioridade: 'essencial' },
      { id: 42, descricao: 'Eletrônicos - Fone', valor: 150.00, categoria: 'compras', data: '2023-07-28', prioridade: 'naoEssencial' },
  
      // Agosto de 2023
      { id: 43, descricao: 'Mercado semanal', valor: 260.00, categoria: 'alimentacao', data: '2023-08-02', prioridade: 'essencial' },
      { id: 44, descricao: 'Taxi - Viagem', valor: 50.00, categoria: 'transporte', data: '2023-08-07', prioridade: 'essencial' },
      { id: 45, descricao: 'Cinema 4D', valor: 100.00, categoria: 'lazer', data: '2023-08-12', prioridade: 'naoEssencial' },
      { id: 46, descricao: 'Consulta psicológica', valor: 200.00, categoria: 'saude', data: '2023-08-15', prioridade: 'essencial' },
      { id: 47, descricao: 'Condomínio extra', valor: 420.00, categoria: 'moradia', data: '2023-08-20', prioridade: 'essencial' },
      { id: 48, descricao: 'Curso de marketing', valor: 300.00, categoria: 'educacao', data: '2023-08-25', prioridade: 'naoEssencial' },
  
      // Setembro de 2023
      { id: 49, descricao: 'Restaurante Italiano', valor: 170.00, categoria: 'alimentacao', data: '2023-09-05', prioridade: 'naoEssencial' },
      { id: 50, descricao: 'Gasolina mensal', valor: 190.00, categoria: 'transporte', data: '2023-09-10', prioridade: 'essencial' },
      { id: 51, descricao: 'Show de jazz', valor: 130.00, categoria: 'lazer', data: '2023-09-15', prioridade: 'naoEssencial' },
      { id: 52, descricao: 'Exame de rotina', valor: 180.00, categoria: 'saude', data: '2023-09-20', prioridade: 'essencial' },
      { id: 53, descricao: 'Internet rápida', valor: 160.00, categoria: 'moradia', data: '2023-09-25', prioridade: 'essencial' },
      { id: 54, descricao: 'Presente de aniversário', valor: 80.00, categoria: 'compras', data: '2023-09-30', prioridade: 'naoEssencial' },
  
      // Outubro de 2023
      { id: 55, descricao: 'Supermercado Carrefour', valor: 290.00, categoria: 'alimentacao', data: '2023-10-03', prioridade: 'essencial' },
      { id: 56, descricao: 'Metrô - Transporte', valor: 70.00, categoria: 'transporte', data: '2023-10-08', prioridade: 'essencial' },
      { id: 57, descricao: 'Viagem local', valor: 250.00, categoria: 'lazer', data: '2023-10-12', prioridade: 'naoEssencial' },
      { id: 58, descricao: 'Vacina gripal', valor: 100.00, categoria: 'saude', data: '2023-10-18', prioridade: 'essencial' },
      { id: 59, descricao: 'Conta de luz', valor: 180.00, categoria: 'moradia', data: '2023-10-22', prioridade: 'essencial' },
      { id: 60, descricao: 'Roupas de inverno', valor: 220.00, categoria: 'compras', data: '2023-10-27', prioridade: 'naoEssencial' },
  
      // Novembro de 2023
      { id: 61, descricao: 'Mercado mensal', valor: 280.00, categoria: 'alimentacao', data: '2023-11-02', prioridade: 'essencial' },
      { id: 62, descricao: 'Uber - Trabalho', valor: 40.00, categoria: 'transporte', data: '2023-11-07', prioridade: 'naoEssencial' },
      { id: 63, descricao: 'Festival cultural', valor: 170.00, categoria: 'lazer', data: '2023-11-12', prioridade: 'naoEssencial' },
      { id: 64, descricao: 'Consulta médica', valor: 160.00, categoria: 'saude', data: '2023-11-15', prioridade: 'essencial' },
      { id: 65, descricao: 'Condomínio', valor: 400.00, categoria: 'moradia', data: '2023-11-20', prioridade: 'essencial' },
      { id: 66, descricao: 'Assinatura Netflix', valor: 39.90, categoria: 'servicos', data: '2023-11-25', prioridade: 'naoEssencial' },
  
      // Dezembro de 2023
      { id: 67, descricao: 'Supermercado Natalino', valor: 350.00, categoria: 'alimentacao', data: '2023-12-05', prioridade: 'essencial' },
      { id: 68, descricao: 'Taxi - Festas', valor: 60.00, categoria: 'transporte', data: '2023-12-10', prioridade: 'essencial' },
      { id: 69, descricao: 'Reveillon em clube', valor: 300.00, categoria: 'lazer', data: '2023-12-15', prioridade: 'naoEssencial' },
      { id: 70, descricao: 'Exame de sangue', valor: 200.00, categoria: 'saude', data: '2023-12-20', prioridade: 'essencial' },
      { id: 71, descricao: 'Aluguel final de ano', valor: 1300.00, categoria: 'moradia', data: '2023-12-25', prioridade: 'essencial' },
      { id: 72, descricao: 'Presentes de Natal', valor: 250.00, categoria: 'compras', data: '2023-12-28', prioridade: 'naoEssencial' },
  
      // Janeiro de 2024
      { id: 73, descricao: 'Supermercado Extra', valor: 325.80, categoria: 'alimentacao', data: '2024-01-04', prioridade: 'essencial' },
      { id: 74, descricao: 'Uber - Viagem ao centro', valor: 32.50, categoria: 'transporte', data: '2024-01-05', prioridade: 'naoEssencial' },
      { id: 75, descricao: 'Cinema com amigos', valor: 75.00, categoria: 'lazer', data: '2024-01-06', prioridade: 'naoEssencial' },
      { id: 76, descricao: 'Farmácia - Remédios', valor: 120.30, categoria: 'saude', data: '2024-01-09', prioridade: 'essencial' },
      { id: 77, descricao: 'Aluguel do apartamento', valor: 1200.00, categoria: 'moradia', data: '2024-01-15', prioridade: 'essencial' },
      { id: 78, descricao: 'Compra online - Livro', valor: 45.90, categoria: 'compras', data: '2024-01-20', prioridade: 'naoEssencial' },
  
      // Fevereiro de 2024
      { id: 79, descricao: 'Mercado do mês', valor: 450.00, categoria: 'alimentacao', data: '2024-02-02', prioridade: 'essencial' },
      { id: 80, descricao: 'Uber - Volta para casa', valor: 28.00, categoria: 'transporte', data: '2024-02-03', prioridade: 'naoEssencial' },
      { id: 81, descricao: 'Show de música', valor: 200.00, categoria: 'lazer', data: '2024-02-10', prioridade: 'naoEssencial' },
      { id: 82, descricao: 'Consulta médica', valor: 150.00, categoria: 'saude', data: '2024-02-12', prioridade: 'essencial' },
      { id: 83, descricao: 'Condomínio', valor: 400.00, categoria: 'moradia', data: '2024-02-20', prioridade: 'essencial' },
      { id: 84, descricao: 'Curso online de Inglês', valor: 250.00, categoria: 'educacao', data: '2024-02-25', prioridade: 'naoEssencial' },
  
      // Março de 2024
      { id: 85, descricao: 'Supermercado ', valor: 280.00, categoria: 'alimentacao', data: '2024-03-03', prioridade: 'essencial' },
      { id: 86, descricao: 'Uber - Ida ao trabalho', valor: 22.00, categoria: 'transporte', data: '2024-03-05', prioridade: 'naoEssencial' },
      { id: 87, descricao: 'Parque de diversões', valor: 180.00, categoria: 'lazer', data: '2024-03-10', prioridade: 'naoEssencial' },
      { id: 88, descricao: 'Remédio para dor', valor: 35.00, categoria: 'saude', data: '2024-03-15', prioridade: 'essencial' },
      { id: 89, descricao: 'Conta de luz', valor: 185.50, categoria: 'moradia', data: '2024-03-20', prioridade: 'essencial' },
      { id: 90, descricao: 'Material escolar', valor: 120.00, categoria: 'educacao', data: '2024-03-25', prioridade: 'naoEssencial' },
  
      // Abril de 2024
      { id: 91, descricao: 'Restaurante Italiano', valor: 180.00, categoria: 'alimentacao', data: '2024-04-05', prioridade: 'naoEssencial' },
      { id: 92, descricao: 'Ônibus - Transporte diário', valor: 50.00, categoria: 'transporte', data: '2024-04-10', prioridade: 'essencial' },
      { id: 93, descricao: 'Cinema 3D', valor: 90.00, categoria: 'lazer', data: '2024-04-15', prioridade: 'naoEssencial' },
      { id: 94, descricao: 'Exame de sangue', valor: 200.00, categoria: 'saude', data: '2024-04-20', prioridade: 'essencial' },
      { id: 95, descricao: 'Internet mensal', valor: 150.00, categoria: 'moradia', data: '2024-04-25', prioridade: 'essencial' },
      { id: 96, descricao: 'Livro de programação', valor: 60.00, categoria: 'compras', data: '2024-04-30', prioridade: 'naoEssencial' },
  
      // Maio de 2024
      { id: 97, descricao: 'Café da manhã na padaria', valor: 15.00, categoria: 'alimentacao', data: '2024-05-05', prioridade: 'naoEssencial' },
      { id: 98, descricao: 'Gasolina - Posto Shell', valor: 200.00, categoria: 'transporte', data: '2024-05-10', prioridade: 'essencial' },
      { id: 99, descricao: 'Viagem de fim de semana', valor: 300.00, categoria: 'lazer', data: '2024-05-15', prioridade: 'naoEssencial' },
      { id: 100, descricao: 'Plano de saúde', valor: 300.00, categoria: 'saude', data: '2024-05-20', prioridade: 'essencial' },
      { id: 101, descricao: 'Água mensal', valor: 100.00, categoria: 'moradia', data: '2024-05-25', prioridade: 'essencial' },
      { id: 102, descricao: 'Spotify - Assinatura', valor: 19.90, categoria: 'servicos', data: '2024-05-30', prioridade: 'naoEssencial' },
  
      // Junho de 2024
      { id: 103, descricao: 'Mercado semanal', valor: 200.00, categoria: 'alimentacao', data: '2024-06-02', prioridade: 'essencial' },
      { id: 104, descricao: 'Taxi - Emergência', valor: 45.00, categoria: 'transporte', data: '2024-06-05', prioridade: 'essencial' },
      { id: 105, descricao: 'Teatro ao vivo', valor: 150.00, categoria: 'lazer', data: '2024-06-10', prioridade: 'naoEssencial' },
      { id: 106, descricao: 'Consulta odontológica', valor: 180.00, categoria: 'saude', data: '2024-06-15', prioridade: 'essencial' },
      { id: 107, descricao: 'Manutenção do apartamento', valor: 500.00, categoria: 'moradia', data: '2024-06-20', prioridade: 'essencial' },
      { id: 108, descricao: 'Curso de design', valor: 300.00, categoria: 'educacao', data: '2024-06-25', prioridade: 'naoEssencial' },
  
      // Julho de 2024
      { id: 109, descricao: 'Supermercado Pão de Açúcar', valor: 310.00, categoria: 'alimentacao', data: '2024-07-03', prioridade: 'essencial' },
      { id: 110, descricao: 'Ônibus - Trabalho', valor: 55.00, categoria: 'transporte', data: '2024-07-08', prioridade: 'essencial' },
      { id: 111, descricao: 'Parque aquático', valor: 150.00, categoria: 'lazer', data: '2024-07-12', prioridade: 'naoEssencial' },
      { id: 112, descricao: 'Remédios genéricos', valor: 90.00, categoria: 'saude', data: '2024-07-18', prioridade: 'essencial' },
      { id: 113, descricao: 'Conta de gás', valor: 120.00, categoria: 'moradia', data: '2024-07-22', prioridade: 'essencial' },
      { id: 114, descricao: 'Eletrônicos - Fone', valor: 150.00, categoria: 'compras', data: '2024-07-28', prioridade: 'naoEssencial' },
  
      // Agosto de 2024
      { id: 115, descricao: 'Mercado semanal', valor: 260.00, categoria: 'alimentacao', data: '2024-08-02', prioridade: 'essencial' },
      { id: 116, descricao: 'Taxi - Viagem', valor: 50.00, categoria: 'transporte', data: '2024-08-07', prioridade: 'essencial' },
      { id: 117, descricao: 'Cinema 4D', valor: 100.00, categoria: 'lazer', data: '2024-08-12', prioridade: 'naoEssencial' },
      { id: 118, descricao: 'Consulta psicológica', valor: 200.00, categoria: 'saude', data: '2024-08-15', prioridade: 'essencial' },
      { id: 119, descricao: 'Condomínio extra', valor: 420.00, categoria: 'moradia', data: '2024-08-20', prioridade: 'essencial' },
      { id: 120, descricao: 'Curso de marketing', valor: 300.00, categoria: 'educacao', data: '2024-08-25', prioridade: 'naoEssencial' },
  
      // Setembro de 2024
      { id: 121, descricao: 'Restaurante Italiano', valor: 170.00, categoria: 'alimentacao', data: '2024-09-05', prioridade: 'naoEssencial' },
      { id: 122, descricao: 'Gasolina mensal', valor: 190.00, categoria: 'transporte', data: '2024-09-10', prioridade: 'essencial' },
      { id: 123, descricao: 'Show de jazz', valor: 130.00, categoria: 'lazer', data: '2024-09-15', prioridade: 'naoEssencial' },
      { id: 124, descricao: 'Exame de rotina', valor: 180.00, categoria: 'saude', data: '2024-09-20', prioridade: 'essencial' },
      { id: 125, descricao: 'Internet rápida', valor: 160.00, categoria: 'moradia', data: '2024-09-25', prioridade: 'essencial' },
      { id: 126, descricao: 'Presente de aniversário', valor: 80.00, categoria: 'compras', data: '2024-09-30', prioridade: 'naoEssencial' },
  
      // Outubro de 2024
      { id: 127, descricao: 'Supermercado Carrefour', valor: 290.00, categoria: 'alimentacao', data: '2024-10-03', prioridade: 'essencial' },
      { id: 128, descricao: 'Metrô - Transporte', valor: 70.00, categoria: 'transporte', data: '2024-10-08', prioridade: 'essencial' },
      { id: 129, descricao: 'Viagem local', valor: 250.00, categoria: 'lazer', data: '2024-10-12', prioridade: 'naoEssencial' },
      { id: 130, descricao: 'Vacina gripal', valor: 100.00, categoria: 'saude', data: '2024-10-18', prioridade: 'essencial' },
      { id: 131, descricao: 'Conta de luz', valor: 180.00, categoria: 'moradia', data: '2024-10-22', prioridade: 'essencial' },
      { id: 132, descricao: 'Roupas de inverno', valor: 220.00, categoria: 'compras', data: '2024-10-27', prioridade: 'naoEssencial' },
  
      // Novembro de 2024
      { id: 133, descricao: 'Mercado mensal', valor: 280.00, categoria: 'alimentacao', data: '2024-11-02', prioridade: 'essencial' },
      { id: 134, descricao: 'Uber - Trabalho', valor: 40.00, categoria: 'transporte', data: '2024-11-07', prioridade: 'naoEssencial' },
      { id: 135, descricao: 'Festival cultural', valor: 170.00, categoria: 'lazer', data: '2024-11-12', prioridade: 'naoEssencial' },
      { id: 136, descricao: 'Consulta médica', valor: 160.00, categoria: 'saude', data: '2024-11-15', prioridade: 'essencial' },
      { id: 137, descricao: 'Condomínio', valor: 400.00, categoria: 'moradia', data: '2024-11-20', prioridade: 'essencial' },
      { id: 138, descricao: 'Assinatura Netflix', valor: 39.90, categoria: 'servicos', data: '2024-11-25', prioridade: 'naoEssencial' },
  
      // Dezembro de 2024
      { id: 139, descricao: 'Supermercado Natalino', valor: 350.00, categoria: 'alimentacao', data: '2024-12-05', prioridade: 'essencial' },
      { id: 140, descricao: 'Taxi - Festas', valor: 60.00, categoria: 'transporte', data: '2024-12-10', prioridade: 'essencial' },
      { id: 141, descricao: 'Reveillon em clube', valor: 300.00, categoria: 'lazer', data: '2024-12-15', prioridade: 'naoEssencial' },
      { id: 142, descricao: 'Exame de sangue', valor: 200.00, categoria: 'saude', data: '2024-12-20', prioridade: 'essencial' },
      { id: 143, descricao: 'Aluguel final de ano', valor: 1300.00, categoria: 'moradia', data: '2024-12-25', prioridade: 'essencial' },
      { id: 144, descricao: 'Presentes de Natal', valor: 250.00, categoria: 'compras', data: '2024-12-28', prioridade: 'naoEssencial' },
  
      // Janeiro de 2025
      { id: 145, descricao: 'Supermercado Extra', valor: 330.00, categoria: 'alimentacao', data: '2025-01-05', prioridade: 'essencial' },
      { id: 146, descricao: 'Uber - Centro', valor: 35.00, categoria: 'transporte', data: '2025-01-10', prioridade: 'naoEssencial' },
      { id: 147, descricao: 'Cinema 3D', valor: 85.00, categoria: 'lazer', data: '2025-01-15', prioridade: 'naoEssencial' },
      { id: 148, descricao: 'Farmácia - Remédios', valor: 115.00, categoria: 'saude', data: '2025-01-20', prioridade: 'essencial' },
      { id: 149, descricao: 'Aluguel', valor: 1250.00, categoria: 'moradia', data: '2025-01-25', prioridade: 'essencial' },
      { id: 150, descricao: 'Livro técnico', valor: 55.00, categoria: 'compras', data: '2025-01-30', prioridade: 'naoEssencial' },
  
      // Fevereiro de 2025 (até 27/02/2025)
      { id: 151, descricao: 'Mercado semanal', valor: 240.00, categoria: 'alimentacao', data: '2025-02-03', prioridade: 'essencial' },
      { id: 152, descricao: 'Ônibus - Trabalho', valor: 50.00, categoria: 'transporte', data: '2025-02-10', prioridade: 'essencial' },
      { id: 153, descricao: 'Show local', valor: 120.00, categoria: 'lazer', data: '2025-02-15', prioridade: 'naoEssencial' },
      { id: 154, descricao: 'Consulta médica', valor: 145.00, categoria: 'saude', data: '2025-02-20', prioridade: 'essencial' },
      { id: 155, descricao: 'Condomínio', valor: 410.00, categoria: 'moradia', data: '2025-02-25', prioridade: 'essencial' },
    ];
    setGastos(initialExpenses);
  }, []);

  useEffect(() => {
    setCategoriaPrevista(novoGasto.trim() ? categorizarGasto(novoGasto) : '');
  }, [novoGasto]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('darkMode', String(isDarkMode));
    }
  }, [isDarkMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'descricaoGasto') setNovoGasto(value);
    if (name === 'valorGasto') setValorGasto(value);
    if (name === 'dataGasto') setDataGasto(value);
  };

  const adicionarGasto = () => {
    if (!novoGasto.trim() || !valorGasto.trim() || !dataGasto) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const valor = parseFloat(valorGasto.replace(',', '.'));
      if (isNaN(valor)) {
        toast.error('Valor inválido!');
        setLoading(false);
        return;
      }

      const novo: Gasto = {
        id: Date.now(),
        descricao: novoGasto,
        valor,
        categoria: categorizarGasto(novoGasto),
        data: dataGasto,
        prioridade: prioridadeGasto,
      };

      setGastos([...gastos, novo]);
      setNovoGasto('');
      setValorGasto('');
      setDataGasto(new Date().toISOString().split('T')[0]);
      setLoading(false);
      setIsModalOpen(false);
      toast.success('Gasto adicionado com sucesso!');
    }, 750);
  };

  const removerGasto = (id: number) => {
    setGastos(gastos.filter((gasto) => gasto.id !== id));
    toast.info('Gasto removido!');
  };

  const exportarCSV = () => {
    const csv = [
      'ID,Descrição,Valor,Categoria,Data,Prioridade',
      ...gastos.map((g) => `${g.id},"${g.descricao}",${g.valor},${g.categoria},${g.data},${g.prioridade}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gastos.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const gastosFiltrados = useMemo(() => {
    let filtered = gastos.filter((gasto) => {
      if (filtroCategoria !== 'todas' && gasto.categoria !== filtroCategoria) return false;
      if (filtroPeriodo === 'todos') return true;

      const hoje = new Date();
      const dataGasto = new Date(gasto.data);

      switch (filtroPeriodo) {
        case 'esteMes':
          return dataGasto.getMonth() === hoje.getMonth() && dataGasto.getFullYear() === hoje.getFullYear();
        case 'mesPassado':
          const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
          const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
          return dataGasto >= mesPassado && dataGasto <= ultimoDiaMesPassado;
        case 'doisMesesAtras':
          const doisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
          const ultimoDiaDoisMeses = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 0);
          return dataGasto >= doisMesesAtras && dataGasto <= ultimoDiaDoisMeses;
        case 'tresMesesAtras':
          const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
          const ultimoDiaTresMeses = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 0);
          return dataGasto >= tresMesesAtras && dataGasto <= ultimoDiaTresMeses;
        default:
          return true;
      }
    });

    if (searchTerm) {
      filtered = filtered.filter((g) => g.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  }, [gastos, filtroCategoria, filtroPeriodo, searchTerm]);

  const paginatedGastos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return gastosFiltrados.slice(start, end);
  }, [gastosFiltrados, currentPage]);

  const totalPages = Math.ceil(gastosFiltrados.length / itemsPerPage);

  const coresCategorias: { [key: string]: string } = {
    alimentacao: '#F4A261',
    transporte: '#5C80BC',
    compras: '#95C623',
    lazer: '#E76F51',
    saude: '#74C69D',
    educacao: '#A37A74',
    moradia: '#9D6B9A',
    servicos: '#2A9D8F',
    outros: '#E63946',
  };

  const dadosGraficoPizza = useMemo(() => ({
    labels: Object.keys(coresCategorias),
    datasets: [
      {
        data: Object.keys(coresCategorias).map((categoria) =>
          gastosFiltrados.filter((gasto) => gasto.categoria === categoria).reduce((total, gasto) => total + gasto.valor, 0)
        ),
        backgroundColor: Object.values(coresCategorias),
        hoverOffset: 10,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
      },
    ],
  }), [gastosFiltrados]);

  const dadosGraficoBarras = useMemo(() => ({
    labels: gastosFiltrados.map((gasto) => gasto.data),
    datasets: [
      {
        label: 'Gastos Diários',
        data: gastosFiltrados.map((gasto) => gasto.valor),
        backgroundColor: 'rgba(42, 157, 143, 0.7)',
        borderColor: '#2A9D8F',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#2A9D8F',
      },
    ],
  }), [gastosFiltrados]);

  const dadosGraficoTendencia = useMemo(() => {
    const totaisMensais: { [key: string]: number } = {};
    gastos.forEach((gasto) => {
      const mesAno = gasto.data.substring(0, 7);
      totaisMensais[mesAno] = (totaisMensais[mesAno] || 0) + gasto.valor;
    });

    return {
      labels: Object.keys(totaisMensais),
      datasets: [
        {
          label: 'Gastos Mensais',
          data: Object.values(totaisMensais),
          fill: false,
          borderColor: '#2A9D8F',
          backgroundColor: 'rgba(42, 157, 143, 0.2)',
          tension: 0.4,
        },
      ],
    };
  }, [gastos]);

  const optionsGraficoPizza: ChartOptions<'pie'> = {
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: R$ ${ctx.parsed.toFixed(2)}` } },
    },
  };

  const optionsGraficoBarras: ChartOptions<'bar'> = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const optionsGraficoTendencia: ChartOptions<'line'> = {
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Valor (R$)' } },
      x: { title: { display: true, text: 'Mês' } },
    },
  };

  const totalGastoEsteMes = useMemo(() => gastosFiltrados.reduce((soma, gasto) => soma + gasto.valor, 0).toFixed(2), [gastosFiltrados]);
  const categoriaMaisGastadora = useMemo(() => {
    const gastosPorCategoria: { [key: string]: number } = {};
    gastosFiltrados.forEach((gasto) => (gastosPorCategoria[gasto.categoria] = (gastosPorCategoria[gasto.categoria] || 0) + gasto.valor));
    let maxCategoria = '';
    let maxValor = 0;
    for (const cat in gastosPorCategoria) {
      if (gastosPorCategoria[cat] > maxValor) {
        maxValor = gastosPorCategoria[cat];
        maxCategoria = cat;
      }
    }
    return maxCategoria || 'Nenhuma';
  }, [gastosFiltrados]);
  const mediaGastoDiario = useMemo(() => (parseFloat(totalGastoEsteMes) / 30).toFixed(2), [totalGastoEsteMes]);
  const economiaPotencial = useMemo(() => (metaEconomiaMensal - parseFloat(totalGastoEsteMes)).toFixed(2), [metaEconomiaMensal, totalGastoEsteMes]);
  const alertaGastoExcessivo = parseFloat(totalGastoEsteMes) > metaEconomiaMensal;

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`${styles.container} ${isDarkMode ? styles['dark-mode'] : ''}`}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <FaWallet className={styles.icon} />
          <h1 className={styles.title}>Finanças em Foco</h1>
        </div>
        <div className={styles.headerRight}>
          <motion.button
            onClick={exportarCSV}
            className={styles.exportButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFileExport /> Exportar
          </motion.button>
          <button onClick={toggleDarkMode} className={styles.darkModeToggle}>
            {isDarkMode ? <FaSun className={styles.darkModeIcon} /> : <FaMoon className={styles.darkModeIcon} />}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.summary}>
            <motion.div className={styles.summaryCard} whileHover={{ scale: 1.05 }}>
              <FaMoneyBillWave className={styles.summaryIcon} />
              <h3>Total Gasto Este Mês</h3>
              <p className={styles.summaryValue}>R$ {totalGastoEsteMes}</p>
            </motion.div>
            <motion.div className={styles.summaryCard} whileHover={{ scale: 1.05 }}>
              <FaPiggyBank className={styles.summaryIcon} />
              <h3>Categoria Mais Gastadora</h3>
              <p className={styles.summaryValue}>{categoriaMaisGastadora}</p>
            </motion.div>
            <motion.div className={styles.summaryCard} whileHover={{ scale: 1.05 }}>
              <FaCalendarAlt className={styles.summaryIcon} />
              <h3>Média de Gasto Diário</h3>
              <p className={styles.summaryValue}>R$ {mediaGastoDiario}</p>
            </motion.div>
            <motion.div className={styles.summaryCard} whileHover={{ scale: 1.05 }}>
              <FaPiggyBank className={styles.summaryIcon} />
              <h3>Meta de Economia</h3>
              <input
                type="number"
                className={styles.metaInput}
                value={metaEconomiaMensal}
                onChange={(e) => setMetaEconomiaMensal(Number(e.target.value))}
              />
              <p className={styles.summarySubValue}>Economia Potencial: R$ {economiaPotencial}</p>
            </motion.div>
            {alertaGastoExcessivo && (
              <motion.div
                className={styles.alertCard}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FaExclamationTriangle /> Atenção: Gastos acima da meta!
              </motion.div>
            )}
          </section>

          <section className={styles.actions}>
            <motion.button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlusCircle className={styles.addIcon} /> Adicionar Gasto
            </motion.button>
          </section>

          <section className={styles.search}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquisar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </section>

          <section className={styles.filters}>
            <h2 className={styles.sectionTitle}>Filtros</h2>
            <div className={styles.filterContainer}>
              <label htmlFor="filtroCategoria" className={styles.filterLabel}>
                <FaFilter className={styles.filterIcon} /> Categoria:
              </label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={styles.selectInput}
              >
                <option value="todas">Todas</option>
                {Object.keys(categorias).map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              <label htmlFor="filtroPeriodo" className={styles.filterLabel}>
                <FaFilter className={styles.filterIcon} /> Período:
              </label>
              <select
                id="filtroPeriodo"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className={styles.selectInput}
              >
                <option value="todos">Todos</option>
                <option value="esteMes">Este Mês</option>
                <option value="mesPassado">Mês Passado</option>
                <option value="doisMesesAtras">Dois Meses Atrás</option>
                <option value="tresMesesAtras">Três Meses Atrás</option>
              </select>
            </div>
          </section>

          <section className={styles.charts}>
            <h2 className={styles.sectionTitle}>Análise Visual</h2>
            <div className={styles.chartContainer}>
              <motion.div className={styles.pieChart} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Pie data={dadosGraficoPizza} options={optionsGraficoPizza} />
              </motion.div>
              <motion.div className={styles.barChart} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Bar data={dadosGraficoBarras} options={optionsGraficoBarras} />
              </motion.div>
              <motion.div className={styles.lineChart} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Line data={dadosGraficoTendencia} options={optionsGraficoTendencia} />
              </motion.div>
            </div>
          </section>

          <section className={styles.recentExpenses}>
            <h2 className={styles.sectionTitle}>Gastos Recentes</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Prioridade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGastos.map((gasto) => (
                    <motion.tr
                      key={gasto.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <td>{gasto.descricao}</td>
                      <td>R$ {gasto.valor.toFixed(2)}</td>
                      <td style={{ color: coresCategorias[gasto.categoria] }}>{gasto.categoria}</td>
                      <td>{new Date(gasto.data).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <span
                          className={
                            gasto.prioridade === 'essencial'
                              ? styles.prioridadeEssencial
                              : styles.prioridadeNaoEssencial
                          }
                        >
                          {gasto.prioridade === 'essencial' ? 'Essencial' : 'Não Essencial'}
                        </span>
                      </td>
                      <td>
                        <motion.button
                          onClick={() => removerGasto(gasto.id)}
                          className={styles.deleteButton}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTrash className={styles.deleteIcon} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Próxima
              </button>
            </div>
          </section>
        </div>
      </main>

      {isModalOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <h2 className={styles.modalTitle}>Adicionar Novo Gasto</h2>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Descrição do gasto"
                value={novoGasto}
                name="descricaoGasto"
                onChange={handleInputChange}
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="Valor (ex: 65,00)"
                value={valorGasto}
                name="valorGasto"
                onChange={handleInputChange}
                className={styles.inputField}
              />
              <input
                type="date"
                value={dataGasto}
                name="dataGasto"
                onChange={handleInputChange}
                className={styles.inputField}
              />
              <select
                value={prioridadeGasto}
                onChange={(e) => setPrioridadeGasto(e.target.value as 'essencial' | 'naoEssencial')}
                className={styles.selectInput}
              >
                <option value="essencial">Essencial</option>
                <option value="naoEssencial">Não Essencial</option>
              </select>
            </div>
            {categoriaPrevista && (
              <div className={styles.categoriaPrevista}>Categoria Sugerida: {categoriaPrevista}</div>
            )}
            <div className={styles.modalButtons}>
              <motion.button
                onClick={adicionarGasto}
                className={styles.modalAddButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? <div className={styles.spinner}></div> : 'Adicionar'}
              </motion.button>
              <button onClick={() => setIsModalOpen(false)} className={styles.modalCancelButton}>
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Finanças em Foco. Todos os direitos reservados.</p>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Gastos;