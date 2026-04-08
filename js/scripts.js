// Gerenciamento do Carrinho/Orçamento (localStorage)
const getOrcamento = () =>
  JSON.parse(localStorage.getItem("portfolio_orcamento") || "[]");
const saveOrcamento = (itens) =>
  localStorage.setItem("portfolio_orcamento", JSON.stringify(itens));

// Ajusta quantidade de itens
function ajustarQtd(inputOrBtn, delta) {
  const input =
    inputOrBtn.tagName === "INPUT"
      ? inputOrBtn
      : inputOrBtn.closest(".orc-qtd").querySelector(".qtd-num");
  let qtd = parseInt(input.value, 10);
  if (isNaN(qtd)) qtd = 0;

  // Na página de produtos, o mínimo é 1. Na de orçamento, 0 remove o item.
  const min = document.getElementById("lista-orc") ? 0 : 1;
  qtd = Math.max(min, qtd + delta);
  input.value = qtd;

  // Se estivermos na página de orçamento, atualizamos o storage e a tela
  if (document.getElementById("lista-orc")) {
    const nome = inputOrBtn.closest(".orc-item").dataset.nome;
    // Agora não removemos o item automaticamente, então sempre pulamos o render se for digitação (delta 0)
    const skipRender = delta === 0;
    atualizarItemOrcamento(nome, qtd, skipRender);
  }
}

function atualizarItemOrcamento(nome, qtd, skipRender = false) {
  let itens = getOrcamento();
  const item = itens.find((i) => i.nome === nome);
  if (item) item.qtd = qtd;
  saveOrcamento(itens);

  if (skipRender) {
    atualizarResumo();
  } else if (typeof renderizarOrcamento === "function") {
    renderizarOrcamento();
  }
}

function removerItem(nome) {
  let itens = getOrcamento();
  itens = itens.filter((i) => i.nome !== nome);
  saveOrcamento(itens);
  renderizarOrcamento();
}

function esvaziarOrcamento() {
  if (confirm("Tem certeza que deseja remover todos os itens do orçamento?")) {
    saveOrcamento([]);
    renderizarOrcamento();
    showToast("Orçamento esvaziado.");
  }
}

// Atualiza resumo na tela
function atualizarResumo() {
  const items = getOrcamento();
  const resumoContainer = document.getElementById("resumo-itens");
  const totalVal = document.getElementById("total-val");

  if (!resumoContainer || !totalVal) return;

  // soma todas as quantidades
  const qtd = items.reduce((total, i) => total + i.qtd, 0);

  const linhas = items.length
    ? items
        .map(
          (i) =>
            `<div class="resumo-linha"><span>${i.nome} ×${i.qtd}</span></div>`,
        )
        .join("")
    : '<div class="resumo-linha"><span>Nenhum item selecionado</span></div>';

  resumoContainer.innerHTML = linhas;
  totalVal.innerHTML = qtd;
}

// Renderiza a lista na página de orçamento
function renderizarOrcamento() {
  const lista = document.getElementById("lista-orc");
  const acoes = document.getElementById("orc-header-acoes");
  if (!lista) return;

  const itens = getOrcamento();

  if (acoes) acoes.style.display = itens.length ? "flex" : "none";

  lista.innerHTML =
    itens
      .map(
        (i) => `
    <div class="orc-item ${i.qtd === 0 ? "zero-quantity" : ""}" data-nome="${i.nome}">
      <div class="orc-item-thumb">
        <img src="${i.img || "img/pallet_de_madeira_.png"}" alt="${i.nome}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/pallet_de_madeira_.png';">
      </div>
      <div class="flex-grow-1">
        <div class="orc-item-nome">${i.nome}</div>
        <div class="orc-item-dim">${i.dim || ""}</div>
      </div>
      <div class="orc-qtd">
        <button class="qtd-btn" onclick="ajustarQtd(this, -1)">−</button>
        <input type="number" class="qtd-num" min="0" value="${i.qtd}" oninput="ajustarQtd(this, 0)">
        <button class="qtd-btn" onclick="ajustarQtd(this, 1)">+</button>
      </div>
      <button class="btn-remove" onclick="removerItem('${i.nome}')" title="Remover item">
        <i class="ph ph-trash"></i>
      </button>
    </div>
  `,
      )
      .join("") ||
    `<div class="orc-vazio-container">
      <p class="text-muted mb-3" style="font-size: 15px">Seu orçamento está vazio.</p>
      <a href="produtos.html" class="btn-hero-primary" style="padding: 10px 20px; font-size: 13px;">Ver Produtos</a>
    </div>`;

  atualizarResumo();
}

