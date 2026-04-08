# Pallet Log - Sistema de Catálogo e Orçamento Industrial

Este projeto é um sistema moderno de catálogo de produtos e gestão de orçamentos desenvolvido para a indústria de paletização e logística. O foco principal é a experiência do usuário (UX) industrial e a conversão de leads diretamente via WhatsApp.

## 🚀 Funcionalidades Principais

### 1. Sistema de Orçamento (Checkout via WhatsApp)

- **Carrinho Persistente**: Utiliza `localStorage` para manter os itens do orçamento mesmo após o fechamento do navegador.
- **Cálculo em Tempo Real**: Atualização instantânea de quantidades e resumo de itens na página de orçamento.
- **Integração com WhatsApp**: Geração automática de mensagens formatadas contendo a lista de produtos, quantidades, dados do cliente e observações de entrega.

### 2. Catálogo Dinâmico

- **Filtros Avançados**: Filtragem de produtos por categorias (Novos, Reformados, etc.) sem recarregamento de página.
- **Busca em Tempo Real**: Sistema de busca que filtra cards de produtos instantaneamente conforme a digitação.
- **Modais de Detalhes**: Visualização técnica detalhada de cada item utilizando uma estrutura de modal reutilizável via JavaScript.

### 3. Interface e Animações

- **Scroll Reveal**: Animações de entrada suaves conforme o usuário navega pela página.
- **Design Responsivo**: Layout totalmente adaptado para dispositivos móveis, tablets e desktops.
- **Componentes Modernos**: Integração com Swiper.js para depoimentos e Phosphor/Tabler Icons para uma interface limpa.

## 🎨 Arquitetura de CSS e Classes Utilitárias

O projeto foi construído utilizando uma metodologia inspirada em _Atomic CSS_, priorizando a reutilização de código e a manutenção simplificada através de classes utilitárias.

### Escala de Espaçamento

Utilizamos uma escala lógica baseada em múltiplos de **8px**, facilitando o alinhamento e a consistência visual:

- `.m-1` (4px) até `.m-5` (32px) / `.mt-6` (48px).
- Mesma lógica aplicada para `padding` (`p-`, `pt-`, `pb-`).

### Sistema Tipográfico

As fontes são padronizadas através de variáveis `:root` e aplicadas via classes utilitárias:

- `.text-title`: Utiliza a fonte **Lora** (Serifada) para títulos elegantes.
- `.text-ui`: Utiliza **Barlow Condensed** para elementos de interface e botões.
- `.text-body`: Utiliza **Barlow** para textos de leitura.
- Utilitários de peso: `.fw-bold` (700), `.fw-black` (800), etc.

### Helpers de Layout (Flexbox & Grid)

Para evitar a repetição de regras no arquivo CSS, foram criados utilitários de alinhamento:

- `.d-flex`, `.d-grid`, `.flex-column`.
- `.justify-center`, `.align-center`, `.justify-between`.
- `.gap-1` a `.gap-5`: Gerenciamento de espaçamento entre itens de forma flexível.

## 🛠️ Tecnologias Utilizadas

- **HTML5** (Semântico)
- **CSS3** (Variáveis, Flexbox, Grid, Animações)
- **Vanilla JavaScript** (ES6+, DOM Manipulation, LocalStorage)
- **Bibliotecas Externas**:
  - Swiper.js (Carrosséis)
  - Phosphor Icons
  - Tabler Icons

## ⚙️ Como executar o projeto

1. Clone o repositório.
2. Certifique-se de que as imagens estão na pasta `img/`.
3. Abra o arquivo `index.html` em qualquer navegador moderno.

---

_Este projeto faz parte de um portfólio de desenvolvimento Front-end focado em soluções industriais e conversão de vendas._
