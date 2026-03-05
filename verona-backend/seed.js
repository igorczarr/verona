const { PrismaClient } = require('@prisma/client');

// Conexão limpa e automática!
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Plantando a semente do Verona: Criando os perfis... 💖');


  // Criando o seu perfil
  const romeu = await prisma.user.create({
    data: {
      name: 'Igor', 
      username: 'romeu',
      password: 'senha_segura_123', // Lembrete: Na AWS, vamos criptografar isso!
      bio: 'O arquiteto deste nosso mundo particular.',
    }
  });

  // Criando o perfil dela
  const julieta = await prisma.user.create({
    data: {
      name: 'Minha Julieta', // Substitua pelo nome dela!
      username: 'julieta',
      password: 'senha_segura_123',
      bio: 'A inspiração por trás de cada linha de código.',
    }
  });

  console.log('✨ Perfis criados com sucesso no banco de dados!');
  console.log('Seus dados:', { romeu, julieta });
}

// Executando a função e fechando a conexão com o banco no final
main()
  .catch((erro) => {
    console.error('Erro ao criar perfis:', erro);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });