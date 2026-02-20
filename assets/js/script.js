/* =========================
   ELEMENTOS
========================= */
const form = document.getElementById("tabelaForm");
const modal = document.getElementById("modalConfirmacao");
const modalTexto = document.getElementById("modalTexto");
const btnConfirmar = document.getElementById("btnConfirmar");
const btnFechar = document.getElementById("btnFechar");

const container = document.getElementById("produtosContainer");
const btnAdicionar = document.getElementById("adicionarProduto");
const template = document.getElementById("produtoTemplate");

const codigoCliente = document.getElementById("codigoCliente");
const cnpjCpf = document.getElementById("cnpjCpf");
const razaoSocial = document.getElementById("razaoSocial");

let dadosClientes = [];
let dadosSku = [];
let resumoEmail = "";

/* =========================
   DATA ATUAL
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dataAtual").value =
    new Date().toLocaleDateString("pt-BR");
});

/* =========================
   CARREGAR CLIENTES
========================= */
async function carregarClientes() {
  try {
    const response = await fetch("assets/data/data.txt");
    const texto = await response.text();

    const linhas = texto
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    linhas.shift(); // remove cabeçalho

    dadosClientes = linhas.map(l => {
      const [codigo_cliente, cnpjCpf, razao_social] =
        l.split(",").map(c => c.trim());

      return {
        codigo_cliente,
        cnpjCpf,
        razao_social
      };
    });

  } catch (erro) {
    console.error("Erro ao carregar clientes:", erro);
  }
}

/* =========================
   CARREGAR SKU
========================= */
async function carregarSku() {
  try {
    const response = await fetch("assets/data/sku.txt");
    const texto = await response.text();

    const linhas = texto
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    linhas.shift(); // remove cabeçalho

    dadosSku = linhas.map(l => {
      const [codigo_produto, descricao] =
        l.split(",").map(c => c.trim());

      return {
        codigo_produto,
        descricao
      };
    });

  } catch (erro) {
    console.error("Erro ao carregar SKU:", erro);
  }
}

carregarSku();

carregarClientes();

/* =========================
   BUSCAR CLIENTE
========================= */
codigoCliente.addEventListener("change", function () {

  const cliente = dadosClientes.find(
    c => c.codigo_cliente === this.value.trim()
  );

  if (!cliente) {
    alert("Cliente não encontrado.");
    return;
  }

  cnpjCpf.value = cliente.cnpjCpf;
  razaoSocial.value = cliente.razao_social;
});

/* =========================
   BUSCAR PRODUTO
========================= */
container.addEventListener("change", function (e) {

  if (e.target.name === "codigoProduto[]") {

    const codigoDigitado = e.target.value.trim();

    const produto = dadosSku.find(
      p => p.codigo_produto === codigoDigitado
    );

    const item = e.target.closest(".produto-item");
    const campoDescricao = item.querySelector(
      'input[name="descricaoProduto[]"]'
    );

    if (!produto) {
      campoDescricao.value = "Produto não encontrado";
      return;
    }

    campoDescricao.value = produto.descricao;
  }
});

/* =========================
   MÁSCARA MOEDA
========================= */
function aplicarMascaraMoeda(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, "");
    valor = (Number(valor) / 100).toFixed(2);

    input.value = Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  });
}

/* =========================
   ADICIONAR PRODUTO
========================= */
btnAdicionar.addEventListener("click", () => {
  const clone = template.content.cloneNode(true);
  container.appendChild(clone);

  const novosPrecos = container.querySelectorAll(".campo-preco");
  aplicarMascaraMoeda(novosPrecos[novosPrecos.length - 1]);
});

/* =========================
   REMOVER PRODUTO
========================= */
container.addEventListener("click", function (e) {
  if (e.target.classList.contains("removerProduto")) {
    e.target.closest(".produto-item").remove();
  }
});

/* =========================
   SUBMIT → MODAL
========================= */
form.addEventListener("submit", e => {
  e.preventDefault();

  const produtos = document.querySelectorAll(".produto-item");

  if (produtos.length === 0) {
    alert("Adicione pelo menos um produto.");
    return;
  }

  const get = id => document.getElementById(id).value;

  let listaProdutos = "";

  produtos.forEach((produto, index) => {
    const codigo = produto.querySelector('input[name="codigoProduto[]"]').value;
    const descricao = produto.querySelector('input[name="descricaoProduto[]"]').value;
    const qtd = produto.querySelector('input[name="quantidade[]"]').value;
    const preco = produto.querySelector('input[name="preco[]"]').value;

    listaProdutos += `
PRODUTO ${index + 1}
Código: ${codigo}
Descrição: ${descricao}
Quantidade: ${qtd}
Preço: ${preco}
`;
  });

  resumoEmail = `
SOLICITAÇÃO DE TABELA ESPECIAL

DATA: ${get("dataAtual")}

CÓDIGO DO CLIENTE: ${get("codigoCliente")}
CNPJ/CPF: ${get("cnpjCpf")}
RAZÃO SOCIAL: ${get("razaoSocial")}
PRAZO DE PAGAMENTO: ${get("prazoPagamento")}

${listaProdutos}

OBSERVAÇÕES:
${get("observacoes")}
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