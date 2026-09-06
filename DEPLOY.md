# Como Subir o Dev Planner na Vercel com MongoDB Atlas 🚀

Siga este passo a passo simples de 3 etapas para ter o seu sistema online e sincronizado na nuvem:

---

## Passo 1: Subir o Código no GitHub

1. Abra o terminal na pasta do projeto `/scratch/dev-planner` (ou no terminal do VS Code).
2. Crie um novo repositório vazio no seu GitHub (ex: `dev-planner`).
3. Conecte o repositório e faça o push com os comandos:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/dev-planner.git
   git branch -M main
   git push -u origin main
   ```

---

## Passo 2: Criar o Banco Gratuito no MongoDB Atlas (5 minutos)

1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) e crie sua conta gratuita.
2. Crie um Cluster escolhendo o plano **M0 Free (Shared - 0 USD/mês para sempre)**.
3. Em **Database Access**, crie um usuário e senha (guarde a senha!).
4. Em **Network Access**, clique em **Add IP Address** e escolha **Allow Access from Anywhere (`0.0.0.0/0`)** (necessário para a Vercel acessar).
5. Clique em **Connect > Drivers > Node.js** e copie a sua string de conexão:
   `mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster0.mongodb.net/dev_planner?retryWrites=true&w=majority`

---

## Passo 3: Conectar na Vercel (2 minutos)

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New... > Project**.
2. Selecione o repositório `dev-planner` que você subiu no GitHub.
3. Em **Environment Variables**, adicione duas variáveis:
   * **`MONGODB_URI`**: cole a string de conexão do seu MongoDB Atlas.
   * **`JWT_SECRET`**: digite qualquer palavra ou frase longa e segura (ex: `minha_chave_super_secreta_12345`).
4. Clique em **Deploy**!

---

## Pronto! 🎉
Em menos de 1 minuto seu app estará online em um link `.vercel.app`.
* Você poderá abrir pelo computador ou celular.
* Clicando em **"Conectar Nuvem / Login"**, você cria sua conta com email e senha.
* Seus projetos, bugs, features e documentações serão sincronizados automaticamente no MongoDB!
