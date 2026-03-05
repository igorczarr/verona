// Pegamos os IDs exatos que o seu banco de dados gerou antes
const ID_ROMEU = '8c9590f3-8bb5-47ea-a5ea-367ab5647e78';
const ID_JULIETA = '25b6dd2e-e212-46a8-9f3d-0ea6953195b6';
const URL_API = 'http://localhost:3000';

async function simularRedeSocial() {
  console.log('🎬 Iniciando simulação do Verona...\n');

  try {
    // 1. Você (Romeu) faz o primeiro Post
    console.log('📝 1. Romeu enviando o primeiro post...');
    const respostaPost1 = await fetch(`${URL_API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Criando o nosso próprio mundo. Te amo!',
        authorId: ID_ROMEU,
      })
    });
    const postOriginal = await respostaPost1.json();
    console.log('✅ Post criado! ID do Post:', postOriginal.id, '\n');

    // 2. Ela (Julieta) responde o seu Post (Criando o Fio/Thread)
    console.log('🧶 2. Julieta respondendo ao post (Criando um Fio)...');
    const respostaPost2 = await fetch(`${URL_API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Nosso cantinho especial! ❤️',
        authorId: ID_JULIETA,
        parentId: postOriginal.id // MÁGICA: Avisamos que este post é "filho" do seu post!
      })
    });
    await respostaPost2.json();
    console.log('✅ Resposta enviada e amarrada ao fio!\n');

    // 3. Simulamos o celular abrindo o App e puxando o Feed
    console.log('📱 3. Celular abrindo o App e carregando o Feed...');
    const respostaFeed = await fetch(`${URL_API}/feed`);
    const feedCompleto = await respostaFeed.json();

    // Mostramos o resultado formatado no terminal
    console.log('\n=======================================');
    console.log('📰 FEED DA TIMELINE DO VERONA:');
    console.log('=======================================');
    
    // Iterando sobre o feed para imprimir de forma bonita
    feedCompleto.forEach(post => {
      console.log(`\n👤 [${post.author.name}] postou:`);
      console.log(`   "${post.content}"`);
      
      if (post.replies && post.replies.length > 0) {
        console.log(`   👇 Respostas (Fio):`);
        post.replies.forEach(resposta => {
          console.log(`      ↪ 👤 [${resposta.author.name}]: "${resposta.content}"`);
        });
      }
    });
    console.log('\n=======================================\n');

  } catch (erro) {
    console.error('❌ Ops, algo deu errado no teste:', erro);
  }
}

// Executando a simulação
simularRedeSocial();