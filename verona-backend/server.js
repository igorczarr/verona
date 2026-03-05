// ==========================================
// VERONA OS - BACKEND SÊNIOR (v7.0 - Psychological Engine)
// ==========================================
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
app.use(cors()); 
app.use(express.json()); 

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const JWT_SECRET = 'verona_super_secret_key_2026';

// ==========================================
// 🛡️ MIDDLEWARE DE SEGURANÇA
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.user = user; 
    next();
  });
};

// ==========================================
// 🚪 ROTAS DE AUTENTICAÇÃO (Mantidas)
// ==========================================
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, username, password, inviteCode } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    let relationshipId;
    let novoStatus = 'PENDING';

    if (inviteCode) {
      const rel = await prisma.relationship.findUnique({ where: { inviteCode } });
      if (!rel) return res.status(404).json({ error: 'Código inválido.' });
      relationshipId = rel.id;
      novoStatus = 'ACTIVE';
      await prisma.relationship.update({ where: { id: relationshipId }, data: { status: novoStatus, startDate: new Date() } });
    } else {
      const novoRel = await prisma.relationship.create({ data: {} });
      relationshipId = novoRel.id;
      await prisma.channel.create({ data: { name: 'geral', description: 'O nosso dia a dia', relationshipId } });
    }

    const newUser = await prisma.user.create({ data: { name, email, username, passwordHash, relationshipId }, include: { relationship: true } });
    res.status(201).json({ message: 'Sucesso', inviteCode: newUser.relationship.inviteCode, status: novoStatus });
  } catch (error) { res.status(500).json({ error: 'Erro ao registrar.' }); }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { relationship: true } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

    const token = jwt.sign({ userId: user.id, relationshipId: user.relationshipId, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    
    // Retorna todos os dados, incluindo o novo Termômetro Emocional (moodStatus) e o Streak
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl, moodStatus: user.moodStatus },
      relationship: user.relationship
    });
  } catch (error) { res.status(500).json({ error: 'Erro no login.' }); }
});

// ==========================================
// 🌡️ ROTAS DO TERMÔMETRO EMOCIONAL E PERFIL
// ==========================================
app.put('/users/me/mood', authenticateToken, async (req, res) => {
  try {
    const { moodStatus } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { moodStatus }
    });
    res.json(updatedUser);
  } catch (error) { res.status(500).json({ error: 'Erro ao atualizar humor.' }); }
});

// ==========================================
// 📺 ROTAS DE CANAIS E POSTS (CÁPSULA DO TEMPO)
// ==========================================
app.get('/channels', authenticateToken, async (req, res) => {
  try {
    const channels = await prisma.channel.findMany({ where: { relationshipId: req.user.relationshipId }, orderBy: { createdAt: 'asc' } });
    res.json(channels);
  } catch (error) { res.status(500).json({ error: 'Erro interno.' }); }
});

app.post('/channels', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const formattedName = name.trim().toLowerCase().replace(/\s+/g, '-'); 
    const newChannel = await prisma.channel.create({ data: { name: formattedName, description, relationshipId: req.user.relationshipId } });
    res.status(201).json(newChannel);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar.' }); }
});

app.get('/channels/:channelId/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { relationshipId: req.user.relationshipId, channelId: req.params.channelId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, username: true, avatarUrl: true } }, replies: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } } }
    });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar posts.' }); }
});

// 🔒 Criação de Post (Suporta Cápsula do Tempo `unlockAt`)
app.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl, parentId, channelId, unlockAt } = req.body;
    const novoPost = await prisma.post.create({
      data: { content, imageUrl, parentId, channelId, unlockAt: unlockAt ? new Date(unlockAt) : null, authorId: req.user.userId, relationshipId: req.user.relationshipId },
      include: { author: { select: { name: true, username: true } } }
    });
    res.status(201).json(novoPost);
  } catch (error) { res.status(500).json({ error: 'Erro ao postar.' }); }
});

// ==========================================
// 🧠 ROTAS DE GAMIFICAÇÃO (Pergunta do Dia & Streak)
// ==========================================

// Simulação do Gerador de IA (Em produção, conectaremos à OpenAI/Gemini aqui)
const generateMockAIQuestion = () => {
  const questions = [
    { text: "Qual memória nossa faz seu coração bater mais forte até hoje?", category: "DEEP" },
    { text: "Se pudéssemos largar tudo e fugir neste fim de semana, para onde iríamos?", category: "FUN" },
    { text: "Qual detalhe físico meu você mais gosta que eu nem imagino?", category: "SPICY" }
  ];
  return questions[Math.floor(Math.random() * questions.length)];
};

