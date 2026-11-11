# felt-web — primeira fatia: visual primeiro

Status: rascunho para aprovação.

## Intenção e porquê

`felt` é uma plataforma de cartas (blackjack e poker) para jogar com amigos, com créditos fictícios. O front fala com um servidor autoritativo (`felt-server`) por HTTPS e WebSocket; a API ainda não existe.

O dono quer que o `felt` se destaque por três coisas: o **visual** (cartas e identidade blklight, diferenciando-se um pouco dos outros projetos), a **facilidade de jogar com amigos** e **ganhar experiência** construindo um projeto completo.

Esta fatia entrega o visual e os componentes com dados falsos no formato do protocolo, para validar a identidade cedo. A rede vem depois.

## Objetivos

- Identidade visual definida e aplicada em tokens (tema único, ver abaixo).
- Componentes: carta (frente/verso, SVG), ficha, assento, mesa em elipse (2 a 6 assentos), pote, board, barra de ações, timer.
- Galeria `/components` (já existe) com demos desses componentes, usando snapshots falsos do formato `view` do plano (`you.legalActions`, `deadline`, potes, fase).
- Telas só de layout: Lobby (criar sala, entrar por código, jogo rápido), Mesa, Perfil, Sobre. Textos em inglês e pt-BR via dicionário (os dois idiomas desde o início).
- Responsivo, começando pelo celular. `prefers-reduced-motion` respeitado. Alt text em cartas, ações por teclado, contraste AA, nada só por cor.
- Opção de baralho de quatro cores/naipes distintos (acessibilidade a daltonismo) prevista nos tokens e no componente de carta.

## Não objetivos

- Sem WebSocket, `api.ts`, `socket.ts`, IndexedDB, contas ou protocolo real nesta fatia.
- Sem motor de jogo, nem regras no front. Os botões de ação virão de `legalActions` (aqui, vindo do snapshot falso).
- Sem servidor falso jogável (opção C ficou para depois, se fizer falta).
- Sem sons e sem animações elaboradas (distribuir/virar/fichas): só o necessário para os demos.

## Anti-objetivos

- Reimplementar regras de jogo no front.
- Visual de cassino (termos "bet", "casino", "jackpot" na marca).
- Um tema que pareça cópia dos projetos irmãos (`tally`, `cringedeck`).

## Restrições

- Mantém o template `tpl-ui`: Next.js 16 (App Router), Tailwind v4, Base UI/shadcn (`base-vega`), Zustand, Vitest, Biome, Bun. Segue o `AGENTS.md`.
- Hospedagem gratuita estática (GitHub Pages) em `felt.blklight.dev`: `output: "export"`. Sem rotas dinâmicas para códigos de sala: a mesa vive em `/table` e lê `?code=` no cliente. Os irmãos usam `trailingSlash: true` e `images.unoptimized`; seguimos o mesmo e o workflow `deploy.yml` do `cringedeck` como referência.
- `cacheComponents: true` está ligado neste repo, e os irmãos exportam sem ele. A compatibilidade com `output: "export"` precisa ser confirmada na doc do Next 16 (`node_modules/next/dist/docs/`, hoje ausente: `bun install` primeiro). **Resultado (confirmado no build): incompatível** (`PPR cannot be enabled in export mode`). `cacheComponents` e `partialPrefetching` foram removidos de `next.config.ts`.
- Sem dependências novas sem avisar. Sem comentários óbvios no código.

## Decisões visuais (aprovadas pelo dono)

Direção: **feltro verde sóbrio com neon só no que importa**.

- Fundo: feltro verde profundo, com a classe existente `.background-texture` (`src/app/globals.css`, imagem `noisy.png`) para dar a textura.
- Mesa e cartas tradicionais: cartas cor de osso, naipes vermelho/preto.
- Neon (roxo `#7c5cff` e ciano `#7cf4ff` como ponto de partida) usado apenas no verso das cartas, no pote, na vez de quem joga e nos botões de ação.
- Interface ao redor em preto/cinza do blklight.
- Valores exatos de cor são ajustáveis e vivem em tokens semânticos (Tailwind v4 + `globals.css`), com light/dark respeitados.
- Referência: mockup "2 · Feltro sóbrio" em `.superpowers/brainstorm/` (não versionado).

## Abordagens consideradas

- **A. Fundação primeiro:** rede, protocolo e stores antes dos componentes. Descartada: muito tempo sem nada visual e sem API para testar.
- **B. Visual primeiro (escolhida):** identidade e componentes com snapshots falsos. Valida o diferencial cedo e deixa o protocolo guiar os componentes.
- **C. Mesa jogável com servidor falso:** descartada por ora; trabalho descartável e risco de regras vazarem para o front. Pode voltar atrás de flag de dev.

Adaptação do plano: o plano original pedia Vite, React Router e CSS Modules. Ficou decidido manter o template Next e usar rotas do App Router e Tailwind com tokens.

## Estrutura proposta

- `src/components/cards/`, `table/`, `chips/` para os componentes do jogo (os genéricos continuam em `components/ui/`).
- `src/components/showcase/demos/` ganha uma categoria "Jogo" registrada em `registry.ts`, como manda o `AGENTS.md`.
- Dados falsos tipados em um módulo de fixtures (ex.: `src/dev/fixtures.ts`) com tipos do `view`, escritos para depois serem substituídos pelo `protocol.ts` sincronizado do servidor.
- Rotas: `/` (lobby), `/table`, `/profile`, `/about`, sem estado real.
- Dicionários `en` e `pt-BR` em `src/i18n/` (aproveitar `useLanguageStore` existente, se couber).

## Deixado ao builder

- Valores finais de tokens, tipografia, desenho do verso e das figuras (valete, dama, rei: arte original).
- Detalhes de layout da elipse por número de assentos e do slider de aposta.
- Se `cacheComponents` convive com export (ver restrições).
- Testes: comportamento por papéis/`aria` (carta tem nome acessível, barra de ações navegável por teclado, mesa renderiza N assentos).

## Fora desta fatia (próximos marcos)

Rede e protocolo (M0 restante), contas (M3), blackjack jogável (M4/M5), poker (M6+), animações e sons (M8).

## Riscos / pontos a verificar

- `cacheComponents` + `output: "export"` (acima).
- `node_modules` ausente neste repo: precisa de `bun install` antes de rodar qualquer coisa.
- Adicionar `.superpowers/` ao `.gitignore`.
