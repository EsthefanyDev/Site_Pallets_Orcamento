// Ajusta quantidade de itens
function ajustarQtd(btn, delta) {
  const item = btn.closest(".orc-item");
  const span = item.querySelector(".qtd-num");
  const qtd = Math.max(0, parseInt(span.textContent, 10) + delta);
  span.textContent = qtd;
  atualizarResumo();
}

// Retorna lista de itens selecionados
function getSelectedItems() {
  return Array.from(document.querySelectorAll(".orc-item"))
    .map(item => ({
      nome: item.dataset.nome,
      qtd: parseInt(item.querySelector(".qtd-num").textContent, 10)
    }))
    .filter(item => item.qtd > 0);
}

// Atualiza resumo na tela
function atualizarResumo() {
  const items = getSelectedItems();

  // soma todas as quantidades
  const qtd = items.reduce((total, i) => total + i.qtd, 0);

  const linhas = items.length
    ? items.map(i => `<div class="resumo-linha"><span>${i.nome} ×${i.qtd}</span></div>`).join("")
    : '<div class="resumo-linha"><span>Nenhum item selecionado</span></div>';

  document.getElementById("resumo-itens").innerHTML = linhas;
  document.getElementById("total-val").innerHTML = qtd;
}

// Máscara telefone
document.addEventListener("DOMContentLoaded", () => {
  const telInput = document.getElementById("cliente-tel");
  if (telInput) {
    telInput.addEventListener("input", e => {
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


  window.enviarWhatsApp = () => {
    const nome = document.getElementById("cliente-nome")?.value.trim() || "";
    const tel = document.getElementById("cliente-tel")?.value.trim() || "";
    const items = getSelectedItems();

    if (!items.length) {
      alert("Adicione produtos!");
      return;
    }

    let msg = "*Olá! Gostaria de fazer um orçamento com a Fabão Gás.*\n\n";
    msg += "Aqui estão os produtos que selecionei:\n\n";

    items.forEach(i => {
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
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // MODAL PRODUTOS
  window.openProductModal = card => {
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
    featureList.innerHTML = features.map(f => `<li>${f.trim()}</li>`).join("");

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
  document.querySelectorAll(".prod-info-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".prod-card");
      openProductModal(card);
    });
  });

  const modalClose = document.querySelector(".modal-close");
  if (modalClose) modalClose.addEventListener("click", closeProductModal);

  const modalOverlay = document.getElementById("product-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }
});