<template>
  <div data-theme="romantic" class="app-master-wrapper">
    
    <div v-if="!usuarioLogado" class="login-screen" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg-app); padding: 20px;">
      <div class="login-card" style="background: var(--bg-surface); padding: 40px; border-radius: 30px; box-shadow: var(--shadow-ambient); width: 100%; max-width: 400px; text-align: center; border: 1px solid var(--border-glass)">
        <Sparkles :size="48" color="var(--accent-color)" style="margin-bottom: 15px" />
        <h1 class="playfair" style="color: var(--text-main); margin: 0 0 10px 0">Verona</h1>
        <p style="color: var(--text-muted); margin-bottom: 30px">Nosso espaço exclusivo.</p>
        
        <form @submit.prevent="modoAuth === 'login' ? fazerLogin() : fazerCadastro()">
          <template v-if="modoAuth === 'register'">
            <input type="text" class="glass-input" placeholder="Como quer ser chamado?" v-model="nome" required />
            <input type="text" class="glass-input" placeholder="@usuario" v-model="username" required />
            <input type="text" class="glass-input" placeholder="Nome do casal (Ex: Igor & Julieta)" v-model="coupleName" required />
          </template>
          
          <input type="email" class="glass-input" placeholder="Seu e-mail" v-model="email" required />
          <input type="password" class="glass-input" placeholder="Sua senha secreta" v-model="senha" required />
          
          <template v-if="modoAuth === 'register'">
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--border-glass); text-align: left;">
              <label style="font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 8px; display: block;">Como você vai entrar?</label>
              <input type="text" class="glass-input" placeholder="Tenho um Convite do meu amor" v-model="codigoConvite" />
              <p v-if="!codigoConvite && !licenseKey" style="text-align: center; font-size: 12px; color: var(--text-muted); margin: 5px 0;">OU</p>
              <input v-if="!codigoConvite" type="text" class="glass-input" placeholder="Tenho uma Licença de Acesso (VRN-...)" v-model="licenseKey" />
            </div>
          </template>

          <button type="submit" class="btn-magic" style="width: 100%; margin-top: 15px; font-size: 16px;">
            {{ modoAuth === 'login' ? 'Entrar no Verona' : 'Criar nosso Cofre' }}
          </button>
        </form>
        
        <p style="margin-top: 25px; color: var(--text-muted); font-size: 14px; cursor: pointer" @click="modoAuth = modoAuth === 'login' ? 'register' : 'login'">
          {{ modoAuth === 'login' ? 'Ainda não tem o seu? Comece aqui' : 'Já tem uma conta? Entre' }}
        </p>
      </div>
    </div>

    <div v-else-if="usuarioLogado.relationship.status === 'PENDING'" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg-app); text-align: center; padding: 20px;">
       <div style="background: var(--bg-surface); padding: 40px; border-radius: 30px; max-width: 400px; border: 1px solid var(--border-glass); box-shadow: var(--shadow-ambient)">
          <Heart :size="60" color="var(--accent-color)" style="margin-bottom: 20px" />
          <h2 class="playfair">Falta pouco!</h2>
          <p style="color: var(--text-muted)">Envie este código para o seu amor usar no cadastro:</p>
          <h3 style="background: rgba(128,128,128,0.1); padding: 20px; border-radius: 15px; letter-spacing: 3px; color: var(--accent-color); font-size: 24px;">{{ usuarioLogado.relationship.inviteCode }}</h3>
          <button class="btn-magic" style="margin: 0 auto; width: 100%" @click="copiarCodigo">Copiar Código</button>
       </div>
    </div>

    <div v-else class="app-master-layout" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
      
      <div class="mobile-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <Sparkles :size="24" color="var(--accent-color)" /> 
          <span class="playfair" style="font-size: 22px; color: var(--accent-color); font-weight: bold;">Verona</span>
        </div>
        <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Menu v-if="!isMobileMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>

      <aside class="desktop-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-brand-area" style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 30px;">
          <div class="workspace-brand" style="margin-bottom: 0; padding-right: 0; display: flex; align-items: center; gap: 12px;" v-show="!sidebarCollapsed">
            <div class="avatar-img" style="width: 40px; height: 40px; overflow: hidden; border: 2px solid var(--accent-color);">
              <img v-if="usuarioLogado.avatarUrl" :src="usuarioLogado.avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
              <template v-else>{{ getInicial(usuarioLogado.name) }}</template>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span class="brand-text playfair" style="font-size: 22px; color: var(--text-main); line-height: 1;">Verona</span>
              <span style="font-size: 12px; font-weight: bold; color: #F97316; margin-top: 4px;">🔥 {{ usuarioLogado.relationship.streakCount }} dias seguidos</span>
            </div>
          </div>
          <button class="toggle-btn desktop-only" style="position: static; margin: 0 auto; box-shadow: none; border-color: transparent;" @click="sidebarCollapsed = !sidebarCollapsed">
            <ChevronRight v-if="sidebarCollapsed" :size="20" />
            <ChevronLeft v-else :size="20" />
          </button>
        </div>

        <div class="channel-group">
          <div class="nav-section-title">
            <span v-show="!sidebarCollapsed">Conversas</span>
            <button v-show="!sidebarCollapsed" class="add-channel-btn" @click="modoCriarCanal = !modoCriarCanal"><Plus :size="16" /></button>
          </div>
          <form v-if="modoCriarCanal && !sidebarCollapsed" @submit.prevent="criarCanal" style="margin-bottom: 15px;">
             <input type="text" class="glass-input" style="padding: 10px; font-size: 14px; margin-bottom: 0;" placeholder="Ex: planejamento-viagem" v-model="novoCanalNome" autoFocus />
          </form>
          <div v-for="canal in canais" :key="canal.id" class="nav-item" :class="{ active: canalAtivo?.id === canal.id && abaAtiva === 'feed' }" @click="mudarCanal(canal)">
            <Hash :size="18" style="flex-shrink: 0; opacity: 0.7;" />
            <span class="nav-text" v-show="!sidebarCollapsed">{{ canal.name }}</span>
          </div>
        </div>

        <div class="channel-group">
          <div class="nav-section-title"><span v-show="!sidebarCollapsed">O Casal</span></div>
          <div class="nav-item" :class="{ active: abaAtiva === 'nosso-perfil' }" @click="mudarAba('nosso-perfil')">
            <Heart :size="18" style="flex-shrink: 0; opacity: 0.7;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">{{ usuarioLogado.relationship.name }}</span>
          </div>
          <div class="nav-item" :class="{ active: abaAtiva === 'encontros' }" @click="mudarAba('encontros')">
            <Calendar :size="18" style="flex-shrink: 0; opacity: 0.7;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Encontros</span>
          </div>
          <div class="nav-item" :class="{ active: abaAtiva === 'nossos-perfis' }" @click="mudarAba('nossos-perfis')">
            <UserIcon :size="18" style="flex-shrink: 0; opacity: 0.7;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Nossos Perfis</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px;">
           <button @click="abrirModalSaudade" class="btn-magic" style="width: 100%; background: linear-gradient(135deg, #F43F5E, #E11D48); padding: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 16px;">
             <Flame :size="18"/> <span v-show="!sidebarCollapsed" style="font-weight: bold">Pensando em você</span>
           </button>
           <div class="nav-item" style="color: #EF4444; margin-top: 10px;" @click="fazerLogout">
             <LogOut :size="18" style="flex-shrink: 0;" /> 
             <span class="nav-text" v-show="!sidebarCollapsed">Sair</span>
           </div>
        </div>
      </aside>

      <main class="main-stage">
        <header class="stage-header">
          <h2 class="stage-title playfair">
            <template v-if="abaAtiva === 'feed' && canalAtivo"><span style="color: var(--accent-color)">#</span> {{ canalAtivo.name }}</template>
            <template v-else-if="abaAtiva === 'nossos-perfis'">Nossos Perfis</template>
            <template v-else-if="abaAtiva === 'encontros'">Ideias de Encontros</template>
            <template v-else>{{ usuarioLogado.relationship.name }}</template>
          </h2>
          <div style="font-size: 28px; cursor: help;" :title="'Seu parceiro(a) está se sentindo: ' + (parceiro?.moodStatus || 'Neutro')">{{ obterIconeHumor(parceiro?.moodStatus) }}</div>
        </header>

        <template v-if="abaAtiva === 'feed'">
          <div class="scroll-area">
            
            <div v-if="dailyQuestion && canalAtivo?.name === 'geral'" style="background: linear-gradient(135deg, var(--bg-surface), var(--bg-app)); border: 2px solid var(--accent-glow); border-radius: 24px; padding: 25px; margin-bottom: 30px; position: relative; overflow: hidden; box-shadow: var(--shadow-ambient);">
               <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05;"><Sparkles :size="150" /></div>
               <div style="font-size: 12px; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                 <Lock :size="14" v-if="dailyQuestion.partnerAnswer === 'LOCKED'"/> 
                 <Unlock :size="14" v-else/> A Pergunta do Dia
               </div>
               <h3 class="playfair" style="font-size: 24px; margin: 0 0 20px 0; color: var(--text-main); position: relative; z-index: 2;">{{ dailyQuestion.text }}</h3>
               
               <div v-if="!dailyQuestion.myAnswer" style="display: flex; gap: 10px; position: relative; z-index: 2;">
                 <input type="text" class="glass-input" style="margin-bottom: 0; padding: 15px 20px; border-radius: 30px;" placeholder="Sua resposta sincera..." v-model="minhaRespostaDaily" @keydown.enter.prevent="responderDaily" />
                 <button class="btn-magic" style="border-radius: 30px; padding: 0 30px;" @click="responderDaily">Responder</button>
               </div>
               <div v-else class="daily-answers-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; position: relative; z-index: 2;">
                 <div style="background: rgba(128,128,128,0.05); padding: 20px; border-radius: 20px;">
                   <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">Sua Resposta:</div>
                   <div style="font-size: 16px; font-weight: 500; line-height: 1.4;">{{ dailyQuestion.myAnswer }}</div>
                 </div>
                 <div style="background: rgba(128,128,128,0.05); padding: 20px; border-radius: 20px; border: 1px dashed var(--border-glass)">
                   <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">Amor:</div>
                   <div v-if="dailyQuestion.partnerAnswer === 'LOCKED'" style="font-size: 14px; font-style: italic; color: var(--text-muted); display: flex; align-items: center; gap: 5px;"><Clock :size="14"/> Aguardando resposta...</div>
                   <div v-else style="font-size: 16px; font-weight: 500; color: var(--accent-color); line-height: 1.4;">{{ dailyQuestion.partnerAnswer }}</div>
                 </div>
               </div>
            </div>

            <div v-for="post in feed" :key="post.id" class="post-modern-card" style="margin-bottom: 25px;">
              <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div class="avatar-img" style="width: 45px; height: 45px; overflow: hidden; flex-shrink: 0; box-shadow: none; border: 1px solid var(--border-glass);">
                  <img v-if="post.author.avatarUrl" :src="post.author.avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                  <template v-else>{{ getInicial(post.author.name) }}</template>
                </div>
                
                <div style="flex: 1;">
                  <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 5px;">
                     <span style="font-weight: 700; font-size: 16px; color: var(--text-main);">{{ post.author.name }}</span>
                     <span style="font-size: 12px; color: var(--text-muted);">{{ formatarDataHora(post.createdAt) }}</span>
                  </div>
                  
                  <div v-if="estaTrancado(post.unlockAt)" style="background: rgba(128,128,128,0.1); padding: 20px; border-radius: 16px; text-align: center; border: 1px dashed var(--border-glass); margin-top: 10px;">
                    <Gift :size="30" color="var(--text-muted)" style="margin: 0 auto 10px auto" />
                    <div style="font-weight: bold; color: var(--text-main)">Cápsula do Tempo</div>
                    <div style="font-size: 13px; color: var(--text-muted)">Abre em: {{ formatarData(post.unlockAt) }}</div>
                  </div>
                  <div v-else>
                     <div style="font-size: 16px; line-height: 1.5; color: var(--text-main); margin-bottom: 15px; white-space: pre-wrap;">{{ post.content }}</div>
                     <img v-if="post.imageUrl" :src="post.imageUrl" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 16px; margin-bottom: 15px; border: 1px solid var(--border-glass);" />
                  </div>
                  
                  <div v-if="!estaTrancado(post.unlockAt)" style="display: flex; gap: 20px; color: var(--text-muted);">
                    <div @click="toggleRespostas(post)" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s" :style="{color: post.mostrarRespostas ? 'var(--accent-color)' : ''}">
                      <MessageCircle :size="18"/> <span style="font-size: 14px; font-weight: 500">Responder ({{ post.replies?.length || 0 }})</span>
                    </div>
                  </div>

                  <div v-if="post.mostrarRespostas" class="post-thread-area" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-glass);">
                    <div v-for="reply in post.replies" :key="reply.id" style="display: flex; gap: 12px; margin-bottom: 15px;">
                       <div class="avatar-img" style="width: 30px; height: 30px; font-size: 12px; flex-shrink: 0;">
                         <img v-if="reply.author.avatarUrl" :src="reply.author.avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                         <template v-else>{{ getInicial(reply.author.name) }}</template>
                       </div>
                       <div style="background: var(--bg-app); padding: 12px 15px; border-radius: 0 16px 16px 16px; font-size: 14px; flex: 1; border: 1px solid var(--border-glass);">
                          <span style="font-weight: bold; margin-right: 5px; color: var(--accent-color);">{{ reply.author.name }}</span>
                          {{ reply.content }}
                       </div>
                    </div>
                    <form @submit.prevent="enviarResposta(post)" style="display: flex; gap: 10px; margin-top: 10px;">
                       <input type="text" class="glass-input" style="margin-bottom: 0; padding: 12px 15px; border-radius: 30px; flex: 1; font-size: 14px;" placeholder="Escreva uma resposta..." v-model="post.novaResposta" />
                       <button type="submit" class="btn-magic" style="padding: 0 20px; font-size: 14px; border-radius: 30px;"><Send :size="16"/></button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
            <div v-if="feed.length === 0" style="text-align: center; margin-top: 60px;">
              <Sparkles :size="40" color="var(--text-muted)" style="opacity: 0.5; margin: 0 auto 15px auto;" />
              <p style="color: var(--text-muted); font-size: 16px;">Este espaço está em branco. Comece a história de vocês aqui.</p>
            </div>
          </div>

          <div class="composer-footer-anchor">
             <div class="immersive-composer">
               <textarea class="composer-textarea" placeholder="O que você quer compartilhar hoje?" v-model="novoTexto" @keydown.enter.prevent="enviarPost"></textarea>
               <div class="composer-toolbar">
                 <div style="display: flex; align-items: center; gap: 20px;">
                   <input type="file" ref="postInputRef" style="display: none" accept="image/*" @change="onPostImageSelected" />
                   <div style="color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 8px" @click="() => postInputRef.click()">
                      <ImageIcon :size="20" :color="imagemPostBase64 ? 'var(--accent-color)' : 'currentColor'" /> 
                      <span style="font-size: 14px; font-weight: 600" :style="{color: imagemPostBase64 ? 'var(--accent-color)' : ''}">{{ imagemPostBase64 ? 'Foto Anexada' : 'Foto' }}</span>
                   </div>
                   <div style="color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 8px" @click="modoCapsula = !modoCapsula">
                      <Clock :size="18" :color="modoCapsula ? 'var(--accent-color)' : 'currentColor'" /> <span style="font-size: 14px; font-weight: 600" :style="{color: modoCapsula ? 'var(--accent-color)' : ''}">Cápsula do Tempo</span>
                   </div>
                 </div>
                 <button class="btn-magic" @click="enviarPost" style="border-radius: 30px; padding: 10px 25px;"><Send :size="16" style="margin-right: 8px" /> Enviar</button>
               </div>
               <div v-if="modoCapsula" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-glass); display: flex; align-items: center; gap: 15px;">
                 <span style="font-size: 13px; color: var(--text-muted)">Abrir presente no dia:</span>
                 <input type="date" class="glass-input" style="margin-bottom: 0; padding: 8px 15px; width: auto; border-radius: 12px;" v-model="dataCapsula" />
               </div>
             </div>
          </div>
        </template>

        <template v-if="abaAtiva === 'encontros'">
           <div class="scroll-area" style="max-width: 800px; margin: 0 auto; width: 100%; padding-top: 20px;">
              <div style="background: linear-gradient(135deg, var(--accent-glow), rgba(0,0,0,0.02)); border: 1px solid var(--accent-color); border-radius: 30px; padding: 40px; text-align: center; box-shadow: 0 10px 30px var(--accent-glow);">
                  <Sparkles :size="40" color="var(--accent-color)" style="margin: 0 auto 20px auto;"/>
                  <h2 class="playfair" style="font-size: 32px; margin: 0 0 10px 0;">Roleta de Encontros</h2>
                  <p style="color: var(--text-muted); font-size: 16px; margin-bottom: 30px;">Sem ideias do que fazer hoje? Deixe o destino escolher por vocês.</p>
                  
                  <div v-if="ideaSorteada" style="background: var(--bg-surface); padding: 30px; border-radius: 20px; border: 2px dashed var(--accent-color); margin-bottom: 30px; animation: slideUp 0.4s ease-out;">
                    <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin-bottom: 10px; font-weight: bold;">O Encontro de Hoje será:</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-main);">{{ ideaSorteada.title }}</div>
                  </div>

                  <button class="btn-magic" style="padding: 15px 40px; font-size: 18px; border-radius: 40px;" @click="girarRoleta">Girar a Roleta 🎲</button>
              </div>
           </div>
        </template>

        <template v-if="abaAtiva === 'nosso-perfil'">
          <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
             
             <div style="flex-shrink: 0; position: relative; height: 250px; border-bottom: 1px solid var(--border-glass);">
                <img :src="usuarioLogado.relationship.coverImageUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&fit=crop'" style="width: 100%; height: 100%; object-fit: cover;" />
                <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 30px;">
                   <h2 class="playfair" style="color: white; font-size: 48px; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">{{ usuarioLogado.relationship.name }}</h2>
                </div>
                
                <input type="file" ref="relCoverInputRef" style="display: none" accept="image/*" @change="onRelCoverSelected" />
                <button @click="() => relCoverInputRef.click()" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 20px; font-size: 12px; cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 8px;">
                  <Camera :size="14"/> Alterar Capa
                </button>
             </div>

             <div class="scroll-area nos-mundo-pad" style="flex: 1; padding: 30px 40px; overflow-y: auto;">
               
               <div style="margin-bottom: 40px;">
                 <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-glass); padding-bottom: 10px; margin-bottom: 20px;">
                   <h3 class="playfair" style="font-size: 24px; margin: 0;">Nossos Momentos</h3>
                   <input type="file" ref="memoryInputRef" style="display: none" accept="image/*" @change="onMemorySelected" />
                   <button @click="triggerMemoryInput" style="background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color); padding: 6px 15px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer;">+ Adicionar</button>
                 </div>
                 
                 <div class="horizontal-gallery hide-scrollbar">
                    <div v-for="foto in galeriaReal" :key="foto.id" class="gallery-card-vertical">
                       <img :src="foto.imageUrl" />
                       <div class="gallery-card-overlay">
                          <div style="font-size: 13px; line-height: 1.4; margin-bottom: 10px; font-weight: 500;">{{ foto.description }}</div>
                          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; opacity: 0.8;">
                             <div style="display: flex; align-items: center; gap: 6px;">
                               <div class="avatar-img" style="width: 20px; height: 20px; font-size: 9px; overflow: hidden; border: 1px solid rgba(255,255,255,0.5);">
                                 <img v-if="foto.author?.avatarUrl" :src="foto.author.avatarUrl" style="width:100%; height:100%; object-fit:cover;"/>
                                 <template v-else>{{ getInicial(foto.author?.name) }}</template>
                               </div>
                               {{ foto.author?.name }}
                             </div>
                             <span>{{ formatarData(foto.createdAt) || 'Agora' }}</span>
                          </div>
                       </div>
                    </div>
                    <div @click="triggerMemoryInput" class="gallery-card-vertical empty-add" style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed var(--border-glass); background: var(--bg-app); cursor: pointer;">
                      <Plus :size="30" color="var(--text-muted)" style="margin-bottom: 10px;" />
                      <span style="color: var(--text-muted); font-weight: bold;">Nova Memória</span>
                    </div>
                 </div>
               </div>

               <div style="background: var(--bg-surface); padding: 30px; border-radius: 24px; border: 1px solid var(--border-glass);">
                 <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-glass); padding-bottom: 15px; margin-bottom: 25px;">
                    <h3 class="playfair" style="font-size: 22px; margin: 0;">Nossa História</h3>
                    <button @click="toggleEditDatas" style="background: none; border: none; color: var(--accent-color); font-weight: bold; cursor: pointer; font-size: 14px;">{{ editandoDatas ? 'Salvar' : 'Editar Datas' }}</button>
                 </div>
                 
                 <div class="dates-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="background: var(--bg-app); padding: 20px; border-radius: 16px; border: 1px solid var(--border-glass);">
                       <div style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">O Início de Tudo</div>
                       <input v-if="editandoDatas" type="date" class="glass-input" v-model="formDatas.startDate" style="margin-bottom: 0; padding: 10px; border-radius: 12px;" />
                       <div v-else style="font-size: 18px; font-weight: 800; color: var(--accent-color);">{{ formDatas.startDate ? formatarData(formDatas.startDate) : 'Definir data' }}</div>
                    </div>
                    <div style="background: var(--bg-app); padding: 20px; border-radius: 16px; border: 1px solid var(--border-glass);">
                       <div style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Primeiro Beijo</div>
                       <input v-if="editandoDatas" type="date" class="glass-input" v-model="formDatas.firstKiss" style="margin-bottom: 0; padding: 10px; border-radius: 12px;" />
                       <div v-else style="font-size: 18px; font-weight: 800; color: var(--text-main);">{{ formDatas.firstKiss ? formatarData(formDatas.firstKiss) : 'Definir data' }}</div>
                    </div>
                 </div>

                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 class="playfair" style="margin: 0; font-size: 20px">Nossos Sonhos</h4>
                    <button v-if="editandoDatas" @click="adicionarMeta" style="background: var(--accent-color); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><Plus :size="16" /></button>
                 </div>
                 <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                    <div v-for="meta in metasCasal" :key="meta.id" style="background: var(--bg-app); padding: 15px; border-radius: 16px; border: 1px dashed var(--accent-color); display: flex; align-items: center; gap: 12px;">
                       <Sparkles :size="18" color="var(--accent-color)"/>
                       <span style="font-size: 15px; font-weight: 600">{{ meta.title }}</span>
                    </div>
                 </div>
               </div>

             </div>
          </div>
        </template>

        <template v-if="abaAtiva === 'nossos-perfis'">
          <div class="scroll-area" style="padding-top: 20px;">
             
             <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 30px;">
                <button @click="perfilVisivel = 'me'" :class="{ 'btn-magic': perfilVisivel === 'me' }" style="padding: 10px 30px; border-radius: 30px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-main); font-weight: bold; cursor: pointer;" :style="perfilVisivel === 'me' ? 'color: white; border:none;' : ''">
                   {{ usuarioLogado.name }}
                </button>
                <button v-if="parceiro" @click="perfilVisivel = 'partner'" :class="{ 'btn-magic': perfilVisivel === 'partner' }" style="padding: 10px 30px; border-radius: 30px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-main); font-weight: bold; cursor: pointer;" :style="perfilVisivel === 'partner' ? 'color: white; border:none;' : ''">
                   {{ parceiro.name }}
                </button>
             </div>

             <div v-if="perfilDados" style="max-width: 600px; margin: 0 auto; width: 100%;">
               
               <div style="background: var(--bg-surface); border-radius: 30px; border: 1px solid var(--border-glass); box-shadow: var(--shadow-ambient); overflow: hidden; margin-bottom: 30px;">
                 <div style="height: 150px; background: var(--bg-app); position: relative;">
                    <img v-if="perfilDados.coverUrl" :src="perfilDados.coverUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                    <button v-if="perfilVisivel === 'me'" @click="() => profileCoverInputRef.click()" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border: none; padding: 6px 12px; border-radius: 20px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                      <Camera :size="12" /> Capa
                    </button>
                    <input type="file" ref="profileCoverInputRef" style="display: none" accept="image/*" @change="onProfileCoverSelected" />
                 </div>

                 <div style="padding: 0 30px 30px 30px; text-align: center; margin-top: -50px; position: relative;">
                    <div style="position: relative; display: inline-block; margin-bottom: 15px;">
                      <div class="avatar-img" style="width: 100px; height: 100px; font-size: 32px; border: 4px solid var(--bg-surface); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                         <img v-if="perfilDados.avatarUrl" :src="perfilDados.avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                         <template v-else>{{ getInicial(perfilDados.name) }}</template>
                      </div>
                      <button v-if="perfilVisivel === 'me'" @click="triggerFileInput" style="position: absolute; bottom: 0px; right: 0px; background: var(--accent-color); color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                        <Camera :size="14" />
                      </button>
                      <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="onFileSelected" />
                    </div>
                    
                    <h2 class="playfair" style="margin: 0 0 5px 0; font-size: 24px;">{{ perfilDados.name }}</h2>
                    <p style="color: var(--text-muted); margin: 0 0 15px 0; font-size: 14px;">@{{ perfilDados.username }}</p>
                    
                    <div v-if="perfilVisivel === 'me' && editandoBio">
                       <textarea class="glass-input" v-model="novaBio" placeholder="Escreva algo sobre você..." style="height: 80px; resize: none; font-size: 14px; text-align: center;"></textarea>
                       <button class="btn-magic" style="padding: 5px 15px; font-size: 12px; margin-bottom: 15px;" @click="salvarBio">Salvar Bio</button>
                    </div>
                    <div v-else @click="perfilVisivel === 'me' ? editandoBio = true : null" :style="{ cursor: perfilVisivel === 'me' ? 'pointer' : 'default' }" style="font-size: 15px; color: var(--text-main); margin-bottom: 20px; line-height: 1.5;">
                       {{ perfilDados.bio || (perfilVisivel === 'me' ? 'Clique para adicionar uma biografia.' : 'Sem biografia.') }}
                    </div>

                    <div style="background: var(--bg-app); padding: 15px; border-radius: 16px;">
                       <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: var(--text-muted);">Termômetro Emocional</h3>
                       
                       <div v-if="perfilVisivel === 'me'" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
                          <button v-for="mood in moodOptions" :key="mood.id" @click="atualizarHumor(mood.id)"
                            :style="{
                              background: perfilDados.moodStatus === mood.id ? 'var(--accent-color)' : 'transparent',
                              color: perfilDados.moodStatus === mood.id ? 'white' : 'var(--text-main)',
                              border: '1px solid ' + (perfilDados.moodStatus === mood.id ? 'var(--accent-color)' : 'var(--border-glass)'),
                              padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px'
                            }">
                            <span>{{ mood.icon }}</span> {{ mood.label }}
                          </button>
                       </div>
                       <div v-else style="display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: bold; color: var(--accent-color);">
                          {{ obterIconeHumor(perfilDados.moodStatus) }} {{ obterLabelHumor(perfilDados.moodStatus) || 'Neutro' }}
                       </div>
                    </div>
                 </div>
               </div>

               <div style="margin-bottom: 30px;">
                 <h3 class="playfair" style="font-size: 20px; margin-bottom: 15px;">Mural Pessoal</h3>
                 
                 <div v-if="perfilVisivel === 'me'" style="background: var(--bg-surface); padding: 15px; border-radius: 20px; border: 1px solid var(--border-glass); margin-bottom: 20px;">
                    <textarea class="glass-input" v-model="novoPostPerfilTexto" placeholder="Escreva algo no seu mural..." style="height: 60px; margin-bottom: 10px; border: none; background: transparent; padding: 0; box-shadow: none;"></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                       <input type="file" ref="profilePostInputRef" style="display: none" accept="image/*" @change="onProfilePostImageSelected" />
                       <button @click="() => profilePostInputRef.click()" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px;">
                         <ImageIcon :size="16" :color="novoPostPerfilImg ? 'var(--accent-color)' : 'currentColor'" /> <span style="font-size: 13px;">{{ novoPostPerfilImg ? 'Foto Anexada' : 'Foto' }}</span>
                       </button>
                       <button class="btn-magic" style="padding: 6px 15px; font-size: 13px;" @click="enviarPostPerfil">Postar</button>
                    </div>
                 </div>

                 <div v-for="post in profilePosts" :key="post.id" style="background: var(--bg-surface); padding: 20px; border-radius: 20px; border: 1px solid var(--border-glass); margin-bottom: 15px;">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">{{ formatarDataHora(post.createdAt) }}</div>
                    <div style="font-size: 15px; line-height: 1.5; color: var(--text-main); margin-bottom: 10px;">{{ post.content }}</div>
                    <img v-if="post.imageUrl" :src="post.imageUrl" style="width: 100%; border-radius: 12px;" />
                 </div>
                 <div v-if="profilePosts.length === 0" style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 14px; border: 1px dashed var(--border-glass); border-radius: 20px;">
                    O mural de {{ perfilDados.name }} está vazio.
                 </div>
               </div>

             </div>
          </div>
        </template>
      </main>

      <div v-if="modalSaudadeAberto" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px;">
         <div style="background: var(--bg-surface); padding: 30px; border-radius: 24px; border: 1px solid var(--border-glass); box-shadow: 0 20px 50px rgba(0,0,0,0.5); max-width: 400px; width: 100%; text-align: center; animation: slideUp 0.3s ease-out;">
            <Flame :size="50" color="#F43F5E" style="margin: 0 auto 15px auto;" />
            <h3 class="playfair" style="font-size: 24px; margin: 0 0 10px 0;">Mandando um sinal</h3>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Escreva um bilhete rápido. Ele chegará direto no e-mail do seu amor.</p>
            <textarea class="glass-input" v-model="textoSaudade" placeholder="Estou pensando no seu sorriso..." style="height: 100px; resize: none; margin-bottom: 20px;"></textarea>
            <div style="display: flex; gap: 15px;">
               <button @click="modalSaudadeAberto = false" style="flex: 1; padding: 12px; border-radius: 12px; background: transparent; border: 1px solid var(--border-glass); color: var(--text-muted); cursor: pointer; font-weight: bold;">Cancelar</button>
               <button @click="dispararSaudade" class="btn-magic" style="flex: 1; background: linear-gradient(135deg, #F43F5E, #E11D48); border: none;">Enviar ❤️</button>
            </div>
         </div>
      </div>

      <div class="chat-widget-container" :class="{ 'chat-open': isChatOpen }">
        <button class="chat-trigger-btn" @click="isChatOpen = !isChatOpen">
          <MessageCircle v-if="!isChatOpen" :size="28" />
          <X v-else :size="28" />
        </button>
        
        <div class="chat-window" v-if="isChatOpen">
          <div class="chat-window-header">
            <span class="playfair" style="font-size: 18px; font-weight: bold;">Nosso Chat</span>
            <div style="font-size: 12px; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 5px;"><Lock :size="12"/> Protegido</div>
          </div>
          
          <div class="chat-window-messages scroll-area hide-scrollbar" style="display: flex; flex-direction: column; gap: 15px; padding: 20px;">
             <div v-for="(msg, idx) in mensagensChat" :key="idx" :style="{ alignSelf: msg.authorId === usuarioLogado.id ? 'flex-end' : 'flex-start', display: 'flex', flexDirection: msg.authorId === usuarioLogado.id ? 'row-reverse' : 'row', gap: '8px', maxWidth: '90%' }">
               <div class="avatar-img" style="width: 28px; height: 28px; font-size: 10px; flex-shrink: 0; box-shadow: none; overflow: hidden;">
                 <img v-if="msg.authorAvatarUrl" :src="msg.authorAvatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                 <template v-else>{{ getInicial(msg.authorName) }}</template>
               </div>
               <div style="display: flex; flex-direction: column;">
                 <div :style="{ background: msg.authorId === usuarioLogado.id ? 'var(--accent-color)' : 'var(--bg-app)', color: msg.authorId === usuarioLogado.id ? 'white' : 'var(--text-main)', padding: '10px 15px', borderTopRightRadius: msg.authorId === usuarioLogado.id ? '4px' : '16px', borderTopLeftRadius: msg.authorId !== usuarioLogado.id ? '4px' : '16px', borderRadius: '16px', border: msg.authorId !== usuarioLogado.id ? '1px solid var(--border-glass)' : 'none', fontSize: '14px', lineHeight: '1.4' }">{{ msg.texto }}</div>
                 <div :style="{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.authorId === usuarioLogado.id ? 'right' : 'left' }">{{ formatarHora(msg.id) }}</div>
               </div>
             </div>
          </div>

          <form class="chat-window-input" @submit.prevent="enviarMensagemChat">
            <input type="text" class="glass-input" style="margin-bottom: 0; border-radius: 30px; font-size: 14px; padding: 10px 15px;" placeholder="Escreva algo..." v-model="novaMensagemChat" />
            <button type="submit" class="btn-magic" style="border-radius: 50%; width: 42px; height: 42px; padding: 0; flex-shrink: 0;"><Send :size="16" style="margin-left: -2px"/></button>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted, onMounted, reactive } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Heart, MessageCircle, Sparkles, UserIcon, X, Calendar,
  ImageIcon, Send, LogOut, Hash, Menu, ChevronLeft, ChevronRight, Plus, Camera, Lock, Unlock, Clock, Gift, Flame
} from 'lucide-vue-next'; 

