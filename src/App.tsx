import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ChartDataItem = {
  [key: string]: string | number;
};

// Linha crua vinda do CSV (tudo string/opcional)
interface CsvRow {
  prato?: string;
  dia_semana?: string;
  qtd_prevista_media?: string;
  qtd_vendida?: string;
  nivel_movimento_prato?: string;
  nivel_movimento?: string;
}

// Linha já tratada para o estado da aplicação
interface Row extends ChartDataItem {
  prato: string;
  dia_semana: string;
  qtd_prevista_media: number;
  nivel_movimento_prato: string;
}

interface NivelMovimentoData extends ChartDataItem {
  nivel: string;
  quantidade: number;
}

type ChartType = "bar" | "pie";

const weekIndexes: Record<string, number> = {
  segunda: 1,
  terça: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sábado: 6,
};

// cores pros gráficos de pizza
const PIE_COLORS = [
  "#60a5fa",
  "#34d399",
  "#f97316",
  "#a855f7",
  "#facc15",
  "#f87171",
  "#22d3ee",
];

const App: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedDia, setSelectedDia] = useState<string>("");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: Row[] = (results.data ?? [])
          .filter((r) => r.prato && r.dia_semana)
          .map((r) => {
            const qtdBruta = Number(r.qtd_prevista_media ?? r.qtd_vendida ?? 0);

            return {
              prato: (r.prato ?? "").trim(),
              dia_semana: (r.dia_semana ?? "").trim(),
              qtd_prevista_media: Number(qtdBruta.toFixed(3)),
              nivel_movimento_prato: (
                r.nivel_movimento_prato ||
                r.nivel_movimento ||
                ""
              ).trim(),
            };
          });


        setRows(data);
        // Seleciona automaticamente o primeiro dia disponível na ordem da semana
        if (data.length > 0) {
          let achou = false;
          for (const key of Object.keys(weekIndexes)) {
            if (achou) {
              break;
            }
            for (const d of data) {
              if (d.dia_semana === key) {
                setSelectedDia(d.dia_semana);
                achou = true;
                break;
              }
            }
          }
        }
      },
      error: (error) => {
        console.error("Erro ao ler CSV:", error);
        alert("Erro ao ler o arquivo CSV.");
      },
    });
  };

  // Lista de dias da semana presentes no arquivo
  const diasDisponiveis = useMemo<string[]>(() => {
    const set = new Set(rows.map((r) => r.dia_semana));
    return Array.from(set);
  }, [rows]);

  // Dados para o gráfico de pratos x quantidade para o dia selecionado
  const dadosPratosDia = useMemo<Row[]>(() => {
    if (!selectedDia) return [];
    return rows
      .filter((r) => r.dia_semana === selectedDia)
      .sort((a, b) => b.qtd_prevista_media - a.qtd_prevista_media);
  }, [rows, selectedDia]);

  // Contagem de pratos por nível de movimento
  const dadosNivelMovimento = useMemo<NivelMovimentoData[]>(() => {
    const contagem: Record<string, number> = {};

    rows.forEach((r) => {
      const nivel = r.nivel_movimento_prato || "não definido";
      contagem[nivel] = (contagem[nivel] || 0) + 1;
    });

    const ordem = ["baixo", "médio", "alto", "não definido"];

    return Object.entries(contagem)
      .map(([nivel, quantidade]) => ({
        nivel,
        quantidade,
      }))
      .sort((a, b) => ordem.indexOf(a.nivel) - ordem.indexOf(b.nivel));
  }, [rows]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "#020617",
          borderRadius: "1rem",
          padding: "1.5rem 2rem 2.5rem",
          boxShadow: "0 20px 40px rgba(15,23,42,0.8)",
          border: "1px solid rgba(148,163,184,0.3)",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
          Dashboard de Previsão de Pratos
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
          Faça upload do arquivo CSV gerado no Colab (por exemplo:
          <code style={{ marginLeft: 4, marginRight: 4 }}>
            previsoes_prato_dia_semana.csv
          </code>
          ) para visualizar as previsões por prato e dia da semana.
        </p>

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px dashed rgba(148,163,184,0.6)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.35))",
          }}
        >
          <label
            htmlFor="csvUpload"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            <span style={{ fontWeight: 500 }}>Arquivo CSV:</span>{" "}
            <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
              (clique para selecionar)
            </span>
          </label>
          <input
            id="csvUpload"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            style={{
              display: "block",
              width: "98%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.7)",
              backgroundColor: "rgba(15,23,42,0.8)",
              color: "#e5e7eb",
            }}
          />
        </div>

        {rows.length === 0 && (
          <p style={{ color: "#9ca3af" }}>
            Nenhum dado carregado ainda. Faça upload de um arquivo CSV para ver
            os gráficos.
          </p>
        )}

        {rows.length > 0 && (
          <>
            {/* Filtro de dia da semana */}
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 500 }}>Dia da semana:</span>
              <select
                value={selectedDia}
                onChange={(e) => setSelectedDia(e.target.value)}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                }}
              >
                {[...diasDisponiveis]
                  .sort(
                    (a, b) => weekIndexes[a] - weekIndexes[b]
                  )
                  .map((dia) => (
                    <option key={dia} value={dia}>
                      {dia}
                    </option>
                  ))}
              </select>
            </div>

            {/* Select de tipo de gráfico */}
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 500 }}>Tipo de gráfico:</span>
              <select
                value={chartType}
                onChange={(e) =>
                  setChartType(e.target.value as ChartType)
                }
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                }}
              >
                <option value="bar">Barras</option>
                <option value="pie">Pizza</option>
              </select>
            </div>

            {/* Gráfico 1: pratos x quantidade prevista (dia selecionado) */}
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Quantidade prevista por prato ({selectedDia})
              </h2>
              <p style={{ color: "#9ca3af", marginBottom: "0.75rem" }}>
                Mostra a quantidade média prevista para cada prato no dia da
                semana selecionado.
              </p>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  {chartType === "bar" ? (
                    <BarChart data={dadosPratosDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="prato" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid rgba(148,163,184,0.6)",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="qtd_prevista_media"
                        name="Qtd. prevista"
                        fill="#60a5fa"
                      />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={dadosPratosDia}
                        dataKey="qtd_prevista_media"
                        nameKey="prato"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {dadosPratosDia.map((_, index) => (
                          <Cell
                            key={`cell-prato-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </section>

            {/* Gráfico 2: contagem por nível de movimento */}
            <section>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Nível de movimento por combinação prato/dia
              </h2>
              <p style={{ color: "#9ca3af", marginBottom: "0.75rem" }}>
                Conta quantas combinações prato + dia da semana foram
                classificadas como baixo, médio ou alto movimento.
              </p>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  {chartType === "bar" ? (
                    <BarChart data={dadosNivelMovimento}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="nivel" />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid rgba(148,163,184,0.6)",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Bar
                        dataKey="quantidade"
                        name="Qtde. de combinações"
                        fill="#34d399"
                      />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={dadosNivelMovimento}
                        dataKey="quantidade"
                        nameKey="nivel"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {dadosNivelMovimento.map((_, index) => (
                          <Cell
                            key={`cell-nivel-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
