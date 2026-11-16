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

- Painel financeiro e inventário.
- Dez missões sequenciais com objetivos e recompensas.
- Linhas de processamento com consumo de insumos e custos.
- Mercado para vender materiais e obter créditos.
- Loja de equipamentos e melhorias.
- Salvamento automático do progresso no navegador.
- Layout responsivo para computador e celular.
- Assistente de voz para orientar usuários com dificuldade de leitura.

## Importante

Esta é uma primeira versão jogável, com valores, rendimentos e custos fictícios para fins educativos. Os processos industriais são simplificados e não constituem instruções operacionais para uma planta real. A simulação roda inteiramente no navegador; não há cadastro, login, banco de dados compartilhado ou sincronização entre dispositivos nesta versão.

## Próximas evoluções recomendadas

- Backend e banco de dados para contas e salvamento em nuvem.
- Cadastro e autenticação de jogadores.
- Painel administrativo do proprietário.
- Funcionários, energia, manutenção, contratos e logística.
- Mercado dinâmico e relatórios financeiros.
- Conteúdo técnico revisado por especialistas em mineração e metalurgia.


### Tutorial falado da Missão 2
- A área de Produção agora inclui um guia visual com cinco etapas para fabricar concentrado mineral.
- O botão “Ouvir tutorial passo a passo” narra o processo completo e considera o estoque e os créditos atuais do jogador.
- O botão de áudio da máquina “Britagem e moagem” também explica como produzir concentrado, os insumos, o custo e a quantidade de operações necessárias.
- A instrução da Missão 2 na Central de Missões foi ampliada para explicar que o concentrado é produzido, não comprado.


## Começar uma nova partida
O botão **Começar nova partida** fica disponível na tela inicial e no menu lateral. Ao clicar, o jogo pede confirmação antes de apagar o progresso local da partida atual (créditos, estoque, produção acumulada, missões e equipamentos). Depois da confirmação, a simulação volta ao estado inicial.


## Nova partida

O botão **Nova partida**, disponível no topo da aplicação, permite reiniciar a simulação. O jogo pede confirmação antes de apagar o progresso atual. Ao confirmar, dinheiro, estoque, produção acumulada, missões e equipamentos voltam aos valores iniciais. A ação afeta apenas o salvamento local deste navegador e não pode ser desfeita.