const URL_API = 'http://localhost:3000'; // Substitua pela OnRender depois
let socket = null;

const usuarioLogado = ref(null);
const parceiro = ref(null); // Parceiro injetado no login
const modoAuth = ref('login');
const nome = ref('');
const email = ref('');
const username = ref('');
const senha = ref('');
const codigoConvite = ref('');
const licenseKey = ref('');
const coupleName = ref(''); // NOVO: Nome do casal no cadastro

const sidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const isChatOpen = ref(false);
const abaAtiva = ref('feed'); 

// MODAL SAUDADE
const modalSaudadeAberto = ref(false);
const textoSaudade = ref('');

// PERFIL DUPLO
const perfilVisivel = ref('me'); // 'me' ou 'partner'
const editandoBio = ref(false);
const novaBio = ref('');
const profilePosts = ref([]);
const novoPostPerfilTexto = ref('');
const novoPostPerfilImg = ref('');
const profilePostInputRef = ref(null);
const profileCoverInputRef = ref(null);

const perfilDados = computed(() => {
  if (perfilVisivel.value === 'me') return usuarioLogado.value;
  return parceiro.value;
});

const canais = ref([]);
const canalAtivo = ref(null);
const modoCriarCanal = ref(false);
const novoCanalNome = ref('');

const feed = ref([]);
const novoTexto = ref('');
const postInputRef = ref(null);
const imagemPostBase64 = ref('');

