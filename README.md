# Terras Raras — Mining Industry (Versão Firebase)

Protótipo web de um simulador educativo de mineração, processamento e transformação de terras raras, integrado com **Firebase Firestore** para salvamento em nuvem.

## Como executar

1. Baixe e extraia o arquivo ZIP.
2. Abra `index.html` no navegador. Não é necessário instalar nada.
3. O progresso é salvo automaticamente no armazenamento local (`localStorage`) e sincronizado com o banco de dados em nuvem do Firebase (`terras-rara-v1-pro`).

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos `index.html`, `style.css`, `app.js` e `README.md` para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`, depois clique em **Save**.
6. Aguarde a publicação e abra o endereço informado pelo GitHub Pages.

## Integração com Firebase

- O projeto utiliza a configuração do Firebase Firestore fornecida (`projectId: terras-rara-v1-pro`).
- Cada jogador recebe um ID de dispositivo único salvo localmente para persistir e sincronizar o progresso automaticamente na nuvem.
- Botão dedicado de sincronização com a nuvem na interface.
