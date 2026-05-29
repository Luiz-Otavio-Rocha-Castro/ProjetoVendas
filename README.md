# Projeto Vendas (Solar Iguatu)

Este é um sistema completo full-stack para gestão de vendas, dividindo-se entre uma aplicação web no frontend e uma API robusta no backend.

## 📂 Estrutura do Projeto

O repositório é composto por dois módulos principais:

- **`/solariguatu`** (Frontend): Interface do usuário moderna e responsiva.
- **`/vendas`** (Backend): API RESTful que gerencia toda a lógica de negócios e o acesso aos dados.

---

## 🎨 Frontend (`/solariguatu`)

O frontend foi desenvolvido focado em performance, componentes reutilizáveis e design moderno.

### Tecnologias Utilizadas
- **React 18** (Framework UI)
- **Vite** (Build tool super rápida)
- **TypeScript** (Tipagem estática)
- **Tailwind CSS 4.0** (Estilização utilitária)
- **React Router DOM** (Navegação de rotas)
- **Recharts** (Criação de gráficos e dashboards)
- **Lucide React** (Ícones bonitos e leves)
- **Date-fns** (Manipulação facilitada de datas)

### 🚀 Como executar o Frontend

1. Abra o terminal e acesse a pasta do frontend:
   ```bash
   cd solariguatu
   ```
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse o endereço local gerado pelo Vite no seu navegador (geralmente `http://localhost:5173`).

---

## ⚙️ Backend (`/vendas`)

O backend é construído em Java e é o coração do sistema, lidando com segurança, banco de dados e APIs.

### Tecnologias Utilizadas
- **Java 25**
- **Spring Boot 4.0.6** (Framework principal)
- **PostgreSQL** (Banco de Dados Relacional)
- **Spring Data JPA e JDBC** (Persistência de dados)
- **ModelMapper** (Mapeamento de objetos/DTOs)
- **Maven** (Gerenciador de dependências)

### 🚀 Como executar o Backend

1. Certifique-se de ter o **Java 25** instalado na sua máquina e um banco de dados **PostgreSQL** rodando (verifique as credenciais no arquivo `application.properties` ou `application.yml` caso exista).
2. Acesse a pasta do backend:
   ```bash
   cd vendas
   ```
3. Execute o projeto usando o Maven Wrapper:
   - No Windows:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - No Linux/Mac:
     ```bash
     ./mvnw spring-boot:run
     ```

---

## 💡 Observações para o Versionamento (GitHub)

Lembre-se de não subir pastas pesadas ou arquivos compilados.
- **Frontend:** A pasta `node_modules` e arquivos de ambiente (`.env`) já devem constar no `.gitignore`.
- **Backend:** A pasta `target/` e as configurações da IDE (como `.vscode` ou `.idea`) também devem ser ignoradas.