const mensagensChat = ref([]);
const novaMensagemChat = ref('');

const dailyQuestion = ref(null);
const minhaRespostaDaily = ref('');
const ideaSorteada = ref(null);
const modoCapsula = ref(false);
const dataCapsula = ref('');

const moodOptions = [
  { id: 'exhausted', icon: '🔋', label: 'Bateria Fraca' },
  { id: 'romantic', icon: '🍷', label: 'Querendo Romance' },
  { id: 'spicy', icon: '🔥', label: 'Com Fogo' },
  { id: 'space', icon: '🛡️', label: 'Preciso de Espaço' }
];

const editandoDatas = ref(false);
const formDatas = reactive({ startDate: '', firstKiss: '' });
const metasCasal = ref([]); 

const galeriaReal = ref([]); 
const memoryInputRef = ref(null);
const relCoverInputRef = ref(null);

const configurarAxiosToken = (token) => { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; };

const mudarAba = (aba) => { abaAtiva.value = aba; isMobileMenuOpen.value = false; };
const mudarCanal = (canal) => { canalAtivo.value = canal; abaAtiva.value = 'feed'; isMobileMenuOpen.value = false; };

// ==========================================
// 🛡️ PERSISTÊNCIA 
// ==========================================
onMounted(async () => {
  const tokenSalvo = localStorage.getItem('verona_token');
  if (tokenSalvo) {
    configurarAxiosToken(tokenSalvo);
    try {
      const res = await axios.get(`${URL_API}/auth/me`);
      usuarioLogado.value = { ...res.data.user, relationship: res.data.relationship };
      parceiro.value = res.data.partner;
      novaBio.value = usuarioLogado.value.bio || '';
    } catch (e) { localStorage.removeItem('verona_token'); }
  }
});