// 1. Busca ou Cria a Pergunta de Hoje
app.get('/daily-question', authenticateToken, async (req, res) => {
  try {
    // Zera a hora para pegar apenas o "Dia"
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let question = await prisma.dailyQuestion.findFirst({
      where: { relationshipId: req.user.relationshipId, date: { gte: today } },
      include: { answers: true }
    });

    // Se não existir pergunta hoje, a "IA" cria uma nova!
    if (!question) {
      const aiGen = generateMockAIQuestion();
      question = await prisma.dailyQuestion.create({
        data: { text: aiGen.text, category: aiGen.category, date: new Date(), relationshipId: req.user.relationshipId },
        include: { answers: true }
      });
    }

    // Regra de Ocultação: Você só vê a resposta do parceiro SE VOCÊ já respondeu
    const myAnswer = question.answers.find(a => a.userId === req.user.userId);
    const partnerAnswer = question.answers.find(a => a.userId !== req.user.userId);

    res.json({
      id: question.id,
      text: question.text,
      category: question.category,
      myAnswer: myAnswer ? myAnswer.content : null,
      // Só devolve a resposta do parceiro se eu respondi. Senão, manda "LOCKED".
      partnerAnswer: myAnswer ? (partnerAnswer ? partnerAnswer.content : null) : (partnerAnswer ? 'LOCKED' : null),
      partnerAnswered: !!partnerAnswer
    });
  } catch (error) { res.status(500).json({ error: 'Erro no Daily Question.' }); }
});

// 2. Responder a Pergunta e Calcular Streak
app.post('/daily-question/answer', authenticateToken, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    
    // Salva a resposta
    await prisma.questionAnswer.create({
      data: { content, questionId, userId: req.user.userId }
    });

    // Verifica se o parceiro também respondeu para aumentar o Streak
    const question = await prisma.dailyQuestion.findUnique({ where: { id: questionId }, include: { answers: true }});
    
    if (question.answers.length === 2) {
      // O casal completou a tarefa de hoje! Mágica do Streak acontece.
      const rel = await prisma.relationship.findUnique({ where: { id: req.user.relationshipId } });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newStreak = rel.streakCount + 1; // Simplificado para MVP
      
      await prisma.relationship.update({
        where: { id: req.user.relationshipId },
        data: { streakCount: newStreak, lastAnswerDate: new Date() }
      });
    }

    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Erro ao salvar resposta.' }); }
});

// ==========================================
// 🎲 ROTA DA ROLETA DE ENCONTROS (Date Ideas)
// ==========================================
app.get('/date-ideas/random', authenticateToken, async (req, res) => {
  try {
    // Busca uma ideia aleatória que ainda não foi concluída
    const ideas = await prisma.dateIdea.findMany({
      where: { relationshipId: req.user.relationshipId, isCompleted: false }
    });

    if (ideas.length === 0) {
      // Seed automático se o baú estiver vazio!
      const defaultIdeas = [
        { title: "Cozinhar uma receita complexa do YouTube juntos", category: "FUN" },
        { title: "Jantar à luz de velas em casa (Sem celulares)", category: "ROMANTIC" },
        { title: "Massagem com óleos quentes focada no corpo todo", category: "SPICY" }
      ];
      
      for (const idea of defaultIdeas) {
        await prisma.dateIdea.create({ data: { ...idea, relationshipId: req.user.relationshipId }});
      }
      return res.json(defaultIdeas[Math.floor(Math.random() * defaultIdeas.length)]);
    }

    // Escolhe uma aleatória do banco
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    res.json(randomIdea);

  } catch (error) { res.status(500).json({ error: 'Erro na Roleta.' }); }
});

// ==========================================
// 💬 CHAT EM TEMPO REAL E MICRO-CONEXÕES
// ==========================================
io.on('connection', (socket) => {
  console.log(`Dispositivo conectado: ${socket.id}`);

  socket.on('entrar_na_sala', (relationshipId) => {
    socket.join(relationshipId);
  });

  socket.on('nova_mensagem', (dados) => {
    io.to(dados.relationshipId).emit('receber_mensagem', dados);
  });

  // 💖 O botão de "Pensando em Você" (Bids for Connection)
  socket.on('pensando_em_voce', (relationshipId) => {
    // Emite para a sala inteira. O Front-end do parceiro vai fazer a tela brilhar com corações!
    socket.to(relationshipId).emit('chuva_de_coracoes');
  });

  socket.on('disconnect', () => { console.log('Desconectado.'); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Verona 7.0 (Psychological Engine) rodando na porta ${PORT}`));