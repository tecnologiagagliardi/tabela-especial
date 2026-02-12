/* =========================
   VARIÁVEIS GERAIS
========================= */
const form = document.getElementById("tabelaForm");
const modal = document.getElementById("modalConfirmacao");
const modalTexto = document.getElementById("modalTexto");
const btnConfirmar = document.getElementById("btnConfirmar");
const btnFechar = document.getElementById("btnFechar");

const codigoCliente = document.getElementById("codigoCliente");
const cnpjCpf = document.getElementById("cnpjCpf");
const razaoSocial = document.getElementById("razaoSocial");
const cidade = document.getElementById("cidade");
const estado = document.getElementById("estado");
const preco = document.getElementById("preco");

let dadosClientes = [];
let resumoEmail = "";

/* =========================
   DATA ATUAL
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dataAtual").value =
    new Date().toLocaleDateString("pt-BR");
});

/* =========================
   FORMATAÇÃO MOEDA
========================= */
function formatarMoeda(input) {
  let valor = input.value.replace(/\D/g, "");
  valor = (Number(valor) / 100).toFixed(2);
  input.value = Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

preco.addEventListener("input", () => formatarMoeda(preco));

/* =========================
   CARREGAR CLIENTES
========================= */
async function carregarArquivo() {
  try {
    const response = await fetch("assets/data/data.txt");
    const texto = await response.text();
    const linhas = texto.split("\n").map(l => l.trim()).filter(Boolean);
    linhas.shift();

    dadosClientes = linhas.map(l => {
      const [codigo_cliente, cnpjCpf, razao_social, cidade, estado] =
        l.split(",").map(c => c.trim());
      return { codigo_cliente, cnpjCpf, razao_social, cidade, estado };
    });
  } catch (erro) {
    console.error("Erro ao carregar clientes:", erro);
  }
}
carregarArquivo();

/* =========================
   BUSCA CLIENTE
========================= */
codigoCliente.addEventListener("change", function () {
  const cliente = dadosClientes.find(c => c.codigo_cliente === this.value);

  if (!cliente) {
    alert("Cliente não encontrado.");
    return;
  }

  cnpjCpf.value = cliente.cnpjCpf;
  razaoSocial.value = cliente.razao_social;
  cidade.value = cliente.cidade.toUpperCase();
  estado.value = cliente.estado.toUpperCase();
});

/* =========================
   SUBMIT → MODAL
========================= */
form.addEventListener("submit", e => {
  e.preventDefault();

  const get = id => document.getElementById(id).value;

  resumoEmail = `
SOLICITAÇÃO DE TABELA ESPECIAL

DATA: ${get("dataAtual")}

CÓDIGO DO CLIENTE: ${get("codigoCliente")}
CNPJ/CPF: ${get("cnpjCpf")}
RAZÃO SOCIAL: ${get("razaoSocial")}
CIDADE: ${get("cidade")}
ESTADO: ${get("estado")}

CÓDIGO DO PRODUTO: ${get("codigoProduto")}
QUANTIDADE: ${get("brosDianteiroVipal")}
PREÇO: ${get("preco")}
PRAZO DE PAGAMENTO: ${get("prazoPagamento")}

OBSERVAÇÕES:
${get("observações")}
`;

  modalTexto.textContent = resumoEmail;
  modal.style.display = "flex";
});

/* =========================
   CONFIRMAR EMAIL
========================= */
btnConfirmar.onclick = () => {
  window.location.href =
    `mailto:aprovacaodetabela@grupogagliardi.com?subject=` +
    encodeURIComponent("Solicitação de Tabela Especial") +
    `&body=${encodeURIComponent(resumoEmail)}`;

  modal.style.display = "none";
};

btnFechar.onclick = () => modal.style.display = "none";