watch(() => usuarioLogado.value, (user) => {
  if (user && user.relationship?.status === 'ACTIVE') {
    carregarCanais();
    carregarDailyQuestion();
    carregarHistoricoChat(); 
    carregarMemories(); 
    
    formDatas.startDate = user.relationship.startDate ? user.relationship.startDate.split('T')[0] : '';
    formDatas.firstKiss = user.relationship.firstKiss ? user.relationship.firstKiss.split('T')[0] : '';
    metasCasal.value = user.relationship.goals || [];

    if(!socket) {
      socket = io(URL_API);
      socket.emit('entrar_na_sala', user.relationship.id);
      socket.on('receber_mensagem', (msg) => mensagensChat.value.push(msg));
    }
  }
});

watch(() => canalAtivo.value, (canal) => { if (canal) carregarFeed(); });
watch(() => perfilVisivel.value, () => { carregarMuralPerfil(); editandoBio.value = false; });
watch(() => abaAtiva.value, (aba) => { if (aba === 'nossos-perfis') carregarMuralPerfil(); });

// ==========================================
// MURAIS E PERFIL DUPLO
// ==========================================
const carregarMuralPerfil = async () => {
  if (!perfilDados.value) return;
  try {
    const res = await axios.get(`${URL_API}/profile-posts/${perfilDados.value.id}`);
    profilePosts.value = res.data;
  } catch(e) {}
};

