<template>
  <div data-theme="premium-glass" class="app-master-wrapper">
    
    <div v-if="!usuarioLogado" class="login-wrapper">
      <div class="login-orb orb-1"></div>
      <div class="login-orb orb-2"></div>
      
      <div class="glass-login-panel">
        <div class="login-icon-glow">
          <Sparkles :size="40" color="white" />
        </div>
        <h1 class="playfair login-title">Verona</h1>
        <p class="login-subtitle">Onde o nosso amor é imortal.</p>
        
        <form @submit.prevent="modoAuth === 'login' ? fazerLogin() : fazerCadastro()" style="width: 100%;">
          <template v-if="modoAuth === 'register'">
            <input type="text" class="glass-input-premium" placeholder="Como quer ser chamado?" v-model="nome" required />
            <input type="text" class="glass-input-premium" placeholder="@usuario" v-model="username" required />
            <input type="text" class="glass-input-premium" placeholder="Nome do casal (Ex: Igor & Julieta)" v-model="coupleName" required />
          </template>
          
          <input type="email" class="glass-input-premium" placeholder="Seu e-mail" v-model="email" required />
          <input type="password" class="glass-input-premium" placeholder="Sua senha secreta" v-model="senha" required />
          
          <template v-if="modoAuth === 'register'">
            <div class="login-divider"><span>Como você vai entrar?</span></div>
            <input type="text" class="glass-input-premium" placeholder="Convite do meu amor" v-model="codigoConvite" />
            <p v-if="!codigoConvite && !licenseKey" class="login-ou">OU</p>
            <input v-if="!codigoConvite" type="text" class="glass-input-premium" placeholder="Licença de Acesso (VRN-...)" v-model="licenseKey" />
          </template>

          <button type="submit" class="btn-neon-large" style="width: 100%; margin-top: 15px; padding: 18px; font-size: 16px;" :disabled="isAuthLoading">
            <template v-if="isAuthLoading">
              <Loader2 class="spin" :size="20" style="margin-right: 10px;" /> Conectando...
            </template>
            <template v-else>
              {{ modoAuth === 'login' ? 'Acessar Santuário' : 'Criar Nosso Cofre' }}
            </template>
          </button>
        </form>
        
        <p class="login-footer-link" @click="modoAuth = modoAuth === 'login' ? 'register' : 'login'">
          {{ modoAuth === 'login' ? 'Ainda não tem o seu? Comece aqui' : 'Já tem uma conta? Entre' }}
        </p>
      </div>
    </div>

    <div v-else-if="usuarioLogado?.relationship?.status === 'PENDING'" class="login-wrapper">
       <div class="glass-login-panel text-center">
          <Heart :size="60" color="var(--accent-color)" style="margin-bottom: 20px" class="float-anim" />
          <h2 class="playfair login-title" style="margin-bottom: 10px;">Falta pouco!</h2>
          <p style="color: rgba(255,255,255,0.7);">Envie este código para o seu amor usar no cadastro:</p>
          <h3 class="invite-code-box">{{ usuarioLogado?.relationship?.inviteCode }}</h3>
          <button class="btn-glass-standard" style="width: 100%; padding: 18px;" @click="copiarCodigo">Copiar Código</button>
       </div>
    </div>

    <div v-else class="app-master-layout" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
      
      <div class="mobile-header hide-on-desktop">
        <div style="display: flex; align-items: center; gap: 10px;">
          <Sparkles :size="24" color="var(--accent-color)" /> 
          <span class="playfair" style="font-size: 22px; font-weight: bold; color: white;">Verona</span>
        </div>
        <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Menu v-if="!isMobileMenuOpen" :size="24" color="white" />
          <X v-else :size="24" color="white" />
        </button>
      </div>

      <aside class="desktop-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-brand-area">
          <div class="workspace-brand cursor-pointer" @click="irParaPerfil(usuarioLogado?.id)" v-show="!sidebarCollapsed">
            <div class="sidebar-avatar">
              <img v-if="usuarioLogado?.avatarUrl" :src="usuarioLogado.avatarUrl" />
              <template v-else>{{ getInicial(usuarioLogado?.name) }}</template>
            </div>
            <div style="display: flex; flex-direction: column; overflow: hidden;">
              <span style="font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase;">Logado como</span>
              <span class="playfair" style="font-size: 18px; color: white; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ usuarioLogado?.name }}</span>
            </div>
          </div>
          <div class="sidebar-avatar cursor-pointer" @click="irParaPerfil(usuarioLogado?.id)" v-show="sidebarCollapsed" style="margin-bottom: 30px;">
              <img v-if="usuarioLogado?.avatarUrl" :src="usuarioLogado.avatarUrl" />
              <template v-else>{{ getInicial(usuarioLogado?.name) }}</template>
          </div>

          <button class="toggle-btn desktop-only" @click="sidebarCollapsed = !sidebarCollapsed">
            <ChevronRight v-if="sidebarCollapsed" :size="18" />
            <ChevronLeft v-else :size="18" />
          </button>
        </div>

        <div class="channel-group">
          <div class="nav-section-title">
            <span v-show="!sidebarCollapsed">Canais de Conversa</span>
            <button v-show="!sidebarCollapsed" class="add-channel-btn" @click="modoCriarCanal = !modoCriarCanal"><Plus :size="16" /></button>
          </div>
          <form v-if="modoCriarCanal && !sidebarCollapsed" @submit.prevent="criarCanal" style="margin-bottom: 15px; width: 100%;">
             <input type="text" class="glass-input-dark" placeholder="Ex: viagens" v-model="novoCanalNome" autoFocus />
          </form>
          
          <div class="scroll-channels hide-scrollbar">
            <div v-for="canal in canais" :key="canal.id" class="nav-item channel-item-row" :class="{ active: canalAtivo?.id === canal.id && abaAtiva === 'feed' }" @click="mudarCanal(canal)">
              <div style="display:flex; align-items:center; gap: 12px; flex: 1; overflow: hidden;">
                <Hash :size="18" :style="{ opacity: canal.isSystem ? '0.9' : '0.6', color: canal.isSystem ? 'var(--accent-color)' : 'inherit' }" style="flex-shrink: 0;" />
                <span class="nav-text" v-show="!sidebarCollapsed" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ canal?.name }}</span>
              </div>
              
              <div v-show="!sidebarCollapsed" class="channel-options-btn" @click.stop="abrirMenuCanal(canal.id)">
                <MoreVertical :size="14" />
              </div>
              
              <div v-if="menuCanalAberto === canal.id" class="channel-dropdown glass-panel" @click.stop>
                 <button @click.stop="deletarCanal(canal)" class="dropdown-item text-danger" :disabled="canal.isSystem">
                   <Trash2 :size="14" /> Excluir
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div class="channel-group">
          <div class="nav-section-title"><span v-show="!sidebarCollapsed">Explorar</span></div>
          <div class="nav-item" :class="{ active: abaAtiva === 'nosso-perfil' }" @click="mudarAba('nosso-perfil')">
            <Heart :size="18" style="opacity: 0.6;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Nosso Mundo</span>
          </div>
          <div class="nav-item" :class="{ active: abaAtiva === 'nossos-perfis' }" @click="mudarAba('nossos-perfis')">
            <UserIcon :size="18" style="opacity: 0.6;" /> 
            <span class="nav-text" v-show="!sidebarCollapsed">Ver Perfis</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 15px; align-items: center;">
           <div class="streak-box" v-show="!sidebarCollapsed" style="width: 100%;">
              🔥 {{ usuarioLogado?.relationship?.streakCount || 0 }} Dias Juntos
           </div>
           <button @click="abrirModalSaudade" class="btn-glass-standard" style="width: 100%; padding: 14px; border: 1px solid rgba(255,255,255,0.2);">
             <Flame :size="18" color="#F43F5E"/> <span v-show="!sidebarCollapsed">Pensando em você</span>
           </button>
           <div class="nav-item text-danger" @click="fazerLogout" style="margin-top: 5px; width: 100%;">
             <LogOut :size="18" /> 
             <span class="nav-text" v-show="!sidebarCollapsed">Sair do App</span>
           </div>
        </div>
      </aside>

      <main class="main-stage" @click="menuCanalAberto = null">
        
        <header class="top-nav-glass">
          <div class="top-nav-left">
             <h2 class="stage-title playfair" v-if="abaAtiva === 'feed' && canalAtivo">
               <span style="color: var(--accent-color)">#</span> {{ canalAtivo?.name }}
             </h2>
          </div>
          
          <div class="top-nav-right">
             
             <div class="dual-toggle-pill glass-card" v-if="abaAtiva === 'nossos-perfis'">
                <button @click="perfilVisivel = 'me'" :class="{'active': perfilVisivel === 'me'}">{{ usuarioLogado?.name }}</button>
                <button @click="perfilVisivel = 'partner'" :class="{'active': perfilVisivel === 'partner'}">{{ parceiro?.name || 'Seu Amor' }}</button>
             </div>

             <div class="partner-status-pill">
                <div class="partner-avatar-round cursor-pointer" @click="parceiro ? irParaPerfil(parceiro.id) : null">
                   <img v-if="parceiro?.avatarUrl" :src="parceiro.avatarUrl" />
                   <template v-else>{{ getInicial(parceiro?.name || '?') }}</template>
                </div>
                <div class="partner-mood-icon" :title="'Humor atual: ' + (obterLabelHumor(parceiro?.moodStatus) || 'Normal')">
                   <component :is="obterIconeLucide(parceiro?.moodStatus)" :size="18" :color="obterCorHumor(parceiro?.moodStatus)" />
                </div>
             </div>

             <div class="notification-wrapper">
                <button @click.stop="toggleNotificacoes" class="icon-btn-round">
                   <Bell :size="18" />
                   <span v-if="naoLidasCount > 0" class="notification-badge">{{ naoLidasCount }}</span>
                </button>
                <div v-if="dropdownNotificacoes" class="notification-dropdown glass-card" @click.stop>
                   <div class="notif-header">Ações Recentes</div>
                   <div class="scroll-area hide-scrollbar" style="max-height: 350px;">
                      <div v-for="n in notificacoes" :key="n.id" class="notif-item" :class="{ 'unread': !n.isRead }">
                         <div class="notif-icon">{{ obterIconeEmojiNotif(n.type) }}</div>
                         <div style="flex: 1;">
                            <div class="notif-text">{{ n.text }}</div>
                            <div class="notif-time">{{ formatarDataHora(n.createdAt) }}</div>
                         </div>
                      </div>
                      <div v-if="notificacoes.length === 0" class="notif-empty">Nenhuma novidade ainda.</div>
                   </div>
                </div>
             </div>

             <button class="icon-btn-round" @click="modalConfigAberto = true"><Settings :size="18" /></button>
          </div>
        </header>

        <template v-if="abaAtiva === 'feed'">
          <div class="scroll-area pad-top-nav pad-responsive">
            
            <div v-if="dailyQuestion && canalAtivo?.name === 'geral'" class="daily-animated-banner">
               <div class="daily-badge"><Lock :size="12" v-if="dailyQuestion?.partnerAnswer === 'LOCKED'"/><Unlock :size="12" v-else/> O Oráculo Pergunta</div>
               <h3 class="playfair daily-question-title">{{ dailyQuestion?.text }}</h3>
               
               <div v-if="!dailyQuestion?.myAnswer" class="daily-answer-form">
                 <input type="text" class="glass-input-light" placeholder="Sua resposta sincera..." v-model="minhaRespostaDaily" @keydown.enter.prevent="responderDaily" />
                 <button class="btn-glass-standard white-text" style="padding: 15px 30px; font-weight: 800;" @click="responderDaily">Responder</button>
               </div>
               <div v-else class="daily-answers-grid">
                 <div class="answer-card">
                   <div class="answer-label">{{ usuarioLogado?.name }}</div>
                   <div class="answer-text">{{ dailyQuestion?.myAnswer }}</div>
                 </div>
                 <div class="answer-card outline-glass">
                   <div class="answer-label">{{ parceiro?.name || 'Seu Amor' }}</div>
                   <div v-if="dailyQuestion?.partnerAnswer === 'LOCKED'" class="answer-locked"><Clock :size="14"/> Aguardando resposta...</div>
                   <div v-else class="answer-text highlight">{{ dailyQuestion?.partnerAnswer }}</div>
                 </div>
               </div>
            </div>

            <div class="feed-container">
               <div v-for="post in feed" :key="post.id" class="post-glass-card">
                 <div class="post-layout-flex">
                   <div class="post-avatar-col cursor-pointer" @click="irParaPerfil(post.authorId)">
                     <div class="avatar-img-round">
                       <img v-if="post.author?.avatarUrl" :src="post.author.avatarUrl" />
                       <template v-else>{{ getInicial(post.author?.name) }}</template>
                     </div>
                   </div>
                   
                   <div class="post-content-col">
                     <div class="post-header-line">
                        <span class="post-author-name hover-underline" @click="irParaPerfil(post.authorId)">{{ post.author?.name }}</span>
                        <span class="post-time">{{ formatarDataHora(post.createdAt) }}</span>
                     </div>
                     
                     <div v-if="estaTrancado(post.unlockAt)" class="capsule-locked-box">
                       <Gift :size="24" color="var(--accent-color)" style="margin-bottom: 8px;" />
                       <div class="capsule-title">Cápsula do Tempo</div>
                       <div class="capsule-date">Disponível em: {{ formatarData(post.unlockAt) }}</div>
                     </div>
                     <div v-else>
                        <div class="post-content-text">{{ post.content }}</div>
                        <img v-if="post.imageUrl" :src="post.imageUrl" class="post-image" />
                     </div>
                     
                     <div v-if="!estaTrancado(post.unlockAt)" class="post-actions-row">
                       <button @click="toggleRespostas(post)" class="btn-icon-action" :class="{ 'active': post.mostrarRespostas }">
                         <MessageCircle :size="16"/> {{ post.replies?.length || 0 }}
                       </button>
                     </div>

                     <div v-if="post.mostrarRespostas" class="nested-replies-area">
                       <div v-for="reply in post.replies" :key="reply.id" class="reply-flex-item">
                          <div class="avatar-img-round tiny-avatar cursor-pointer" @click="irParaPerfil(reply.authorId)">
                            <img v-if="reply.author?.avatarUrl" :src="reply.author.avatarUrl" />
                            <template v-else>{{ getInicial(reply.author?.name) }}</template>
                          </div>
                          <div class="reply-bubble-content">
                             <span class="reply-author hover-underline cursor-pointer" @click="irParaPerfil(reply.authorId)">{{ reply.author?.name }}</span>
                             <span class="reply-text">{{ reply.content }}</span>
                          </div>
                       </div>
                       <form @submit.prevent="enviarResposta(post)" class="reply-input-form">
                          <input type="text" class="reply-input" placeholder="Responda..." v-model="post.novaResposta" />
                          <button type="submit" class="btn-send-reply"><Send :size="14"/></button>
                       </form>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div v-if="feed.length === 0" class="empty-state-box">
                 <Sparkles :size="32" color="var(--text-muted)" style="margin-bottom: 15px; opacity: 0.5;" />
                 <p>O silêncio é de ouro, mas palavras são eternas.<br/>A história de vocês neste canal começa aqui.</p>
               </div>
            </div>
          </div>

          <div class="composer-footer-anchor">
             <div class="main-composer-box glass-panel" :class="{'disabled-composer': canalAtivo?.isSystem}">
               <textarea class="composer-textarea" :placeholder="canalAtivo?.isSystem ? 'Este é um canal exclusivo para registros do oráculo e do sistema.' : 'O que você quer compartilhar agora?'" v-model="novoTexto" @keydown.enter.prevent="enviarPost" :disabled="canalAtivo?.isSystem"></textarea>
               <div class="composer-toolbar">
                 <div class="composer-tools">
                   <input type="file" ref="postInputRef" style="display: none" accept="image/*" @change="onPostImageSelected" />
                   <button class="btn-glass-standard" style="padding: 8px 15px;" @click="triggerPostImageInput" :class="{ 'active': imagemPostBase64 }" :disabled="canalAtivo?.isSystem">
                      <ImageIcon :size="16"/> <span class="hide-mobile-text">{{ imagemPostBase64 ? 'Imagem Pronta' : 'Foto' }}</span>
                   </button>
                   <button class="btn-glass-standard" style="padding: 8px 15px;" @click="modoCapsula = !modoCapsula" :class="{ 'active': modoCapsula }" :disabled="canalAtivo?.isSystem">
                      <Clock :size="16"/> <span class="hide-mobile-text">Cápsula</span>
                   </button>
                 </div>
                 
                 <button class="btn-glass-standard" @click="enviarPost" :disabled="isUploading || canalAtivo?.isSystem" style="border-radius: 50%; padding: 12px;">
                    <template v-if="isUploading"><Loader2 class="spin" :size="16"/></template>
                    <template v-else><Send :size="16"/></template>
                 </button>
               </div>
               <div v-if="modoCapsula" class="capsule-date-picker">
                 <span class="label">Revelar em:</span>
                 <input type="date" class="glass-input-premium" style="margin-bottom:0; padding:10px 15px; width:auto;" v-model="dataCapsula" />
               </div>
             </div>
          </div>
        </template>

        <template v-if="abaAtiva === 'nosso-perfil'">
          <div class="scroll-area" style="padding: 0;">
             <div class="mundo-master-cover">
                <img class="cover-img" :src="usuarioLogado?.relationship?.coverImageUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&fit=crop'" />
                <div class="cover-gradient"></div>
                <div class="cover-overlay">
                   <h2 class="playfair">{{ usuarioLogado?.relationship?.name || 'Nosso Mundo' }}</h2>
                </div>
                <input type="file" ref="relCoverInputRef" style="display: none" accept="image/*" @change="onRelCoverSelected" />
                <button @click="triggerRelCoverInput" class="btn-glass-standard abs-bottom-right" :disabled="isUploadingCover">
                  <template v-if="isUploadingCover"><Loader2 class="spin" :size="14"/></template>
                  <template v-else><Camera :size="14"/> Alterar Capa</template>
                </button>
             </div>

             <div class="mundo-bento-grid-3 pad-responsive">
                <div class="bento-glass-card column-wrapper">
                   <div class="card-header-flex" style="padding: 25px 25px 0 25px;">
                      <h3 class="playfair">Nossa Galeria</h3>
                      <input type="file" ref="memoryInputRef" style="display: none" accept="image/*" @change="onMemorySelected" />
                      <button @click="triggerMemoryInput" class="btn-glass-standard" :disabled="isUploadingMemory">
                         <template v-if="isUploadingMemory"><Loader2 class="spin" :size="12"/> Subindo</template>
                         <template v-else><Plus :size="14"/> Nova</template>
                      </button>
                   </div>
                   
                   <div class="carousel-horizontal hide-scrollbar">
                      <div v-for="foto in galeriaReal" :key="foto.id" class="carousel-slide">
                         <img :src="foto.imageUrl" />
                         <div class="memory-info-overlay">
                            <div class="desc">{{ foto.description }}</div>
                            <div class="meta">{{ formatarData(foto.createdAt) }}</div>
                         </div>
                      </div>
                      <div v-if="galeriaReal.length === 0" class="carousel-slide empty-memory-slot" @click="triggerMemoryInput">
                         <ImageIcon :size="30" color="var(--border-soft)" />
                         <span>Sua galeria está vazia</span>
                      </div>
                   </div>
                </div>

                <div class="bento-glass-card column-wrapper" style="padding: 25px;">
                   <div class="card-header-flex">
                      <h3 class="playfair">Nossa História</h3>
                      <button class="btn-glass-standard" style="padding: 6px 12px; font-size: 11px;" @click="toggleEditDatas">{{ editandoDatas ? 'Salvar' : 'Editar' }}</button>
                   </div>
                   
                   <div class="timeline-row-vertical">
                      <div class="timeline-item">
                         <span class="label">O Início</span>
                         <input v-if="editandoDatas" type="date" class="glass-input-premium mb-0 p-small" v-model="formDatas.startDate" />
                         <span v-else class="value text-accent">{{ formDatas.startDate ? formatarData(formDatas.startDate) : 'Não definido' }}</span>
                      </div>
                      <div class="timeline-item">
                         <span class="label">Primeiro Beijo</span>
                         <input v-if="editandoDatas" type="date" class="glass-input-premium mb-0 p-small" v-model="formDatas.firstKiss" />
                         <span v-else class="value">{{ formDatas.firstKiss ? formatarData(formDatas.firstKiss) : 'Não definido' }}</span>
                      </div>
                   </div>

                   <div class="divider-line"></div>

                   <div class="card-header-flex mt-2">
                      <h4 class="playfair" style="font-size: 18px;">Nossos Sonhos</h4>
                      <button v-if="editandoDatas" @click="adicionarMeta" class="btn-circle-mini"><Plus :size="14" /></button>
                   </div>
                   <div class="dreams-list scroll-area hide-scrollbar" style="max-height: 200px;">
                      <div v-for="meta in metasCasal" :key="meta.id" class="dream-item">
                         <Sparkles :size="16" color="var(--accent-color)"/> <span>{{ meta.title }}</span>
                      </div>
                      <div v-if="metasCasal.length === 0" class="empty-list-text">O que vocês sonham em construir juntos?</div>
                   </div>
                </div>

                <div class="column-wrapper gap-vertical">
                   <div class="bento-glass-card" style="padding: 25px;">
                      <div class="card-header-flex" style="margin-bottom: 15px;">
                         <h3 class="playfair" style="display:flex; align-items:center; gap:8px;"><Music :size="18"/> Trilha Sonora</h3>
                         <button class="btn-glass-standard" style="padding: 6px 12px; font-size: 11px;" @click="modalConfigAberto = true">Editar</button>
                      </div>
                      <div class="spotify-wrapper">
                         <iframe v-if="usuarioLogado?.relationship?.spotifyUri" :src="formatarSpotifyIframe(usuarioLogado.relationship.spotifyUri)" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius: 16px;"></iframe>
                         <div v-else class="empty-spotify-slot" @click="modalConfigAberto = true">
                            Clique aqui para colar a música tema de vocês.
                         </div>
                      </div>
                   </div>

                   <div class="bento-glass-card roleta-bento-card">
                      <div class="roleta-inner text-center">
                         <div class="icon-pulse-wrapper">
                            <Calendar :size="28" color="white" />
                         </div>
                         <h4 class="playfair" style="font-size: 20px;">O Destino</h4>
                         <p class="subtitle-tiny">Sorteie um encontro embasado nos sonhos de vocês.</p>
                         
                         <div v-if="isSpinning" class="loading-state-tiny">
                            <Loader2 class="spin" :size="20" color="var(--accent-color)" /> Consultando a IA...
                         </div>
                         <div v-else-if="ideaSorteada" class="result-tiny slide-up">
                            {{ ideaSorteada.title }}
                         </div>
                         
                         <button class="btn-glass-standard" style="width:100%; border-radius: 20px; padding: 14px; font-weight: 800; background: rgba(255,255,255,0.8);" @click="girarRoletaAnimado" :disabled="isSpinning">
                            Sortear Encontro
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </template>

        <template v-if="abaAtiva === 'nossos-perfis'">
          <div class="scroll-area" style="padding: 0;">
             
             <div class="profile-hero-expanded" v-if="perfilDados">
                <div class="mundo-master-cover">
                   <img class="cover-img" :src="perfilDados?.coverUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&fit=crop'" />
                   <input type="file" ref="profileCoverInputRef" style="display: none" accept="image/*" @change="onProfileCoverSelected" />
                   <button v-if="perfilVisivel === 'me'" @click="triggerProfileCoverInput" class="btn-glass-standard abs-bottom-right" :disabled="isUploadingProfileCover">
                     <template v-if="isUploadingProfileCover"><Loader2 class="spin" :size="14"/></template>
                     <template v-else><Camera :size="14"/> Alterar Capa</template>
                   </button>
                </div>

                <div class="hero-info-wrapper pad-responsive">
                   <div class="hero-avatar-box">
                      <img v-if="perfilDados?.avatarUrl" :src="perfilDados.avatarUrl" />
                      <template v-else>{{ getInicial(perfilDados?.name) }}</template>
                      
                      <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="onFileSelected" />
                      <button v-if="perfilVisivel === 'me'" @click="triggerFileInput" class="btn-edit-avatar-small">
                        <Camera :size="14" v-if="!isUploadingAvatar" />
                        <Loader2 :size="14" class="spin" v-else />
                      </button>
                   </div>
                   
                   <div class="hero-text-content">
                      <div class="name-row">
                         <h2 class="playfair">{{ perfilDados?.name }}</h2>
                         
                         <div class="mood-dropdown-wrapper">
                            <button class="btn-mood-pill" @click="perfilVisivel === 'me' ? mostrarMenuHumor = !mostrarMenuHumor : null" :disabled="perfilVisivel !== 'me'">
                               <component :is="obterIconeLucide(perfilDados?.moodStatus)" :size="16" :color="obterCorHumor(perfilDados?.moodStatus)" style="flex-shrink: 0;" />
                               <span class="mood-label-text">{{ obterLabelHumor(perfilDados?.moodStatus) || 'Normal' }}</span>
                               <ChevronDown v-if="perfilVisivel === 'me'" :size="14" style="margin-left: 2px; flex-shrink: 0;" />
                            </button>
                            <div v-if="mostrarMenuHumor && perfilVisivel === 'me'" class="mood-menu glass-panel">
                               <div v-for="mood in moodOptions" :key="mood.id" class="mood-item" @click="atualizarHumorEFechar(mood.id)">
                                  <component :is="mood.lucide" :size="16" :color="mood.color" /> {{ mood.label }}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <span class="username-tag">@{{ perfilDados?.username }}</span>
                      
                      <div v-if="perfilVisivel === 'me' && editandoBio" class="bio-edit-box mt-2">
                         <textarea class="glass-input-premium" v-model="novaBio" placeholder="Escreva algo sobre você..." style="height: 80px; padding: 15px; font-size: 14px; width: 100%;"></textarea>
                         <button class="btn-glass-standard" style="padding: 8px 20px;" @click="salvarBio">Salvar Bio</button>
                      </div>
                      <div v-else @click="perfilVisivel === 'me' ? editandoBio = true : null" class="bio-text mt-2" :class="{'cursor-pointer': perfilVisivel === 'me'}">
                         {{ perfilDados?.bio || (perfilVisivel === 'me' ? 'Adicionar biografia...' : 'Nenhuma biografia informada.') }}
                      </div>
                   </div>
                </div>

                <div class="profile-tabs pad-responsive">
                   <button :class="{'active': perfilAbaAtiva === 'mural'}" @click="perfilAbaAtiva = 'mural'">Mural Pessoal</button>
                </div>
                
                <div class="profile-tab-content pad-responsive">
                   <div v-if="perfilAbaAtiva === 'mural'" class="mural-layout-inverted">
                      
                      <div v-if="perfilVisivel === 'me'" class="glass-panel composer-fixo" style="padding: 20px; border-radius: 24px; margin-bottom: 30px;">
                         <textarea class="composer-textarea" v-model="novoPostPerfilTexto" placeholder="Poste no seu mural pessoal..." style="height: 60px; margin-bottom: 10px;"></textarea>
                         <div class="composer-toolbar">
                            <input type="file" ref="profilePostInputRef" style="display: none" accept="image/*" @change="onProfilePostImageSelected" />
                            <button @click="triggerProfilePostInput" class="btn-glass-standard" :class="{'active': novoPostPerfilImg}">
                              <ImageIcon :size="16"/> <span>{{ novoPostPerfilImg ? 'Foto Anexada' : 'Adicionar Foto' }}</span>
                            </button>
                            <button class="btn-glass-standard" style="width: auto; padding: 10px 25px; border-radius: 30px;" @click="enviarPostPerfil" :disabled="isUploadingMural">
                               <template v-if="isUploadingMural"><Loader2 class="spin" :size="14"/> Postando</template>
                               <template v-else>Postar</template>
                            </button>
                         </div>
                      </div>

                      <div class="mural-posts-lista">
                         <div v-for="post in profilePosts" :key="post.id" class="glass-panel post-bento-card" style="margin-bottom: 20px; padding: 25px;">
                            <div class="post-header-line mb-2">
                               <span class="post-author-name">{{ perfilDados?.name }}</span>
                               <span class="post-time">{{ formatarDataHora(post.createdAt) }}</span>
                            </div>
                            <div class="post-content-text">{{ post.content }}</div>
                            <img v-if="post.imageUrl" :src="post.imageUrl" class="post-image" />
                         </div>
                         
                         <div v-if="profilePosts.length === 0" class="empty-state-box">
                            <p>O mural de {{ perfilDados?.name }} está vazio.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div v-else class="empty-state-box" style="margin-top: 100px;">
                 <Heart :size="48" color="var(--accent-color)" style="margin-bottom: 20px; opacity: 0.5" />
                 <h3 class="playfair">Aguardando seu amor</h3>
                 <p>O perfil e as informações do seu parceiro estarão disponíveis assim que ele entrar no Verona usando o seu convite.</p>
             </div>
          </div>
        </template>
      </main>

      <div v-if="modalSaudadeAberto" class="modal-overlay-blur">
         <div class="modal-content-glass pop-in">
            <div class="modal-icon-circle"><Flame :size="40" color="#F43F5E" /></div>
            <h3 class="playfair title-large text-center">Sinal de Amor</h3>
            <p class="subtitle-text text-center mb-4">Enviaremos direto para as notificações e e-mail.</p>
            <textarea class="glass-input-premium" v-model="textoSaudade" placeholder="O que seu coração quer dizer agora?" style="height: 100px; resize: none;"></textarea>
            <div style="display: flex; gap: 15px; margin-top: 10px;">
               <button @click="modalSaudadeAberto = false" class="btn-glass-standard" style="flex:1; padding: 15px;">Cancelar</button>
               <button @click="dispararSaudade" class="btn-glass-standard" style="flex:1; padding: 15px;">Enviar ❤️</button>
            </div>
         </div>
      </div>

      <div v-if="modalConfigAberto" class="modal-overlay-blur">
         <div class="modal-content-glass pop-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
               <h3 class="playfair title-large" style="margin:0; font-size: 24px;"><Settings :size="20" style="margin-right: 8px; vertical-align: middle;"/> Configurações</h3>
               <button @click="modalConfigAberto = false" class="btn-close-subtle"><X :size="20"/></button>
            </div>
            <label class="input-label" style="display:block; margin-bottom: 8px;">Música do Casal (Link Spotify)</label>
            <input type="text" class="glass-input-premium" v-model="spotifyTemp" placeholder="Cole a URL do Spotify..." />
            <button class="btn-glass-standard" style="width: 100%; margin-top: 15px; padding: 15px;" @click="salvarConfig">Salvar Configurações</button>
         </div>
      </div>

      <div class="chat-widget-absolute" :class="{ 'is-open': isChatOpen }">
        <button class="chat-trigger-btn" @click="isChatOpen = !isChatOpen">
          <MessageCircle v-if="!isChatOpen" :size="28" color="white" />
          <X v-else :size="28" color="white" />
        </button>
        
        <div class="chat-window-panel glass-panel" v-show="isChatOpen">
          <div class="chat-header-blur">
            <div class="chat-header-info cursor-pointer" @click="parceiro ? irParaPerfil(parceiro.id) : null">
               <div class="avatar-img-round" style="width: 40px; height: 40px; border:none; box-shadow:none;">
                 <img v-if="parceiro?.avatarUrl" :src="parceiro.avatarUrl" />
                 <template v-else>{{ getInicial(parceiro?.name || '?') }}</template>
               </div>
               <div class="chat-header-text">
                 <span class="name">{{ parceiro?.name || 'Aguardando Parceiro...' }}</span>
                 <span class="status">
                    <component :is="obterIconeLucide(parceiro?.moodStatus)" :size="10" :color="obterCorHumor(parceiro?.moodStatus)" style="margin-right: 4px;" />
                    {{ parceiro ? (obterLabelHumor(parceiro?.moodStatus) || 'Online') : 'Conectando...' }}
                 </span>
               </div>
            </div>
            <button @click="isChatOpen = false" class="btn-close-subtle" style="width: 30px; height: 30px;"><ChevronDown :size="20" /></button>
          </div>
          
          <div class="chat-message-list scroll-area hide-scrollbar">
             <div v-for="(msg, idx) in mensagensChat" :key="idx" class="chat-bubble-row" :class="{'is-mine': msg.authorId === usuarioLogado?.id}">
               <div v-if="msg.authorId !== usuarioLogado?.id" class="avatar-img-round tiny-avatar cursor-pointer" @click="irParaPerfil(msg.authorId)" style="border:none;">
                 <img v-if="msg.authorAvatarUrl" :src="msg.authorAvatarUrl" />
                 <template v-else>{{ getInicial(msg.authorName || '?') }}</template>
               </div>
               <div class="chat-bubble">
                 <div class="text">{{ msg.texto }}</div>
                 <div class="time">{{ formatarHora(msg.id) }}</div>
               </div>
             </div>
          </div>

          <form class="chat-input-bar" @submit.prevent="enviarMensagemChat">
            <input type="text" class="chat-input" placeholder="Digite uma mensagem..." v-model="novaMensagemChat" />
            <button type="submit" class="btn-glass-standard" style="border-radius: 50%; width: 42px; height: 42px; padding: 0; flex-shrink: 0;"><Send :size="16" style="margin-left: -2px"/></button>
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
  Heart, MessageCircle, Sparkles, UserIcon, X, Calendar, Bell, Settings, Loader2,
  ImageIcon, Send, LogOut, Hash, Menu, ChevronLeft, ChevronRight, Plus, Camera, Lock, Unlock, Clock, Gift, Flame,
  BatteryWarning, Wine, Shield, Smile, ChevronDown, Music, MoreVertical, Trash2 
} from 'lucide-vue-next'; 

