// ==========================================
// VERONA OS - BACKEND SÊNIOR (Produção - IA Psicológica & Arquitetura)
// ==========================================
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

const app = express();
const prisma = new PrismaClient();
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const JWT_SECRET = process.env.JWT_SECRET || 'verona_super_secret_key_2026';
const MASTER_KEY = process.env.MASTER_KEY || 'VERONA2026'; 

// ==========================================
// 🧠 CONFIGURAÇÃO DA IA (GEMINI) - Comportamental e Contextual
// ==========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'SUA_CHAVE_AQUI');

const gerarPerguntaIA = async (nomesCasal) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Atue como um terapeuta de casais especialista no Método Gottman e nas 36 perguntas de Arthur Aron para gerar intimidade. 
    Crie uma única pergunta curta, profunda e reflexiva para o casal ${nomesCasal} responder em um diário compartilhado. 
    A pergunta deve focar em gerar apaixonamento, vulnerabilidade ou resgate de memórias afetivas.
    Retorne APENAS a pergunta formulada, sem aspas ou introduções.`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); 
    return { text: responseText.trim().replace(/['"]/g, ''), category: "DEEP" };
  } catch (error) {
    console.error("❌ ERRO GRAVE NO GEMINI (Pergunta):", error.message);
    return { text: "Se pudéssemos congelar um único momento que vivemos juntos, qual você escolheria?", category: "DEEP" };
  }
};

const gerarDateIA = async (nomesCasal, metasDoCasal) => {
  try {
    const metasStr = metasDoCasal.length > 0 ? metasDoCasal.map(m => m.title).join(', ') : "fortalecer a conexão";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Atue como um conselheiro matrimonial. Sugira uma ideia criativa, fora da caixa e factível para um encontro do casal ${nomesCasal}. 
    Considere que os sonhos/metas deles incluem: ${metasStr}.
    O encontro deve estimular a intimidade e a quebra de rotina empírica. 
    Retorne APENAS o título da ideia do encontro, em uma linha curta (máximo 15 palavras).`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return { title: responseText.trim().replace(/['"]/g, ''), category: "SURPRISE", isCompleted: false };
  } catch (error) {
    console.error("❌ ERRO GRAVE NO GEMINI (Date):", error.message);
    return { title: "Cozinhar um prato novo juntos, apenas à luz de velas", category: "ROMANTIC", isCompleted: false };
  }
};

// ==========================================
// ☁️ CONFIGURAÇÃO DO CLOUDINARY (CDN DE IMAGENS)
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (base64Image) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'Root') return base64Image; 
  try {
    const result = await cloudinary.uploader.upload(base64Image, { folder: "verona_santuario" });
    return result.secure_url;
  } catch (error) { return base64Image; }
};

// ==========================================
// 📧 E-MAILS E 🔔 NOTIFICAÇÕES
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const enviarEmail = async (para, assunto, texto) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try { await transporter.sendMail({ from: '"Verona" <verona@vrtice.com.br>', to: para, subject: assunto, text: texto }); } catch (error) {}
};

const criarNotificacao = async (type, text, senderId, relationshipId) => {
  try {
    const parceiro = await prisma.user.findFirst({ where: { relationshipId, id: { not: senderId } } });
    if (parceiro) await prisma.notification.create({ data: { type, text, userId: parceiro.id, relationshipId } });
  } catch (error) {}
};

// 🛡️ MIDDLEWARE DE SEGURANÇA
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado. Faça login.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sessão expirada. Faça login novamente.' });
    req.user = user; next();
  });
};

// ==========================================
// FUNÇÃO DE REPARO ESTRUTURAL DE CANAIS (Ponto 4 e 7)
// ==========================================
const repararCanaisDeSistema = async (relationshipId) => {
  if (!relationshipId) return;
  // Garante que o canal de Perguntas exista
  const sysQ = await prisma.channel.findFirst({ where: { relationshipId, isSystem: true, name: 'perguntasdodia' } });
  if (!sysQ) await prisma.channel.create({ data: { name: 'perguntasdodia', description: 'Nosso diário eterno', isSystem: true, relationshipId } });
  
  // Garante que o canal de Dates exista
  const sysD = await prisma.channel.findFirst({ where: { relationshipId, isSystem: true, name: 'dates' } });
  if (!sysD) await prisma.channel.create({ data: { name: 'dates', description: 'Planejamento dos nossos encontros', isSystem: true, relationshipId } });
};