const onProfilePostImageSelected = (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { novoPostPerfilImg.value = ev.target.result; };
  reader.readAsDataURL(file);
};

const enviarPostPerfil = async () => {
  if (!novoPostPerfilTexto.value.trim() && !novoPostPerfilImg.value) return;
  try {
    await axios.post(`${URL_API}/profile-posts`, { content: novoPostPerfilTexto.value, imageUrl: novoPostPerfilImg.value });
    novoPostPerfilTexto.value = ''; novoPostPerfilImg.value = '';
    carregarMuralPerfil();
  } catch(e) {}
};

const salvarBio = async () => {
  try {
    await axios.put(`${URL_API}/users/me`, { bio: novaBio.value });
    usuarioLogado.value.bio = novaBio.value;
    editandoBio.value = false;
  } catch(e) {}
};

const onProfileCoverSelected = (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const b64 = ev.target.result;
    usuarioLogado.value.coverUrl = b64;
    try { await axios.put(`${URL_API}/users/me`, { coverUrl: b64 }); } catch(err){}
  };
  reader.readAsDataURL(file);
};

// ==========================================
// CAPA DO RELACIONAMENTO 
// ==========================================
const onRelCoverSelected = (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const b64 = ev.target.result;
    usuarioLogado.value.relationship.coverImageUrl = b64;
    try { await axios.put(`${URL_API}/relationship`, { coverImageUrl: b64 }); } catch(err){}
  };
  reader.readAsDataURL(file);
};

