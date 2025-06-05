import React, { useEffect, useState } from "react";
import "./App.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

function normalize(word: string) {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]/g, "");
}

// Utilitaire pour la date du jour (format AAAA-MM-JJ)
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [extractTokens, setExtractTokens] = useState<string[]>([]);
  const [displayTokens, setDisplayTokens] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [synonymGuesses, setSynonymGuesses] = useState<{
    [key: string]: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null);
  const [win, setWin] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [fullText, setFullText] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mode, setMode] = useState<"daily" | "random">("daily");
  const [showCongrats, setShowCongrats] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<(number | string)[]>([]);
  const [revealedTokens, setRevealedTokens] = useState<{
    [key: number]: string;
  }>({});
  const [guesses, setGuesses] = useState<string[]>([]);
  const [lastGuess, setLastGuess] = useState("");
  const [lexicalReveals, setLexicalReveals] = useState<{
    [index: number]: string;
  }>({});
  const [particles, setParticles] = useState<Particle[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const fetchPage = async (selectedMode = mode) => {
    setLoading(true);
    setRevealed([]);
    setSynonymGuesses({});
    setInput("");
    setMessage("");
    setWin(false);
    setShowTitle(false);
    setShowFullText(false);
    setFullText("");
    setAttempts(0);
    setShowConfetti(false);
    setRevealedTitle(null);
    setTokenInfo([]);
    setGuesses([]);
    let url =
      selectedMode === "daily"
        ? `${apiUrl}/api/daily_page`
        : `${apiUrl}/api/random_page`;
    const res = await fetch(url);
    const data = await res.json();
    setTokenInfo(data.token_info);
    setDisplayTokens(data.tokens || []);
    setFullText("");
    setRevealed([]);
    setLexicalReveals({});
    if (selectedMode === "random") {
      setTitle(data.title || "");
    } else {
      setTitle("");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPage();
  }, []);

  useEffect(() => {
    if (win && mode === "daily") {
      setShowCongrats(true);
    }
  }, [win, mode]);

  // Fonction pour sauvegarder l'état du jeu dans le localStorage
  function saveGameState({
    win,
    guesses,
    revealed,
    revealedTitle,
    attempts,
    lexicalReveals,
  }: {
    win: boolean;
    guesses: string[];
    revealed: string[];
    revealedTitle: string | null;
    attempts: number;
    lexicalReveals: { [index: number]: string };
  }) {
    if (mode !== "daily") return;
    const data = {
      date: getTodayStr(),
      win,
      guesses,
      revealed,
      revealedTitle,
      attempts,
      lexicalReveals,
    };
    localStorage.setItem("pedantix_daily_game", JSON.stringify(data));
  }

  // Restauration de l'état du jeu si la partie du jour existe déjà
  useEffect(() => {
    if (mode !== "daily") return;
    const saved = localStorage.getItem("pedantix_daily_game");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.date === getTodayStr()) {
          // On restaure l'état
          setGuesses(data.guesses || []);
          setAttempts(data.attempts || 0);
          setWin(data.win || false);
          setRevealed(data.revealed || []);
          setRevealedTitle(data.revealedTitle || null);
          setLexicalReveals(data.lexicalReveals || {});
          setRestored(true);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [mode]);

  // Sauvegarde à chaque changement pertinent (victoire ou nouvelle proposition)
  useEffect(() => {
    if (mode !== "daily") return;
    if (!displayTokens.length) return;
    saveGameState({
      win,
      guesses,
      revealed,
      revealedTitle,
      attempts,
      lexicalReveals,
    });
  }, [win, guesses, revealed, revealedTitle, attempts, displayTokens, mode, lexicalReveals]);

  // Met à jour l'affichage du texte masqué après restauration ou changement de revealed ou lexicalReveals
  useEffect(() => {
    if (showFullText) return; // Ne rien faire si le texte complet est affiché
    // L'affichage est déjà géré par displayTokens
  }, [displayTokens, revealed, showFullText, lexicalReveals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLastGuess(input.trim());
    setAttempts((a) => a + 1);
    const newGuesses = [...guesses, input.trim()];
    setGuesses(newGuesses);
    // Vérifie d'abord si tous les mots du titre ont été proposés
    const res = await fetch(`${apiUrl}/api/check_title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        guesses: newGuesses,
        title: mode === "random" ? title : undefined,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setWin(true);
      setMessage("Bravo, tu as trouvé le titre !");
      setInput("");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      // On révèle le titre pour l'affichage UNIQUEMENT après victoire
      const resTitle = await fetch(`${apiUrl}/api/reveal_title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          title: mode === "random" ? title : undefined,
        }),
      });
      const dataTitle = await resTitle.json();
      setRevealedTitle(dataTitle.title);
      return;
    }
    // Sinon, on traite comme un mot à révéler
    const resWord = await fetch(`${apiUrl}/api/reveal_word`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: input,
        revealed: revealed,
      }),
    });
    const dataWord = await resWord.json();
    setDisplayTokens(dataWord.display);
    setRevealed(dataWord.revealed);
    // Mise à jour de la persistance des mots du champ lexical
    setLexicalReveals((prev) => {
      const updated = { ...prev };
      dataWord.display.forEach((t: string, i: number) => {
        if (t.startsWith("*") && t.endsWith("*")) {
          // On stocke le mot proposé par l'utilisateur, pas le mot révélé
          if (!updated[i]) {
            updated[i] = input.trim();
          }
        }
      });
      return updated;
    });
    setMessage("");
    setInput("");
  };

  const handleShare = () => {
    const shareText = `J'ai trouvé le mot du jour Pedantix en ${attempts} propositions ! Essaie aussi : https://tonsitepedantix.fr`;
    navigator.clipboard.writeText(shareText);
    setMessage("Score copié dans le presse-papier !");
  };

  const revealTitle = async () => {
    const res = await fetch(`${apiUrl}/api/reveal_title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        title: mode === "random" ? title : undefined,
      }),
    });
    const data = await res.json();
    setRevealedTitle(data.title);
  };

  const revealFullText = async () => {
    const res = await fetch(`${apiUrl}/api/reveal_text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        title: mode === "random" ? title : undefined,
      }),
    });
    const data = await res.json();
    setFullText(data.extract);
    setShowFullText(true);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAttempts((a) => a + 1);
    // Vérifie le titre auprès du backend sans jamais révéler le titre
    const res = await fetch(`${apiUrl}/api/check_title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        guess: input,
        title: mode === "random" ? title : undefined,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setWin(true);
      setMessage("Bravo, tu as trouvé le titre !");
      setInput("");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      // On révèle le titre pour l'affichage UNIQUEMENT après victoire
      const resTitle = await fetch(`${apiUrl}/api/reveal_title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          title: mode === "random" ? title : undefined,
        }),
      });
      const dataTitle = await resTitle.json();
      setRevealedTitle(dataTitle.title);
    } else {
      setMessage("Ce n'est pas le bon titre.");
    }
  };

  const revealedCount = displayTokens.filter(
    (token) => revealed.includes(normalize(token)) && token.length >= 2
  ).length;

  const totalGuessable = displayTokens.filter(token => token.length >= 2 && /\w/.test(token)).length;
  const percentDiscovered = totalGuessable > 0 ? Math.round((revealedCount / totalGuessable) * 100) : 0;

  return (
    <div className="app">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <div className="grid-background" />

      <div className="container">
        <header className="header">
          <h1 className="title">PEDANTIX</h1>
          <p className="subtitle">Découvrez le titre de cette page Wikipedia</p>
        </header>

        <main className="main-grid">





          <section className="text-section">


             {/* Zone de saisie */}
             <div className="input-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">🔍</span>
                  Votre proposition
                </h3>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmit} className="input-form">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Entrez votre mot..."
                    className="word-input"
                    disabled={win || (restored && win)}
                  />
                  <button type="submit" className="submit-button" disabled={!input.trim() || win || (restored && win)}>
                    <span className="icon">✨</span>
                    Valider
                  </button>
                </form>
              </div>
            </div>


            {/* Texte Wikipedia */}
            <div className="text-card">
              <div className="text-card-header">
                <div className="text-card-title">
                  <span className="icon">🎯</span>
                  Texte Wikipedia
                </div>
                <span className="found-badge">{revealedCount} mots trouvés</span>
              </div>
              <div className="text-card-content">
                <div className="wiki-text">
                  {showFullText && fullText
                    ? fullText
                    : displayTokens.map((t: string, i: number) => {
                        // Si le vrai mot a été trouvé, on l'affiche (en blanc)
                        if (
                          t.startsWith("__HIDDEN_BLOCK__") === false &&
                          revealed.includes(normalize(t))
                        ) {
                          return (
                            <span key={i} style={{ marginRight: /\w/.test(t) ? 2 : 0 }}>
                              {t}
                            </span>
                          );
                        }
                        // Sinon, si un mot du champ lexical a été trouvé à cet index, on l'affiche en bleu
                        if (lexicalReveals[i]) {
                          return (
                            <span
                              key={i}
                              style={{ color: "blue", textDecoration: "underline", marginRight: 2 }}
                            >
                              {lexicalReveals[i]}
                            </span>
                          );
                        }
                        // Sinon, on affiche le bloc masqué ou la ponctuation
                        if (t.startsWith("__HIDDEN_BLOCK__")) {
                          const length = parseInt(t.split(":")[1], 10) || 1;
                          return (
                            <span
                              key={i}
                              style={{
                                display: "inline-block",
                                width: 14 * length,
                                height: 18,
                                background: "#ccc",
                                borderRadius: 4,
                                marginRight: 4,
                                verticalAlign: "middle"
                              }}
                            />
                          );
                        }
                        return (
                          <span key={i} style={{ marginRight: /\w/.test(t) ? 2 : 0 }}>
                            {t}
                          </span>
                        );
                      })}
                </div>
              </div>
            </div>
          </section>










          <aside className="sidebar">
            {/* Statistiques */}
            <div className="stats-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">⚡</span>
                  Statistiques
                </h3>
              </div>
              <div className="card-content">
                <div className="stat-row">
                  <span className="stat-label">Propositions</span>
                  <span className="stat-badge proposals">{attempts}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Mots trouvés</span>
                  <span className="stat-badge found">{revealedCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Page découverte</span>
                  <span className="stat-badge percent">{percentDiscovered}%</span>
                </div>
              </div>
            </div>




           



            {/* Historique */}
            <div className="history-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">🕒</span>
                  Historique
                </h3>
              </div>
              <div className="card-content">
                <div className="history-scroll">
                  {guesses.length === 0 ? (
                    <p className="no-history">Aucune proposition pour le moment</p>
                  ) : (
                    <div className="history-list">
                      {[...guesses].reverse().map((word, index) => {
                        // On normalise le mot proposé
                        const normalizedWord = normalize(word);

                        // On vérifie s'il est dans displayTokens (texte principal) et dans revealed
                        const isInDisplay = displayTokens.some(
                          (token, i) =>
                            normalize(token) === normalizedWord &&
                            revealed.includes(normalize(token)) &&
                            token.length >= 2 // tu peux ajuster la longueur minimale ici
                        );

                        // On vérifie s'il a permis de révéler un mot du champ lexical
                        const isLexical = Object.values(lexicalReveals).includes(word) && !isInDisplay;


                        let className = "history-item";
                        if (isInDisplay) className += " history-item-found"; // vert
                        else if (isLexical) className += " history-item-lexical"; // jaune

                        let wordClass = "history-word";
                        if (isInDisplay) wordClass += " history-word-found";
                        else if (isLexical) wordClass += " history-word-lexical";

                        return (
                          <div key={index} className={className}>
                            <span className={wordClass}>{word}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>


            </aside>





        </main>
      </div>




       {/* Modal de victoire */}
       {showCongrats && (
        <div className="modal-overlay" onClick={() => setShowCongrats(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="trophy-container">
                <span className="trophy-icon">🏆</span>
              </div>
              <h2 className="modal-title">Félicitations !</h2>
            </div>
            <div className="modal-content">
              <p className="victory-text">
                Vous avez trouvé le mot <span className="target-word">"{revealedTitle}"</span> !
              </p>
              <div className="victory-stats">
                <div className="victory-stat">
                  <div className="victory-stat-value">{guesses.length}</div>
                  <div className="victory-stat-label">Propositions</div>
                </div>
                <div className="victory-stat">
                  <div className="victory-stat-value">{revealedCount}</div>
                  <div className="victory-stat-label">Mots trouvés</div>
                </div>
              </div>
               <button
                 onClick={async () => {
                  await revealFullText();
                  setShowCongrats(false);
                }}
                className="new-game-button"
              >
                Voir la page complète
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    // <h1>Pedantix - Wikipédia</h1>
    // <div className="layout-top">
    //   <div className="mode-switcher" style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
    //     <button
    //       className={mode === 'daily' ? 'active-mode' : ''}
    //       onClick={() => { setMode('daily'); fetchPage('daily'); }}
    //       style={{ fontWeight: mode === 'daily' ? 700 : 400 }}
    //     >
    //       Mot du jour
    //     </button>
    //     { (mode !== 'daily' || win) && (
    //       <button
    //         className={mode === 'random' ? 'active-mode' : ''}
    //         onClick={() => { setMode('random'); fetchPage('random'); }}
    //         style={{ fontWeight: mode === 'random' ? 700 : 400 }}
    //       >
    //         Partie libre
    //       </button>
    //     )}
    //   </div>
    //   <form onSubmit={handleSubmit} className="search-bar">
    //     <input
    //       type="text"
    //       value={input}
    //       onChange={e => setInput(e.target.value)}
    //       placeholder="Propose un mot ou le titre..."
    //       disabled={win}
    //       style={{ padding: 8, fontSize: 16, flex: 1 }}
    //     />
    //     <button type="submit" disabled={win} style={{ padding: 8 }}>
    //       Valider
    //     </button>
    //   </form>
    //   <div className="actions-row">
    //     { (mode !== 'daily' || win) && (
    //       <button onClick={() => setShowTitle(true)} style={{ marginRight: 8 }}>
    //         Abandonner / Révéler la réponse
    //       </button>
    //     )}
    //     { mode !== 'daily' && (
    //       <button onClick={() => fetchPage()}>Nouvelle page</button>
    //     )}
    //     { (mode !== 'daily' || win) && (
    //       <button onClick={revealFullText} style={{ marginLeft: 8 }}>
    //         Révéler le texte complet
    //       </button>
    //     )}
    //   </div>
    //   <div className="attempts">Propositions : <strong>{attempts}</strong></div>
    //   <div style={{ margin: '12px 0', color: win ? '#007b00' : 'red', minHeight: 24 }}>{message}</div>
    // </div>
    // <div className="masked-text">
    //   {showFullText && fullText
    //     ? fullText
    //     : displayTokens.map((t: string, i: number) => {
    //         if (lexicalReveals[i]) {
    //           if (revealed.includes(normalize(extractTokens[i]))) {
    //             return <span key={i} style={{ marginRight: /\w/.test(extractTokens[i]) ? 2 : 0 }}>{extractTokens[i]}</span>;
    //           }
    //           return (
    //             <span key={i} style={{ color: 'blue', textDecoration: 'underline', marginRight: 2 }}>{lexicalReveals[i]}</span>
    //           );
    //         }
    //         if (t.startsWith('*') && t.endsWith('*')) {
    //           setTimeout(() => {
    //             setLexicalReveals(prev => ({
    //               ...prev,
    //               [i]: lastGuess
    //             }));
    //           }, 0);
    //           return (
    //             <span key={i} style={{ color: 'blue', textDecoration: 'underline', marginRight: 2 }}>{lastGuess}</span>
    //           );
    //         }
    //         return <span key={i} style={{ marginRight: /\w/.test(t) ? 2 : 0 }}>{t}</span>;
    //       })}
    // </div>
    // {showTitle && (
    //   <div style={{ marginTop: 20, color: 'red', textAlign: 'center' }}>
    //     {revealedTitle ? (
    //       <strong>Le titre était : {revealedTitle}</strong>
    //     ) : (
    //       <button onClick={revealTitle} className="share-btn">Révéler le titre</button>
    //     )}
    //   </div>
    // )}
    // {showConfetti && (
    //   <div className="confetti">
    //     <div className="confetti-piece" style={{ left: '10%' }} />
    //     <div className="confetti-piece" style={{ left: '30%' }} />
    //     <div className="confetti-piece" style={{ left: '50%' }} />
    //     <div className="confetti-piece" style={{ left: '70%' }} />
    //     <div className="confetti-piece" style={{ left: '90%' }} />
    //     <div className="confetti-piece" style={{ left: '20%' }} />
    //     <div className="confetti-piece" style={{ left: '80%' }} />
    //   </div>
    // )}
    // {showCongrats && mode === 'daily' && (
    //   <div className="modal-congrats">
    //     <div className="modal-content">
    //       <h2>🎉 Félicitations !</h2>
    //       <p>Tu as trouvé le mot du jour en <strong>{attempts}</strong> propositions.</p>
    //       <button onClick={handleShare} className="share-btn">Partager mon score</button>
    //       <button
    //         className="playfree-btn"
    //         onClick={() => { setMode('random'); fetchPage('random'); setShowCongrats(false); }}
    //         style={{ marginTop: 12 }}
    //       >
    //         Jouer en mode libre
    //       </button>
    //       <div style={{ marginTop: 18 }}>
    //         {revealedTitle ? (
    //           <strong>Le titre était : {revealedTitle}</strong>
    //         ) : (
    //           <button onClick={revealTitle} className="share-btn">Révéler le titre</button>
    //         )}
    //       </div>
    //       <div style={{ marginTop: 18 }}>
    //         {!showFullText && (
    //           <button
    //             onClick={async () => {
    //               await revealFullText();
    //               setShowCongrats(false);
    //             }}
    //             className="share-btn"
    //           >
    //             Voir la page complète
    //           </button>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // )}
  );
}

export default App;
