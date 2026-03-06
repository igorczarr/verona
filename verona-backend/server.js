// ==========================================
// VERONA OS - BACKEND SÊNIOR (Sprint 1 - Foundation & SaaS Ready)
// ==========================================
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); 

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const JWT_SECRET = process.env.JWT_SECRET || 'verona_super_secret_key_2026';
const MASTER_KEY = process.env.MASTER_KEY || 'VERONA2026'; // A Senha Mestra de Segurança

// 📧 CONFIGURAÇÃO DO DISPARADOR DE E-MAILS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const enviarEmail = async (para, assunto, texto) => {
  if (!process.env.EMAIL_USER) return console.log(`Simulação de E-mail para ${para}: ${assunto}`);
  try { await transporter.sendMail({ from: '"Verona" <verona@vrtice.com.br>', to: para, subject: assunto, text: texto }); } 
  catch (error) { console.error("Erro ao enviar e-mail:", error); }
};

// 🛡️ MIDDLEWARE DE SEGURANÇA
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.user = user; next();
  });
};

// ==========================================
// 🎟️ GERADOR ADMIN DE LICENÇAS (Uso Temporário do CEO)
// ==========================================
// Rota secreta para você criar uma chave antes de ligar a Kiwify
app.post('/admin/generate-license', async (req, res) => {
  try {
    const { masterKey } = req.body;
    if (masterKey !== MASTER_KEY) return res.status(403).json({ error: 'Acesso negado. Apenas o CEO.' });

    // Gera chave no padrão VRN-XXXX-XXXX
    const randomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `VRN-${randomCode()}-${randomCode()}`;
    
    await prisma.license.create({ data: { key: newKey } });
    res.status(201).json({ success: true, license: newKey, message: "Guarde essa chave para usar no cadastro." });
  } catch (error) { res.status(500).json({ error: 'Erro ao gerar.' }); }
});

// ==========================================
// 🚪 ROTAS DE AUTENTICAÇÃO E PERSISTÊNCIA (C/ METAS)
// ==========================================
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    // Agora busca o cofre COMPLETO (com as Metas) para resistir ao F5
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId }, 
      include: { relationship: { include: { goals: true } } } 
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user, relationship: user.relationship });
  } catch (error) { res.status(500).json({ error: 'Erro ao restaurar sessão.' }); }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, username, password, inviteCode, licenseKey } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    
    let relationshipId; 
    let novoStatus = 'PENDING';

    // CENÁRIO A: É o PARCEIRO entrando com o convite (Gratuito)
    if (inviteCode) {
      const rel = await prisma.relationship.findUnique({ where: { inviteCode } });
      if (!rel) return res.status(404).json({ error: 'Código de convite inválido.' });
      
      relationshipId = rel.id; novoStatus = 'ACTIVE';
      await prisma.relationship.update({ where: { id: relationshipId }, data: { status: novoStatus, startDate: new Date() } });
      
      const parceiro = await prisma.user.findFirst({ where: { relationshipId, NOT: { email } }});
      if (parceiro) enviarEmail(parceiro.email, "Santuário Completo ❤️", `${name} entrou no Verona!`);

    } 
    // CENÁRIO B: É o COMPRADOR criando um cofre novo (EXIGE LICENÇA)
    else {
      if (!licenseKey) return res.status(403).json({ error: 'Licença de acesso obrigatória para criar um cofre.' });
      
      const licencaValida = await prisma.license.findUnique({ where: { key: licenseKey } });
      if (!licencaValida || licencaValida.isUsed) return res.status(403).json({ error: 'Licença inválida ou já utilizada.' });

      const novoRel = await prisma.relationship.create({ data: {} });
      relationshipId = novoRel.id;
      
      await prisma.channel.create({ data: { name: 'geral', description: 'O nosso dia a dia', relationshipId } });
      await prisma.channel.create({ data: { name: 'perguntasdodia', description: 'Nosso diário eterno', isSystem: true, relationshipId } });

      await prisma.license.update({ where: { id: licencaValida.id }, data: { isUsed: true } });
    }

    const newUser = await prisma.user.create({ data: { name, email, username, passwordHash, relationshipId }, include: { relationship: true } });
    res.status(201).json({ message: 'Sucesso', inviteCode: newUser.relationship.inviteCode, status: novoStatus });
  } catch (error) { res.status(500).json({ error: 'Erro ao registrar.' }); }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { relationship: { include: { goals: true } } } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ userId: user.id, relationshipId: user.relationshipId, name: user.name }, JWT_SECRET, { expiresIn: '365d' });
    res.json({ token, user, relationship: user.relationship });
  } catch (error) { res.status(500).json({ error: 'Erro no login.' }); }
});