// ==========================================
// 📸 MEMÓRIAS (Cloudinary)
// ==========================================
const carregarMemories = async () => { try { const res = await axios.get(`${URL_API}/memories`); galeriaReal.value = res.data; } catch(e) {} };
const triggerMemoryInput = () => { if (memoryInputRef.value) memoryInputRef.value.click(); };
const onMemorySelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Image = e.target.result;
    const description = prompt("Legenda para esta memória:");
    galeriaReal.value.unshift({ id: 'temp', imageUrl: base64Image, description: description, author: { name: usuarioLogado.value.name, avatarUrl: usuarioLogado.value.avatarUrl }, createdAt: new Date().toISOString() });
    try { await axios.post(`${URL_API}/memories`, { base64Image, description }); carregarMemories(); } catch(err) { alert("Erro ao subir a foto"); }
  };
  reader.readAsDataURL(file);
};

// ==========================================
// 🚀 DEMAIS LÓGICAS (Postagem no Feed com Imagem, Auth, Modal Saudade)
// ==========================================
const abrirModalSaudade = () => { modalSaudadeAberto.value = true; textoSaudade.value = ''; };
const dispararSaudade = async () => {
  if (!textoSaudade.value.trim()) return;
  try { 
    await axios.post(`${URL_API}/notifications/miss-you`, { customMessage: textoSaudade.value }); 
    modalSaudadeAberto.value = false;
    alert("Mensagem enviada com sucesso! ❤️"); 
  } catch(e) {}
};