const URL_API = 'https://verona-api.onrender.com'; // Servidor Oficial
let socket = null;

const usuarioLogado = ref(null);
const parceiro = ref(null);
const modoAuth = ref('login');
const nome = ref('');
const email = ref('');
const username = ref('');
const senha = ref('');
const codigoConvite = ref('');
const licenseKey = ref('');
const coupleName = ref(''); 

const sidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const isChatOpen = ref(false);
const abaAtiva = ref('feed'); 
const menuCanalAberto = ref(null);

const modalSaudadeAberto = ref(false);
const textoSaudade = ref('');
const modalConfigAberto = ref(false);
const spotifyTemp = ref('');

const isUploading = ref(false);
const isUploadingCover = ref(false);
const isUploadingProfileCover = ref(false);
const isUploadingAvatar = ref(false);
const isUploadingMemory = ref(false);
const isUploadingMural = ref(false);
const isAuthLoading = ref(false); 

const notificacoes = ref([]);
const dropdownNotificacoes = ref(false);
const naoLidasCount = computed(() => notificacoes.value.filter(n => !n.isRead).length);

const perfilVisivel = ref('me'); 
const perfilAbaAtiva = ref('mural');
const editandoBio = ref(false);
const novaBio = ref('');
const profilePosts = ref([]);
const novoPostPerfilTexto = ref('');
const novoPostPerfilImg = ref('');
const profilePostInputRef = ref(null);
const profileCoverInputRef = ref(null);
const fileInputRef = ref(null);
const mostrarMenuHumor = ref(false);

