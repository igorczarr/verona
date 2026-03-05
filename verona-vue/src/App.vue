<template>
  <div data-theme="romantic" class="app-master-wrapper">
    
    <div v-if="!usuarioLogado" class="login-screen" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg-app)">
      <div class="login-card" style="background: var(--bg-surface); padding: 40px; border-radius: 30px; box-shadow: var(--shadow-ambient); width: 100%; max-width: 400px; text-align: center; border: 1px solid var(--border-glass)">
        <Sparkles :size="48" color="var(--accent-color)" style="margin-bottom: 15px" />
        <h1 class="playfair" style="color: var(--text-main); margin: 0 0 10px 0">Verona</h1>
        <p style="color: var(--text-muted); margin-bottom: 30px">Santuário para o nosso amor.</p>
        <form @submit.prevent="modoAuth === 'login' ? fazerLogin() : fazerCadastro()">
          <template v-if="modoAuth === 'register'">
            <input type="text" class="glass-input" placeholder="Seu nome" v-model="nome" required />
            <input type="text" class="glass-input" placeholder="@usuario" v-model="username" required />
          </template>
          <input type="email" class="glass-input" placeholder="Seu e-mail" v-model="email" required />
          <input type="password" class="glass-input" placeholder="Sua senha secreta" v-model="senha" required />
          <input v-if="modoAuth === 'register'" type="text" class="glass-input" placeholder="Código de convite (Opcional)" v-model="codigoConvite" />
          <button type="submit" class="btn-magic" style="width: 100%; margin-top: 10px">
            {{ modoAuth === 'login' ? 'Acessar' : 'Criar Conta' }}
          </button>
        </form>
        <p style="margin-top: 25px; color: var(--text-muted); font-size: 14px; cursor: pointer" @click="modoAuth = modoAuth === 'login' ? 'register' : 'login'">
          {{ modoAuth === 'login' ? 'Não tem um cofre? Cadastre-se' : 'Já tem conta? Faça login' }}
        </p>
      </div>
    </div>

    <div v-else-if="usuarioLogado.relationship.status === 'PENDING'" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg-app); text-align: center">
       <div style="background: var(--bg-surface); padding: 40px; border-radius: 30px; max-width: 400px; border: 1px solid var(--border-glass); box-shadow: var(--shadow-ambient)">
          <Heart :size="60" color="var(--accent-color)" style="margin-bottom: 20px" />
          <h2 class="playfair">Aguardando a Conexão</h2>
          <p style="color: var(--text-muted)">Envie este código para o seu parceiro inserir no cadastro:</p>
          <h3 style="background: rgba(128,128,128,0.1); padding: 15px; border-radius: 15px; letter-spacing: 2px; color: var(--accent-color)">{{ usuarioLogado.relationship.inviteCode }}</h3>
          <button class="btn-magic" style="margin: 0 auto" @click="copiarCodigo">Copiar Código</button>
       </div>
    </div>

    <div v-else class="app-master-layout">
      
      <aside class="desktop-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 30px;">
          <div class="workspace-brand" style="margin-bottom: 0; padding-right: 0; display: flex; align-items: center; gap: 10px;" v-show="!sidebarCollapsed">
            <Sparkles :size="28" style="flex-shrink: 0; color: var(--accent-color)" /> 
            <div style="display: flex; flex-direction: column;">
              <span class="brand-text playfair" style="font-size: 26px; color: var(--accent-color); line-height: 1;">Verona</span>
              <span style="font-size: 11px; font-weight: bold; color: #F97316; margin-top: 2px;">🔥 {{ usuarioLogado.relationship.streakCount }} dias juntos</span>
            </div>
          </div>
          <button class="toggle-btn" style="position: static; margin: 0 auto; box-shadow: none; border-color: transparent;" @click="sidebarCollapsed = !sidebarCollapsed">
            <ChevronRight v-if="sidebarCollapsed" :size="20" />
            <ChevronLeft v-else :size="20" />
          </button>
        </div>

        <div class="channel-group">
          <div class="nav-section-title">
            <span v-show="!sidebarCollapsed">Canais</span>
            <button v-show="!sidebarCollapsed" class="add-channel-btn" @click="modoCriarCanal = !modoCriarCanal"><Plus :size="16" /></button>
          </div>
          <form v-if="modoCriarCanal && !sidebarCollapsed" @submit.prevent="criarCanal" style="margin-bottom: 15px;">
             <input type="text" class="glass-input" style="padding: 10px; font-size: 14px; margin-bottom: 0;" placeholder="Ex: #viagem-2026" v-model="novoCanalNome" autoFocus />
          </form>
          <div v-for="canal in canais" :key="canal.id" class="nav-item" :class="{ active: canalAtivo?.id === canal.id && abaAtiva === 'feed' }" @click="mudarCanal(canal)">
            <Hash :size="18" style="flex-shrink: 0; opacity: 0.7;" />
            <span class="nav-text" v-show="!sidebarCollapsed">{{ canal.name }}</span>
          </div>
        </div>

        <div class="channel-group">
          <div class="nav-section-title"><span v-show="!sidebarCollapsed">Conexão</span></div>
          <div class="nav-item" :class="{ active: abaAtiva === 'chat' }" @click="abaAtiva = 'chat'">
            <MessageCircle :size="18" style="flex-shrink: 0; opacity: 0.7;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Chat Privado</span>
          </div>
          <div class="nav-item" :class="{ active: abaAtiva === 'meu-perfil' }" @click="abaAtiva = 'meu-perfil'">
            <UserIcon :size="18" style="flex-shrink: 0; opacity: 0.7;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Meu Perfil</span>
          </div>
          <div class="nav-item" :class="{ active: abaAtiva === 'nosso-perfil' }" @click="abaAtiva = 'nosso-perfil'">
            <Heart :size="18" style="flex-shrink: 0; opacity: 0.7;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Nosso Mundo</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px;">
           <button @click="enviarSaudade" class="btn-magic" style="width: 100%; background: linear-gradient(135deg, #F43F5E, #E11D48); padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <Flame :size="16"/> <span v-show="!sidebarCollapsed">Pensando em você</span>
           </button>
           <div class="nav-item" style="color: #EF4444" @click="fazerLogout">
             <LogOut :size="18" style="flex-shrink: 0;" /> 
             <span class="nav-text" v-show="!sidebarCollapsed">Encerrar Sessão</span>
           </div>
        </div>
      </aside>

      <main class="main-stage">
        <header class="stage-header">
          <h2 class="stage-title playfair">
            <template v-if="abaAtiva === 'feed' && canalAtivo"><span style="color: var(--accent-color)">#</span> {{ canalAtivo.name }}</template>
            <template v-else-if="abaAtiva === 'chat'">Chat Privado</template>
            <template v-else-if="abaAtiva === 'meu-perfil'">Meu Perfil</template>
            <template v-else>Nosso Mundo</template>
          </h2>
          <div style="font-size: 24px" :title="'Humor atual do parceiro'">{{ obterIconeHumor(usuarioLogado.moodStatus) }}</div>
        </header>

        <template v-if="abaAtiva === 'feed'">
          <div class="scroll-area">
            
            <div v-if="dailyQuestion && canalAtivo?.name === 'geral'" style="background: linear-gradient(135deg, var(--bg-surface), var(--bg-app)); border: 2px solid var(--accent-glow); border-radius: 24px; padding: 25px; margin-bottom: 30px; position: relative; overflow: hidden; box-shadow: var(--shadow-ambient);">
               <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05;"><Sparkles :size="150" /></div>
               <div style="font-size: 11px; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                 <Lock :size="14" v-if="dailyQuestion.partnerAnswer === 'LOCKED'"/> 
                 <Unlock :size="14" v-else/> Pergunta do Dia
               </div>
               <h3 class="playfair" style="font-size: 22px; margin: 0 0 20px 0; color: var(--text-main); position: relative; z-index: 2;">{{ dailyQuestion.text }}</h3>
               
               <div v-if="!dailyQuestion.myAnswer" style="display: flex; gap: 10px; position: relative; z-index: 2;">
                 <input type="text" class="glass-input" style="margin-bottom: 0; padding: 12px 18px;" placeholder="Sua resposta sincera..." v-model="minhaRespostaDaily" @keydown.enter.prevent="responderDaily" />
                 <button class="btn-magic" @click="responderDaily">Responder</button>
               </div>
               <div v-else style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; position: relative; z-index: 2;">
                 <div style="background: rgba(128,128,128,0.05); padding: 15px; border-radius: 16px;">
                   <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Sua Resposta:</div>
                   <div style="font-size: 16px; font-weight: 500;">{{ dailyQuestion.myAnswer }}</div>
                 </div>
                 <div style="background: rgba(128,128,128,0.05); padding: 15px; border-radius: 16px; border: 1px dashed var(--border-glass)">
                   <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Resposta do Seu Amor:</div>
                   <div v-if="dailyQuestion.partnerAnswer === 'LOCKED'" style="font-size: 14px; font-style: italic; color: var(--text-muted); display: flex; align-items: center; gap: 5px;"><Clock :size="14"/> Aguardando resposta...</div>
                   <div v-else style="font-size: 16px; font-weight: 500; color: var(--accent-color)">{{ dailyQuestion.partnerAnswer }}</div>
                 </div>
               </div>
            </div>

            <div v-for="post in feed" :key="post.id" class="post-glass-card" style="flex-direction: column; gap: 15px;">
              <div style="display: flex; gap: 20px;">
                <div class="avatar-img" style="overflow: hidden;">
                  <img v-if="post.author.avatarUrl" :src="post.author.avatarUrl" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
                  <template v-else>{{ getInicial(post.author.name) }}</template>
                </div>
                
                <div class="post-content">
                  <div class="post-header">
                     <span class="post-author">{{ post.author.name }}</span>
                     <span class="post-timestamp" style="opacity: 0.7">{{ formatarDataHora(post.createdAt) }}</span>
                  </div>
                  
                  <div v-if="estaTrancado(post.unlockAt)" style="background: rgba(128,128,128,0.1); padding: 20px; border-radius: 16px; text-align: center; border: 1px dashed var(--border-glass);">
                    <Gift :size="30" color="var(--text-muted)" style="margin: 0 auto 10px auto" />
                    <div style="font-weight: bold; color: var(--text-main)">Cápsula do Tempo</div>
                    <div style="font-size: 13px; color: var(--text-muted)">Estará disponível em: {{ formatarData(post.unlockAt) }}</div>
                  </div>
                  <div v-else class="post-text">{{ post.content }}</div>
                  
                  <div v-if="!estaTrancado(post.unlockAt)" style="display: flex; gap: 30px; color: var(--text-muted)">
                    <div @click="toggleRespostas(post)" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s" :style="{color: post.mostrarRespostas ? 'var(--accent-color)' : ''}">
                      <MessageCircle :size="18"/> Comentar ({{ post.replies?.length || 0 }})
                    </div>
                    <div @click="curtirPost(post)" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s" :style="{color: post.curtido ? 'var(--accent-color)' : ''}">
                      <Heart :size="18" :fill="post.curtido ? 'currentColor' : 'none'"/> Curtir {{ post.likesCount ? `(${post.likesCount})` : '' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="feed.length === 0" style="text-align: center; color: var(--text-muted); margin-top: 40px;">Este canal está vazio. Envie a primeira mensagem abaixo.</p>
          </div>

          <div class="composer-footer-anchor">
             <div class="immersive-composer">
               <textarea class="composer-textarea" placeholder="Envie uma mensagem para o canal..." v-model="novoTexto" @keydown.enter.prevent="enviarPost"></textarea>
               <div class="composer-toolbar">
                 <div style="display: flex; align-items: center; gap: 20px;">
                   <div style="color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 8px">
                      <ImageIcon :size="20" /> <span style="font-size: 14px; font-weight: 600">Mídia</span>
                   </div>
                   <div style="color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 8px" @click="modoCapsula = !modoCapsula">
                      <Clock :size="18" :color="modoCapsula ? 'var(--accent-color)' : 'currentColor'" /> <span style="font-size: 14px; font-weight: 600" :style="{color: modoCapsula ? 'var(--accent-color)' : ''}">Cápsula do Tempo</span>
                   </div>
                 </div>
                 <button class="btn-magic" @click="enviarPost"><Send :size="16" style="margin-right: 8px" /> Enviar</button>
               </div>
               <div v-if="modoCapsula" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-glass); display: flex; align-items: center; gap: 15px;">
                 <span style="font-size: 13px; color: var(--text-muted)">Desbloquear esta mensagem no dia:</span>
                 <input type="date" class="glass-input" style="margin-bottom: 0; padding: 8px 15px; width: auto;" v-model="dataCapsula" />
               </div>
             </div>
          </div>
        </template>

        <template v-if="abaAtiva === 'nosso-perfil'">
          <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
             
             <div style="flex-shrink: 0; position: relative; height: 200px; border-bottom: 1px solid var(--border-glass);">
                <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" alt="Capa do Casal" />
                <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 30px;">
                   <h2 class="playfair" style="color: white; font-size: 36px; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Nosso Mundo</h2>
                   <div style="color: rgba(255,255,255,0.8); font-size: 14px; display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                     <Music :size="14"/> <span style="cursor: pointer; text-decoration: underline" @click="tocarMusicaDoCasal">Ouvir Trilha Sonora</span>
                   </div>
                </div>
                <button style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 20px; font-size: 12px; cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 8px;">
                  <Camera :size="14"/> Alterar Capa
                </button>
             </div>

             <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 25px 40px;">
               
               <div style="flex-shrink: 0; background: linear-gradient(135deg, var(--accent-glow), rgba(0,0,0,0.02)); border: 1px solid var(--accent-color); border-radius: 20px; padding: 20px 25px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 5px 20px var(--accent-glow);">
                  <div>
                    <h3 class="playfair" style="margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;"><Sparkles :size="20" color="var(--accent-color)"/> O que vamos fazer hoje?</h3>
                    <div v-if="ideaSorteada" style="margin-top: 10px; font-size: 16px; font-weight: bold; color: var(--accent-color); background: var(--bg-surface); padding: 8px 15px; border-radius: 12px; display: inline-block;">
                      {{ ideaSorteada.title }}
                    </div>
                  </div>
                  <button class="btn-magic" style="padding: 10px 25px; font-size: 14px;" @click="girarRoleta">Girar Roleta</button>
               </div>

               <div style="flex: 1; display: flex; gap: 40px; overflow: hidden;">
                  
                  <div style="flex: 2; display: flex; flex-direction: column; overflow: hidden;">
                     <div style="flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-glass); padding-bottom: 10px; margin-bottom: 20px;">
                       <h3 class="playfair" style="font-size: 20px; margin: 0;">Linha do Tempo</h3>
                       <button class="btn-magic" style="padding: 8px 15px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                         <ImageIcon :size="14" /> Nova Memória
                       </button>
                     </div>
                     
                     <div style="flex: 1; overflow-y: auto; padding-right: 15px;" class="hide-scrollbar">
                        <div v-for="foto in mockGaleria" :key="foto.id" style="background: var(--bg-app); border-radius: 20px; overflow: hidden; border: 1px solid var(--border-glass); margin-bottom: 30px;">
                           <img :src="foto.img" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; display: block;" />
                           <div style="padding: 20px;">
                              <div style="font-size: 15px; margin-bottom: 15px; color: var(--text-main); line-height: 1.5">{{ foto.desc }}</div>
                              <div style="display: flex; align-items: center; justify-content: space-between; color: var(--text-muted); border-top: 1px solid var(--border-glass); padding-top: 15px;">
                                 <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="avatar-img" style="width: 24px; height: 24px; font-size: 10px; overflow: hidden">
                                      <img v-if="foto.authorAvatar" :src="foto.authorAvatar" style="width:100%; height:100%; object-fit:cover;"/>
                                      <template v-else>{{ getInicial(foto.author) }}</template>
                                    </div>
                                    <span style="font-size: 13px; font-weight: 600">{{ foto.author }}</span>
                                 </div>
                                 <span style="font-size: 12px">{{ foto.date }}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-surface); border-radius: 20px; border: 1px solid var(--border-glass);">
                     <div style="flex-shrink: 0; padding: 20px 20px 0 20px;">
                       <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-glass); padding-bottom: 10px; margin-bottom: 20px;">
                          <h3 class="playfair" style="font-size: 18px; margin: 0;">Nossos Marcos</h3>
                          <button @click="toggleEditDatas" style="background: none; border: none; color: var(--accent-color); font-weight: bold; cursor: pointer; font-size: 13px;">{{ editandoDatas ? 'Salvar' : 'Editar' }}</button>
                       </div>
                     </div>
                     
                     <div style="flex: 1; overflow-y: auto; padding: 0 20px 20px 20px;" class="hide-scrollbar">
                        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
                          <div style="background: var(--bg-app); padding: 15px; border-radius: 12px; border: 1px solid var(--border-glass);">
                             <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">Início do Namoro</div>
                             <input v-if="editandoDatas" type="date" class="glass-input" v-model="formDatas.startDate" style="margin-bottom: 0; padding: 8px;" />
                             <div v-else style="font-size: 14px; font-weight: 800; color: var(--accent-color);">{{ formDatas.startDate ? formatarData(formDatas.startDate) : 'Definir data' }}</div>
                          </div>
                          <div style="background: var(--bg-app); padding: 15px; border-radius: 12px; border: 1px solid var(--border-glass);">
                             <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">Primeiro Beijo</div>
                             <input v-if="editandoDatas" type="date" class="glass-input" v-model="formDatas.firstKiss" style="margin-bottom: 0; padding: 8px;" />
                             <div v-else style="font-size: 14px; font-weight: 800; color: var(--text-main);">{{ formDatas.firstKiss ? formatarData(formDatas.firstKiss) : 'Definir data' }}</div>
                          </div>
                       </div>

                       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                          <h4 class="playfair" style="margin: 0; font-size: 16px">Nossas Metas</h4>
                          <button v-if="editandoDatas" @click="adicionarMeta" style="background: var(--accent-color); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">+</button>
                       </div>
                       <div style="display: flex; flex-direction: column; gap: 10px;">
                          <div v-for="(meta, index) in metasCasal" :key="index" style="background: var(--bg-app); padding: 10px 12px; border-radius: 12px; border: 1px dashed var(--accent-color); display: flex; align-items: center; gap: 10px;">
                             <Sparkles :size="14" color="var(--accent-color)"/>
                             <input v-if="editandoDatas" type="text" class="glass-input" v-model="meta.titulo" style="margin-bottom: 0; padding: 5px; font-size: 13px; flex: 1" placeholder="Nova Meta..." />
                             <span v-else style="font-size: 13px; font-weight: 600">{{ meta.titulo }}</span>
                          </div>
                       </div>
                     </div>
                  </div>

               </div>
             </div>
          </div>
        </template>

        <template v-if="abaAtiva === 'meu-perfil'">
          <div class="scroll-area" style="max-width: 600px; margin: 0 auto; width: 100%">
             
             <div style="text-align: center; margin-bottom: 40px; position: relative;">
                <div class="avatar-img" style="width: 120px; height: 120px; font-size: 40px; margin: 0 auto 15px auto; overflow: hidden; box-shadow: var(--shadow-ambient);">
                   <img v-if="usuarioLogado.avatarUrl" :src="usuarioLogado.avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                   <template v-else>{{ getInicial(usuarioLogado.name) }}</template>
                </div>
                <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="onFileSelected" />
                <button class="btn-magic" @click="triggerFileInput" style="padding: 8px 20px; font-size: 13px; background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color); box-shadow: none;">Alterar Minha Foto</button>
             </div>

             <div style="background: var(--bg-surface); padding: 30px; border-radius: 24px; border: 1px solid var(--border-glass); margin-bottom: 30px; text-align: center; box-shadow: var(--shadow-ambient);">
                <h3 class="playfair" style="margin: 0 0 5px 0; font-size: 22px;">Como você está se sentindo hoje?</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Seu parceiro verá seu status para entender suas necessidades.</p>
                <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                  <button v-for="mood in moodOptions" :key="mood.id" @click="atualizarHumor(mood.id)"
                    :style="{
                      background: usuarioLogado.moodStatus === mood.id ? 'var(--accent-color)' : 'var(--bg-app)',
                      color: usuarioLogado.moodStatus === mood.id ? 'white' : 'var(--text-main)',
                      border: '1px solid ' + (usuarioLogado.moodStatus === mood.id ? 'var(--accent-color)' : 'var(--border-glass)'),
                      padding: '12px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
                    }">
                    <span>{{ mood.icon }}</span> {{ mood.label }}
                  </button>
                </div>
             </div>

             <div style="background: var(--bg-app); padding: 30px; border-radius: 20px; border: 1px solid var(--border-glass);">
                <h3 style="margin: 0 0 20px 0; color: var(--text-muted); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Meus Dados Pessoais</h3>
                <input type="text" class="glass-input" v-model="formMeuPerfil.name" disabled />
                <input type="text" class="glass-input" v-model="formMeuPerfil.username" disabled style="margin-bottom: 0;" />
             </div>
          </div>
        </template>
        
        <template v-if="abaAtiva === 'chat'">
           <div class="scroll-area" style="padding-bottom: 0;">
             <div style="display: flex; flex-direction: column; flex: 1; justify-content: flex-end; gap: 20px; margin-bottom: 20px;">
               <div v-for="(msg, idx) in mensagensChat" :key="idx" 
                    :style="{
                      alignSelf: msg.authorId === usuarioLogado.id ? 'flex-end' : 'flex-start',
                      display: 'flex',
                      flexDirection: msg.authorId === usuarioLogado.id ? 'row-reverse' : 'row',
                      gap: '12px',
                      maxWidth: '85%'
                    }">
                 
                 <div class="avatar-img" style="width: 36px; height: 36px; font-size: 14px; flex-shrink: 0; box-shadow: none; overflow: hidden;">
                   <img v-if="msg.authorAvatarUrl" :src="msg.authorAvatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                   <template v-else>{{ getInicial(msg.authorName) }}</template>
                 </div>
                 
                 <div style="display: flex; flex-direction: column;">
                   <div :style="{
                        background: msg.authorId === usuarioLogado.id ? 'var(--accent-color)' : 'var(--bg-app)',
                        color: msg.authorId === usuarioLogado.id ? 'white' : 'var(--text-main)',
                        padding: '14px 20px', borderRadius: '20px',
                        borderTopRightRadius: msg.authorId === usuarioLogado.id ? '4px' : '20px',
                        borderTopLeftRadius: msg.authorId !== usuarioLogado.id ? '4px' : '20px',
                        border: msg.authorId !== usuarioLogado.id ? '1px solid var(--border-glass)' : 'none',
                        fontSize: '15px', lineHeight: '1.5'
                      }">
                     {{ msg.texto }}
                   </div>
                   <div :style="{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: msg.authorId === usuarioLogado.id ? 'right' : 'left' }">
                     {{ formatarHora(msg.id) }}
                   </div>
                 </div>

               </div>
             </div>
           </div>
           <div class="composer-footer-anchor">
              <form @submit.prevent="enviarMensagemChat" style="display: flex; gap: 15px; align-items: center;">
                <input type="text" class="glass-input" style="margin-bottom: 0; border-radius: 30px;" placeholder="Mensagem secreta..." v-model="novaMensagemChat" />
                <button type="submit" class="btn-magic" style="border-radius: 50%; width: 50px; height: 50px; padding: 0; flex-shrink: 0"><Send :size="18" style="margin-left: -2px"/></button>
              </form>
           </div>
        </template>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, reactive } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Heart, MessageCircle, Sparkles, UserIcon, Music, 
  ImageIcon, Send, LogOut, Hash, Menu, ChevronLeft, ChevronRight, Plus, Camera, Lock, Unlock, Clock, Gift, Flame
} from 'lucide-vue-next'; 