const onPostImageSelected = (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { imagemPostBase64.value = ev.target.result; };
  reader.readAsDataURL(file);
};
const enviarPost = async () => { 
  if ((!novoTexto.value.trim() && !imagemPostBase64.value) || !canalAtivo.value) return; 
  try { 
    await axios.post(`${URL_API}/posts`, { content: novoTexto.value, imageUrl: imagemPostBase64.value, channelId: canalAtivo.value.id, unlockAt: modoCapsula.value && dataCapsula.value ? dataCapsula.value : null }); 
    novoTexto.value = ''; imagemPostBase64.value = ''; postInputRef.value.value = null; modoCapsula.value = false; dataCapsula.value = ''; carregarFeed(); 
  } catch (err) {} 
};

// Autenticação
const fazerLogin = async () => {
  try {
    const res = await axios.post(`${URL_API}/auth/login`, { email: email.value, password: senha.value });
    localStorage.setItem('verona_token', res.data.token); configurarAxiosToken(res.data.token);
    usuarioLogado.value = { ...res.data.user, relationship: res.data.relationship };
    parceiro.value = res.data.partner;
    senha.value = '';
  } catch (err) { alert(err.response?.data?.error || 'Erro no login'); }
};

const fazerCadastro = async () => {
  try {
    await axios.post(`${URL_API}/auth/register`, { name: nome.value, email: email.value, username: username.value, password: senha.value, inviteCode: codigoConvite.value, licenseKey: licenseKey.value, coupleName: coupleName.value });
    alert('Santuário criado com sucesso! Faça login.'); modoAuth.value = 'login'; senha.value = '';
  } catch (err) { alert(err.response?.data?.error || 'Erro no cadastro'); }
};

const fazerLogout = () => { usuarioLogado.value = null; parceiro.value = null; localStorage.removeItem('verona_token'); delete axios.defaults.headers.common['Authorization']; if (socket) { socket.disconnect(); socket = null; } };
const copiarCodigo = () => { navigator.clipboard.writeText(usuarioLogado.value.relationship.inviteCode); alert('Código copiado!'); };

// Canais e Metas
const carregarCanais = async () => { try { const res = await axios.get(`${URL_API}/channels`); canais.value = res.data; if (res.data.length > 0) canalAtivo.value = res.data.find(c => c.name === 'geral') || res.data[0]; } catch (err) {} };
const criarCanal = async () => { if (!novoCanalNome.value.trim()) return; try { await axios.post(`${URL_API}/channels`, { name: novoCanalNome.value }); novoCanalNome.value = ''; modoCriarCanal.value = false; carregarCanais(); } catch (err) {} };
const carregarFeed = async () => { if (!canalAtivo.value) return; try { const res = await axios.get(`${URL_API}/channels/${canalAtivo.value.id}/posts`); feed.value = res.data.map(post => ({ ...post, curtido: false, mostrarRespostas: false, novaResposta: '' })); } catch (err) {} };

