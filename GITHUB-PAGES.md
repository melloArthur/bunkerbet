# Publicação no GitHub Pages

1. Crie um repositório vazio no GitHub.
2. Envie todos os arquivos deste projeto para a branch `main`.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment → Source**, selecione **GitHub Actions**.
5. Aguarde a rotina **Publicar no GitHub Pages** terminar.

O site será publicado automaticamente novamente sempre que houver um novo envio para a branch `main`.

## Atualização da rodada

O painel do ADM salva os jogos no navegador usado por ele. O botão **Copiar JSON** fornece os dados da rodada para uma futura integração ou para atualização do conteúdo padrão no código. Como o GitHub Pages é uma hospedagem estática, ele não sincroniza sozinho alterações feitas no navegador do administrador com todos os visitantes.
