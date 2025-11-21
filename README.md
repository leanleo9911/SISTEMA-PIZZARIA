# 🍕 Sistema de Gestão de Pizzaria

Sistema completo de gestão para pizzarias com painel administrativo e interface de pedidos online para clientes. **100% responsivo** para desktop, tablet e celular.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-green)
![Deploy](https://img.shields.io/badge/deploy-Vercel%20%2B%20Render-success)

---

## 📋 Índice

- [Sobre o Sistema](#-sobre-o-sistema)
- [Demo Online](#-demo-online)
- [Funcionalidades](#-funcionalidades)
- [Requisitos](#-requisitos)
- [Instalação Rápida](#-instalação-rápida)
- [Configuração .env](#️-configuração-env)
- [Dependências Essenciais](#-dependências-essenciais)
- [Configuração Completa](#️-configuração-completa)
- [Acessando o Sistema](#-acessando-o-sistema)
- [Comandos Úteis](#-comandos-úteis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Segurança](#-segurança)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Deploy em Produção](#-deploy-em-produção)
- [Suporte e Documentação](#-suporte-e-documentação)
- [Recursos Destacados](#-recursos-destacados)

---

## 🎯 Sobre o Sistema

Sistema web moderno e completo para gestão de pizzarias que oferece:

- **Painel Administrativo**: Gerenciamento completo de pedidos, clientes, produtos e relatórios
- **Interface Pública de Pedidos**: Página otimizada para clientes fazerem pedidos online com validação visual
- **100% Responsivo**: Interface adaptativa para celular, tablet e desktop
- **Sistema Offline**: Pedidos são salvos localmente e sincronizados automaticamente quando a conexão voltar
- **Autenticação JWT**: Sistema seguro de login com tokens
- **Banco de Dados SQLite**: Leve e sem necessidade de servidor externo
- **Validação Inteligente**: Campos obrigatórios são destacados visualmente em vermelho
- **Integração ViaCEP**: Preenchimento automático de endereço pelo CEP
- **Proteção contra Abuso**: Rate limiting configurado (500 requisições/15min)
- **Deploy em Nuvem**: Pronto para produção (Vercel + Render.com)

---

## 🌐 Demo Online

### 🔴 Sistema em Produção (Gratuito)

**Frontend (Vercel):**
- 🌐 **URL:** https://bella-napoli-pizzas.vercel.app
- 📱 **Interface Pública:** https://bella-napoli-pizzas.vercel.app/pedidos-cliente
- 🔐 **Admin:** https://bella-napoli-pizzas.vercel.app/login

**Backend (Render.com):**
- 🚀 **API:** https://pizzaria-backend-eqcg.onrender.com
- ✅ **Health Check:** https://pizzaria-backend-eqcg.onrender.com/health

> ⚠️ **Nota:** O backend em Render Free Tier "dorme" após 15min de inatividade. A primeira requisição pode demorar ~30 segundos para "acordar" o servidor.

---

## ✨ Funcionalidades

### Painel Administrativo
- ✅ Dashboard com estatísticas em tempo real
- ✅ Gestão completa de clientes (CRUD)
- ✅ Gestão de produtos e cardápio (Pizza, Bebida, Porção, Sobremesa)
- ✅ Controle de pedidos com status e ordenação crescente
- ✅ Relatórios de vendas e produtos mais vendidos
- ✅ Sistema de autenticação e autorização JWT
- ✅ **Interface 100% responsiva para mobile** (cards em vez de tabelas)
- ✅ **Menu lateral deslizante em celular** com overlay

### Interface Pública de Pedidos
- ✅ Catálogo de produtos por categoria (Pizza, Bebida, Porção, Sobremesa)
- ✅ Filtros dinâmicos por tipo de produto (corrigido: pizza, bebida, porção, sobremesa)
- ✅ Carrinho de compras interativo
- ✅ **100% responsivo** - layout adaptativo para celular, tablet e desktop
- ✅ **Validação visual de campos obrigatórios** (borda vermelha em campos vazios)
- ✅ **Sistema offline** - pedidos salvos localmente e enviados automaticamente
- ✅ Validação de email e telefone com formatação automática
- ✅ Integração com ViaCEP para preenchimento automático de endereço
- ✅ Estimativa de tempo de preparo e entrega
- ✅ Múltiplas formas de pagamento (Dinheiro, Cartão, Pix)
- ✅ **Campos de pagamento dinâmicos** (troco para dinheiro, modal PIX, info cartão)
- ✅ **Sem alertas intrusivos** - feedback visual em tempo real

### Recursos Técnicos Avançados
- ✅ **Sincronização offline** com localStorage e auto-sync
- ✅ **Rate limiting otimizado** (500 req/15min geral, 20 login/15min, 5 pedidos públicos/hora)
- ✅ **Geração de comprovantes** - Download automático de arquivos TXT no navegador
- ✅ **Email automático de comprovantes** - Sistema de envio via Nodemailer (opcional)
- ✅ Validação de dados em backend e frontend
- ✅ Soft delete (dados preservados para auditoria)
- ✅ Logger personalizado seguro para produção
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado (aceita todos os domínios *.vercel.app)
- ✅ SQLite com modo WAL para melhor performance
- ✅ **Deploy automático** via GitHub (Vercel + Render)

---

## 📦 Requisitos

### Software Necessário

| Software | Versão Mínima | Versão Recomendada |
|----------|---------------|-------------------|
| Node.js  | 18.x          | 20.x ou superior  |
| npm      | 9.x           | 10.x ou superior  |
| Navegador| -             | Chrome, Firefox, Edge (última versão) |

### Sistema Operacional
- ✅ Windows 10/11
- ✅ macOS 11+
- ✅ Linux (Ubuntu 20.04+, Debian 11+)

### Hardware Mínimo
- **RAM**: 4 GB (8 GB recomendado)
- **Disco**: 2 GB livre
- **CPU**: Dual-core 2.0 GHz

---

## 🚀 Instalação Rápida

### 🌐 Opção 1: Usar Demo Online (Sem Instalação)

Acesse o sistema já deployado gratuitamente:
- **Fazer Pedidos:** https://bella-napoli-pizzas.vercel.app/pedidos-cliente
- **Admin:** https://bella-napoli-pizzas.vercel.app/login (admin@pizzaria.com / Pizzabela2025)

### 💻 Opção 2: Instalação Local

#### 📋 COMANDOS ESSENCIAIS (Copie e Cole)

#### 1️⃣ Instalar Backend (Pasta Raiz)
```bash
npm install express@4.18.2 sqlite3@5.1.7 jsonwebtoken@9.0.2 bcryptjs@2.4.3 helmet@7.1.0 cors@2.8.5 express-validator@7.0.1 express-rate-limit@7.1.5 dotenv@16.3.1 && npm install --save-dev nodemon@3.0.2 concurrently@8.2.2
```

#### 2️⃣ Instalar Frontend
```bash
cd frontend && npm install react@18.2.0 react-dom@18.2.0 react-router-dom@6.21.0 axios@1.6.5 react-icons@5.0.1 && npm install --save-dev react-scripts@5.0.1 && cd ..
```

#### 3️⃣ Gerar JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie o resultado e cole no arquivo `.env` (crie se não existir).

#### 4️⃣ Criar Banco de Dados
```bash
node backend/database/init.js
```
⚠️ **Anote a senha do admin!**

#### 5️⃣ Executar o Sistema
```bash
npm run dev
```

### ✅ Acessar o Sistema
- **Painel Admin**: http://localhost:3000/login
- **Pedidos Públicos**: http://localhost:3000/pedidos-cliente
- **Demo Online**: https://bella-napoli-pizzas.vercel.app

---

## 📦 Lista Completa de Bibliotecas

### Backend (11 pacotes)
```bash
# Produção (9):
express@4.18.2
sqlite3@5.1.7
jsonwebtoken@9.0.2
bcryptjs@2.4.3
helmet@7.1.0
cors@2.8.5
express-validator@7.0.1
express-rate-limit@7.1.5
dotenv@16.3.1

# Desenvolvimento (2):
nodemon@3.0.2
concurrently@8.2.2
```

### Frontend (6 pacotes)
```bash
# Produção (5):
react@18.2.0
react-dom@18.2.0
react-router-dom@6.21.0
axios@1.6.5
react-icons@5.0.1

# Desenvolvimento (1):
react-scripts@5.0.1
```

### Email (Opcional - para comprovantes automáticos)
```bash
# Backend adicional:
nodemailer@6.9.7
```

---

## ⚙️ Configuração .env

Crie o arquivo `.env` na raiz do projeto:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=cole_aqui_o_resultado_do_comando_de_geracao
JWT_EXPIRES_IN=8h
DB_PATH=./backend/database/pizzaria.db
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:3000

# Email (Opcional - para comprovantes automáticos)
EMAIL_SERVICE=gmail
EMAIL_USER=seu.email@gmail.com
EMAIL_PASSWORD=sua_senha_app_gmail
```

> **💡 Nota:** As variáveis de email são opcionais. O sistema funciona perfeitamente sem elas - os comprovantes serão apenas baixados como arquivo TXT no navegador.

---

## 📦 Dependências Essenciais

### Backend (11 pacotes)

#### Produção (9 pacotes obrigatórios)

| Pacote | Versão | Tamanho | Propósito |
|--------|--------|---------|-----------|
| **express** | 4.18.2 | ~200KB | Framework web servidor |
| **sqlite3** | 5.1.7 | ~6MB | Banco de dados leve |
| **jsonwebtoken** | 9.0.2 | ~50KB | Autenticação JWT |
| **bcryptjs** | 2.4.3 | ~40KB | Hash de senhas (alternativa ao bcrypt nativo) |
| **helmet** | 7.1.0 | ~20KB | Headers de segurança HTTP |
| **cors** | 2.8.5 | ~10KB | Cross-Origin Resource Sharing |
| **express-validator** | 7.0.1 | ~100KB | Validação de dados |
| **express-rate-limit** | 7.1.5 | ~30KB | Rate limiting contra ataques |
| **dotenv** | 16.3.1 | ~15KB | Variáveis de ambiente |

**Total Backend (Produção)**: ~6.5MB

#### Desenvolvimento (2 pacotes opcionais)

| Pacote | Versão | Tamanho | Propósito |
|--------|--------|---------|-----------|
| **nodemon** | 3.0.2 | ~5MB | Auto-reload do servidor (dev) |
| **concurrently** | 8.2.2 | ~1MB | Executar múltiplos comandos (dev) |

**Total Backend (Dev)**: ~6MB

### Frontend (5 pacotes)

#### Produção (5 pacotes obrigatórios)

| Pacote | Versão | Tamanho | Propósito |
|--------|--------|---------|-----------|
| **react** | 18.2.0 | ~300KB | Biblioteca UI |
| **react-dom** | 18.2.0 | ~200KB | Renderização DOM |
| **react-router-dom** | 6.21.0 | ~150KB | Roteamento SPA |
| **axios** | 1.6.5 | ~100KB | Cliente HTTP |
| **react-icons** | 5.0.1 | ~2MB | Ícones (apenas usados são incluídos no build) |

**Total Frontend (Produção)**: ~2.75MB

#### Desenvolvimento (1 pacote obrigatório)

| Pacote | Versão | Tamanho | Propósito |
|--------|--------|---------|-----------|
| **react-scripts** | 5.0.1 | ~220MB | Webpack, Babel, ESLint (dev) |

> ⚠️ **NOTA**: react-scripts é pesado mas NECESSÁRIO para desenvolvimento React. Em produção, você só usa o build otimizado (~500KB).

### Resumo Total

```
Backend Produção:     ~6.5MB   (9 pacotes)
Backend Dev:          ~6MB     (2 pacotes)
Frontend Produção:    ~2.75MB  (5 pacotes)
Frontend Dev:         ~220MB   (1 pacote - react-scripts)
─────────────────────────────────────────
TOTAL DESENVOLVIMENTO: ~235MB  (17 pacotes)
TOTAL PRODUÇÃO:        ~9.25MB (14 pacotes)
```

### Alternativa: Instalação Ainda Mais Leve

Se quiser reduzir ainda mais, você pode:

1. **Substituir bcryptjs por bcrypt nativo** (mais rápido, mas requer compilação):
```bash
npm uninstall bcryptjs
npm install bcrypt@5.1.1 --save
```

2. **Não instalar dependências de dev**:
```bash
# Pular nodemon e concurrently
# Executar diretamente:
node backend/server.js
```

3. **Build do frontend em outra máquina**:
```bash
# Na máquina de build:
cd frontend
npm run build

# Copiar pasta frontend/build/ para servidor
# Servidor só precisa servir arquivos estáticos (sem react-scripts)
```

---

## 🔧 Instalação por Categoria

### Mínimo Absoluto (Backend Apenas - ~6.5MB)

```bash
npm install express sqlite3 jsonwebtoken bcryptjs helmet cors express-validator express-rate-limit dotenv --save
```

### Backend Completo com Dev Tools (~12.5MB)

```bash
npm install express sqlite3 jsonwebtoken bcryptjs helmet cors express-validator express-rate-limit dotenv --save
npm install nodemon concurrently --save-dev
```

### Frontend Mínimo (~2.75MB - sem dev tools)

```bash
cd frontend
npm install react react-dom react-router-dom axios react-icons --save
```

### Frontend Completo (~223MB - com ferramentas de build)

```bash
cd frontend
npm install react react-dom react-router-dom axios react-icons --save
npm install react-scripts --save-dev
```

---

## ⚡ Comando Rápido (Tudo de Uma Vez)

Se você confia no package.json e quer instalar tudo:

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

**Tamanho total**: ~400-500MB (inclui todas as sub-dependências)

---

## 💡 Recomendações de Instalação

### Para Desenvolvimento Local

```bash
# Instale tudo (mais fácil para desenvolver)
npm install
cd frontend && npm install && cd ..
```

### Para Servidor de Produção

```bash
# Backend: Apenas produção
npm install --production

# Frontend: Build em outra máquina, copie apenas frontend/build/
# Servidor produção pode servir arquivos estáticos com nginx ou express.static
```

### Para Máquinas com Pouco Espaço

```bash
# Backend: Mínimo absoluto
npm install express sqlite3 jsonwebtoken bcryptjs helmet cors express-validator express-rate-limit dotenv --save

# Frontend: Use CDN para React (sem npm)
# Ou faça build em outra máquina e copie apenas /build
```

---

## ⚙️ Configuração Completa

### Arquivo .env (Backend)

O arquivo `.env` já vem pré-configurado com valores seguros:

```env
# Servidor
PORT=5000
NODE_ENV=development

# JWT (128 caracteres aleatórios)
JWT_SECRET=<valor_aleatorio_seguro>
JWT_EXPIRES_IN=8h

# Banco de Dados
DB_PATH=./backend/database/pizzaria.db

# Segurança
BCRYPT_ROUNDS=10

# CORS
FRONTEND_URL=http://localhost:3000

# Email (Opcional - para envio de comprovantes automáticos)
EMAIL_SERVICE=gmail
EMAIL_USER=seu.email@gmail.com
EMAIL_PASSWORD=sua_senha_app_gmail
```

> **💡 Nota:** Configurações de email são opcionais. Sem elas, comprovantes serão apenas baixados como TXT no navegador.

### Arquivo .env (Frontend)

Criado automaticamente em `frontend/.env`:

```env
SKIP_PREFLIGHT_CHECK=true
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
ALLOWED_HOSTS=localhost
WDS_SOCKET_PORT=0
```

### Configuração de Produção

Para ambiente de produção:

```env
NODE_ENV=production
FRONTEND_URL=https://seu-dominio.com
```

---

## 🎮 Como Rodar o Sistema

### ▶️ Opção 1: Tudo Junto (Recomendado)
```bash
npm run dev
```
Inicia backend (porta 5000) + frontend (porta 3000) simultaneamente.

### ▶️ Opção 2: Separadamente

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 🏭 Opção 3: Produção
```bash
# Build otimizado do frontend
npm run build

# Executar backend em produção
npm start
```

### 🔍 Verificar se está Funcionando
```bash
# Testar backend
curl http://localhost:5000/api/health

# Abrir no navegador
# Admin: http://localhost:3000/login
# Público: http://localhost:3000/pedidos
```

---

## 🏗️ Estrutura do Projeto

```
SISTEMA-PIZZARIA/
├── backend/
│   ├── database/
│   │   ├── connection.js      # Conexão SQLite + wrappers async
│   │   ├── init.js            # Inicialização do banco
│   │   ├── limpar-dados.js    # Script de limpeza (pedidos/clientes)
│   │   ├── limpar-tudo.js     # Script de limpeza total
│   │   ├── verificar-produtos.js # Verificar produtos disponíveis
│   │   └── pizzaria.db        # Banco de dados SQLite
│   ├── middlewares/
│   │   └── auth-middleware.js # Autenticação JWT
│   ├── routes/
│   │   ├── route-auth.js      # Login e registro
│   │   ├── route-clientes.js  # CRUD de clientes
│   │   ├── route-produtos.js  # CRUD de produtos (público + admin)
│   │   ├── route-pedidos.js   # CRUD de pedidos (ordenação ASC)
│   │   └── route-relatorios.js # Dashboard e relatórios
│   ├── utils/
│   │   └── logger.js          # Logger personalizado
│   ├── app-server.js          # Servidor Express (rate limit otimizado)
│   └── server.js              # Entry point
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── service-worker.js  # Service Worker para PWA
│   │   └── sync-manager.js    # Gerenciador de sincronização offline
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js      # Layout com menu
│   │   │   └── PrivateRoute.js # Rotas protegidas
│   │   ├── contexts/
│   │   │   └── AuthContext.js # Contexto de autenticação
│   │   ├── pages/
│   │   │   ├── Page-Login.js       # Página de login
│   │   │   ├── Page-Dashboard.js   # Dashboard admin
│   │   │   ├── Page-Clientes.js    # Gestão de clientes
│   │   │   ├── Page-Produtos.js    # Gestão de produtos
│   │   │   ├── Page-Pedidos.js     # Gestão de pedidos (admin)
│   │   │   ├── Page-Relatorios.js  # Relatórios
│   │   │   ├── Page-PedidosCliente.js # Interface pública (validação visual)
│   │   │   └── styles.css          # Estilos globais (com .campo-erro)
│   │   ├── services/
│   │   │   └── api.js         # Cliente Axios
│   │   ├── App.js
│   │   └── index.js
│   ├── .env                   # Variáveis de ambiente do frontend
│   └── package.json
│
├── .env                       # Variáveis de ambiente do backend
├── .gitignore
├── package.json               # Scripts principais
├── README.md
├── INICIO_RAPIDO.md          # Guia de início rápido
├── ANALISE_CRITICA_COMPLETA.md # Análise técnica
└── RESUMO_CORRECOES.md       # Histórico de correções
```

---

## 🛠️ Tecnologias Utilizadas

### Backend (9 dependências de produção)

| Biblioteca | Versão | Tamanho | Essencial | Propósito |
|-----------|--------|---------|-----------|-----------|
| **express** | 4.18.2 | ~200KB | ✅ SIM | Framework web servidor |
| **sqlite3** | 5.1.7 | ~6MB | ✅ SIM | Banco de dados leve sem servidor externo |
| **jsonwebtoken** | 9.0.2 | ~50KB | ✅ SIM | Autenticação JWT stateless |
| **bcryptjs** | 2.4.3 | ~40KB | ✅ SIM | Hash de senhas seguro (10 rounds) |
| **helmet** | 7.1.0 | ~20KB | ✅ SIM | Headers de segurança HTTP |
| **cors** | 2.8.5 | ~10KB | ✅ SIM | Cross-Origin Resource Sharing |
| **express-validator** | 7.0.1 | ~100KB | ✅ SIM | Validação e sanitização de dados |
| **express-rate-limit** | 7.1.5 | ~30KB | ✅ SIM | Rate limiting contra força bruta |
| **dotenv** | 16.3.1 | ~15KB | ✅ SIM | Carregar variáveis de ambiente |

**Total Backend**: ~6.5MB

### Frontend (5 dependências de produção)

| Biblioteca | Versão | Tamanho | Essencial | Propósito |
|-----------|--------|---------|-----------|-----------|
| **react** | 18.2.0 | ~300KB | ✅ SIM | Biblioteca para construir UI |
| **react-dom** | 18.2.0 | ~200KB | ✅ SIM | Renderização do React no DOM |
| **react-router-dom** | 6.21.0 | ~150KB | ✅ SIM | Roteamento SPA (navegação sem reload) |
| **axios** | 1.6.5 | ~100KB | ✅ SIM | Cliente HTTP com interceptors |
| **react-icons** | 5.0.1 | ~2MB | ⚠️ OPCIONAL | Ícones (pode usar FontAwesome CDN) |

**Total Frontend**: ~2.75MB

### Ferramentas de Desenvolvimento (3 dependências - APENAS para dev)

| Ferramenta | Versão | Tamanho | Essencial | Propósito |
|-----------|--------|---------|-----------|-----------|
| **nodemon** | 3.0.2 | ~5MB | ⚠️ OPCIONAL | Auto-reload do servidor (dev) |
| **concurrently** | 8.2.2 | ~1MB | ⚠️ OPCIONAL | Executar backend + frontend juntos |
| **react-scripts** | 5.0.1 | ~220MB | ✅ SIM (dev) | Webpack, Babel, ESLint (build React) |

**Total Dev**: ~226MB

> 💡 **DICA**: Em produção, você não precisa de `react-scripts`. Faça o build (`npm run build`) em outra máquina e copie apenas a pasta `frontend/build/` (~500KB)

---

## 🔒 Segurança

### Medidas Implementadas

✅ **Autenticação JWT** com tokens de 8 horas de validade  
✅ **Senhas hasheadas** com bcrypt (10 rounds)  
✅ **JWT_SECRET aleatório** de 128 caracteres  
✅ **Rate Limiting Otimizado**:
- 500 requisições/15min (geral) - aumentado para suportar mais usuários
- 20 tentativas de login/15min - aumentado para melhor UX
- 5 pedidos públicos/hora

✅ **Headers de Segurança** (Helmet):
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection

✅ **Validação de Entrada**:
- Backend: express-validator com regras personalizadas
- Frontend: Validação visual em tempo real com destaque vermelho
- Formatação automática de telefone e CEP

✅ **Proteção SQL Injection**:
- Prepared statements em todas as queries
- Sanitização de wildcards em buscas

✅ **Soft Delete**: Dados preservados para auditoria  
✅ **Logger Seguro**: Sem stack traces em produção  
✅ **CORS Configurado**: Apenas origem autorizada  
✅ **Sistema Offline Seguro**: Dados criptografados no localStorage

---

## 🌐 API Endpoints

### Autenticação
```
POST   /api/auth/login       # Login (público)
POST   /api/auth/register    # Criar usuário (admin apenas)
GET    /api/auth/verify      # Verificar token
```

### Clientes
```
GET    /api/clientes         # Listar clientes
GET    /api/clientes/:id     # Buscar cliente
POST   /api/clientes         # Criar cliente
PUT    /api/clientes/:id     # Atualizar cliente
DELETE /api/clientes/:id     # Desativar cliente (soft delete)
```

### Produtos
```
GET    /api/produtos/publico # Listar produtos (público)
GET    /api/produtos         # Listar produtos (admin)
GET    /api/produtos/:id     # Buscar produto
POST   /api/produtos         # Criar produto
PUT    /api/produtos/:id     # Atualizar produto
DELETE /api/produtos/:id     # Deletar produto
```

### Pedidos
```
POST   /api/pedidos/publico  # Criar pedido (público)
GET    /api/pedidos          # Listar pedidos
GET    /api/pedidos/:id      # Buscar pedido
POST   /api/pedidos          # Criar pedido (admin)
PATCH  /api/pedidos/:id/status # Atualizar status
DELETE /api/pedidos/:id      # Cancelar pedido
POST   /api/pedidos/gerar-comprovantes # Gerar comprovantes TXT
DELETE /api/pedidos/resetar-todos # Reset manual
```

### Relatórios
```
GET    /api/relatorios/dashboard # Dashboard estatísticas
GET    /api/relatorios/vendas    # Relatório de vendas
```

### Health Check
```
GET    /api/health           # Verificar status da API
```

---

## 📱 Acessando o Sistema

### 🌐 Demo Online (Sem Instalação)
- **Pedidos Públicos:** https://bella-napoli-pizzas.vercel.app/pedidos-cliente
- **Painel Admin:** https://bella-napoli-pizzas.vercel.app/login
- **Credenciais:** admin@pizzaria.com / Pizzabela2025

### 💻 Instalação Local

#### Painel Administrativo
1. Acesse: http://localhost:3000/login
2. Use as credenciais geradas em `npm run init-db`
3. **Troque a senha** no primeiro login

#### Interface Pública (Pedidos)
Acesse: http://localhost:3000/pedidos-cliente

---

## 🔧 Comandos Úteis

### 🚀 Executar Sistema
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Backend + Frontend juntos (desenvolvimento) |
| `npm run server` | Apenas backend com auto-reload |
| `npm run client` | Apenas frontend |
| `npm start` | Backend produção (sem auto-reload) |
| `npm run build` | Build frontend otimizado |

### 💾 Banco de Dados
| Comando | Descrição |
|---------|-----------|
| `node backend/database/init.js` | Criar/recriar banco + admin |
| `node backend/database/verificar-produtos.js` | Ver produtos disponíveis |
| `node backend/database/limpar-dados.js` | Limpar pedidos e clientes |
| `node backend/database/limpar-tudo.js` | Limpar TUDO (⚠️ cuidado!) |

### 🔍 Verificações
| Comando | Descrição |
|---------|-----------|
| `npm audit` | Verificar vulnerabilidades |
| `npm audit fix` | Corrigir vulnerabilidades |
| `curl http://localhost:5000/api/health` | Testar backend |

---

## � Acessando o Sistema

### Painel Administrativo

1. Acesse: **http://localhost:3000/login**
2. Use as credenciais geradas em `npm run init-db`
3. **Importante**: Troque a senha no primeiro login

**Funcionalidades Admin:**
- Dashboard com estatísticas
- Gestão de clientes
- Gestão de produtos (adicionar, editar, remover)
- Visualização de pedidos (ordem crescente por ID)
- Relatórios de vendas

### Interface Pública de Pedidos

Acesse: **http://localhost:3000/pedidos**

**Funcionalidades do Cliente:**
- Navegar pelo cardápio (Pizza, Bebida, Porção, Sobremesa)
- Filtrar produtos por categoria
- Adicionar produtos ao carrinho
- Preencher dados de entrega (com validação visual)
- CEP com preenchimento automático
- Estimativa de tempo de preparo e entrega
- **Sistema offline** - pedidos salvos e enviados automaticamente

**Validação Visual:**
- Campos obrigatórios vazios ficam com **borda vermelha**
- Ao preencher, a borda vermelha desaparece automaticamente
- Sem pop-ups ou alertas intrusivos

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

**Solução 1: Reinstalar apenas o pacote faltando**
```bash
# Exemplo: se faltar express
npm install express@4.18.2 --save

# Se faltar no frontend
cd frontend
npm install react@18.2.0 --save
cd ..
```

**Solução 2: Reinstalar tudo (mais pesado)**
```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

**Solução 3: Verificar se está na pasta correta**
```bash
# Backend deve ter node_modules/ na raiz
ls node_modules/

# Frontend deve ter node_modules/ dentro de frontend/
ls frontend/node_modules/
```

### Problema: "Port already in use" (Porta em uso)

**Windows (PowerShell):**
```powershell
# Encontrar processo na porta 5000 (backend)
netstat -ano | findstr :5000

# Matar processo (substitua <PID> pelo número encontrado)
taskkill /PID <PID> /F

# Para a porta 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Encontrar e matar processo
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Problema: "JWT_SECRET not defined"

O `.env` já vem configurado. Se necessário, gere um novo:

```bash
# Gerar novo JWT_SECRET (128 caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado e substitua no arquivo `.env`.

### Problema: "Database locked" (Banco bloqueado)

```bash
# Pare o servidor e remova arquivos de lock
rm backend/database/*.db-shm
rm backend/database/*.db-wal

# Ou no Windows PowerShell:
del backend\database\*.db-shm
del backend\database\*.db-wal
```

### Problema: Esqueci a senha do admin

```bash
# Reinicialize o banco (⚠️ ATENÇÃO: apaga todos os dados!)
npm run init-db

# Anote a nova senha temporária mostrada no terminal
```

### Problema: Frontend não conecta no backend

1. Verifique se o proxy está configurado em `frontend/package.json`:
```json
"proxy": "http://localhost:5000"
```

2. Verifique se o backend está rodando:
```bash
# Teste direto na API
curl http://localhost:5000/api/health
```

3. Verifique o `.env` do frontend em `frontend/.env`

### Problema: Produtos não aparecem na página pública

```bash
# Verifique se há produtos disponíveis
node backend/database/verificar-produtos.js

# Se necessário, adicione produtos pelo painel admin
# Acesse: http://localhost:3000/produtos
```

### Problema: "Module not found: Can't resolve 'react'"

Isso significa que o React não foi instalado no frontend:

```bash
cd frontend
npm install react@18.2.0 react-dom@18.2.0 --save
cd ..
```

### Problema: Sistema muito pesado após `npm install`

**Causa**: O `npm install` instalou TODAS as dependências, incluindo sub-dependências.

**Solução 1: Limpar e instalar apenas essenciais**
```bash
# Remover node_modules
rm -rf node_modules
rm -rf frontend/node_modules

# Instalar APENAS essenciais (veja seção "Instalação Otimizada")
npm install express sqlite3 jsonwebtoken bcryptjs helmet cors express-validator express-rate-limit dotenv --save
```

**Solução 2: Usar npm ci (mais rápido e limpo)**
```bash
npm ci  # Instala exatamente o que está no package-lock.json
```

**Solução 3: Usar --production em servidor**
```bash
npm install --production  # Pula dependências de dev (nodemon, concurrently)
```

### Problema: Erro 429 (Too Many Requests)

O rate limit foi aumentado para 500 requisições/15min. Se ainda assim estiver limitando:

1. Edite `backend/app-server.js`
2. Localize a seção `rateLimiter`
3. Aumente o valor de `max`:
```javascript
max: 1000, // era 500
```

### Problema: Pedidos não sincronizam offline

1. Verifique o console do navegador (F12)
2. Verifique se o `sync-manager.js` está carregado
3. Teste a conexão:
```javascript
// No console do navegador
syncManager.getPendingCount()
```

---

## 📊 Comparação de Tamanhos

### Instalação Completa (`npm install`)
```
Backend node_modules:      ~150-200MB  (inclui todas sub-dependências)
Frontend node_modules:     ~350-400MB  (react-scripts + webpack + babel)
─────────────────────────────────────────────
TOTAL:                     ~500-600MB
```

### Instalação Otimizada (Manual)
```
Backend node_modules:      ~20-30MB    (apenas dependências diretas)
Frontend node_modules:     ~250-300MB  (react-scripts é inevitável em dev)
─────────────────────────────────────────────
TOTAL:                     ~270-330MB
```

### Produção (Build)
```
Backend node_modules:      ~20-30MB    (sem nodemon/concurrently)
Frontend build/:           ~500KB-1MB  (apenas arquivos compilados)
─────────────────────────────────────────────
TOTAL:                     ~20-31MB
```

---

## 💡 Dicas de Uso

### Para Administradores

1. **Adicione produtos antes de abrir para clientes**
   - Acesse: `/produtos`
   - Tipos: Pizza, Bebida, Porção, Sobremesa
   - Marque como "Disponível"

2. **Acompanhe pedidos em tempo real**
   - Acesse: `/pedidos`
   - Pedidos aparecem em ordem crescente (mais antigos primeiro)

3. **Verifique relatórios periodicamente**
   - Acesse: `/relatorios`
   - Veja produtos mais vendidos
   - Analise período de vendas

### Para Clientes

1. **Navegue pelo cardápio**
   - Use os filtros por categoria
   - Veja descrição e preços

2. **Preencha todos os campos obrigatórios**
   - Campos vazios ficam vermelhos
   - Preencha para a borda voltar ao normal

3. **Use o CEP para preenchimento rápido**
   - Digite o CEP
   - Endereço é preenchido automaticamente

4. **Sistema funciona offline**
   - Pedido é salvo localmente
   - Enviado automaticamente quando conexão voltar

---

## 🚀 Deploy em Produção

### Checklist Pré-Deploy

- [ ] Alterar `NODE_ENV=production` no `.env`
- [ ] Configurar `FRONTEND_URL` para domínio real
- [ ] Trocar senha admin padrão
- [ ] Executar `npm audit fix` 
- [ ] Configurar HTTPS (certificado SSL)
- [ ] Configurar backup automático do banco SQLite
- [ ] Configurar monitoramento (PM2, Sentry)
- [ ] Testar rate limiting em produção
- [ ] Configurar logs de produção
- [ ] Testar sistema offline

### Deploy com PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Build do frontend
cd frontend
npm run build
cd ..

# Iniciar backend com PM2
pm2 start backend/server.js --name pizzaria-api

# Servir frontend com serve
npm install -g serve
pm2 start "serve -s frontend/build -l 3000" --name pizzaria-frontend

# Salvar configuração do PM2
pm2 save
pm2 startup

# Comandos úteis PM2
pm2 status           # Ver status
pm2 logs pizzaria-api # Ver logs
pm2 restart all      # Reiniciar tudo
pm2 stop all         # Parar tudo
```

### Backup do Banco de Dados

```bash
# Backup manual
cp backend/database/pizzaria.db backend/database/backup-$(date +%Y%m%d).db

# Backup automático (adicionar no cron/agendador)
# Diário às 3h da manhã
0 3 * * * cp /caminho/backend/database/pizzaria.db /backup/pizzaria-$(date +\%Y\%m\%d).db
```

---

## 📞 Suporte e Documentação

### 📚 Documentação Adicional

Este projeto possui documentação completa:

1. **Início Rápido** - `INICIO_RAPIDO.md`
   - Comandos essenciais para começar
   - Instalação passo a passo simplificada

2. **Deploy em Produção** - `COMO_COLOQUEI_NA_WEB.md`
   - Tutorial completo de deploy gratuito
   - Vercel (frontend) + Render.com (backend)
   - Configuração de domínio personalizado
   - Troubleshooting de deploy

3. **Análise Técnica** - `ANALISE_CRITICA_COMPLETA.md`
   - Arquitetura do sistema
   - Decisões técnicas e trade-offs
   - Performance e escalabilidade

4. **Análise do Banco de Dados** - `ARTIGO_BANCO_DADOS.md`
   - Modelagem do banco SQLite
   - Normalização e denormalização
   - Críticas e melhorias possíveis

5. **Histórico de Mudanças** - `RESUMO_CORRECOES.md`
   - Todas as correções implementadas
   - Melhorias de funcionalidade
   - Bug fixes

### ❓ Para Dúvidas ou Problemas

1. Verifique a seção [Troubleshooting](#-troubleshooting)
2. Consulte a documentação específica acima
3. Verifique se o sistema está atualizado (`git pull`)

---

## 🌐 Deploy em Produção

### 🚀 Deploy Gratuito (Vercel + Render)

O sistema está configurado para deploy automático:

- **Frontend**: Vercel (auto-deploy via GitHub)
- **Backend**: Render.com (auto-deploy via GitHub)
- **Banco de Dados**: SQLite persistido em disco do Render

**Tutorial completo:** Veja `COMO_COLOQUEI_NA_WEB.md`

### 📋 Checklist Pré-Deploy

✅ Variáveis de ambiente configuradas (JWT_SECRET, NODE_ENV=production)  
✅ CORS configurado para domínio de produção  
✅ Rate limiting ajustado para tráfego esperado  
✅ Backup do banco de dados local  
✅ Email configurado (opcional - Nodemailer)

### ⚙️ Configurações de Produção

```env
# Backend (.env no Render)
NODE_ENV=production
PORT=5000
JWT_SECRET=<seu_secret_de_128_caracteres>
FRONTEND_URL=https://bella-napoli-pizzas.vercel.app

# Email (opcional)
EMAIL_SERVICE=gmail
EMAIL_USER=seu.email@gmail.com
EMAIL_PASSWORD=sua_senha_app_gmail
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🎉 Recursos Destacados

### ✨ Sistema Offline Inteligente
- Pedidos salvos automaticamente no navegador (localStorage)
- Sincronização automática quando conexão voltar
- Indicador visual de pedidos pendentes
- Retry automático com backoff exponencial

### 🎨 Validação Visual Moderna
- Campos obrigatórios destacados em vermelho em tempo real
- Feedback visual imediato sem alertas intrusivos
- Máscaras de formatação automática (telefone, CEP)
- Integração com ViaCEP para preenchimento de endereço

### 📱 100% Responsivo
- **Desktop**: Layout em tabelas, sidebar fixa
- **Tablet**: Layout híbrido, sidebar retrátil
- **Mobile**: Cards em vez de tabelas, menu overlay deslizante
- Touch-friendly: Botões com mínimo 44px de altura
- Zoom prevention: font-size 16px em inputs iOS

### 🚀 Performance Otimizada
- SQLite com modo WAL (Write-Ahead Logging)
- Rate limiting inteligente (500 req/15min geral)
- Build otimizado do React (~500KB gzipped)
- Lazy loading de componentes

### 🔒 Segurança em Primeiro Lugar
- JWT com tokens de 8 horas e renovação automática
- Senhas hasheadas com bcrypt (10 rounds)
- JWT_SECRET de 128 caracteres aleatórios
- Rate limiting contra ataques (20 login/15min)
- Headers de segurança configurados (Helmet)
- Prepared statements contra SQL injection
- Soft delete para auditoria de dados

### 💾 Geração de Comprovantes
- Download automático de arquivos TXT no navegador
- Formato otimizado para impressoras térmicas
- Geração em lote (últimas 24 horas)
- Email automático opcional (Nodemailer)

### 🌐 Deploy em Nuvem Gratuito
- Frontend em Vercel (auto-deploy via GitHub)
- Backend em Render.com (free tier)
- CORS dinâmico aceitando *.vercel.app
- Banco SQLite persistido em disco

---

**Desenvolvido com ❤️ para facilitar a gestão de pizzarias**

---

**Versão:** 2.1.0 | **Última Atualização:** Janeiro 2025 | **Status:** ✅ Deploy Ativo