const URL_API = 'http://localhost:3000';
let socket = null;

const usuarioLogado = ref(null);
const modoAuth = ref('login');
const nome = ref('');
const email = ref('');
const username = ref('');
const senha = ref('');
const codigoConvite = ref('');

const sidebarCollapsed = ref(false);
const abaAtiva = ref('nosso-perfil'); 

const canais = ref([]);
const canalAtivo = ref(null);
const modoCriarCanal = ref(false);
const novoCanalNome = ref('');

const feed = ref([]);
const novoTexto = ref('');
const mensagensChat = ref([]);
const novaMensagemChat = ref('');

const dailyQuestion = ref(null);
const minhaRespostaDaily = ref('');
const ideaSorteada = ref(null);
const modoCapsula = ref(false);
const dataCapsula = ref('');

const formMeuPerfil = reactive({ name: '', username: '' });
const moodOptions = [
  { id: 'exhausted', icon: '🔋', label: 'Bateria Fraca' },
  { id: 'romantic', icon: '🍷', label: 'Querendo Romance' },
  { id: 'spicy', icon: '🔥', label: 'Com Fogo' },
  { id: 'space', icon: '🛡️', label: 'Preciso de Espaço' }
];

const editandoDatas = ref(false);
const formDatas = reactive({ startDate: '', firstKiss: '' });
const metasCasal = ref([
  { titulo: 'Viajar para a Europa' },
  { titulo: 'Adotar um cachorro' }
]);
const adicionarMeta = () => { metasCasal.value.push({ titulo: '' }); };