const perfilDados = computed(() => {
  if (perfilVisivel.value === 'me') return usuarioLogado.value;
  return parceiro.value || null;
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
const isSpinning = ref(false);
const modoCapsula = ref(false);
const dataCapsula = ref('');
const editandoDatas = ref(false);
const formDatas = reactive({ startDate: '', firstKiss: '' });
const metasCasal = ref([]); 
const galeriaReal = ref([]); 
const memoryInputRef = ref(null);
const relCoverInputRef = ref(null);

const moodOptions = [
  { id: 'exhausted', lucide: BatteryWarning, color: '#EF4444', label: 'Bateria Fraca' },
  { id: 'romantic', lucide: Wine, color: '#D946EF', label: 'Romântico' },
  { id: 'spicy', lucide: Flame, color: '#F97316', label: 'Com Fogo' },
  { id: 'space', lucide: Shield, color: '#3B82F6', label: 'Preciso de Espaço' },
  { id: 'normal', lucide: Smile, color: '#10B981', label: 'Tranquilo' }
];
const obterIconeLucide = (moodId) => { const f = moodOptions.find(m => m.id === moodId); return f ? f.lucide : Smile; };
const obterCorHumor = (moodId) => { const f = moodOptions.find(m => m.id === moodId); return f ? f.color : '#64748B'; };
const obterLabelHumor = (moodId) => { const f = moodOptions.find(m => m.id === moodId); return f ? f.label : ''; };

const configurarAxiosToken = (token) => { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; };

const triggerFileInput = () => { if (fileInputRef.value) fileInputRef.value.click(); };
const triggerProfileCoverInput = () => { if (profileCoverInputRef.value) profileCoverInputRef.value.click(); };
const triggerRelCoverInput = () => { if (relCoverInputRef.value) relCoverInputRef.value.click(); };
const triggerProfilePostInput = () => { if (profilePostInputRef.value) profilePostInputRef.value.click(); };
const triggerMemoryInput = () => { if (memoryInputRef.value) memoryInputRef.value.click(); };
const triggerPostImageInput = () => { if (postInputRef.value) postInputRef.value.click(); };

const irParaPerfil = (id) => {
  if(!id) return;
  if (id === usuarioLogado.value?.id) {
     perfilVisivel.value = 'me';
  } else if (parceiro.value && id === parceiro.value.id) {
     perfilVisivel.value = 'partner';
  } else {
     return; 
  }
  abaAtiva.value = 'nossos-perfis';
  isMobileMenuOpen.value = false;
};

const mudarAba = (aba) => { abaAtiva.value = aba; isMobileMenuOpen.value = false; };
const mudarCanal = (canal) => { canalAtivo.value = canal; abaAtiva.value = 'feed'; isMobileMenuOpen.value = false; };

const abrirMenuCanal = (id) => {
  if (menuCanalAberto.value === id) menuCanalAberto.value = null;
  else menuCanalAberto.value = id;
};

const deletarCanal = async (canal) => {
  if (canal.isSystem) return alert("Canais de sistema não podem ser apagados.");
  if (confirm(`Tem certeza que deseja excluir o canal #${canal.name} e todas as suas mensagens?`)) {
    try {
      await axios.delete(`${URL_API}/channels/${canal.id}`);
      await carregarCanais();
      menuCanalAberto.value = null;
    } catch (e) { alert("Erro ao excluir o canal."); }
  }
};

// O RADAR DE PARCEIRO: Impede que o app fique 'preso' sem carregar a pessoa
let radarInterval = null;
const verificarParceiro = async () => {
  if (parceiro.value) return; // Se já achou, não faz mais nada
  try {
    const res = await axios.get(`${URL_API}/auth/me`);
    if (res.data.partner) {
      parceiro.value = res.data.partner;
      if (radarInterval) { clearInterval(radarInterval); radarInterval = null; }
    }
  } catch(e) {}
};

onMounted(async () => {
  document.title = "Verona"; 
  const tokenSalvo = localStorage.getItem('verona_token');
  if (tokenSalvo) {
    configurarAxiosToken(tokenSalvo);
    try {
      const res = await axios.get(`${URL_API}/auth/me`);
      usuarioLogado.value = { ...res.data.user, relationship: res.data.relationship };
      parceiro.value = res.data.partner;
      novaBio.value = usuarioLogado.value?.bio || '';
      spotifyTemp.value = usuarioLogado.value?.relationship?.spotifyUri || '';
      abaAtiva.value = 'feed'; 
      
      // Se estiver logado e não tiver parceiro, liga o radar
      if (!parceiro.value) { radarInterval = setInterval(verificarParceiro, 5000); }
    } catch (e) { localStorage.removeItem('verona_token'); }
  }
});

watch(() => usuarioLogado.value, (user) => {
  if (user && user.relationship?.status === 'ACTIVE') {
    carregarCanais(); carregarDailyQuestion(); carregarHistoricoChat(); carregarMemories(); carregarNotificacoes(); 
    formDatas.startDate = user.relationship?.startDate ? user.relationship.startDate.split('T')[0] : '';
    formDatas.firstKiss = user.relationship?.firstKiss ? user.relationship.firstKiss.split('T')[0] : '';
    metasCasal.value = user.relationship?.goals || [];
    
    if(!socket) {
      socket = io(URL_API, { transports: ['websocket', 'polling'] }); 
      socket.emit('entrar_na_sala', user.relationship.id);
      
      socket.on('receber_mensagem', (msg) => {
         mensagensChat.value.push(msg);
         if (!parceiro.value) verificarParceiro(); // Atualiza instantaneamente se o parceiro mandar mensagem
      });
      
      socket.on('feed_atualizado', (dados) => {
        if (canalAtivo.value && canalAtivo.value.id === dados.channelId) {
          carregarFeed(); 
        }
        if (!parceiro.value) verificarParceiro(); // Atualiza instantaneamente se o parceiro postar algo
      });
    }
  }
});

watch(() => canalAtivo.value, (canal) => { if (canal) carregarFeed(); });
watch(() => perfilVisivel.value, () => { carregarMuralPerfil(); editandoBio.value = false; perfilAbaAtiva.value = 'mural'; mostrarMenuHumor.value = false; });

const carregarNotificacoes = async () => { try { const res = await axios.get(`${URL_API}/notifications`); notificacoes.value = res.data; } catch(e){} };
const toggleNotificacoes = async () => {
  dropdownNotificacoes.value = !dropdownNotificacoes.value;
  if (dropdownNotificacoes.value && naoLidasCount.value > 0) {
    try { await axios.put(`${URL_API}/notifications/read`); notificacoes.value.forEach(n => n.isRead = true); } catch(e){}
  }
};
const obterIconeEmojiNotif = (type) => { if(type === 'MISS_YOU') return '🔥'; if(type === 'NEW_POST' || type === 'NEW_REPLY') return '💬'; if(type === 'NEW_MEMORY') return '📸'; return '✨'; };

const carregarMuralPerfil = async () => { if (!perfilDados.value) return; try { const res = await axios.get(`${URL_API}/profile-posts/${perfilDados.value.id}`); profilePosts.value = res.data; } catch(e) {} };
const onProfilePostImageSelected = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (ev) => { novoPostPerfilImg.value = ev.target.result; }; reader.readAsDataURL(file); };

const enviarPostPerfil = async () => {
  if (!novoPostPerfilTexto.value.trim() && !novoPostPerfilImg.value) return;
  isUploadingMural.value = true;
  try { 
    await axios.post(`${URL_API}/profile-posts`, { content: novoPostPerfilTexto.value, imageUrl: novoPostPerfilImg.value }); 
    novoPostPerfilTexto.value = ''; novoPostPerfilImg.value = ''; await carregarMuralPerfil(); 
  } catch(e) { alert("Erro ao postar."); } finally { isUploadingMural.value = false; }
};

const salvarBio = async () => { try { await axios.put(`${URL_API}/users/me`, { bio: novaBio.value }); usuarioLogado.value.bio = novaBio.value; editandoBio.value = false; } catch(e) {} };
const onProfileCoverSelected = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = async (ev) => { const b64 = ev.target.result; isUploadingProfileCover.value = true; try { await axios.put(`${URL_API}/users/me`, { coverUrl: b64 }); usuarioLogado.value.coverUrl = b64; } catch(err){} finally { isUploadingProfileCover.value = false; } }; reader.readAsDataURL(file); };
const atualizarHumorEFechar = async (moodId) => { try { await axios.put(`${URL_API}/users/me`, { moodStatus: moodId }); usuarioLogado.value.moodStatus = moodId; mostrarMenuHumor.value = false; } catch(e) {} };

