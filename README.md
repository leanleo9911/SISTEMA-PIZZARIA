   # Sistema de Gestão para Pizzaria (Node.js + TypeScript)

   ## Sobre o Sistema
   Este sistema foi desenvolvido para facilitar a gestão completa de uma pizzaria, incluindo cadastro, consulta, atualização e exclusão de clientes, produtos, pedidos, promoções e geração de relatórios. Todos os dados são armazenados em arquivos CSV, e os comprovantes de pedidos são gerados em arquivos TXT na pasta "Comprovantes" da área de trabalho do usuário.

   ---

   ## Requisitos
   - **Node.js** versão 18 ou superior
   - **npm** (gerenciador de pacotes do Node.js)
   - Permissão de escrita na pasta do projeto e na área de trabalho
   - **Git-2.50.1-64-bit** (necessário para clonar o projeto do GitHub e versionar o código)
   ---

   ## Instalação e Execução

   1. **Clone o projeto inteiro** para o seu computador. Recomenda-se salvar a pasta do sistema diretamente na área de trabalho (Desktop) para facilitar o acesso e a execução dos comandos.
   2. **Abra o terminal/cmd** na pasta do projeto.
   3. **Instale as dependências**:
   
   ```
   **Bibliotecas necessárias**
   > **Atenção:** Caso encontre algum problema ao executar os comandos no terminal PowerShell do VS Code, utilize o terminal "Git Bash" no próprio VS Code para evitar erros de compatibilidade.

   **Execute os comandos abaixo para instalar todas as bibliotecas essenciais:**
   
   npm install typescript
   npm install @types/node
   npm install csv-parse
   npm install csv-stringify
   npm install readline-sync
   npm install fs-extra
   npm install dayjs
   ```
   Para rodar TypeScript diretamente (opcional para desenvolvimento):
   npm install --save-dev ts-node
   ```
   **Descrição das bibliotecas:**
   - `typescript`: Compilador TypeScript
   - `@types/node`: Tipos para Node.js
   - `csv-parse`/`csv-stringify`: Manipulação de arquivos CSV
   - `readline-sync`: Entrada interativa no terminal
   - `fs-extra`: Manipulação avançada de arquivos
   - `dayjs`: Manipulação de datas
   4. **Compile o TypeScript para JavaScript**:


   5. **Execute o sistema no terminal**:
   ```
   node dist/main.js
   ```
   **ATENÇÃO OS PASSOS ANTERIORES DEVEM TER SIDO EXECUTADOS**
   Se preferir, você pode criar e executar um arquivo `.bat` (como `Sistema Pizzaria.bat` ou outro nome de sua escolha) para iniciar o sistema de forma prática com um duplo clique:

   ## Como usar o arquivo Sistema Pizzaria.bat

   O arquivo `.bat` serve para facilitar a execução do sistema sem precisar digitar comandos manualmente no terminal. Ele automatiza o processo de abrir a pasta do projeto e rodar o sistema.

   ### Como criar o arquivo Sistema Pizzaria.bat
   1. Abra o Bloco de Notas.
   2. Cole o conteúdo abaixo:
   ```
   @echo off
   cd /d "C:\Users\%USERNAME%\Desktop\SISTEMA-PIZZARIA"
   node dist\main.js
   pause
   ```
   3. Salve o arquivo `.bat` na área de trabalho.

   ### Como funciona
   - Ao dar dois cliques no arquivo `.bat`, ele abre o terminal, entra na pasta do projeto e executa o sistema automaticamente.
   - O comando `pause` mantém a janela aberta após a execução, permitindo ver mensagens ou erros.

   ## Estrutura de Pastas
   - **clientes/**: Cadastro, consulta, atualização e exclusão de clientes
   - **produtos/**: Cadastro, consulta, atualização e exclusão de produtos
   - **pedidos/**: Registro de pedidos e vendas
   - **relatorios/**: Relatórios de vendas
   - **extras/**: Promoções
   - **dist/**: Arquivos JavaScript gerados após compilação

   ---

   ## Funcionamento do Sistema
   O sistema é totalmente interativo via menu principal. As opções disponíveis são:

   1. Menu de Clientes (Cadastrar/Consultar/Atualizar/Excluir)
   2. Menu de Produtos (Cadastrar/Consultar/Atualizar/Excluir)
   3. Menu de Pedidos (Registrar/Consultar/Atualizar)
   4. Ver Relatório de Vendas
   5. Menu de Promoções (Adicionar/Consultar/Atualizar/Excluir)
   0. Sair

   ### Menu de Clientes
   - **Cadastrar Cliente:** Solicita ID, nome completo, data de nascimento, e-mail, telefone, endereço e CEP. Valida todos os campos e impede IDs duplicadas.
   - **Consultar/Atualizar/Excluir Cliente:** Permite consultar dados, atualizar informações ou excluir clientes pelo ID. IDs são renumeradas automaticamente após exclusão.

   ### Menu de Produtos
   - **Cadastrar Produto:** Solicita ID, tipo (Pizza Tradicional, Pizza Especial, Bebida, Porções, Sobremesa, Outro), sabor/nome/tamanho e preço. Valida todos os campos e impede IDs duplicadas.
   - **Consultar/Atualizar/Excluir Produto:** Permite consultar dados, atualizar informações ou excluir produtos pelo ID. IDs são renumeradas automaticamente após exclusão.

   ### Menu de Pedidos
   - **Registrar Pedido:** Permite selecionar cliente, adicionar múltiplos produtos, informar quantidade e forma de pagamento (Dinheiro, Cartão de Crédito/Débito, Pix). Calcula o valor total do pedido, registra no CSV e gera comprovante em TXT na pasta "Comprovantes" da área de trabalho.
   - **Consultar/Atualizar Pedido/Venda:** Permite consultar vendas registradas, atualizar dados ou excluir vendas.

   ### Menu de Promoções
   - **Adicionar Promoção:** Adiciona uma nova promoção ao sistema.
   - **Consultar Promoções:** Lista todas as promoções cadastradas.
   - **Atualizar Promoção:** Permite alterar a descrição de uma promoção existente.
   - **Excluir Promoção:** Remove uma promoção do sistema.

   ### Relatórios
   - **Relatório de Vendas:** Permite consultar vendas por dia (data específica ou hoje) e por mês (mês específico ou atual). Mostra a quantidade de pizzas vendidas.

   ---

   ## Estrutura dos Arquivos CSV

   **clientes.csv**
   ```
   id,nome,data_nascimento,email,telefone,endereco,CEP
   001,João Silva,15/08/1990,joao@email.com,11999999999,Rua das Pizzas,01234-567
   ```

   **produtos.csv**
   ```
   id,tipo,sabor,preco
   001,Pizza Tradicional,Margherita P,35.00
   002,Bebida,Coca-cola 1L,10.00
   ```

   **vendas.csv**
   ```
   data_pedido,cliente,produto,quantidade,valor_total,forma_pagamento
   2025-09-01 19:00:00,João Silva,Margherita P,2,70.00,Pix
   ```

   **promocoes.csv**
   ```
   Promoção 1: Pizza em dobro toda terça-feira
   Promoção 2: Refrigerante grátis nas compras acima de R$50
   ```

   ---

   ## Geração de Comprovantes
   - Após registrar um pedido, um comprovante em TXT é gerado automaticamente na pasta "Comprovantes" que é gerada automaticamente no Desktop do usuário.
   - O nome do arquivo segue o padrão:  `comprovante_<nome_cliente>_<data>.txt`

   ### Como acessar a pasta dos comprovantes
   ```
   C:\Users\<SeuUsuario> (EX:Adin)\Desktop\Comprovantes
   ```
   1. Abra o **Explorador de Arquivos** do Windows.
   2. Navegue até **Este Computador** > **Disco Local (C:)** > **Users** > **SeuUsuario** > **Desktop**.
   3. Localize e abra a pasta chamada **Comprovantes**.

   ---

   ## Validações e Barreiras
   - Todos os campos de cadastro possuem validação para evitar dados inválidos (exemplo: formato de e-mail, CEP, telefone, preço, etc).
   - IDs duplicadas são impedidas.
   - Não é possível registrar pedidos sem clientes ou produtos cadastrados.
   - Exclusão de clientes/produtos renumera os IDs para manter a ordem.

   ---

   ## Dicas de Uso
   - Sempre cadastre clientes e produtos antes de registrar pedidos.
   - Use IDs sequenciais e únicos para facilitar a organização.
   - Consulte relatórios regularmente para acompanhar as vendas.
   - Mantenha as promoções atualizadas para atrair mais clientes.

   ---

   ## Solução de Problemas
   - Se aparecer erro de permissão, execute o terminal/cmd como administrador.
   - Se algum arquivo CSV estiver corrompido, apague e gere novamente pelo sistema.
   - Para dúvidas, consulte o código-fonte ou entre em contato com o desenvolvedor.

   ---

   ## Contato
   Para dúvidas, sugestões ou problemas, entre em contato com o desenvolvedor ou abra uma issue no repositório.

   ## Observação sobre Acentuação
   Algumas palavras exibidas no terminal podem aparecer sem acentuação correta, dependendo da configuração do terminal ou do sistema operacional.  
   Isso não interfere no funcionamento do sistema, apenas na exibição dos textos.  
   Caso note ausência de acentos, saiba que é apenas uma limitação visual do ambiente e não afeta os dados ou operações do sistema.