const mockGaleria = ref([
  { id: 1, img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&fit=crop', desc: 'Nossa primeira viagem. O vento frio, o café quente e a certeza de que estávamos construindo algo incrível juntos.', author: 'Igor', authorAvatar: null, date: '22 de Outubro, 2026' },
  { id: 2, img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&fit=crop', desc: 'Aquele café da manhã surpresa que ele preparou. Os pequenos detalhes são os que mais importam ❤️', author: 'Julieta', authorAvatar: null, date: '15 de Outubro, 2026' }
]);

const tocarMusicaDoCasal = () => { alert("Iniciando playlist! (Integração de áudio pronta para a API do Spotify)"); };

// === O MOTOR DE AVATAR ===
const fileInputRef = ref(null);

const triggerFileInput = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Transformação imediata de Base64 para Optimistic UI
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Image = e.target.result;
    usuarioLogado.value.avatarUrl = base64Image;
    // (Futuro: Aqui injetaremos o código que envia esse Base64 para a AWS S3)
    alert("Foto de perfil atualizada no dispositivo! (Pronta para nuvem)");
  };
  reader.readAsDataURL(file);
};

watch(() => usuarioLogado.value, (user) => {
  if (user && user.relationship?.status === 'ACTIVE') {
    carregarCanais();
    carregarDailyQuestion();
    formMeuPerfil.name = user.name;
    formMeuPerfil.username = user.username;
    formDatas.startDate = user.relationship.startDate ? user.relationship.startDate.split('T')[0] : '';
    formDatas.firstKiss = user.relationship.firstKiss ? user.relationship.firstKiss.split('T')[0] : '';

    socket = io(URL_API);
    socket.emit('entrar_na_sala', user.relationship.id);
    socket.on('receber_mensagem', (msg) => mensagensChat.value.push(msg));
  }
});

watch(() => canalAtivo.value, (canal) => { if (canal) carregarFeed(); });

const enviarSaudade = async () => {
  try { alert(`E-mail de notificação enviado para o seu parceiro: "${usuarioLogado.value.name} está pensando em você agora."`); } 
  catch(e) { console.error(e); }
};

const carregarDailyQuestion = async () => {
  try {
    const res = await axios.get(`${URL_API}/daily-question`);
    dailyQuestion.value = res.data;
  } catch(e) { console.error(e); }
};

const responderDaily = async () => {
  if (!minhaRespostaDaily.value.trim()) return;
  try {
    await axios.post(`${URL_API}/daily-question/answer`, { questionId: dailyQuestion.value.id, content: minhaRespostaDaily.value });
    minhaRespostaDaily.value = '';
    await carregarDailyQuestion(); 
    if (dailyQuestion.value.partnerAnswered) { usuarioLogado.value.relationship.streakCount += 1; }
  } catch(e) { console.error(e); }
};

const girarRoleta = async () => {
  try {
    ideaSorteada.value = { title: "Sorteando..." };
    const res = await axios.get(`${URL_API}/date-ideas/random`);
    setTimeout(() => { ideaSorteada.value = res.data; }, 800); 
  } catch(e) { console.error(e); }
};

