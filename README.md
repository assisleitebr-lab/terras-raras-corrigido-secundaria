# Terras Raras — Mining Industry

Protótipo web de um simulador educativo de mineração, processamento e transformação de terras raras.

## Como executar

1. Baixe e extraia o arquivo ZIP.
2. Abra `index.html` no navegador. Não é necessário instalar nada.
3. O progresso é salvo automaticamente no armazenamento local do navegador (`localStorage`).

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos `index.html`, `style.css`, `app.js` e `README.md` para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`, depois clique em **Save**.
6. Aguarde a publicação e abra o endereço informado pelo GitHub Pages.

## Assistente de áudio e acessibilidade

- Instruções faladas em português do Brasil para as seções do aplicativo.
- Botão para ouvir individualmente cada missão, processo industrial, material à venda e equipamento.
- Leitura automática das confirmações após processar materiais, concluir missões, vender produtos ou comprar equipamentos.
- Controles para ativar, desligar e repetir a última instrução.
- A leitura utiliza a voz instalada no navegador/dispositivo por meio da API de síntese de fala. Para melhores resultados, use uma versão atualizada do Google Chrome ou Microsoft Edge e mantenha o volume do dispositivo ligado.
- Na primeira utilização, pressione **Ativar áudio**. Alguns navegadores só permitem iniciar áudio após uma ação do usuário. A disponibilidade e a qualidade da voz em português dependem do sistema operacional e do navegador.

## O que já funciona

- Painel financeiro e inventário completo.
- Dez missões sequenciais com objetivos, progresso e recompensas.
- Linhas de processamento com consumo de insumos, custo dinâmico conforme eficiência e contador acumulado.
- Mercado para vender materiais e obter créditos.
- Loja de equipamentos e melhorias que aumentam a eficiência e reduzem os custos operacionais.
- Tutorial visual e falado passo a passo para a Missão 2.
- Salvamento automático do progresso no navegador (`localStorage`) e opção para iniciar nova partida.
- Layout responsivo para computador e celular.

## Importante

Esta é uma primeira versão jogável, com valores, rendimentos e custos fictícios para fins educativos. Os processos industriais são simplificados e não constituem instruções operacionais para uma planta real. A simulação roda inteiramente no navegador; não há cadastro, login, banco de dados compartilhado ou sincronização entre dispositivos nesta versão.
