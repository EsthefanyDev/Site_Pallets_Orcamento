// Gerenciamento do Carrinho/Orçamento (localStorage)
const getOrcamento = () =>
  JSON.parse(localStorage.getItem("fabaogas_orcamento") || "[]");
const saveOrcamento = (itens) =>
  localStorage.setItem("fabaogas_orcamento", JSON.stringify(itens));

// Ajusta quantidade de itens
function ajustarQtd(inputOrBtn, delta) {
  const input =
    inputOrBtn.tagName === "INPUT"
      ? inputOrBtn
      : inputOrBtn.closest(".orc-qtd").querySelector(".qtd-num");
  let qtd = parseInt(input.value || 0, 10);

  // Na página de produtos, o mínimo é 1. Na de orçamento, 0 remove o item.
  const min = document.getElementById("lista-orc") ? 0 : 1;
  qtd = Math.max(min, qtd + delta);
  input.value = qtd;

  // Se estivermos na página de orçamento, atualizamos o storage e a tela
  if (document.getElementById("lista-orc")) {
    const nome = inputOrBtn.closest(".orc-item").dataset.nome;
    atualizarItemOrcamento(nome, qtd);
  }
}

function atualizarItemOrcamento(nome, qtd) {
  let itens = getOrcamento();
  if (qtd <= 0) {
    itens = itens.filter((i) => i.nome !== nome);
  } else {
    const item = itens.find((i) => i.nome === nome);
    if (item) item.qtd = qtd;
  }
  saveOrcamento(itens);
  renderizarOrcamento();
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

// Máscara telefone
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for quantity inputs
  document.querySelectorAll(".qtd-num").forEach((input) => {
    input.addEventListener("input", atualizarResumo);
    input.addEventListener("change", () => {
      if (input.value < 0) input.value = 0;
      atualizarResumo();
    });
  });
  const telInput = document.getElementById("cliente-tel");
  if (telInput) {
    telInput.addEventListener("input", (e) => {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length > 2) {
        valor = "(" + valor.substring(0, 2) + ") " + valor.substring(2);
      }
      if (valor.length > 9) {
        valor = valor.substring(0, 9) + "-" + valor.substring(9, 13);
      }
      e.target.value = valor;
    });
  }

  // Renderiza a lista na página de orçamento
  const renderizarOrcamento = () => {
    const lista = document.getElementById("lista-orc");
    if (!lista) return;

    const itens = getOrcamento();
    lista.innerHTML =
      itens
        .map(
          (i) => `
      <div class="orc-item" data-nome="${i.nome}">
        <div class="prod-icon" style="flex-shrink: 0; background: var(--cinza-claro)">
          <img src="img/pallet_de_madeira_.png" alt="${i.nome}">
        </div>
        <div style="flex: 1">
          <div class="orc-item-nome">${i.nome}</div>
          <div class="orc-item-dim">${i.dim || ""}</div>
        </div>
        <div class="orc-qtd">
          <button class="qtd-btn" onclick="ajustarQtd(this, -1)">−</button>
          <input type="number" class="qtd-num" min="0" value="${i.qtd}" onchange="ajustarQtd(this, 0)">
          <button class="qtd-btn" onclick="ajustarQtd(this, 1)">+</button>
        </div>
      </div>
    `,
        )
        .join("") ||
      '<p style="padding: 20px; color: var(--texto-muted)">Seu orçamento está vazio. Adicione produtos na galeria!</p>';

    atualizarResumo();
  };

  // Se estiver na página de orçamento, renderiza ao carregar
  if (document.getElementById("lista-orc")) {
    renderizarOrcamento();
  }

  window.enviarWhatsApp = () => {
    const nome = document.getElementById("cliente-nome")?.value.trim() || "";
    const tel = document.getElementById("cliente-tel")?.value.trim() || "";
    const items = getOrcamento();

    if (!items.length) {
      alert("Adicione produtos!");
      return;
    }

    let msg = "*Olá! Gostaria de fazer um orçamento com a Fabão Gás.*\n\n";
    msg += "Aqui estão os produtos que selecionei:\n\n";

    items.forEach((i) => {
      msg += `• ${i.nome} — ${i.qtd} unidade(s)\n`;
    });

    // adiciona total de itens
    const totalQtd = items.reduce((t, i) => t + i.qtd, 0);
    msg += `\nTotal de itens: ${totalQtd}\n`;

    msg += "\n-------------------------\n";
    if (nome) msg += ` Cliente: ${nome}\n`;
    msg += "-------------------------\n\n";
    msg += "Aguardo seu retorno para confirmar o pedido. Muito obrigado!";

    const numero = "5591985974371";
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
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
    toast.innerHTML = `<i class='bx bx-check-circle'></i> <span>${message}</span>`;
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
      const qtdInput = card.querySelector(".qtd-num");
      const qtd = parseInt(qtdInput.value, 10);

      let itens = getOrcamento();
      const index = itens.findIndex((i) => i.nome === nome);

      if (index > -1) {
        itens[index].qtd += qtd;
      } else {
        itens.push({ nome, qtd, dim });
      }

      saveOrcamento(itens);
      showToast(`${nome} adicionado ao orçamento!`);
    });
  });

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
  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          scrollObserver.unobserve(entry.target); // one-time animation
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  // Observe elements
  document.querySelectorAll(".scroll-reveal").forEach((el) => {
    scrollObserver.observe(el);
  });

  // Stagger effect for grids
  document.querySelectorAll(".scroll-reveal.stagger").forEach((el, i) => {
    el.style.setProperty("--stagger-index", i);
  });
});