// ==========================================
// ⚙️ ROTAS DE PERFIL
// ==========================================
app.put('/users/me', authenticateToken, async (req, res) => {
  try {
    const { moodStatus, avatarUrl, bio } = req.body;
    const dataToUpdate = {};
    if (moodStatus !== undefined) dataToUpdate.moodStatus = moodStatus;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;
    if (bio !== undefined) dataToUpdate.bio = bio;

    const updatedUser = await prisma.user.update({ where: { id: req.user.userId }, data: dataToUpdate });
    res.json(updatedUser);
  } catch (error) { res.status(500).json({ error: 'Erro ao atualizar perfil.' }); }
});

// ==========================================
// 📺 ROTAS DE CANAIS E POSTS 
// ==========================================
app.get('/channels', authenticateToken, async (req, res) => {
  try { const channels = await prisma.channel.findMany({ where: { relationshipId: req.user.relationshipId }, orderBy: { createdAt: 'asc' } }); res.json(channels); } catch (error) { res.status(500).json({ error: 'Erro interno.' }); }
});

app.post('/channels', authenticateToken, async (req, res) => {
  try {
    const formattedName = req.body.name.trim().toLowerCase().replace(/\s+/g, '-'); 
    const newChannel = await prisma.channel.create({ data: { name: formattedName, description: req.body.description, relationshipId: req.user.relationshipId } });
    
    const parceiro = await prisma.user.findFirst({ where: { relationshipId: req.user.relationshipId, id: { not: req.user.userId } }});
    if (parceiro) enviarEmail(parceiro.email, `Novo canal criado: #${formattedName}`, `${req.user.name} criou um novo canal para vocês.`);
    res.status(201).json(newChannel);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar.' }); }
});

app.get('/channels/:channelId/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { relationshipId: req.user.relationshipId, channelId: req.params.channelId, parentId: null },
      take: 50, 
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, username: true, avatarUrl: true } }, replies: { include: { author: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } } }
    });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar posts.' }); }
});

app.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl, parentId, channelId, unlockAt } = req.body;
    const novoPost = await prisma.post.create({
      data: { content, imageUrl, parentId, channelId, unlockAt: unlockAt ? new Date(unlockAt) : null, authorId: req.user.userId, relationshipId: req.user.relationshipId },
      include: { author: { select: { name: true, username: true } } }
    });
    
    const parceiro = await prisma.user.findFirst({ where: { relationshipId: req.user.relationshipId, id: { not: req.user.userId } }});
    if (parceiro && !parentId) enviarEmail(parceiro.email, `Nova memória de ${req.user.name}`, `Corra no Verona para ver a nova postagem.`);
    res.status(201).json(novoPost);
  } catch (error) { res.status(500).json({ error: 'Erro ao postar.' }); }
});