const onFileSelected = (event) => { 
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); 
  reader.onload = async (e) => { 
    const b64 = e.target.result; isUploadingAvatar.value = true; 
    try { await axios.put(`${URL_API}/users/me`, { avatarUrl: b64 }); usuarioLogado.value.avatarUrl = b64; } catch(e) {} finally { isUploadingAvatar.value = false; } 
  }; reader.readAsDataURL(file); 
};

const onRelCoverSelected = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = async (ev) => { const b64 = ev.target.result; isUploadingCover.value = true; try { await axios.put(`${URL_API}/relationship`, { coverImageUrl: b64 }); usuarioLogado.value.relationship.coverImageUrl = b64; } catch(err){} finally { isUploadingCover.value = false; } }; reader.readAsDataURL(file); };
const salvarConfig = async () => { try { await axios.put(`${URL_API}/relationship`, { spotifyUri: spotifyTemp.value }); usuarioLogado.value.relationship.spotifyUri = spotifyTemp.value; modalConfigAberto.value = false; } catch(e) {} };

const formatarSpotifyIframe = (link) => { 
  if(!link) return ''; 
  if (link.includes('embed')) return link; 
  const regex = /open\.spotify\.com\/(track|playlist|album|episode)\/([a-zA-Z0-9]+)/;
  const match = link.match(regex);
  if(match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`;
  return link;
};

const carregarMemories = async () => { try { const res = await axios.get(`${URL_API}/memories`); galeriaReal.value = res.data; } catch(e) {} };
const onMemorySelected = (event) => {
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Image = e.target.result; const description = prompt("Legenda para esta memória:"); if(description === null) return;
    isUploadingMemory.value = true;
    try { await axios.post(`${URL_API}/memories`, { base64Image, description }); await carregarMemories(); } catch(err) {} finally { isUploadingMemory.value = false; }
  }; reader.readAsDataURL(file);
};

const abrirModalSaudade = () => { modalSaudadeAberto.value = true; textoSaudade.value = ''; };
const dispararSaudade = async () => { if (!textoSaudade.value.trim()) return; try { await axios.post(`${URL_API}/notifications/miss-you`, { customMessage: textoSaudade.value }); modalSaudadeAberto.value = false; } catch(e) {} };
const onPostImageSelected = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (ev) => { imagemPostBase64.value = ev.target.result; }; reader.readAsDataURL(file); };

const carregarFeed = async () => { 
  if (!canalAtivo.value) return; 
  try { 
    const res = await axios.get(`${URL_API}/channels/${canalAtivo.value.id}/posts`); 
    const stateMap = {};
    feed.value.forEach(p => { stateMap[p.id] = { mostrar: p.mostrarRespostas, texto: p.novaResposta }; });
    feed.value = res.data.map(post => ({ ...post, curtido: false, mostrarRespostas: stateMap[post.id]?.mostrar || false, novaResposta: stateMap[post.id]?.texto || '' })); 
  } catch (err) {} 
};

const enviarPost = async () => { 
  if ((!novoTexto.value.trim() && !imagemPostBase64.value) || !canalAtivo.value) return; 
  isUploading.value = true;
  try { 
    await axios.post(`${URL_API}/posts`, { content: novoTexto.value, imageUrl: imagemPostBase64.value, channelId: canalAtivo.value.id, unlockAt: modoCapsula.value && dataCapsula.value ? dataCapsula.value : null }); 
    novoTexto.value = ''; imagemPostBase64.value = ''; if(postInputRef.value) postInputRef.value.value = null; modoCapsula.value = false; dataCapsula.value = ''; 
  } catch (err) { alert(err.response?.data?.error || "Erro ao postar."); } finally { isUploading.value = false; }
};

const fazerLogin = async () => { 
  if (!email.value || !senha.value) return;
  isAuthLoading.value = true; 
  try { 
    const res = await axios.post(`${URL_API}/auth/login`, { email: email.value, password: senha.value }); 
    localStorage.setItem('verona_token', res.data.token); 
    configurarAxiosToken(res.data.token); 
    usuarioLogado.value = { ...res.data.user, relationship: res.data.relationship }; 
    parceiro.value = res.data.partner; 
    senha.value = ''; 
    abaAtiva.value = 'feed'; 
    
    // Liga o radar após o login se o parceiro ainda não existir
    if (!parceiro.value) { radarInterval = setInterval(verificarParceiro, 5000); }
  } catch (err) { 
    alert(err.response?.data?.error || 'Erro de conexão com o servidor. Verifique suas credenciais.'); 
  } finally {
    isAuthLoading.value = false;
  }
};

const fazerCadastro = async () => { 
  isAuthLoading.value = true;
  try { 
    await axios.post(`${URL_API}/auth/register`, { name: nome.value, email: email.value, username: username.value, password: senha.value, inviteCode: codigoConvite.value, licenseKey: licenseKey.value, coupleName: coupleName.value }); 
    alert('Santuário criado com sucesso! Faça login para entrar.'); 
    modoAuth.value = 'login'; 
    senha.value = ''; 
  } catch (err) { 
    alert(err.response?.data?.error || 'Erro no cadastro.'); 
  } finally {
    isAuthLoading.value = false;
  }
};

const fazerLogout = () => { 
  if (radarInterval) { clearInterval(radarInterval); radarInterval = null; }
  usuarioLogado.value = null; 
  parceiro.value = null; 
  localStorage.removeItem('verona_token'); 
  delete axios.defaults.headers.common['Authorization']; 
  if (socket) { socket.disconnect(); socket = null; } 
};
const copiarCodigo = () => { navigator.clipboard.writeText(usuarioLogado.value?.relationship?.inviteCode); alert('Código copiado!'); };

const carregarCanais = async () => { 
  try { 
    const res = await axios.get(`${URL_API}/channels`); 
    canais.value = res.data; 
    if (res.data.length > 0 && !canalAtivo.value) canalAtivo.value = res.data.find(c => c.name === 'geral') || res.data[0]; 
  } catch (err) {} 
};

const criarCanal = async () => { if (!novoCanalNome.value.trim()) return; try { await axios.post(`${URL_API}/channels`, { name: novoCanalNome.value }); novoCanalNome.value = ''; modoCriarCanal.value = false; await carregarCanais(); } catch (err) {} };

const toggleRespostas = (post) => { post.mostrarRespostas = !post.mostrarRespostas; };
const enviarResposta = async (post) => { 
  if (!post.novaResposta?.trim()) return; 
  try { await axios.post(`${URL_API}/posts`, { content: post.novaResposta, parentId: post.id, channelId: canalAtivo.value.id }); post.novaResposta = ''; } catch(e) {} 
};

const adicionarMeta = async () => { const titulo = prompt("Qual a nova meta de vocês?"); if (!titulo) return; try { const res = await axios.post(`${URL_API}/goals`, { title: titulo }); metasCasal.value.push(res.data); } catch(e) {} };
const toggleEditDatas = async () => { if (editandoDatas.value) { try { await axios.put(`${URL_API}/relationship`, { startDate: formDatas.startDate, firstKiss: formDatas.firstKiss }); } catch(e) {} } editandoDatas.value = !editandoDatas.value; };

const carregarHistoricoChat = async () => { try { const res = await axios.get(`${URL_API}/chat`); mensagensChat.value = res.data; } catch(e) {} };
const enviarMensagemChat = () => { if (!novaMensagemChat.value.trim()) return; socket.emit('nova_mensagem', { texto: novaMensagemChat.value, authorName: usuarioLogado.value?.name, authorId: usuarioLogado.value?.id, authorAvatarUrl: usuarioLogado.value?.avatarUrl, relationshipId: usuarioLogado.value?.relationship?.id }); novaMensagemChat.value = ''; };

const carregarDailyQuestion = async () => { try { const res = await axios.get(`${URL_API}/daily-question`); dailyQuestion.value = res.data; } catch(e) {} };
const responderDaily = async () => { if (!minhaRespostaDaily.value.trim()) return; try { await axios.post(`${URL_API}/daily-question/answer`, { questionId: dailyQuestion.value.id, content: minhaRespostaDaily.value }); minhaRespostaDaily.value = ''; await carregarDailyQuestion(); if (dailyQuestion.value?.partnerAnswered && usuarioLogado.value?.relationship) { usuarioLogado.value.relationship.streakCount += 1; } } catch(e) {} };

const girarRoletaAnimado = () => { 
  isSpinning.value = true; 
  setTimeout(async () => { 
    try { const res = await axios.get(`${URL_API}/date-ideas/random`); ideaSorteada.value = res.data; } catch(e){} finally { isSpinning.value = false; } 
  }, 1800); 
};

const estaTrancado = (unlockAt) => { if (!unlockAt) return false; return new Date(unlockAt) > new Date(); };
const formatarDataHora = (dataIso) => { if (!dataIso) return ''; const data = new Date(dataIso); return `${data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}`; };
const formatarData = (dataIso) => { if (!dataIso) return ''; return new Date(dataIso + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); };
const formatarHora = (ts) => ts ? new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }) : '';
const getInicial = (nomeStr) => nomeStr ? nomeStr.charAt(0).toUpperCase() : 'V';

onUnmounted(() => { 
  if (socket) socket.disconnect(); 
  if (radarInterval) clearInterval(radarInterval);
});
</script>

<style>
/* ========================================== */
/* VRTICE DESIGN SYSTEM (Modern Premium Glass) */
/* ========================================== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; max-width: 100%; }

:root {
  --bg-app: #F4F5F9;
  --bg-surface: #FFFFFF;
  --bg-sidebar: #0C0A15;
  --accent-color: #8B5CF6;
  --accent-glow: rgba(139, 92, 246, 0.25);
  --text-main: #0F172A;
  --text-muted: #64748B;
  --border-soft: rgba(0,0,0,0.06);
  --shadow-soft: 0 8px 24px rgba(0,0,0,0.04);
  --shadow-ambient: 0 20px 40px rgba(0,0,0,0.06);
  --gradient-primary: linear-gradient(135deg, #8B5CF6, #D946EF);
  --gradient-cosmic: linear-gradient(-45deg, #2B0A3D, #000000, #4C1D95);
}

body { background: var(--bg-app); color: var(--text-main); font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
.playfair { font-family: 'Poppins', sans-serif; letter-spacing: -0.5px; }

/* UTILS */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.cursor-pointer { cursor: pointer; transition: 0.2s; }
.hover-underline:hover { text-decoration: underline; color: var(--accent-color); }
.text-center { text-align: center; }
.mt-2 { margin-top: 10px; }
.mt-3 { margin-top: 15px; }
.mt-4 { margin-top: 20px; }
.mb-0 { margin-bottom: 0 !important; }
.text-danger { color: #EF4444 !important; }

/* ANIMAÇÕES */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.float-anim { animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes cosmicGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

/* ESTRUTURA GERAL */
.app-master-wrapper { display: flex; height: 100vh; overflow: hidden; background: var(--bg-app); position: relative; width: 100vw; }
.app-master-layout { display: flex; width: 100%; height: 100%; }
.glass-panel { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.8); }
.glass-card { background: var(--bg-surface); border-radius: 30px; box-shadow: var(--shadow-ambient); border: 1px solid var(--border-soft); overflow: hidden; }
.pad-responsive { padding: 0 40px; }
.pad-top-nav { padding-top: 110px !important; }

/* BOTOES PADRONIZADOS */
.btn-glass-standard { background: rgba(255,255,255,0.4); border: 1px solid rgba(0,0,0,0.1); color: var(--text-main); font-weight: 800; cursor: pointer; padding: 12px 20px; border-radius: 20px; font-size: 14px; backdrop-filter: blur(10px); display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease; box-shadow: var(--shadow-soft); }
.btn-glass-standard:hover:not(:disabled) { background: rgba(255,255,255,0.8); transform: translateY(-2px); box-shadow: var(--shadow-ambient); color: var(--accent-color); border-color: var(--accent-glow); }
.btn-glass-standard:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-glass-standard.white-text { background: rgba(255,255,255,0.9); color: var(--accent-color); border: none; }

.btn-neon-large { background: var(--gradient-primary); color: white; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px var(--accent-glow); padding: 16px 30px; border-radius: 20px; font-size: 16px; }
.btn-neon-large:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.btn-icon-action { background: transparent; border: none; color: var(--text-muted); display: flex; align-items: center; gap: 5px; font-weight: 600; cursor: pointer; padding: 6px 12px; border-radius: 20px; transition: 0.2s; }
.btn-icon-action:hover { background: rgba(0,0,0,0.04); }
.btn-icon-action.active { color: var(--accent-color); background: rgba(139, 92, 246, 0.1); }
.btn-close-subtle { background: transparent; border: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; padding: 5px; border-radius: 50%; }
.btn-close-subtle:hover { background: rgba(0,0,0,0.05); color: var(--text-main); }

/* INPUTS */
.glass-input-login, .glass-input-premium { width: 100%; padding: 16px 25px; border-radius: 20px; border: 1px solid var(--border-soft); background: rgba(255,255,255,0.8); font-size: 15px; color: var(--text-main); margin-bottom: 15px; transition: 0.3s; font-family: inherit; }
.glass-input-login:focus, .glass-input-premium:focus { outline: none; border-color: var(--accent-color); background: white; box-shadow: 0 0 0 4px var(--accent-glow); }
.glass-input-light { width: 100%; padding: 15px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); font-size: 15px; color: white; transition: 0.3s; }
.glass-input-light::placeholder { color: rgba(255,255,255,0.6); }
.glass-input-light:focus { outline: none; border-color: white; background: rgba(255,255,255,0.2); }
.glass-input-dark { width: 100%; padding: 10px 15px; border-radius: 16px; border: none; background: rgba(255,255,255,0.05); color: white; font-size: 13px; }
.glass-input-dark:focus { outline: none; background: rgba(255,255,255,0.1); }

/* IMAGENS E AVATARES */
.avatar-img-round { border-radius: 50%; overflow: hidden; background: var(--bg-app); display: flex; justify-content: center; align-items: center; font-weight: bold; color: var(--accent-color); flex-shrink: 0; border: 1px solid var(--border-soft); box-shadow: var(--shadow-soft); }
.avatar-img-round img { width: 100%; height: 100%; object-fit: cover; }
.tiny-avatar { width: 28px; height: 28px; font-size: 10px; }

/* LOGIN */
.login-wrapper { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #0A0710; padding: 20px; }
.login-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; animation: float 10s infinite alternate; }
.orb-1 { width: 400px; height: 400px; background: #8B5CF6; top: -100px; left: -100px; }
.orb-2 { width: 500px; height: 500px; background: #D946EF; bottom: -150px; right: -100px; animation-delay: -5s; }
.glass-login-panel { background: rgba(255,255,255,0.05); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.1); padding: 50px 40px; border-radius: 40px; width: 100%; max-width: 420px; text-align: center; position: relative; z-index: 10; box-shadow: 0 30px 60px rgba(0,0,0,0.4); }
.login-icon-glow { background: var(--gradient-primary); width: 80px; height: 80px; border-radius: 25px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; box-shadow: 0 10px 25px rgba(217, 70, 239, 0.4); }
.login-title { color: white; font-size: 36px; margin: 0 0 5px 0; }
.login-subtitle { color: rgba(255,255,255,0.6); margin-bottom: 30px; font-weight: 500; }
.login-divider { display: flex; align-items: center; text-align: center; margin: 20px 0; color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 800; text-transform: uppercase; }
.login-divider::before, .login-divider::after { content: ''; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.1); }
.login-divider span { padding: 0 10px; }
.login-ou { text-align: center; font-size: 11px; color: rgba(255,255,255,0.4); margin: 10px 0; font-weight: 800; text-transform: uppercase; }
.login-footer-link { margin-top: 30px; color: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.login-footer-link:hover { color: white; }
.invite-code-box { background: rgba(255,255,255,0.1); border: 1px dashed rgba(255,255,255,0.3); padding: 25px; border-radius: 20px; letter-spacing: 8px; color: white; font-size: 32px; font-weight: 800; margin: 30px 0; }

/* SIDEBAR ESCURA E CANAIS */
.desktop-sidebar { width: 280px; background: var(--bg-sidebar); display: flex; flex-direction: column; padding: 40px 25px; transition: 0.3s; z-index: 100; box-shadow: 10px 0 30px rgba(0,0,0,0.2); border-right: 1px solid rgba(255,255,255,0.05); }
.desktop-sidebar.collapsed { width: 90px; align-items: center; padding: 40px 15px; }
.desktop-sidebar.collapsed .sidebar-avatar { display: flex; }
.desktop-sidebar.collapsed .nav-item { justify-content: center; padding: 15px 0; margin-bottom: 15px; }
.sidebar-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); display: flex; justify-content: center; align-items: center; color: white; background: rgba(255,255,255,0.1); }
.sidebar-avatar img { width: 100%; height: 100%; object-fit: cover; }
.nav-section-title { font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 15px; display: flex; justify-content: space-between; color: rgba(255,255,255,0.3); }
.scroll-channels { max-height: 200px; overflow-y: auto; }
.nav-item { padding: 12px 15px; border-radius: 16px; margin-bottom: 5px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; position: relative; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-item.active { background: rgba(255,255,255,0.1); color: white; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
.nav-text { color: inherit; }

.channel-item-row { display: flex; justify-content: space-between; }
.channel-options-btn { opacity: 0; background: transparent; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; border-radius: 50%; transition: 0.2s; }
.channel-item-row:hover .channel-options-btn { opacity: 1; }
.channel-options-btn:hover { background: rgba(255,255,255,0.1); }
.channel-dropdown { position: absolute; right: -5px; top: 35px; width: 120px; padding: 8px; z-index: 50; display: flex; flex-direction: column; }
.dropdown-item { background: transparent; border: none; text-align: left; padding: 10px; font-size: 13px; font-weight: 600; font-family: inherit; color: var(--text-main); display: flex; align-items: center; gap: 8px; border-radius: 12px; cursor: pointer; }
.dropdown-item:hover:not(:disabled) { background: rgba(0,0,0,0.05); }
.dropdown-item:disabled { opacity: 0.4; cursor: not-allowed; }

.streak-box { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.05); font-size: 12px; font-weight: 800; color: #F97316; text-transform: uppercase; letter-spacing: 1px; }

/* PALCO CLARO E HEADER FLUTUANTE (TOP NAV) */
.main-stage { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-app); position: relative; }
.scroll-area { flex: 1; height: 100%; overflow-y: auto; display: flex; flex-direction: column; position: relative; padding-bottom: 40px;}

.top-nav-glass { position: absolute; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; z-index: 100; background: transparent; pointer-events: none; }
.top-nav-left { pointer-events: auto; }
.top-nav-right { display: flex; flex-direction: row; align-items: center; gap: 15px; pointer-events: auto; }

.partner-status-pill { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); padding: 6px 16px 6px 6px; border-radius: 40px; box-shadow: var(--shadow-soft); border: 1px solid var(--border-soft); }
.partner-status-pill .partner-avatar-round { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 2px solid white; box-shadow: var(--shadow-soft); }
.partner-status-pill .partner-avatar-round img { width: 100%; height: 100%; object-fit: cover; }

.icon-btn-round { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border: 1px solid var(--border-soft); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-soft); transition: 0.2s; position: relative; color: var(--text-main); }
.icon-btn-round:hover { transform: translateY(-2px); box-shadow: var(--shadow-ambient); background: white; }
.notification-badge { position: absolute; top: -2px; right: -2px; background: #EF4444; color: white; font-size: 10px; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-surface); }
.notification-dropdown { position: absolute; top: 55px; right: 0; width: 340px; z-index: 1000; padding: 0; }
.notif-header { padding: 15px 20px; border-bottom: 1px solid var(--border-soft); font-weight: 800; font-size: 13px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
.notif-item { display: flex; align-items: flex-start; padding: 15px 20px; border-bottom: 1px solid var(--border-soft); transition: 0.2s; cursor: default; }
.notif-item:hover { background: rgba(0,0,0,0.02); }
.notif-item.unread { background: rgba(139, 92, 246, 0.04); }
.notif-text { font-size: 14px; color: var(--text-main); line-height: 1.4; font-weight: 500; }
.notif-time { font-size: 11px; color: var(--text-muted); margin-top: 5px; font-weight: 600; }

.dual-toggle-pill { background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-radius: 40px; padding: 6px; display: flex; border: 1px solid var(--border-soft); box-shadow: var(--shadow-soft); pointer-events: auto; }
.dual-toggle-pill button { background: transparent; border: none; color: var(--text-muted); font-weight: 700; padding: 10px 25px; border-radius: 30px; cursor: pointer; transition: 0.3s; font-size: 14px; }
.dual-toggle-pill button.active { background: white; color: var(--text-main); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

/* FEED E POSTS */
.daily-animated-banner { background: var(--gradient-cosmic); background-size: 300% 300%; animation: cosmicGradient 10s ease infinite; padding: 40px; border-radius: 30px; margin-bottom: 30px; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(43, 10, 61, 0.3); min-height: 200px; display: flex; flex-direction: column; justify-content: center; }
.daily-badge { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(10px); width: fit-content; }
.daily-question-title { font-size: 28px; margin: 0 0 25px 0; color: white; position: relative; z-index: 2; line-height: 1.3; }
.daily-answer-form { display: flex; gap: 15px; position: relative; z-index: 2; align-items: center; flex-wrap: wrap; }
.daily-answers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; position: relative; z-index: 2; }
.answer-card { background: rgba(255,255,255,0.1); padding: 25px; border-radius: 24px; backdrop-filter: blur(15px); }
.answer-card.outline-glass { border: 1px solid rgba(255,255,255,0.2); }
.answer-label { font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
.answer-text { font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.9); line-height: 1.6; }
.answer-text.highlight { color: white; font-weight: 700; }

.feed-container { display: flex; flex-direction: column; gap: 20px; }
.post-glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border-radius: 24px; padding: 25px; border: 1px solid var(--border-soft); box-shadow: var(--shadow-soft); }
.post-layout-flex { display: flex; gap: 15px; align-items: flex-start; }
.post-avatar-col { flex-shrink: 0; }
.post-avatar-col .avatar-img-round { width: 48px; height: 48px; }
.post-content-col { flex: 1; }
.post-header-line { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.03); padding-bottom: 10px; }
.post-author-name { font-weight: 800; font-size: 16px; color: var(--text-main); }
.post-time { font-size: 13px; color: var(--text-muted); font-weight: 500; }
.post-content-text { font-size: 16px; line-height: 1.6; color: var(--text-main); margin-bottom: 15px; white-space: pre-wrap; margin-top: 10px; }
.post-image { width: 100%; max-height: 450px; object-fit: cover; border-radius: 20px; margin-bottom: 15px; border: 1px solid var(--border-soft); }

.capsule-locked-box { background: var(--bg-surface); padding: 30px; border-radius: 20px; text-align: center; border: 1px dashed var(--border-soft); margin-top: 10px; }
.capsule-title { font-weight: 800; color: var(--text-main); font-size: 15px; margin-bottom: 5px; }
.capsule-date { font-size: 13px; color: var(--text-muted); font-weight: 500; }

.nested-replies-area { margin-top: 15px; padding-left: 20px; border-left: 2px solid var(--border-soft); }
.reply-flex-item { display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start; }
.reply-bubble-content { background: var(--bg-surface); padding: 12px 18px; border-radius: 4px 20px 20px 20px; font-size: 14px; flex: 1; border: 1px solid var(--border-soft); line-height: 1.5; }
.reply-author { font-weight: 800; margin-right: 8px; color: var(--text-main); }
.reply-input-form { display: flex; gap: 10px; margin-top: 15px; }
.reply-input { flex: 1; padding: 12px 20px; border-radius: 30px; border: 1px solid var(--border-soft); background: var(--bg-surface); font-size: 14px; font-family: inherit; }
.reply-input:focus { outline: none; border-color: var(--accent-color); }
.empty-state-box { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 16px; font-weight: 500; line-height: 1.6; }

/* COMPOSER */
.composer-footer-anchor { padding: 0 40px 20px 40px; background: linear-gradient(to top, var(--bg-app) 70%, transparent); position: sticky; bottom: 0; z-index: 50; }
.main-composer-box { padding: 20px 25px; transition: 0.3s; }
.main-composer-box.disabled-composer { opacity: 0.5; pointer-events: none; }
.composer-textarea { width: 100%; border: none; background: transparent; resize: none; font-size: 16px; color: var(--text-main); font-family: inherit; margin-bottom: 15px; height: 60px; font-weight: 500; }
.composer-textarea:focus { outline: none; }
.composer-toolbar { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-soft); padding-top: 15px; }

/* NOSSO MUNDO BENTO GRID E CAPA COLOSSAL */
.mundo-master-cover { position: relative; height: 400px; width: calc(100% - 40px); margin: 20px auto 40px auto; border-radius: 30px; overflow: hidden; box-shadow: var(--shadow-ambient); }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); pointer-events: none; }
.cover-overlay { position: absolute; bottom: 40px; left: 40px; }
.cover-overlay h2 { color: white; font-size: 48px; margin: 0; text-shadow: 0 4px 15px rgba(0,0,0,0.5); line-height: 1.1; }
.abs-bottom-right { position: absolute; bottom: 20px; right: 20px; z-index: 2; }

.mundo-bento-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; padding: 0 40px 40px 40px; }
.column-wrapper { display: flex; flex-direction: column; height: 100%; }
.gap-vertical { gap: 25px; }
.bento-glass-card { background: rgba(255,255,255,0.7); border-radius: 30px; box-shadow: var(--shadow-ambient); border: 1px solid rgba(255,255,255,0.8); overflow: hidden; position: relative; backdrop-filter: blur(20px); }

.memory-bento-card { padding: 25px; display: flex; flex-direction: column; flex: 1; height: 100%; }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header-flex h3, .card-header-flex h4 { margin: 0; font-size: 20px; color: var(--text-main); }

.carousel-horizontal { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 15px; padding-bottom: 10px; flex: 1; height: 450px; }
.carousel-slide { flex: 0 0 100%; height: 100%; border-radius: 20px; overflow: hidden; position: relative; scroll-snap-align: start; background: var(--bg-app); border: 1px solid var(--border-soft); }
.carousel-slide img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.memory-info-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: 25px; display: flex; flex-direction: column; justify-content: flex-end; color: white; }
.memory-info-overlay .desc { font-weight: 700; font-size: 15px; margin-bottom: 8px; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.memory-info-overlay .meta { font-size: 12px; opacity: 0.8; font-weight: 600; }
.empty-memory-slot { display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; border: 2px dashed var(--border-soft); border-radius: 20px; gap: 10px; transition: 0.2s; width: 100%; height: 100%; min-height: 300px; }

.history-bento-card { display: flex; flex-direction: column; height: 500px; padding: 25px; }
.timeline-row-vertical { display: flex; flex-direction: column; gap: 15px; }
.timeline-item { background: rgba(255,255,255,0.6); padding: 15px 20px; border-radius: 16px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-soft); }
.timeline-item .label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
.timeline-item .value { font-size: 16px; font-weight: 800; color: var(--text-main); }
.timeline-item .text-accent { color: var(--accent-color); }
.divider-line { height: 1px; background: var(--border-soft); margin: 25px 0; }
.btn-circle-mini { background: var(--text-main); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s; }
.btn-circle-mini:hover { transform: scale(1.1); background: var(--accent-color); }
.dream-item { background: rgba(255,255,255,0.6); padding: 12px 18px; border-radius: 16px; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 14px; color: var(--text-main); margin-bottom: 10px; border: 1px solid var(--border-soft); }
.empty-list-text { color: var(--text-muted); font-size: 13px; text-align: center; padding: 15px; font-weight: 500; }

.spotify-bento-card { display: flex; flex-direction: column; }
.spotify-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; }
.empty-spotify-slot { padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; border: 2px dashed var(--border-soft); border-radius: 20px; width: 100%; transition: 0.2s; background: rgba(255,255,255,0.5); }

.roleta-bento-card { padding: 40px 30px; text-align: center; position: relative; overflow: hidden; flex: 1; display: flex; flex-direction: column; justify-content: center; }
.roleta-inner { display: flex; flex-direction: column; align-items: center; gap: 15px; position: relative; z-index: 2; }
.icon-pulse-wrapper { background: var(--gradient-primary); width: 60px; height: 60px; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px var(--accent-glow); margin-bottom: 10px; position: relative; }
.icon-pulse-wrapper::before { content: ''; position: absolute; inset: -20px; border-radius: 30px; border: 2px solid var(--accent-glow); animation: pulseRing 2s infinite; pointer-events: none; }
.subtitle-tiny { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.5; }
.loading-state-tiny { display: flex; align-items: center; gap: 10px; font-weight: bold; color: var(--accent-color); margin-bottom: 15px; }
.result-tiny { background: var(--bg-surface); padding: 15px; border-radius: 16px; font-weight: 800; color: var(--text-main); font-size: 18px; width: 100%; border: 1px solid var(--border-soft); margin-bottom: 15px; box-shadow: var(--shadow-soft); }

/* PERFIL DUPLO V4 */
.profile-hero-expanded { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 0; }
.hero-info-wrapper { max-width: 1000px; width: 100%; display: flex; align-items: flex-end; gap: 30px; padding: 0 40px; margin-top: -70px; position: relative; z-index: 2; flex-wrap: wrap; }
.hero-avatar-box { position: relative; width: 150px; height: 150px; border-radius: 50%; border: 8px solid var(--bg-app); background: white; display: flex; justify-content: center; align-items: center; font-size: 48px; font-weight: bold; color: var(--accent-color); box-shadow: var(--shadow-soft); overflow: hidden; flex-shrink: 0; }
.hero-avatar-box img { width: 100%; height: 100%; object-fit: cover; }
.btn-edit-avatar-small { position: absolute; bottom: 5px; right: 5px; background: var(--text-main); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 10; }

.hero-text-content { flex: 1; padding-bottom: 10px; }
.name-row { display: flex; align-items: center; gap: 15px; }
.name-row h2 { margin: 0; font-size: 36px; color: var(--text-main); letter-spacing: -0.5px; }
.username-tag { font-size: 15px; color: var(--text-muted); font-weight: 600; display: block; margin-top: 4px; }
.bio-edit-box { width: 100%; max-width: 500px; }
.bio-text { font-size: 16px; color: var(--text-main); line-height: 1.6; max-width: 500px; margin-top: 15px; }

/* CSS do Botão Mood Otimizado */
.mood-dropdown-wrapper { position: relative; }
.btn-mood-pill { background: var(--bg-surface); border: 1px solid var(--border-soft); padding: 8px 18px; border-radius: 30px; font-size: 14px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: var(--shadow-soft); transition: 0.2s; height: 38px; max-width: 200px; }
.btn-mood-pill .mood-label-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; display: inline-block; }
.btn-mood-pill:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-ambient); }
.btn-mood-pill:disabled { cursor: default; opacity: 0.9; }
.mood-menu { position: absolute; top: 45px; left: 0; width: 220px; padding: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 100; border-radius: 20px; box-shadow: var(--shadow-ambient); }
.mood-item { padding: 12px 15px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; transition: 0.2s; color: var(--text-main); white-space: nowrap; }
.mood-item:hover { background: rgba(0,0,0,0.04); }

.profile-tabs { display: flex; gap: 30px; border-bottom: 1px solid var(--border-soft); margin-top: 40px; margin-bottom: 30px; width: 100%; max-width: 1000px; padding: 0 40px; }
.profile-tabs button { background: transparent; border: none; padding: 15px 0; font-size: 16px; font-weight: 700; color: var(--text-muted); cursor: pointer; position: relative; transition: 0.2s; }
.profile-tabs button:hover { color: var(--text-main); }
.profile-tabs button.active { color: var(--text-main); }
.profile-tabs button.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 4px; background: var(--text-main); border-radius: 4px 4px 0 0; }
.profile-tab-content { width: 100%; max-width: 1000px; padding: 0 40px 50px 40px; margin: 0 auto;}

/* Mural Invertido */
.mural-layout-inverted { display: flex; flex-direction: column; }
.mural-posts-lista { display: flex; flex-direction: column; }

/* MODALS ABSOLUTOS */
.modal-overlay-blur { position: fixed; inset: 0; background: rgba(12, 10, 21, 0.7); backdrop-filter: blur(15px); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content-glass { background: rgba(255,255,255,0.95); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.5); padding: 40px; border-radius: 40px; box-shadow: 0 40px 80px rgba(0,0,0,0.3); width: 100%; max-width: 420px; }
.modal-icon-circle { background: rgba(244, 63, 94, 0.1); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; }
.input-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }

/* CHAT WHATSAPP STYLE */
.chat-widget-absolute { position: fixed; bottom: 30px; right: 30px; z-index: 99999; display: flex; flex-direction: column; align-items: flex-end; gap: 15px; pointer-events: none; }
.chat-trigger-btn { width: 65px; height: 65px; border-radius: 50%; background: var(--gradient-primary); border: none; box-shadow: 0 10px 30px var(--accent-glow); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: auto; }
.chat-trigger-btn:hover { transform: scale(1.1); }
.chat-window-panel { width: 380px; height: 550px; background: rgba(255,255,255,0.95); border: 1px solid rgba(255,255,255,0.5); border-radius: 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; pointer-events: auto; }
.chat-header-blur { background: rgba(255,255,255,0.8); border-bottom: 1px solid var(--border-soft); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(20px); z-index: 2; }
.chat-header-info { display: flex; align-items: center; gap: 12px; }
.chat-header-text { display: flex; flex-direction: column; }
.chat-header-text .name { font-weight: 800; font-size: 16px; color: var(--text-main); }
.chat-header-text .status { font-size: 11px; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; }
.chat-message-list { padding: 20px; background: #F8F9FA; flex: 1; display: flex; flex-direction: column; gap: 15px; }
.chat-bubble-row { display: flex; align-items: flex-end; gap: 8px; max-width: 85%; }
.chat-bubble-row.is-mine { align-self: flex-end; flex-direction: row-reverse; }
.chat-bubble { padding: 12px 18px; font-size: 15px; line-height: 1.4; box-shadow: 0 2px 10px rgba(0,0,0,0.03); position: relative; }
.chat-bubble-row:not(.is-mine) .chat-bubble { background: white; color: var(--text-main); border-radius: 20px 20px 20px 4px; border: 1px solid var(--border-soft); }
.chat-bubble-row.is-mine .chat-bubble { background: var(--gradient-primary); color: white; border-radius: 20px 20px 4px 20px; }
.chat-bubble .time { font-size: 10px; margin-top: 5px; font-weight: 700; opacity: 0.7; text-align: right; }
.chat-input-bar { padding: 15px; background: white; border-top: 1px solid var(--border-soft); display: flex; gap: 10px; align-items: center; z-index: 2; }
.chat-input { flex: 1; padding: 12px 20px; border-radius: 30px; border: none; background: var(--bg-app); font-size: 15px; font-family: inherit; color: var(--text-main); transition: 0.2s; width: 100%; }
.chat-input:focus { outline: none; box-shadow: 0 0 0 2px var(--accent-glow); }

/* RESPONSIVIDADE MOBILE ABSOLUTA */
.hide-on-desktop { display: none; }

@media (max-width: 1100px) {
  .mundo-bento-grid-3 { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) {
  .hero-info-wrapper { align-items: center; text-align: center; flex-direction: column; margin-top: -50px; }
  .name-row { flex-direction: column; gap: 10px; }
  .profile-tabs { justify-content: center; }
  .mundo-bento-grid-3 { grid-template-columns: 1fr; }
}

@media (max-width: 800px) {
  .app-master-layout { flex-direction: column; }
  .hide-on-desktop { display: flex; background: var(--bg-sidebar); padding: 15px 20px; justify-content: space-between; align-items: center; z-index: 1001; position: relative; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .mobile-menu-btn { background: transparent; border: none; cursor: pointer; padding: 5px; }
  
  .desktop-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; z-index: 1000; transform: translateX(-100%); padding-top: 80px; }
  .app-master-layout.mobile-menu-open .desktop-sidebar { transform: translateX(0); }
  .desktop-only { display: none !important; }
  .top-nav-glass { padding: 15px 20px; position: relative; flex-direction: column; align-items: flex-start; gap: 15px;}
  .main-stage { padding: 0; }
  .pad-responsive { padding: 0 20px; }
  .pad-top-nav { padding-top: 20px !important; }
  
  .mundo-master-cover { width: calc(100% - 40px); border-radius: 20px; margin: 20px auto; height: 250px;}
  .mundo-bento-grid-3 { padding: 0 20px 40px 20px; }
  
  .chat-widget-absolute { bottom: 20px; right: 20px; z-index: 999999; }
  .chat-window-panel { width: calc(100vw - 40px); height: calc(100vh - 100px); position: fixed; bottom: 0; left: 0; border-radius: 30px 30px 0 0; width: 100%; border: none; }
}
</style>