// ==========================================
// 🎟️ ADMIN E AUTENTICAÇÃO
// ==========================================
app.post('/admin/generate-license', async (req, res) => {
  try {
    const { masterKey } = req.body;
    if (masterKey !== MASTER_KEY) return res.status(403).json({ error: 'Acesso negado.' });
    const randomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `VRN-${randomCode()}-${randomCode()}`;
    await prisma.license.create({ data: { key: newKey } });
    res.status(201).json({ success: true, license: newKey });
  } catch (error) { res.status(500).json({ error: 'Erro ao gerar.' }); }
});

app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { relationship: { include: { goals: true } } } });
    let partner = null;
    if (req.user.relationshipId) {
      await repararCanaisDeSistema(req.user.relationshipId); 
      partner = await prisma.user.findFirst({ where: { relationshipId: req.user.relationshipId, id: { not: req.user.userId } }});
    }
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user, relationship: user.relationship, partner });
  } catch (error) { res.status(500).json({ error: 'Erro ao restaurar sessão.' }); }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, username, password, inviteCode, licenseKey, coupleName } = req.body;
    if (!email || !password || !name || !username) return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });

    const passwordHash = await bcrypt.hash(password, 10);
    let relationshipId; let novoStatus = 'PENDING';

    if (inviteCode) {
      const rel = await prisma.relationship.findUnique({ where: { inviteCode } });
      if (!rel) return res.status(404).json({ error: 'Código de convite inválido.' });
      relationshipId = rel.id; novoStatus = 'ACTIVE';
      await prisma.relationship.update({ where: { id: relationshipId }, data: { status: novoStatus, startDate: new Date() } });
      const parceiro = await prisma.user.findFirst({ where: { relationshipId, NOT: { email } }});
      if (parceiro) enviarEmail(parceiro.email, "Santuário Completo ❤️", `${name} entrou no Verona!`);
    } else {
      if (!licenseKey) return res.status(403).json({ error: 'Licença de acesso obrigatória.' });
      const licencaValida = await prisma.license.findUnique({ where: { key: licenseKey } });
      if (!licencaValida || licencaValida.isUsed) return res.status(403).json({ error: 'Licença inválida ou já utilizada.' });

      const novoRel = await prisma.relationship.create({ data: { name: coupleName || "Nosso Mundo" } });
      relationshipId = novoRel.id;
      await prisma.channel.create({ data: { name: 'geral', description: 'O nosso dia a dia', relationshipId } });
      await prisma.channel.create({ data: { name: 'perguntasdodia', description: 'Nosso diário eterno', isSystem: true, relationshipId } });
      await prisma.channel.create({ data: { name: 'dates', description: 'Planejamento dos encontros', isSystem: true, relationshipId } });
      await prisma.license.update({ where: { id: licencaValida.id }, data: { isUsed: true } });
    }

    const newUser = await prisma.user.create({ data: { name, email, username, passwordHash, relationshipId }, include: { relationship: true } });
    res.status(201).json({ message: 'Sucesso', inviteCode: newUser.relationship.inviteCode, status: novoStatus });
  } catch (error) { res.status(500).json({ error: 'Erro ao registrar.' }); }
});

// LOGIN ESTREITO (Ponto 1)
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

    const user = await prisma.user.findUnique({ where: { email }, include: { relationship: { include: { goals: true } } } });
    if (!user) return res.status(401).json({ error: 'E-mail não cadastrado.' });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ error: 'Senha incorreta.' });

    const token = jwt.sign({ userId: user.id, relationshipId: user.relationshipId, name: user.name }, JWT_SECRET, { expiresIn: '365d' });
    
    let partner = null;
    if (user.relationshipId) {
      await repararCanaisDeSistema(user.relationshipId);
      partner = await prisma.user.findFirst({ where: { relationshipId: user.relationshipId, id: { not: user.id } }});
    }
    res.json({ token, user, relationship: user.relationship, partner });
  } catch (error) { res.status(500).json({ error: 'Erro interno no servidor.' }); }
});

