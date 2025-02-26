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
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import styles from '../styles/Gastos.module.css';
import {
  FaWallet,
  FaChartPie,
  FaFilter,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaMoon,
  FaSun,
  FaTrash,
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

// Simplificando os ícones sem forwardRef
const WalletIcon = ({ className }: { className?: string }) => <FaWallet className={className} />;
const ChartPieIcon = ({ className }: { className?: string }) => <FaChartPie className={className} />;
const FilterIcon = ({ className }: { className?: string }) => <FaFilter className={className} />;
const FileAltIcon = ({ className }: { className?: string }) => <FaFileAlt className={className} />;
const CheckCircleIcon = ({ className }: { className?: string }) => <FaCheckCircle className={className} />;
const TimesCircleIcon = ({ className }: { className?: string }) => <FaTimesCircle className={className} />;
const MoonIcon = ({ className }: { className?: string }) => <FaMoon className={className} />;
const SunIcon = ({ className }: { className?: string }) => <FaSun className={className} />;
const TrashIcon = ({ className }: { className?: string }) => <FaTrash className={className} />;

const Gastos: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [novoGasto, setNovoGasto] = useState('');
  const [valorGasto, setValorGasto] = useState('');
  const [categoriaPrevista, setCategoriaPrevista] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );
  const [metaEconomiaMensal, setMetaEconomiaMensal] = useState<number>(1000);
  const [prioridadeGasto, setPrioridadeGasto] = useState<'essencial' | 'naoEssencial'>('naoEssencial');
  const [mediaGastosMensal, setMediaGastosMensal] = useState<number>(0);

  useEffect(() => {
    const initialExpenses: Gasto[] = [
      { id: 1, descricao: 'Supermercado Extra', valor: 325.80, categoria: 'alimentacao', data: '2024-01-05', prioridade: 'essencial' },
      { id: 2, descricao: 'Uber - Viagem ao centro', valor: 32.50, categoria: 'transporte', data: '2024-01-06', prioridade: 'naoEssencial' },
      { id: 3, descricao: 'Cinema com amigos', valor: 75.00, categoria: 'lazer', data: '2024-01-07', prioridade: 'naoEssencial' },
      { id: 4, descricao: 'Farmácia - Remédios', valor: 120.30, categoria: 'saude', data: '2024-01-10', prioridade: 'essencial' },
      { id: 5, descricao: 'Compra online - Livro', valor: 45.90, categoria: 'compras', data: '2024-01-12', prioridade: 'naoEssencial' },
      { id: 6, descricao: 'Restaurante Italiano', valor: 180.00, categoria: 'alimentacao', data: '2024-01-15', prioridade: 'naoEssencial' },
      { id: 7, descricao: 'Gasolina - Posto Shell', valor: 200.00, categoria: 'transporte', data: '2024-01-18', prioridade: 'essencial' },
      { id: 8, descricao: 'Netflix - Assinatura', valor: 39.90, categoria: 'servicos', data: '2024-01-20', prioridade: 'naoEssencial' },
      { id: 9, descricao: 'Academia - Mensalidade', valor: 110.00, categoria: 'servicos', data: '2024-01-22', prioridade: 'naoEssencial' },
      { id: 10, descricao: 'Aluguel do apartamento', valor: 1200.00, categoria: 'moradia', data: '2024-01-25', prioridade: 'essencial' },
      { id: 11, descricao: 'Conta de luz', valor: 185.50, categoria: 'moradia', data: '2024-01-28', prioridade: 'essencial' },
      { id: 12, descricao: 'Curso online de Inglês', valor: 250.00, categoria: 'educacao', data: '2024-01-30', prioridade: 'naoEssencial' },
      { id: 13, descricao: 'Café da manhã na padaria', valor: 15.00, categoria: 'alimentacao', data: '2024-02-02', prioridade: 'naoEssencial' },
      { id: 14, descricao: 'Uber - Volta para casa', valor: 28.00, categoria: 'transporte', data: '2024-02-03', prioridade: 'naoEssencial' },
      { id: 15, descricao: 'Presente de aniversário', valor: 80.00, categoria: 'compras', data: '2024-02-05', prioridade: 'naoEssencial' },
      { id: 16, descricao: 'Consulta médica', valor: 150.00, categoria: 'saude', data: '2024-02-08', prioridade: 'essencial' },
      { id: 17, descricao: 'Ingressos para show', valor: 200.00, categoria: 'lazer', data: '2024-02-10', prioridade: 'naoEssencial' },
      { id: 18, descricao: 'Mercado do mês', valor: 450.00, categoria: 'alimentacao', data: '2024-02-12', prioridade: 'essencial' },
      { id: 19, descricao: 'Oficina mecânica', valor: 300.00, categoria: 'transporte', data: '2024-02-15', prioridade: 'essencial' },
      { id: 20, descricao: 'Spotify - Assinatura', valor: 19.90, categoria: 'servicos', data: '2024-02-18', prioridade: 'naoEssencial' },
      { id: 21, descricao: 'Condomínio', valor: 400.00, categoria: 'moradia', data: '2024-02-20', prioridade: 'essencial' },
      { id: 22, descricao: 'Material escolar', valor: 120.00, categoria: 'educacao', data: '2024-02-22', prioridade: 'naoEssencial' },
      { id: 23, descricao: 'Jantar especial', valor: 100.00, categoria: 'alimentacao', data: '2024-02-25', prioridade: 'naoEssencial' },
      { id: 24, descricao: 'Supermercado', valor: 280.00, categoria: 'alimentacao', data: '2024-03-03', prioridade: 'essencial' },
      { id: 25, descricao: 'Uber - Ida ao trabalho', valor: 22.00, categoria: 'transporte', data: '2024-03-05', prioridade: 'naoEssencial' },
      { id: 26, descricao: 'Remédio para dor de cabeça', valor: 35.00, categoria: 'saude', data: '2024-03-07', prioridade: 'essencial' },
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
    setFeedback(null);
  };

  const adicionarGasto = () => {
    if (!novoGasto.trim() || !valorGasto.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const valor = parseFloat(valorGasto.replace(',', '.'));
      if (isNaN(valor)) {
        setFeedback('error');
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
      setFeedback('success');
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
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

  const optionsGraficoPizza = {
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
          font: { size: 12, weight: 'bold' as const }, // Corrigido para valor compatível
        },
      },
    },
    animation: { animateRotate: true, animateScale: true },
  };

  const optionsGraficoBarras = {
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
    return maxCategoria;
  }, [gastosFiltrados]);
  const mediaGastoDiario = useMemo(() => (parseFloat(totalGastoEsteMes) / 30).toFixed(2), [totalGastoEsteMes]);
  const economiaPotencial = useMemo(() => (metaEconomiaMensal - parseFloat(totalGastoEsteMes)).toFixed(2), [metaEconomiaMensal, totalGastoEsteMes]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`${styles.container} ${isDarkMode ? styles['dark-mode'] : ''}`}>
      <header className={styles.header}>
        <WalletIcon className={`${styles.icon} ${styles.hoverScale}`} />
        <div className={styles.headerText}>
          <h1>Finanças em Foco</h1>
          <span className={styles.slogan}>Seu controle financeiro, simplificado.</span>
        </div>
        <nav>
          <a href="#">Home</a>
          <a href="#">Relatórios</a>
          <a href="#">Configurações</a>
          <button onClick={toggleDarkMode} className={styles.darkModeToggle} aria-label={isDarkMode ? 'Desativar modo noturno' : 'Ativar modo noturno'}>
            {isDarkMode ? <SunIcon className={styles.darkModeIcon} /> : <MoonIcon className={styles.darkModeIcon} />}
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.dashboardTop}>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Total Gasto Este Mês</h3>
            <p className={styles.metricValue}>R$ {totalGastoEsteMes}</p>
          </div>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Categoria Mais Gastadora</h3>
            <p className={styles.metricValue}>{categoriaMaisGastadora}</p>
          </div>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Média de Gasto Diário</h3>
            <p className={styles.metricValue}>R$ {mediaGastoDiario}</p>
          </div>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Média de Gastos Mensal</h3>
            <p className={styles.metricValue}>R$ {mediaGastosMensal}</p>
          </div>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Meta de Economia Mensal</h3>
            <p className={styles.metricValue}>
              R${' '}
              <motion.input
                type="number"
                className={styles.metaInput}
                value={metaEconomiaMensal}
                onChange={(e) => setMetaEconomiaMensal(Number(e.target.value))}
                whileFocus={{ scale: 1.05 }}
              />
            </p>
          </div>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Economia Potencial</h3>
            <p className={styles.metricValue}>R$ {economiaPotencial}</p>
          </div>
        </section>

        <section className={styles.inputSection}>
          <motion.input
            type="text"
            placeholder="Descrição do gasto"
            value={novoGasto}
            name="descricaoGasto"
            onChange={handleInputChange}
            whileFocus={{ scale: 1.03 }}
            className={styles.inputField}
          />
          <motion.input
            type="text"
            placeholder="Valor (ex: 65,00)"
            value={valorGasto}
            name="valorGasto"
            onChange={handleInputChange}
            whileFocus={{ scale: 1.03 }}
            className={styles.inputField}
          />
          {categoriaPrevista && <div className={styles.categoriaPrevista}>Categoria: {categoriaPrevista}</div>}
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
          <motion.button
            onClick={adicionarGasto}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={styles.addButton}
          >
            {loading ? <div className={styles.spinner}></div> : 'Adicionar Gasto'}
          </motion.button>
          {feedback && (
            <motion.div
              className={`${styles.feedback} ${feedback === 'success' ? styles.success : styles.error}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {feedback === 'success' ? (
                <>
                  <CheckCircleIcon className={styles.successIcon} /> Gasto adicionado com sucesso!
                </>
              ) : (
                <>
                  <TimesCircleIcon className={styles.errorIcon} /> Valor inválido!
                </>
              )}
            </motion.div>
          )}
        </section>

        <section className={styles.gastosRecentes}>
          <h2>Gastos Recentes</h2>
          <div className={styles.tableContainer}>
            <motion.table
              className={styles.table}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th className={styles.valorHeader}>Valor</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Prioridade</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((gasto) => (
                  <motion.tr
                    key={gasto.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <td>{gasto.descricao}</td>
                    <td className={styles.valorCell}>R$ {gasto.valor.toFixed(2)}</td>
                    <td style={{ color: coresCategorias[gasto.categoria] }}>{gasto.categoria}</td>
                    <td>{gasto.data}</td>
                    <td>
                      <span
                        className={gasto.prioridade === 'essencial' ? styles.prioridadeEssencial : styles.prioridadeNaoEssencial}
                      >
                        {gasto.prioridade}
                      </span>
                    </td>
                    <td>
                      <motion.button
                        onClick={() => removerGasto(gasto.id)}
                        whileTap={{ scale: 0.9 }}
                        className={styles.deleteButton}
                      >
                        <TrashIcon className={styles.deleteIcon} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        </section>

        <section className={styles.filtros}>
          <h2>Filtros</h2>
          <div className={styles.filterContainer}>
            <label htmlFor="filtroCategoria">
              <FilterIcon className={styles.icon} /> Categoria:
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
              <FilterIcon className={styles.icon} /> Período:
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

        <section className={styles.graficos}>
          <h2>Análise Visual</h2>
          <div className={styles.chartContainer}>
            <div className={styles.pieChart}>
              <Pie data={dadosGraficoPizza} options={optionsGraficoPizza} />
            </div>
            <div className={styles.barChart}>
              <Bar data={dadosGraficoBarras} options={optionsGraficoBarras} />
            </div>
          </div>
        </section>

        <section className={styles.relatorios}>
          <motion.button className={styles.reportButton} whileTap={{ scale: 0.95 }}>
            <FileAltIcon className={styles.icon} /> Gerar Relatório
          </motion.button>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Finanças em Foco.</p>
        <p>
          <a href="#">Termos de Uso</a> | <a href="#">Privacidade</a>
        </p>
      </footer>
    </div>
  );
};

export default Gastos;