// Máscara telefone
document.addEventListener("DOMContentLoaded", () => {
  // Se estiver na página de orçamento, renderiza ao carregar
  if (document.getElementById("lista-orc")) {
    renderizarOrcamento();

    // Recupera dados salvos do cliente
    const dadosSalvos = JSON.parse(
      localStorage.getItem("portfolio_cliente_dados") || "{}",
    );
    if (dadosSalvos.nome)
      document.getElementById("cliente-nome").value = dadosSalvos.nome;
    if (dadosSalvos.local)
      document.getElementById("cliente-local").value = dadosSalvos.local;
  }

  window.enviarWhatsApp = () => {
    const nomeEl = document.getElementById("cliente-nome");
    const localEl = document.getElementById("cliente-local");
    const obsEl = document.getElementById("cliente-obs");

    const nome = nomeEl?.value.trim() || "";
    const local = localEl?.value.trim() || "";
    const obs = obsEl?.value.trim() || "";
    const items = getOrcamento();
    const itemsComQtd = items.filter((i) => i.qtd > 0);

    // Validação visual
    let valid = true;
    [nomeEl, localEl].forEach((el) => {
      if (el && !el.value.trim()) {
        el.classList.add("error");
        valid = false;
      } else {
        el.classList.remove("error");
      }
    });

    if (!valid) {
      showToast("Por favor, preencha seu nome e local de entrega.");
      return;
    }

    if (!itemsComQtd.length) {
      alert(
        "Por favor, adicione quantidades aos produtos desejados antes de enviar.",
      );
      return;
    }

    let msg = "*Olá! Gostaria de fazer uma solicitação de orçamento.*\n\n";
    msg += "Aqui estão os produtos que selecionei:\n\n";

    itemsComQtd.forEach((i) => {
      msg += `• ${i.nome} — ${i.qtd} unidade(s)\n`;
    });

    // adiciona total de itens
    const totalQtd = itemsComQtd.reduce((t, i) => t + i.qtd, 0);
    msg += `\nTotal de itens: ${totalQtd}\n`;

    msg += "\n-------------------------\n";
    msg += ` Cliente: ${nome}\n`;
    msg += ` Local de entrega: ${local}\n`;
    if (obs) msg += ` Obs: ${obs}\n`;
    msg += "-------------------------\n\n";
    msg += "Aguardo seu retorno. Muito obrigado!";

    // Salva dados para a próxima vez
    localStorage.setItem(
      "portfolio_cliente_dados",
      JSON.stringify({ nome, local }),
    );

    const numero = "5500000000000"; // Substitua pelo seu telefone de contato
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );

    // Limpeza automática do orçamento após o redirecionamento
    saveOrcamento([]);
    renderizarOrcamento();

    // Limpa os campos de identificação se existirem na página
    if (document.getElementById("cliente-nome"))
      document.getElementById("cliente-nome").value = "";
    if (document.getElementById("cliente-tel"))
      document.getElementById("cliente-tel").value = "";
  };

  // MODAL PRODUTOS
  window.openProductModal = (card) => {
    const modal = document.getElementById("product-modal");
    if (!modal) {
      alert("Modal não encontrado!");
      return;
    }

    modal.querySelector(".modal-title").textContent =
      card.dataset.title || card.querySelector(".prod-nome").textContent;
    modal.querySelector(".modal-category").textContent =
      card.dataset.category || "";
    modal.querySelector(".modal-text").textContent =
      card.dataset.detail || "Detalhes do produto.";

    // Captura o src exato da imagem que está no card clicado
    const imgSrc = card.querySelector(".prod-icon img").getAttribute("src");
    const modalImg = modal.querySelector(".modal-image img");
    modalImg.src = imgSrc;
    modalImg.alt = card.dataset.title;
    // Garante que a imagem comece no topo do modal
    modal.scrollTop = 0;

    const features = (card.dataset.features || "").split(";").filter(Boolean);
    const featureList = modal.querySelector(".modal-features");
    featureList.innerHTML = features
      .map((f) => `<li>${f.trim()}</li>`)
      .join("");

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  window.closeProductModal = () => {
    const modal = document.getElementById("product-modal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  // Event listeners modais
  document.querySelectorAll(".prod-info-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".prod-card");
      openProductModal(card);
    });
  });

  const modalClose = document.querySelector(".modal-close");
  if (modalClose) modalClose.addEventListener("click", closeProductModal);

  const modalOverlay = document.getElementById("product-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }

  // Função para exibir Toast
  const showToast = (message) => {
    let toast = document.querySelector(".toast-notification");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-notification";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ph ph-check-circle"></i> <span>${message}</span>`;
    toast.classList.add("show");

    // Remove a classe após 3 segundos
    setTimeout(() => toast.classList.remove("show"), 3000);
  };

  // Botão Adicionar ao Orçamento (Toast e permanecer na tela)
  document.querySelectorAll(".btn-add-orc").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".prod-card");
      const nome = card.dataset.title;
      const dim = card.querySelector(".prod-uso").textContent.split(".")[0]; // Pega a primeira frase
      const img = card.querySelector(".prod-icon img").getAttribute("src");
      const qtdInput = card.querySelector(".qtd-num");
      const qtd = parseInt(qtdInput.value, 10);

      let itens = getOrcamento();
      const index = itens.findIndex((i) => i.nome === nome);

      if (index > -1) {
        itens[index].qtd += qtd;
      } else {
        itens.push({ nome, qtd, dim, img });
      }

      saveOrcamento(itens);
      showToast(`${nome} adicionado ao orçamento!`);
    });
  });

  // Elementos para filtragem e busca
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productSearchInput = document.getElementById("product-search");
  const prodCards = document.querySelectorAll(".prod-card");
  const noProductsMessage = document.getElementById("no-products-found");

  let currentFilter = "all"; // Filtro de categoria ativo
  let currentSearchTerm = ""; // Termo de busca ativo

  // Função principal de filtragem e busca
  const filterAndSearchProducts = () => {
    let visibleProductsCount = 0;

    prodCards.forEach((card) => {
      const cardType = card.getAttribute("data-type");
      const cardTitle = card.dataset.title.toLowerCase();
      const matchesFilter =
        currentFilter === "all" || cardType === currentFilter;
      const matchesSearch = cardTitle.includes(currentSearchTerm.toLowerCase());

      if (matchesFilter && matchesSearch) {
        card.style.display = "block";
        card.classList.add("animate"); // Re-adiciona a classe para animação, se necessário
        visibleProductsCount++;
      } else {
        card.style.display = "none";
        card.classList.remove("animate");
      }
    });

    // Exibe ou esconde a mensagem de "nenhum produto encontrado"
    if (visibleProductsCount === 0) {
      noProductsMessage.style.display = "block";
    } else {
      noProductsMessage.style.display = "none";
    }
  };

  // Lógica de Filtragem de Categorias
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentFilter = btn.getAttribute("data-filter");
      filterAndSearchProducts();
    });
  });

  // Lógica de Busca em tempo real
  const clearSearchBtn = document.getElementById("clear-search");
  if (productSearchInput) {
    productSearchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchTerm ? "flex" : "none";
      }
      filterAndSearchProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      productSearchInput.value = "";
      currentSearchTerm = "";
      clearSearchBtn.style.display = "none";
      productSearchInput.focus();
      filterAndSearchProducts();
    });
  }

  // Hamburger menu toggle
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");
  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", !isOpen);
      nav.classList.toggle("mobile-open");
      hamburger.classList.toggle("open");
    });

    // Close menu on link click
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.setAttribute("aria-expanded", "false");
        nav.classList.remove("mobile-open");
        hamburger.classList.remove("open");
      });
    });
  }

  // SCROLL REVEAL ANIMATIONS
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
        }
      });
    },
    { threshold: 0.1 },
  );

  // Observe elements
  document.querySelectorAll(".scroll-reveal").forEach((el) => {
    observer.observe(el);
  });

  // Stagger effect for grids
  document.querySelectorAll(".scroll-reveal.stagger").forEach((el, i) => {
    el.style.setProperty("--stagger-index", i);
  });
});