// ==========================================
// 💖 ROTA DE NOTIFICAÇÃO DIRETA (Pensando em Você)
// ==========================================
app.post('/notifications/miss-you', authenticateToken, async (req, res) => {
  try {
    const { customMessage } = req.body;
    const parceiro = await prisma.user.findFirst({ where: { relationshipId: req.user.relationshipId, id: { not: req.user.userId } }});
    if (parceiro) {
      await enviarEmail(parceiro.email, `🔥 ${req.user.name} está pensando em você...`, `Mensagem direta do Verona:\n\n"${customMessage}"\n\nAbra o aplicativo para responder.`);
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Erro ao enviar notificação.' }); }
});

// ==========================================
// 💾 PERSISTÊNCIA DE METAS E DATAS
// ==========================================
app.put('/relationship', authenticateToken, async (req, res) => {
  try {
    const { startDate, firstKiss } = req.body;
    // Evita apagar a data se o campo for enviado vazio
    const dataToUpdate = {};
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (firstKiss) dataToUpdate.firstKiss = new Date(firstKiss);

    const updated = await prisma.relationship.update({ where: { id: req.user.relationshipId }, data: dataToUpdate });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Erro ao salvar datas.' }); }
});

app.post('/goals', authenticateToken, async (req, res) => {
  try {
    const goal = await prisma.goal.create({ data: { title: req.body.title, relationshipId: req.user.relationshipId } });
    res.json(goal);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar meta.' }); }
});

// ==========================================
// 💬 HISTÓRICO ETERNO DE CHAT
// ==========================================
app.get('/chat', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { relationshipId: req.user.relationshipId },
      orderBy: { createdAt: 'asc' }, 
      include: { sender: { select: { name: true, avatarUrl: true } } }
    });
    const formattedMessages = messages.map(msg => ({
      id: msg.createdAt, texto: msg.content, authorId: msg.senderId, authorName: msg.sender.name, authorAvatarUrl: msg.sender.avatarUrl
    }));
    res.json(formattedMessages);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar chat.' }); }
});

// ==========================================
// 🧠 ROTAS DE GAMIFICAÇÃO (Pergunta do Dia & Roleta)
// ==========================================
const generateMockAIQuestion = () => {
  const q = [
    { text: "Qual memória nossa faz seu coração bater mais forte até hoje?", category: "DEEP" },
    { text: "Se pudéssemos largar tudo e fugir neste fim de semana, para onde iríamos?", category: "FUN" },
    { text: "Qual detalhe físico meu você mais gosta que eu nem imagino?", category: "SPICY" }
  ];
  return q[Math.floor(Math.random() * q.length)];
};

app.get('/daily-question', authenticateToken, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let question = await prisma.dailyQuestion.findFirst({ where: { relationshipId: req.user.relationshipId, date: { gte: today } }, include: { answers: true } });
    if (!question) {
      const aiGen = generateMockAIQuestion();
      question = await prisma.dailyQuestion.create({ data: { text: aiGen.text, category: aiGen.category, date: new Date(), relationshipId: req.user.relationshipId }, include: { answers: true } });
    }
    const myAnswer = question.answers.find(a => a.userId === req.user.userId);
    const partnerAnswer = question.answers.find(a => a.userId !== req.user.userId);
    res.json({ id: question.id, text: question.text, category: question.category, myAnswer: myAnswer ? myAnswer.content : null, partnerAnswer: myAnswer ? (partnerAnswer ? partnerAnswer.content : null) : (partnerAnswer ? 'LOCKED' : null), partnerAnswered: !!partnerAnswer });
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.post('/daily-question/answer', authenticateToken, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    await prisma.questionAnswer.create({ data: { content, questionId, userId: req.user.userId } });
    const question = await prisma.dailyQuestion.findUnique({ where: { id: questionId }, include: { answers: true }});
    
    if (question.answers.length === 2) {
      const rel = await prisma.relationship.findUnique({ where: { id: req.user.relationshipId } });
      await prisma.relationship.update({ where: { id: req.user.relationshipId }, data: { streakCount: rel.streakCount + 1, lastAnswerDate: new Date() } });
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.get('/date-ideas/random', authenticateToken, async (req, res) => {
  try {
    const ideas = await prisma.dateIdea.findMany({ where: { relationshipId: req.user.relationshipId, isCompleted: false } });
    if (ideas.length === 0) {
      const defaultIdeas = [ { title: "Cozinhar uma receita complexa do YouTube juntos", category: "FUN" }, { title: "Jantar à luz de velas em casa", category: "ROMANTIC" }, { title: "Massagem com óleos quentes", category: "SPICY" } ];
      for (const idea of defaultIdeas) { await prisma.dateIdea.create({ data: { ...idea, relationshipId: req.user.relationshipId }}); }
      return res.json(defaultIdeas[Math.floor(Math.random() * defaultIdeas.length)]);
    }
    res.json(ideas[Math.floor(Math.random() * ideas.length)]);
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

// ==========================================
// 📡 WEBSOCKET 
// ==========================================
io.on('connection', (socket) => {
  socket.on('entrar_na_sala', (relationshipId) => { socket.join(relationshipId); });
  
  socket.on('nova_mensagem', async (dados) => {
    try {
      const novaMensagemDB = await prisma.message.create({
        data: { content: dados.texto, senderId: dados.authorId, relationshipId: dados.relationshipId }
      });
      dados.id = novaMensagemDB.createdAt;
      io.to(dados.relationshipId).emit('receber_mensagem', dados);
    } catch (error) { console.error('Erro Socket', error); }
  });

  socket.on('disconnect', () => {});
});

// ==========================================
// 🌐 WEBHOOK DA KIWIFY (Aprovadas as compras - Sprint Futuro)
// ==========================================
/*
app.post('/kiwify/webhook', async (req, res) => {
  // 1. Validar Token da Kiwify
  // 2. Se status == 'approved', gera a Licença VRN-XXXX
  // 3. Envia e-mail de boas-vindas com a licença
  res.status(200).send('OK');
});
*/

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Verona 1.0 (Sprint 1) rodando na porta ${PORT}`));