// ==========================================
// ⚙️ ROTAS DE PERFIL
// ==========================================
app.put('/users/me', authenticateToken, async (req, res) => {
  try {
    const { moodStatus, avatarUrl, coverUrl, bio } = req.body;
    const dataToUpdate = {};
    if (moodStatus !== undefined) dataToUpdate.moodStatus = moodStatus;
    if (bio !== undefined) dataToUpdate.bio = bio;

    if (avatarUrl && avatarUrl.startsWith('data:image')) dataToUpdate.avatarUrl = await uploadImage(avatarUrl);
    else if (avatarUrl) dataToUpdate.avatarUrl = avatarUrl;
    
    if (coverUrl && coverUrl.startsWith('data:image')) dataToUpdate.coverUrl = await uploadImage(coverUrl);

    const updatedUser = await prisma.user.update({ where: { id: req.user.userId }, data: dataToUpdate });
    res.json(updatedUser);
  } catch (error) { res.status(500).json({ error: 'Erro ao atualizar.' }); }
});

app.get('/profile-posts/:userId', authenticateToken, async (req, res) => {
  try { res.json(await prisma.profilePost.findMany({ where: { authorId: req.params.userId }, orderBy: { createdAt: 'desc' } })); } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.post('/profile-posts', authenticateToken, async (req, res) => {
  try {
    let urlFinal = req.body.imageUrl;
    if (urlFinal && urlFinal.startsWith('data:image')) urlFinal = await uploadImage(urlFinal);
    const conteudoSeguro = req.body.content && req.body.content.trim() !== '' ? req.body.content : " "; 
    const novoPost = await prisma.profilePost.create({ data: { content: conteudoSeguro, imageUrl: urlFinal, authorId: req.user.userId } });
    res.status(201).json(novoPost);
  } catch (error) { res.status(500).json({ error: 'Erro no mural.' }); }
});

// ==========================================
// 🔔 NOTIFICAÇÕES E MEMÓRIAS
// ==========================================
app.get('/notifications', authenticateToken, async (req, res) => {
  try { res.json(await prisma.notification.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' }, take: 20 })); } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});
app.put('/notifications/read', authenticateToken, async (req, res) => {
  try { await prisma.notification.updateMany({ where: { userId: req.user.userId, isRead: false }, data: { isRead: true } }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});
app.post('/notifications/miss-you', authenticateToken, async (req, res) => {
  try {
    await criarNotificacao('MISS_YOU', req.body.customMessage || 'Está pensando em você...', req.user.userId, req.user.relationshipId);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});
app.get('/memories', authenticateToken, async (req, res) => {
  try { res.json(await prisma.memory.findMany({ where: { relationshipId: req.user.relationshipId }, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true, avatarUrl: true } } } })); } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});
app.post('/memories', authenticateToken, async (req, res) => {
  try {
    if (!req.body.base64Image) return res.status(400).json({ error: 'Imagem obrigatória.' });
    const imageUrl = await uploadImage(req.body.base64Image);
    const novaMemoria = await prisma.memory.create({ data: { imageUrl, description: req.body.description, authorId: req.user.userId, relationshipId: req.user.relationshipId }, include: { author: { select: { name: true, avatarUrl: true } } } });
    await criarNotificacao('NEW_MEMORY', `Adicionou uma nova memória visual.`, req.user.userId, req.user.relationshipId);
    res.status(201).json(novaMemoria);
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

// ==========================================
// 📺 CANAIS E POSTS (Trava de Sistema Reforçada)
// ==========================================
app.get('/channels', authenticateToken, async (req, res) => {
  try { res.json(await prisma.channel.findMany({ where: { relationshipId: req.user.relationshipId }, orderBy: { createdAt: 'asc' } })); } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.post('/channels', authenticateToken, async (req, res) => {
  try {
    const formattedName = req.body.name.trim().toLowerCase().replace(/\s+/g, '-'); 
    const newChannel = await prisma.channel.create({ data: { name: formattedName, description: req.body.description, relationshipId: req.user.relationshipId } });
    res.status(201).json(newChannel);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar.' }); }
});

app.delete('/channels/:id', authenticateToken, async (req, res) => {
  try {
    const canal = await prisma.channel.findUnique({ where: { id: req.params.id } });
    if (!canal) return res.status(404).json({ error: 'Canal não encontrado.' });
    if (canal.relationshipId !== req.user.relationshipId) return res.status(403).json({ error: 'Sem permissão.' });
    if (canal.isSystem) return res.status(403).json({ error: 'Canais de sistema não podem ser excluídos.' });
    await prisma.channel.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Erro ao excluir canal.' }); }
});

app.get('/channels/:channelId/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { relationshipId: req.user.relationshipId, channelId: req.params.channelId, parentId: null },
      take: 50, orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, username: true, avatarUrl: true } }, replies: { include: { author: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } } }
    });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl, parentId, channelId, unlockAt } = req.body;
    
    // Ponto 4: Impede postagem manual em canais fechados do sistema
    const canalAlvo = await prisma.channel.findUnique({ where: { id: channelId } });
    if(canalAlvo && canalAlvo.isSystem && !parentId) {
        return res.status(403).json({ error: 'Apenas o sistema pode iniciar posts neste canal (mas você pode comentar nos fios criados).' });
    }

    let urlFinal = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) urlFinal = await uploadImage(imageUrl);

    const novoPost = await prisma.post.create({
      data: { content, imageUrl: urlFinal, parentId, channelId, unlockAt: unlockAt ? new Date(unlockAt) : null, authorId: req.user.userId, relationshipId: req.user.relationshipId },
      include: { author: { select: { name: true, username: true, avatarUrl: true } } }
    });
    
    if (!parentId) await criarNotificacao('NEW_POST', `Compartilhou algo novo no canal.`, req.user.userId, req.user.relationshipId);
    else await criarNotificacao('NEW_REPLY', `Respondeu a uma postagem.`, req.user.userId, req.user.relationshipId);

    io.to(req.user.relationshipId).emit('feed_atualizado', { channelId });
    res.status(201).json(novoPost);
  } catch (error) { res.status(500).json({ error: 'Erro ao postar.' }); }
});

// ==========================================
// 💾 METAS E CHAT
// ==========================================
app.put('/relationship', authenticateToken, async (req, res) => {
  try {
    const { startDate, firstKiss, name, coverImageUrl, spotifyUri } = req.body;
    const dataToUpdate = {};
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (firstKiss) dataToUpdate.firstKiss = new Date(firstKiss);
    if (name) dataToUpdate.name = name;
    if (spotifyUri !== undefined) dataToUpdate.spotifyUri = spotifyUri;
    if (coverImageUrl && coverImageUrl.startsWith('data:image')) dataToUpdate.coverImageUrl = await uploadImage(coverImageUrl);
    const updated = await prisma.relationship.update({ where: { id: req.user.relationshipId }, data: dataToUpdate });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.post('/goals', authenticateToken, async (req, res) => {
  try { res.json(await prisma.goal.create({ data: { title: req.body.title, relationshipId: req.user.relationshipId } })); } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});
app.get('/goals', authenticateToken, async (req, res) => {
  try { res.json(await prisma.goal.findMany({ where: { relationshipId: req.user.relationshipId }})); } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});
app.get('/chat', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({ where: { relationshipId: req.user.relationshipId }, orderBy: { createdAt: 'asc' }, include: { sender: { select: { name: true, avatarUrl: true } } } });
    res.json(messages.map(msg => ({ id: msg.createdAt, texto: msg.content, authorId: msg.senderId, authorName: msg.sender.name, authorAvatarUrl: msg.sender.avatarUrl })));
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

// ==========================================
// 🧠 GAMIFICAÇÃO E IA (Punição e Lógica Estrutural)
// ==========================================
app.get('/daily-question', authenticateToken, async (req, res) => {
  try {
    const rel = await prisma.relationship.findUnique({ where: { id: req.user.relationshipId }, include: { users: true } });
    
    // Ponto 3: Zerar Streak se não responder em mais de 48h
    if (rel.lastAnswerDate) {
       const horasPassadas = (new Date() - new Date(rel.lastAnswerDate)) / (1000 * 60 * 60);
       if (horasPassadas > 48 && rel.streakCount > 0) {
          await prisma.relationship.update({ where: { id: rel.id }, data: { streakCount: 0 } });
       }
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    let question = await prisma.dailyQuestion.findFirst({ where: { relationshipId: req.user.relationshipId, date: { gte: today } }, include: { answers: true } });
    
    if (!question) {
      const nomes = rel.users.map(u => u.name).join(' e ');
      const aiGen = await gerarPerguntaIA(nomes); // Injeta o nome do casal na IA
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
    const question = await prisma.dailyQuestion.findUnique({ where: { id: questionId }, include: { answers: true, relationship: { include: { users: true } } }});
    
    // Ponto 4: Ambos responderam? Publica no canal fixo
    if (question.answers.length === 2) {
      await prisma.relationship.update({ where: { id: req.user.relationshipId }, data: { streakCount: { increment: 1 }, lastAnswerDate: new Date() } });
      
      const sysChannel = await prisma.channel.findFirst({ where: { relationshipId: req.user.relationshipId, isSystem: true, name: 'perguntasdodia' } });
      if (sysChannel) {
         const autor1 = question.relationship.users.find(u => u.id === question.answers[0].userId).name;
         const autor2 = question.relationship.users.find(u => u.id === question.answers[1].userId).name;
         const postContent = `🎯 **Nosso Diário Respondido!**\n\n**A Pergunta:** ${question.text}\n\n💬 **${autor1}:** ${question.answers[0].content}\n💬 **${autor2}:** ${question.answers[1].content}`;
         
         await prisma.post.create({ data: { content: postContent, channelId: sysChannel.id, authorId: req.user.userId, relationshipId: req.user.relationshipId } });
         io.to(req.user.relationshipId).emit('feed_atualizado', { channelId: sysChannel.id });
      }
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.get('/date-ideas/random', authenticateToken, async (req, res) => {
  try {
    const rel = await prisma.relationship.findUnique({ where: { id: req.user.relationshipId }, include: { users: true, goals: true } });
    const nomes = rel.users.map(u => u.name).join(' e ');
    
    // Ponto 7: Usa as Metas do Casal e o Nome como contexto para a IA
    const novaIdeiaIA = await gerarDateIA(nomes, rel.goals);
    await prisma.dateIdea.create({ data: { ...novaIdeiaIA, relationshipId: req.user.relationshipId }});
    
    // Publica no canal fixo de Dates
    const sysChannel = await prisma.channel.findFirst({ where: { relationshipId: req.user.relationshipId, isSystem: true, name: 'dates' } });
    if (sysChannel) {
       await prisma.post.create({ data: { content: `✨ **O Destino Escolheu!**\n\nEncontro Sorteado: **${novaIdeiaIA.title}**\n\nRespondam este fio para planejar quando e onde vamos realizar!`, channelId: sysChannel.id, authorId: req.user.userId, relationshipId: req.user.relationshipId } });
       io.to(req.user.relationshipId).emit('feed_atualizado', { channelId: sysChannel.id });
    }
    
    res.json(novaIdeiaIA);
  } catch (error) { res.status(500).json({ error: 'Erro ao gerar Date.' }); }
});

// ==========================================
// 📡 WEBSOCKET 
// ==========================================
io.on('connection', (socket) => {
  socket.on('entrar_na_sala', (relationshipId) => { socket.join(relationshipId); });
  socket.on('nova_mensagem', async (dados) => {
    try {
      const novaMensagemDB = await prisma.message.create({ data: { content: dados.texto, senderId: dados.authorId, relationshipId: dados.relationshipId } });
      dados.id = novaMensagemDB.createdAt;
      io.to(dados.relationshipId).emit('receber_mensagem', dados);
    } catch (error) { }
  });
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Verona OS (Prod) rodando na porta ${PORT}`));