const atualizarHumor = async (moodId) => {
  try {
    await axios.put(`${URL_API}/users/me/mood`, { moodStatus: moodId });
    usuarioLogado.value.moodStatus = moodId;
  } catch(e) { console.error(e); }
};

const obterIconeHumor = (moodId) => {
  const found = moodOptions.find(m => m.id === moodId);
  return found ? found.icon : '';
};

const estaTrancado = (unlockAt) => {
  if (!unlockAt) return false;
  return new Date(unlockAt) > new Date(); 
};

const formatarDataHora = (dataIso) => {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  return `${data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}`;
};

const formatarData = (dataIso) => {
  if (!dataIso) return '';
  return new Date(dataIso + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatarHora = (ts) => ts ? new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }) : '';

const curtirPost = (post) => {
  post.curtido = !post.curtido;
  post.likesCount = post.curtido ? (post.likesCount || 0) + 1 : (post.likesCount || 1) - 1;
};

const toggleRespostas = (post) => { post.mostrarRespostas = !post.mostrarRespostas; };

const enviarResposta = async (post) => {
  if (!post.novaResposta?.trim()) return;
  try {
    const res = await axios.post(`${URL_API}/posts`, { content: post.novaResposta, parentId: post.id, channelId: canalAtivo.value.id });
    if (!post.replies) post.replies = [];
    post.replies.push(res.data);
    post.novaResposta = '';
  } catch(e) { console.error(e); }
};