const adicionarMeta = async () => { const titulo = prompt("Qual a nova meta de vocês?"); if (!titulo) return; try { const res = await axios.post(`${URL_API}/goals`, { title: titulo }); metasCasal.value.push(res.data); } catch(e) {} };
const toggleEditDatas = async () => { if (editandoDatas.value) { try { await axios.put(`${URL_API}/relationship`, { startDate: formDatas.startDate, firstKiss: formDatas.firstKiss }); } catch(e) {} } editandoDatas.value = !editandoDatas.value; };

const fileInputRef = ref(null);
const triggerFileInput = () => { if (fileInputRef.value) fileInputRef.value.click(); };
const onFileSelected = (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = async (e) => { const base64Image = e.target.result; usuarioLogado.value.avatarUrl = base64Image; try { await axios.put(`${URL_API}/users/me`, { avatarUrl: base64Image }); } catch(e) {} }; reader.readAsDataURL(file); };

// Respostas e Chat
const toggleRespostas = (post) => { post.mostrarRespostas = !post.mostrarRespostas; };
const enviarResposta = async (post) => { if (!post.novaResposta?.trim()) return; try { const res = await axios.post(`${URL_API}/posts`, { content: post.novaResposta, parentId: post.id, channelId: canalAtivo.value.id }); if (!post.replies) post.replies = []; res.data.author = { name: usuarioLogado.value.name, avatarUrl: usuarioLogado.value.avatarUrl }; post.replies.push(res.data); post.novaResposta = ''; } catch(e) {} };

const carregarHistoricoChat = async () => { try { const res = await axios.get(`${URL_API}/chat`); mensagensChat.value = res.data; } catch(e) {} };
const enviarMensagemChat = () => { if (!novaMensagemChat.value.trim()) return; socket.emit('nova_mensagem', { texto: novaMensagemChat.value, authorName: usuarioLogado.value.name, authorId: usuarioLogado.value.id, authorAvatarUrl: usuarioLogado.value.avatarUrl, relationshipId: usuarioLogado.value.relationship.id }); novaMensagemChat.value = ''; };

// Gamificação
const carregarDailyQuestion = async () => { try { const res = await axios.get(`${URL_API}/daily-question`); dailyQuestion.value = res.data; } catch(e) {} };
const responderDaily = async () => { if (!minhaRespostaDaily.value.trim()) return; try { await axios.post(`${URL_API}/daily-question/answer`, { questionId: dailyQuestion.value.id, content: minhaRespostaDaily.value }); minhaRespostaDaily.value = ''; await carregarDailyQuestion(); if (dailyQuestion.value.partnerAnswered) { usuarioLogado.value.relationship.streakCount += 1; } } catch(e) {} };
const girarRoleta = async () => { try { ideaSorteada.value = { title: "Sorteando..." }; const res = await axios.get(`${URL_API}/date-ideas/random`); setTimeout(() => { ideaSorteada.value = res.data; }, 800); } catch(e) {} };
const atualizarHumor = async (moodId) => { try { await axios.put(`${URL_API}/users/me`, { moodStatus: moodId }); usuarioLogado.value.moodStatus = moodId; } catch(e) {} };

const obterIconeHumor = (moodId) => { const found = moodOptions.find(m => m.id === moodId); return found ? found.icon : '✨'; };
const obterLabelHumor = (moodId) => { const found = moodOptions.find(m => m.id === moodId); return found ? found.label : ''; };
const estaTrancado = (unlockAt) => { if (!unlockAt) return false; return new Date(unlockAt) > new Date(); };
const formatarDataHora = (dataIso) => { if (!dataIso) return ''; const data = new Date(dataIso); return `${data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}`; };
const formatarData = (dataIso) => { if (!dataIso) return ''; return new Date(dataIso + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); };
const formatarHora = (ts) => ts ? new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }) : '';
const getInicial = (nomeStr) => nomeStr ? nomeStr.charAt(0).toUpperCase() : 'V';

onUnmounted(() => { if (socket) socket.disconnect(); });
</script>

<style>
/* CSS FLUIDO */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.chat-widget-container { position: fixed; bottom: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 15px; }
.chat-trigger-btn { width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-color), #E11D48); color: white; border: none; box-shadow: 0 10px 25px rgba(225, 29, 72, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.chat-trigger-btn:hover { transform: scale(1.1); }
.chat-window { width: 380px; height: 500px; background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; }
.chat-window-header { background: var(--accent-color); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
.chat-window-input { padding: 15px; border-top: 1px solid var(--border-glass); display: flex; gap: 10px; background: var(--bg-app); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

.post-modern-card { background: var(--bg-surface); padding: 25px; border-radius: 24px; border: 1px solid var(--border-glass); box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; }
.post-modern-card:hover { border-color: rgba(225, 29, 72, 0.3); }

.horizontal-gallery { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; scroll-snap-type: x mandatory; }
.gallery-card-vertical { flex: 0 0 240px; aspect-ratio: 9/16; position: relative; scroll-snap-align: center; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); transition: transform 0.3s; }
.gallery-card-vertical img { width: 100%; height: 100%; object-fit: cover; }
.gallery-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; color: white; }
.empty-add:hover { background: rgba(225,29,72,0.05) !important; border-color: var(--accent-color) !important; }

.mobile-header { display: none; background: var(--bg-surface); padding: 15px 20px; border-bottom: 1px solid var(--border-glass); justify-content: space-between; align-items: center; }
.mobile-menu-btn { background: none; border: none; color: var(--text-main); cursor: pointer; }

@media (max-width: 800px) {
  .app-master-layout { flex-direction: column; }
  .mobile-header { display: flex; }
  .desktop-sidebar { position: fixed; top: 65px; left: 0; bottom: 0; width: 100%; z-index: 1000; transform: translateX(-100%); transition: transform 0.3s ease-in-out; border-right: none; }
  .app-master-layout.mobile-menu-open .desktop-sidebar { transform: translateX(0); }
  .desktop-only { display: none !important; }
  .main-stage { border-radius: 0; padding: 10px; }
  .nos-mundo-pad { padding: 15px !important; }
  .dates-grid { grid-template-columns: 1fr !important; }
  .daily-answers-grid { grid-template-columns: 1fr !important; }
  
  .chat-window { width: 100%; height: calc(100vh - 100px); position: fixed; bottom: 0; left: 0; border-radius: 24px 24px 0 0; z-index: 10000; }
  .chat-trigger-btn { bottom: 20px; right: 20px; z-index: 10001; }
}
</style>