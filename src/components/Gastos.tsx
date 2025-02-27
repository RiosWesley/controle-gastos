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
  Title,
  ChartOptions,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import styles from '../styles/Gastos.module.css';
import {
  FaWallet,
  FaChartPie,
  FaFilter,
  FaFileAlt,
  FaTrash,
  FaPlusCircle,
  FaMoon,
  FaSun,
  FaMoneyBillWave,
  FaPiggyBank,
  FaCalendarAlt,
} from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
  const [categoriaPrevista, setCategoriaPrevista] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );
  const [metaEconomiaMensal, setMetaEconomiaMensal] = useState<number>(1000);
  const [prioridadeGasto, setPrioridadeGasto] = useState<'essencial' | 'naoEssencial'>('naoEssencial');
  const [mediaGastosMensal, setMediaGastosMensal] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar a sidebar
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initialExpenses: Gasto[] = [
      { id: 1, descricao: 'Supermercado Extra', valor: 325.80, categoria: 'alimentacao', data: '2024-01-04', prioridade: 'essencial' },
      { id: 2, descricao: 'Uber - Viagem ao centro', valor: 32.50, categoria: 'transporte', data: '2024-01-05', prioridade: 'naoEssencial' },
      { id: 3, descricao: 'Cinema com amigos', valor: 75.00, categoria: 'lazer', data: '2024-01-06', prioridade: 'naoEssencial' },
      { id: 4, descricao: 'Farmácia - Remédios', valor: 120.30, categoria: 'saude', data: '2024-01-09', prioridade: 'essencial' },
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

  useEffect(() => {
    calcularMediaGastosMensal();
  }, [gastos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'descricaoGasto') setNovoGasto(value);
    if (name === 'valorGasto') setValorGasto(value);
  };

  const adicionarGasto = () => {
    if (!novoGasto.trim() || !valorGasto.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const valor = parseFloat(valorGasto.replace(',', '.'));
      if (isNaN(valor)) {
        setLoading(false);
        return;
      }

      const novo: Gasto = {
        id: Date.now(),
        descricao: novoGasto,
        valor,
        categoria: categorizarGasto(novoGasto),
        data: new Date().toISOString().split('T')[0],
        prioridade: prioridadeGasto,
      };

      setGastos([...gastos, novo]);
      setNovoGasto('');
      setValorGasto('');
      setLoading(false);
      setIsModalOpen(false);
    }, 750);
  };

  const removerGasto = (id: number) => {
    setGastos(gastos.filter((gasto) => gasto.id !== id));
  };

  const gastosFiltrados = useMemo(() => {
    return gastos.filter((gasto) => {
      if (filtroCategoria !== 'todas' && gasto.categoria !== filtroCategoria) return false;
      if (filtroPeriodo === 'todos') return true;

      const hoje = new Date();
      const dataGasto = new Date(gasto.data);

      if (filtroPeriodo === 'esteMes') {
        return dataGasto.getMonth() === hoje.getMonth() && dataGasto.getFullYear() === hoje.getFullYear();
      }
      if (filtroPeriodo === 'mesPassado') {
        const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        return dataGasto >= mesPassado && dataGasto <= ultimoDiaMesPassado;
      }
      return true;
    });
  }, [gastos, filtroCategoria, filtroPeriodo]);

  const calcularMediaGastosMensal = () => {
    if (gastos.length === 0) {
      setMediaGastosMensal(0);
      return;
    }

    const totaisMensais: { [key: string]: number } = {};
    gastos.forEach((gasto) => {
      const mesAno = gasto.data.substring(0, 7);
      totaisMensais[mesAno] = (totaisMensais[mesAno] || 0) + gasto.valor;
    });

    const meses = Object.keys(totaisMensais).length;
    const somaTotais = Object.values(totaisMensais).reduce((soma, valor) => soma + valor, 0);
    setMediaGastosMensal(parseFloat((somaTotais / meses).toFixed(2)));
  };

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

  const optionsGraficoPizza: ChartOptions<'pie'> = {
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(26, 32, 44, 0.9)',
        borderRadius: 8,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDarkMode ? '#E2E8F0' : '#1F2A44',
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
    animation: { animateRotate: true, animateScale: true },
  };

  const optionsGraficoBarras: ChartOptions<'bar'> = {
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(26, 32, 44, 0.9)',
        borderRadius: 8,
        callbacks: {
          label: (context: any) => `${context.dataset.label || ''}: R$ ${context.parsed.y.toFixed(2)}`,
        },
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: isDarkMode ? '#A0AEC0' : '#64748B', font: { size: 12 } },
        grid: { color: isDarkMode ? 'rgba(160, 174, 192, 0.1)' : 'rgba(100, 116, 139, 0.1)' },
      },
      x: { ticks: { color: isDarkMode ? '#A0AEC0' : '#64748B', font: { size: 12 } } },
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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev); // Simplificado para garantir toggle correto

  return (
    <div className={`${styles.container} ${isDarkMode ? styles['dark-mode'] : ''}`}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <FaWallet className={styles.icon} />
          <h1 className={styles.title}>Finanças em Foco</h1>
        </div>
        <div className={styles.headerRight}>

          <button onClick={toggleDarkMode} className={styles.darkModeToggle}>
            {isDarkMode ? <FaSun className={styles.darkModeIcon} /> : <FaMoon className={styles.darkModeIcon} />}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <motion.div
          className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}
          initial={{ x: '-100%' }}
          animate={{ x: isSidebarOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h2 className={styles.sidebarTitle}>Filtros Avançados</h2>
          <div className={styles.sidebarFilters}>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={styles.sidebarSelect}
            >
              <option value="todas">Todas as Categorias</option>
              {Object.keys(categorias).map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className={styles.sidebarSelect}
            >
              <option value="todos">Todos os Períodos</option>
              <option value="esteMes">Este Mês</option>
              <option value="mesPassado">Mês Passado</option>
            </select>
          </div>
          <button onClick={toggleSidebar} className={styles.sidebarClose}>Fechar</button>
        </motion.div>

        <div className={styles.content}>
          <section className={styles.summary}>
            <motion.div
              className={styles.summaryCard}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FaMoneyBillWave className={styles.summaryIcon} />
              <h3>Total Gasto Este Mês</h3>
              <p className={styles.summaryValue}>R$ {totalGastoEsteMes}</p>
            </motion.div>
            <motion.div
              className={styles.summaryCard}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaPiggyBank className={styles.summaryIcon} />
              <h3>Categoria Mais Gastadora</h3>
              <p className={styles.summaryValue}>{categoriaMaisGastadora}</p>
            </motion.div>
            <motion.div
              className={styles.summaryCard}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FaCalendarAlt className={styles.summaryIcon} />
              <h3>Média de Gasto Diário</h3>
              <p className={styles.summaryValue}>R$ {mediaGastoDiario}</p>
            </motion.div>
            <motion.div
              className={styles.summaryCard}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FaPiggyBank className={styles.summaryIcon} />
              <h3>Meta de Economia</h3>
              <motion.input
                type="number"
                className={styles.metaInput}
                value={metaEconomiaMensal}
                onChange={(e) => setMetaEconomiaMensal(Number(e.target.value))}
                whileFocus={{ scale: 1.05 }}
              />
              <p className={styles.summarySubValue}>Economia Potencial: R$ {economiaPotencial}</p>
            </motion.div>
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

          <section className={styles.charts}>
              <h2 className={styles.sectionTitle}>Filtros</h2>
              <div className={styles.chartHeader}>
                <label htmlFor="filtroCategoria">
                  <FaFilter className={styles.filterChartIcon} /> Categoria:
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
                <label htmlFor="filtroPeriodo">
                  <FaFilter className={styles.filterChartIcon} /> Período:
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
                </select>
              </div>
          </section>

          <section className={styles.charts}>
            <div className={styles.chartHeader}>
              <h2 className={styles.sectionTitle}>Análise Visual</h2>

            </div>
            <div className={styles.chartContainer}>
              <motion.div
                className={styles.pieChart}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Pie data={dadosGraficoPizza} options={optionsGraficoPizza} />
              </motion.div>
              <motion.div
                className={styles.barChart}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Bar data={dadosGraficoBarras} options={optionsGraficoBarras} />
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
                  {gastosFiltrados.map((gasto) => (
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
            </div>
            <div className={styles.inputGroup}>
              {categoriaPrevista && (
                <div className={styles.categoriaPrevista}>Categoria Sugerida: {categoriaPrevista}</div>
              )}
              <div className={styles.prioridadeInput}>
                <label htmlFor="prioridadeGasto" className={styles.prioridadeLabel}>Prioridade:</label>
                <select
                  id="prioridadeGasto"
                  value={prioridadeGasto}
                  onChange={(e) => setPrioridadeGasto(e.target.value as 'essencial' | 'naoEssencial')}
                  className={styles.selectInput}
                >
                  <option value="essencial">Essencial</option>
                  <option value="naoEssencial">Não Essencial</option>
                </select>
              </div>
            </div>
            <div className={styles.modalButtons}>
              <motion.button
                onClick={adicionarGasto}
                className={styles.modalAddButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? <div className={styles.spinner}></div> : 'Adicionar'}
              </motion.button>
              <button onClick={() => setIsModalOpen(false)} className={styles.modalCancelButton}>Cancelar</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Finanças em Foco. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Gastos;