const toggleEditDatas = async () => {
  if (editandoDatas.value) {
    try { await axios.put(`${URL_API}/relationship`, { firstDate: formDatas.startDate, firstKiss: formDatas.firstKiss }); } 
    catch(e) { console.error(e); }
  }
  editandoDatas.value = !editandoDatas.value;
};

const configurarAxiosToken = (token) => { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; };

const fazerLogin = async () => {
  try {
    const res = await axios.post(`${URL_API}/auth/login`, { email: email.value, password: senha.value });
    configurarAxiosToken(res.data.token);
    usuarioLogado.value = { ...res.data.user, relationship: res.data.relationship };
    senha.value = '';
  } catch (err) { alert(err.response?.data?.error || 'Erro no login'); }
};

const fazerCadastro = async () => {
  try {
    await axios.post(`${URL_API}/auth/register`, { name: nome.value, email: email.value, username: username.value, password: senha.value, inviteCode: codigoConvite.value });
    alert('Sucesso!'); modoAuth.value = 'login'; senha.value = '';
  } catch (err) { alert('Erro no cadastro'); }
};

const fazerLogout = () => { usuarioLogado.value = null; delete axios.defaults.headers.common['Authorization']; if (socket) socket.disconnect(); };
const copiarCodigo = () => { navigator.clipboard.writeText(usuarioLogado.value.relationship.inviteCode); alert('Código copiado!'); };

