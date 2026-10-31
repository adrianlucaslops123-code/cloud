/**
 * Conteúdo do site: tudo o que é próprio do Chalé do Vale mora aqui.
 *
 * Para outra propriedade, troque este arquivo (e as fotos em public/fotos);
 * a estrutura, o CSS e os módulos de movimento ficam como estão.
 *
 * Regras de escrita: fatos curtos e concretos, só o que as fotos ou o
 * proprietário confirmam. Nada de "exclusivo", "experiência", "sofisticado".
 * Num título, " / " é uma quebra de linha.
 *
 * Campos vazios ('') são dados que ainda faltam: o site se adapta e esconde
 * o que depende deles (ver docs/curadoria.md).
 */

export default {
  marca: {
    nome: 'Chalé do Vale',
    tituloPagina: 'Chalé do Vale · chalé em A na serra',
    descricao:
      'Chalé em A de madeira e aço preto, com jacuzzi, deck e fogueira, de frente para o vale.',
    imagemCompartilhar: 'og.jpg',
    endereco: '', // endereço do site publicado (ex.: 'https://chaledovale.com.br'), para a prévia do link
  },

  // Dados de contato. Vazio = ainda não informado.
  contato: {
    whatsapp: '', // só dígitos, com DDD (ex.: '11987654321'); vazio = formulário em demonstração
    airbnb: '', // link do anúncio
    instagram: '', // link do perfil
    email: '',
  },

  nav: {
    links: [
      { texto: 'O chalé', alvo: '#chale' },
      { texto: 'Lá fora', alvo: '#fora' },
      { texto: 'Reserva', alvo: '#reserva' },
      { texto: 'Contato', alvo: '#contato' },
    ],
    botao: { texto: 'Reservar', alvo: '#reserva' },
    pular: { texto: 'Pular as fotos', alvo: '#chale' },
  },

  /**
   * O voo: fotos reais presas ao scroll, com um movimento de câmera lento
   * (só escala e posição, nunca distorção) e troca por dissolução no tempo.
   *
   * telas    → quanto de rolagem (em alturas de tela) a cena ocupa
   * segundos → quanto do "filme" a cena dura (o teto de velocidade usa isso)
   * camera   → [x, y, zoom] no começo e no fim da cena: x/y é o ponto da foto
   *            (0 a 1) que fica no centro da tela; zoom 1 = a foto cobrindo a tela
   * posicao  → onde o texto mora na tela (cada cena num lugar diferente)
   */
  voo: {
    descansoInicio: 0.45, // telas paradas na primeira foto
    descansoFim: 0.5, // telas paradas na última foto, antes da folha subir
    velocidadeMax: 2, // segundos de filme por segundo real
    dissolver: 0.7, // segundos da dissolução entre fotos
    rotuloSecao: 'Fotos do chalé, do dia à noite',
    cenas: [
      {
        posicao: 'hero',
        telas: 1.3,
        segundos: 2,
        foto: {
          desktop: 'fotos/externo/jacuzzi-vale-dia.webp',
          mobile: 'fotos/externo/deck-dia.webp',
        },
        descricao:
          'A jacuzzi sob o pergolado de madeira, de frente para o vale e a serra, numa tarde de sol.',
        camera: {
          desktop: [[0.5, 0.42, 1], [0.52, 0.56, 1.07]],
          mobile: [[0.38, 0.5, 1], [0.5, 0.5, 1.06]],
        },
        rotulo: 'Hospedagem na serra',
        titulo: 'De frente / para o vale',
        linha: 'Um chalé em A de madeira e aço preto, cercado de mata.',
        botao: { texto: 'Ver o chalé', alvo: '#chale' },
        lado: ['Jacuzzi', 'Deck', 'Fogueira'],
      },
      {
        posicao: 'pe-esq',
        grande: true,
        telas: 1.5,
        segundos: 2,
        foto: { desktop: 'fotos/interno/sala.webp', mobile: 'fotos/interno/sala.webp' },
        descricao:
          'A sala: sofá de linho, tapete redondo de couro, mesa para dois e a cozinha ao fundo, sob a parede de madeira do A.',
        camera: {
          desktop: [[0.5, 0.26, 1], [0.5, 0.4, 1.05]],
          mobile: [[0.36, 0.5, 1], [0.6, 0.5, 1.05]],
        },
        rotulo: '01 · Sala',
        titulo: 'Tudo sob / o mesmo A',
        linha: 'Sofá, mesa para dois e a cozinha ao fundo.',
      },
      {
        posicao: 'pe-dir',
        telas: 1.5,
        segundos: 2,
        foto: { desktop: 'fotos/interno/cozinha.webp', mobile: 'fotos/interno/cozinha.webp' },
        descricao:
          'A cozinha no fundo do A: forro de madeira, frigobar, micro-ondas, air fryer, cafeteira e uma janela pequena.',
        camera: {
          desktop: [[0.5, 0.36, 1], [0.5, 0.48, 1.1]],
          mobile: [[0.5, 0.5, 1], [0.5, 0.46, 1.1]],
        },
        rotulo: '02 · Cozinha',
        titulo: 'No fundo / do A',
        linha: 'Frigobar, micro-ondas, air fryer e cafeteira.',
      },
      {
        posicao: 'alto-esq',
        telas: 1.4,
        segundos: 2,
        foto: { desktop: 'fotos/interno/banheiro.webp', mobile: 'fotos/interno/banheiro.webp' },
        descricao:
          'O banheiro: cuba de pedra sobre bancada de madeira, torneira preta e espelho oval na parede inclinada.',
        camera: {
          desktop: [[0.5, 0.5, 1], [0.5, 0.7, 1.04]],
          mobile: [[0.5, 0.4, 1.02], [0.5, 0.56, 1.08]],
        },
        rotulo: '03 · Banheiro',
        titulo: 'Cuba de pedra, / espelho oval',
        linha: 'Box de vidro e a parede inclinada do A.',
      },
      {
        posicao: 'alto-centro',
        telas: 1.5,
        segundos: 2,
        foto: {
          desktop: 'fotos/externo/deck-anoitecer.webp',
          mobile: 'fotos/externo/deck-anoitecer.webp',
        },
        descricao:
          'O deck ao anoitecer: namoradeira, guarda-corpo de ferro iluminado e o pico da serra contra o céu azul.',
        camera: {
          desktop: [[0.5, 0.46, 1], [0.5, 0.6, 1.05]],
          mobile: [[0.42, 0.5, 1], [0.56, 0.5, 1.05]],
        },
        rotulo: '04 · Deck',
        titulo: 'A serra em frente / ao deck',
      },
      {
        posicao: 'meio-dir',
        telas: 1.4,
        segundos: 2,
        foto: {
          desktop: 'fotos/externo/jacuzzi-noite.webp',
          mobile: 'fotos/externo/jacuzzi-noite.webp',
        },
        descricao:
          'A jacuzzi à noite, iluminada, entre cortinas brancas, com duas taças de vinho na borda de madeira.',
        camera: {
          desktop: [[0.5, 0.26, 1], [0.5, 0.4, 1.05]],
          mobile: [[0.46, 0.5, 1], [0.58, 0.5, 1.05]],
        },
        rotulo: '05 · Jacuzzi',
        titulo: 'Sob o pergolado, / entre cortinas',
      },
      {
        posicao: 'alto-dir',
        telas: 1.3,
        segundos: 2,
        foto: {
          desktop: 'fotos/externo/fachada-noite.webp',
          mobile: 'fotos/externo/fachada-noite.webp',
        },
        descricao:
          'O chalé aceso à noite: a fachada de vidro em A, o mezanino com a cama sob as lâmpadas, a sala e a jacuzzi ao lado.',
        camera: {
          desktop: [[0.5, 0.6, 1.04], [0.48, 0.4, 1]],
          mobile: [[0.46, 0.5, 1.06], [0.38, 0.5, 1]],
        },
        rotulo: 'Reservas',
        titulo: 'Chalé / do Vale',
        linha: 'Chalé em A · mezanino · jacuzzi · deck com vista',
        botao: { texto: 'Pedir reserva', alvo: '#reserva' },
      },
    ],
  },

  // A saída do voo: a folha clara com a janela em A, desenhada como a fachada.
  folha: {
    esquerda: { rotulo: 'Chalé em A', texto: 'Chalé do Vale' },
    direita: { rotulo: 'Reservas', texto: 'Datas sob consulta' },
  },

  chale: {
    id: 'chale',
    titulo: 'Madeira por dentro, / aço por fora',
    destaque: 'Um ambiente só.',
    texto:
      'Sala, mesa e cozinha dividem o térreo, sob o forro de madeira. Uma escada de aço sobe ao mezanino, onde fica a cama; pelo vidro, o deck e a serra.',
    botao: { texto: 'Ver lá fora', alvo: '#fora' },
    foto: {
      src: 'fotos/interno/escada-vista.webp',
      largura: 1062,
      altura: 1327,
      alt: 'Escada de aço com degraus de madeira e, pelo vidro, o deck com a namoradeira e a serra na neblina.',
    },
    topicos: [
      { titulo: 'Mezanino', texto: 'A cama fica no alto do A, sob lâmpadas penduradas.' },
      { titulo: 'Adega', texto: 'Aparador com nichos para vinho e taças, ao pé da escada.' },
    ],
    numero: { valor: 'A', rotulo: 'Chalé em A' },
  },

  fora: {
    id: 'fora',
    titulo: 'Lá fora',
    texto:
      'Decks, gramado e jardim descem pela encosta, de frente para a serra. Além da jacuzzi, três lugares para ficar.',
    chamada: 'Pedir reserva',
    alvo: '#reserva',
    itens: [
      {
        nome: 'Deck',
        dados: 'Mesa, guarda-sol, namoradeira e churrasqueira portátil',
        foto: {
          src: 'fotos/externo/deck-guarda-sol.webp',
          largura: 1062,
          altura: 796,
          alt: 'Deck de madeira ao lado do chalé, com mesa, guarda-sol, namoradeira e sofá, de frente para a serra.',
        },
      },
      {
        nome: 'Fogueira',
        dados: 'Braseiro e poltronas no gramado',
        foto: {
          src: 'fotos/externo/fogueira-encosta.webp',
          largura: 1062,
          altura: 796,
          alt: 'Braseiro com lenha e duas poltronas no gramado da encosta, abaixo do deck.',
        },
      },
      {
        nome: 'Rede suspensa',
        dados: 'Sobre o declive, de frente para o vale',
        foto: {
          src: 'fotos/externo/rede-neblina.webp',
          largura: 1062,
          altura: 796,
          alt: 'Rede esticada sobre o declive, ao lado de um deck, com o vale coberto de neblina ao fundo.',
        },
      },
    ],
  },

  reserva: {
    id: 'reserva',
    titulo: 'Escolha / as datas',
    texto:
      'Mande as datas e o seu WhatsApp. Disponibilidade e valor são confirmados antes da reserva.',
    campos: { nome: 'Nome', whatsapp: 'WhatsApp', chegada: 'Chegada', saida: 'Saída' },
    exemploWhatsapp: '(11) 98765-4321',
    botao: 'Pedir reserva',
    erros: {
      faltando: 'Preencha os quatro campos para pedir a reserva.',
      whatsapp: 'Confira o WhatsApp: com DDD, só números.',
      passado: 'Escolha uma chegada a partir de hoje.',
      ordem: 'A saída precisa ser depois da chegada.',
    },
    // {nome}, {periodo} são trocados pelo que a pessoa escolheu.
    obrigado: 'Obrigado, {nome}. O WhatsApp abriu com o pedido {periodo}: é só enviar a mensagem.',
    obrigadoDemo:
      'Obrigado, {nome}. Pedido {periodo} pronto. Quando o número do chalé estiver no site, este botão abre o WhatsApp com a mensagem.',
    mensagem: 'Olá! Sou {nome} e gostaria de reservar o Chalé do Vale {periodo}. Meu WhatsApp: {whatsapp}.',
  },

  rodape: {
    id: 'contato',
    links: [
      { texto: 'O chalé', alvo: '#chale' },
      { texto: 'Lá fora', alvo: '#fora' },
      { texto: 'Reserva', alvo: '#reserva' },
      { texto: 'Início', alvo: '#topo' },
    ],
    reservas: { rotulo: 'Reservas', pedido: 'Pedido pelo site' },
    nota: 'Fotos do próprio chalé. Valores e datas sob consulta.',
  },
}
