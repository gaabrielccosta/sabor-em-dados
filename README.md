# 🍽️ Sabor em Dados

**Sabor em Dados** é uma aplicação web construída com **React + TypeScript + Vite** que permite visualizar, de forma interativa, previsões de consumo de pratos em um restaurante a partir de um arquivo **CSV** gerado previamente em um notebook do Google Colab (https://colab.research.google.com/drive/12F2zPiblk-EFiSJbtYSmUk4dfAxvEyNj?usp=sharing)

O foco é apoiar a **gestão de produção** e **planejamento de cardápio**, ajudando a responder perguntas como:

- Quantas unidades de cada prato devo preparar em cada dia da semana?
- Quais pratos têm **baixo**, **médio** ou **alto** nível de movimento?
- Como enxergar esses dados de forma visual, em **gráficos de barras** ou **pizza**?

---

## 🧠 Visão geral da aplicação

A aplicação funciona em cima de um **arquivo CSV** com previsões por **prato** e **dia da semana**.

Depois do upload do arquivo, o usuário consegue:

1. **Selecionar um dia da semana** (segunda a sábado).
2. Ver um **gráfico de quantidade prevista por prato** para o dia selecionado.
3. Ver um **gráfico de distribuição por nível de movimento** (baixo, médio, alto).
4. Alternar entre **gráficos de barras** e **gráficos de pizza** através de um select.

Tudo isso em um **dashboard dark**, pensado para uso em tela cheia.

---

## ⚙️ Tecnologias utilizadas

- **Vite** – bundler e dev server.
- **React** – construção da interface.
- **TypeScript** – tipagem estática.
- **Papaparse** – parser de arquivos CSV no navegador.
- **Recharts** – gráficos (barras e pizza).

---

## 📁 Estrutura esperada do CSV

O arquivo CSV deve conter, no mínimo, as seguintes colunas (nomes em minúsculo):

- `prato` – nome do prato.
- `dia_semana` – dia da semana (ex.: `segunda`, `terça`, `quarta`, `quinta`, `sexta`, `sábado`).
- Uma das duas:
  - `qtd_prevista_media` – quantidade prevista (média) do prato.
  - **ou** `qtd_vendida` – quantidade vendida (caso a previsão esteja baseada nisso).
- Opcionalmente:
  - `nivel_movimento_prato` – classificação do nível de movimento do prato no dia (`baixo`, `médio`, `alto`).
  - **ou** `nivel_movimento` – mesma ideia, com outro nome de coluna.

A aplicação trata ambos os nomes para quantidade (`qtd_prevista_media` / `qtd_vendida`) e para nível de movimento (`nivel_movimento_prato` / `nivel_movimento`).

### 🧾 Exemplo de cabeçalho CSV

```csv
prato,dia_semana,qtd_prevista_media,nivel_movimento_prato
Filé de frango,segunda,45.237,alto
Arroz branco,segunda,120.500,alto
Salada verde,segunda,30.125,médio
Feijão preto,terça,80.000,alto
...