const carregarCanais = async () => {
  try {
    const res = await axios.get(`${URL_API}/channels`); canais.value = res.data;
    if (res.data.length > 0) canalAtivo.value = res.data[0];
  } catch (err) { console.error(err); }
};

const criarCanal = async () => {
  if (!novoCanalNome.value.trim()) return;
  try {
    await axios.post(`${URL_API}/channels`, { name: novoCanalNome.value });
    novoCanalNome.value = ''; modoCriarCanal.value = false; carregarCanais();
  } catch (err) { console.error(err); }
};

const mudarCanal = (canal) => { canalAtivo.value = canal; abaAtiva.value = 'feed'; };

const carregarFeed = async () => {
  if (!canalAtivo.value) return;
  try {
    const res = await axios.get(`${URL_API}/channels/${canalAtivo.value.id}/posts`);
    feed.value = res.data.map(post => ({ ...post, curtido: false, mostrarRespostas: false, novaResposta: '' }));
  } catch (err) { console.error(err); }
};

const enviarPost = async () => {
  if (!novoTexto.value.trim() || !canalAtivo.value) return;
  try {
    await axios.post(`${URL_API}/posts`, { 
      content: novoTexto.value, 
      channelId: canalAtivo.value.id,
      unlockAt: modoCapsula.value && dataCapsula.value ? dataCapsula.value : null 
    });
    novoTexto.value = ''; modoCapsula.value = false; dataCapsula.value = '';
    carregarFeed();
  } catch (err) { console.error(err); }
};

const enviarMensagemChat = () => {
  if (!novaMensagemChat.value.trim()) return;
  socket.emit('nova_mensagem', { 
    id: Date.now(), 
    texto: novaMensagemChat.value, 
    authorName: usuarioLogado.value.name, 
    authorId: usuarioLogado.value.id, 
    authorAvatarUrl: usuarioLogado.value.avatarUrl, // Avatar Dinâmico injetado no Socket!
    relationshipId: usuarioLogado.value.relationship.id 
  });
  novaMensagemChat.value = '';
};

const getInicial = (nomeStr) => nomeStr ? nomeStr.charAt(0).toUpperCase() : 'V';
onUnmounted(() => { if (socket) socket.disconnect(); });
</script>

<style>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hover\:scale-105:hover { transform: scale(1.05); }
</style>