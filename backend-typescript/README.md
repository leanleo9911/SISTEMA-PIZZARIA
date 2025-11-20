# 🍕 Backend TypeScript - Sistema de Pizzaria

Conversão completa do backend JavaScript para TypeScript mantendo 100% das funcionalidades.

---

## 🚀 **Instalação e Uso**

```bash
# 1. Instalar dependências
npm install

# 2. Inicializar banco de dados
npm run init-db

# 3. Rodar servidor
npm run dev
```

Servidor disponível em: `http://localhost:5000`

---

## 📝 **Scripts Disponíveis**

```bash
npm run dev        # Desenvolvimento com hot-reload
npm run build      # Compilar TypeScript
npm start          # Produção
npm run init-db    # Criar banco de dados
```

---

## ⚙️ **Configuração**

Copie `.env.example` para `.env` e configure:

```env
JWT_SECRET=sua_chave_secreta_aqui
ADMIN_EMAIL=admin@pizzaria.com
ADMIN_PASSWORD=sua_senha_segura
```

---

## 🔐 **Login Padrão**

- **Email:** `admin@pizzaria.com`
- **Senha:** `Pizzaria@2024`

---

## 📁 **Estrutura**

```
backend-typescript/
├── app-server.ts          # Servidor Express
├── database/              # SQLite + Inicialização
├── routes/                # 5 módulos de rotas
├── middlewares/           # Autenticação JWT
├── utils/                 # Logger
└── types/                 # Definições TypeScript
```

---

## ✅ **O que foi convertido**

- ✅ 11 arquivos JavaScript → TypeScript
- ✅ Autenticação JWT + RBAC
- ✅ Rate Limiting (3 níveis)
- ✅ Validação de inputs
- ✅ SQLite com async wrappers
- ✅ Tipos TypeScript completos

---

## 🆘 **Problemas Comuns**

- **Porta em uso:** Altere `PORT=5001` no `.env`
- **Erro de compilação:** Execute `npm run build`
- **Banco não inicializa:** Delete `database/pizzaria.db` e rode `npm run init-db`

---

**Sistema pronto para uso!** 🎉
