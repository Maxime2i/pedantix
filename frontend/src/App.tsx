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
  const [showLength, setShowLength] = useState<Record<string, boolean>>({});
  const [restorationChecked, setRestorationChecked] = useState(false);
  const [revealedImage, setRevealedImage] = useState<string | null>(null);

  useEffect(() => {
    const newParticles = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const fetchPage = async (selectedMode = mode) => {
    setRestored(false);
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
    setTitle(data.title || "");
    setLoading(false);
  };

  useEffect(() => {
    if (mode !== "daily") return;
    const saved = localStorage.getItem("pedantix_daily_game");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.date === getTodayStr()) {
          setGuesses(data.guesses || []);
          setAttempts(data.attempts || 0);
          setWin(data.win || false);
          setRevealed(data.revealed || []);
          setRevealedTitle(data.revealedTitle || null);
          setLexicalReveals(data.lexicalReveals || {});
          setDisplayTokens(data.displayTokens || []);
          setTitle(data.title || "");
          setRestored(true);
        }
      } catch (e) {
        // ignore
      }
    }
    setRestorationChecked(true);
  }, [mode]);

  useEffect(() => {
    if (restorationChecked && !restored) {
      fetchPage();
    }
  }, [restorationChecked, restored]);

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
    displayTokens,
    title,
  }: {
    win: boolean;
    guesses: string[];
    revealed: string[];
    revealedTitle: string | null;
    attempts: number;
    lexicalReveals: { [index: number]: string };
    displayTokens: string[];
    title: string;
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
      displayTokens,
      title,
    };
    localStorage.setItem("pedantix_daily_game", JSON.stringify(data));
  }

  // Sauvegarde à chaque changement pertinent (victoire ou nouvelle proposition)
  useEffect(() => {
    if (mode !== "daily") return;
    if (!displayTokens.length) return;
    console.log(displayTokens);
    saveGameState({
      win,
      guesses,
      revealed,
      revealedTitle,
      attempts,
      lexicalReveals,
      displayTokens,
      title,
    });
  }, [
    win,
    guesses,
    revealed,
    revealedTitle,
    attempts,
    displayTokens,
    mode,
    lexicalReveals,
    title,
  ]);

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

    // 1. On traite d'abord comme un mot à révéler
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
    setLexicalReveals((prev) => {
      const updated = { ...prev };
      dataWord.display.forEach((t: string, i: number) => {
        if (t.startsWith("*") && t.endsWith("*")) {
          if (!updated[i]) {
            updated[i] = input.trim();
          }
        }
      });
      return updated;
    });

    // 2. Ensuite, on vérifie la victoire
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
      setRevealedImage(dataTitle.image_url || null);

      // On ajoute tous les mots du titre à revealed pour la cohérence d'affichage
      const titleWords = (mode === "random" ? title : data.title || title)
        .split(/\s+/)
        .map(normalize)
        .filter(Boolean);
      setRevealed((prev) => Array.from(new Set([...prev, ...titleWords])));
      return;
    }

    setMessage("");
    setInput("");
  };

  const handleShare = () => {
    const shareText = `J'ai trouvé le mot du jour Pedantix en ${attempts} propositions ! Essaie aussi : https://tonsitepedantix.fr`;
    navigator.clipboard.writeText(shareText);
    setMessage("Score copié dans le presse-papier !");
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

  const revealedCount = displayTokens.filter(
    (token) => revealed.includes(normalize(token)) && token.length >= 2
  ).length;

  const totalGuessable = displayTokens.filter(
    (token) => token.length >= 2 && /\w/.test(token)
  ).length;
  const percentDiscovered =
    totalGuessable > 0 ? Math.round((revealedCount / totalGuessable) * 100) : 0;

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
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={!input.trim() || win || (restored && win)}
                  >
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
                <span className="found-badge">
                  {revealedCount} mots trouvés
                </span>
              </div>
              <div className="text-card-content">
                <div className="wiki-text">
                  {/* Affichage du titre masqué/révélé dans la section texte */}
                  {title && (
                    <div
                      style={{
                        textAlign: "left",
                        marginBottom: 18,
                        minHeight: 28,
                      }}
                    >
                      {title.split(/(\s+)/).map((part, idx) => {
                        if (/^\s+$/.test(part)) {
                          return <span key={idx}>{part}</span>;
                        }
                        // On normalise le mot du titre
                        const normalizedPart = normalize(part);
                        const isRevealed =
                          win || revealed.includes(normalizedPart);
                        if (isRevealed) {
                          return (
                            <span
                              key={idx}
                              style={{
                                fontSize: 22,
                                fontWeight: 700,
                                letterSpacing: 1,
                                color: "#fff",
                                marginRight: 4,
                              }}
                            >
                              {part}
                            </span>
                          );
                        } else {
                          return (
                            <span
                              key={idx}
                              style={{
                                display: "inline-block",
                                width: 14 * part.length,
                                height: 18,
                                background: "#ccc",
                                borderRadius: 4,
                                marginRight: 4,
                                verticalAlign: "middle",
                                position: "relative",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setShowLength((prev) => ({
                                  ...prev,
                                  ["title-" + idx]: true,
                                }));
                                setTimeout(() => {
                                  setShowLength((prev) => ({
                                    ...prev,
                                    ["title-" + idx]: false,
                                  }));
                                }, 2000);
                              }}
                              title="Mot du titre caché"
                            >
                              <span
                                className={`fade-in-out${
                                  showLength["title-" + idx] ? " visible" : ""
                                }`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#2563eb",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  pointerEvents: "none",
                                  zIndex: 2,
                                  opacity: showLength["title-" + idx] ? 1 : 0,
                                  transition: "opacity 0.4s",
                                }}
                              >
                                {part.length}
                              </span>
                            </span>
                          );
                        }
                      })}
                    </div>
                  )}
                  {showFullText && fullText
                    ? fullText
                    : displayTokens.map((t: string, i: number) => {
                        // Si le vrai mot a été trouvé, on l'affiche (en blanc)
                        if (
                          t.startsWith("__HIDDEN_BLOCK__") === false &&
                          revealed.includes(normalize(t))
                        ) {
                          return (
                            <span
                              key={i}
                              style={{ marginRight: /\w/.test(t) ? 2 : 0 }}
                            >
                              {t}
                            </span>
                          );
                        }
                        // Sinon, si un mot du champ lexical a été trouvé à cet index, on l'affiche en bleu
                        if (lexicalReveals[i]) {
                          return (
                            <span
                              key={i}
                              style={{
                                color: "black",
                                background: "#ccc",
                                borderRadius: 4,
                                marginRight: 4,
                                padding: "0 8px",
                                fontWeight: 600,
                                userSelect: "none",
                              }}
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
                                position: "relative",
                                width: 14 * length,
                                height: 18,
                                marginRight: 4,
                                verticalAlign: "middle",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                              onClick={() => {
                                setShowLength((prev) => ({
                                  ...prev,
                                  [i]: true,
                                }));
                                setTimeout(() => {
                                  setShowLength((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }));
                                }, 2000);
                              }}
                            >
                              {/* Bloc masqué */}
                              <span
                                style={{
                                  display: "block",
                                  width: "100%",
                                  height: "100%",
                                  background: "#ccc",
                                  borderRadius: 4,
                                }}
                              />
                              {/* Nombre de lettres en bleu, centré et par-dessus */}
                              <span
                                className={`fade-in-out${
                                  showLength[i] ? " visible" : ""
                                }`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#2563eb",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  pointerEvents: "none",
                                  zIndex: 2,
                                  opacity: showLength[i] ? 1 : 0,
                                  transition: "opacity 0.4s",
                                }}
                              >
                                {length}
                              </span>
                            </span>
                          );
                        }
                        return (
                          <span
                            key={i}
                            style={{ marginRight: /\w/.test(t) ? 2 : 0 }}
                          >
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
                  <span className="stat-badge percent">
                    {percentDiscovered}%
                  </span>
                </div>
              </div>
            </div>

            {/* Règle du jeu */}
            <div className="rules-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">📜</span>
                  Règle du jeu
                </h3>
              </div>
              <div className="card-content">
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  <li>Devinez le titre de la page Wikipédia cachée.</li>
                  <li>Proposez des mots pour révéler le texte.</li>
                  <li>Les mots du même champ lexical sont révélés en noir.</li>
                  <li>Cliquez sur un mot pour révéler son nombre de lettres.</li>
                  <li>Essayez de trouver le titre exact pour gagner !</li>
                </ul>
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
                    <p className="no-history">
                      Aucune proposition pour le moment
                    </p>
                  ) : (
                    <div className="history-list">
                      {[...guesses].reverse().map((word, index) => {
                        // On normalise le mot proposé
                        const normalizedWord = normalize(word);

                        console.log(normalizedWord, displayTokens, lexicalReveals);

                        // On vérifie s'il est dans displayTokens (texte principal) et dans revealed
                        const isInDisplay = displayTokens.some(
                          (token, i) =>
                            normalize(token) === normalizedWord &&
                            revealed.includes(normalize(token)) &&
                            token.length >= 2 // tu peux ajuster la longueur minimale ici
                        );

                        // On vérifie s'il a permis de révéler un mot du champ lexical
                        const isLexical =
                          Object.values(lexicalReveals).includes(word) &&
                          !isInDisplay;

                        let className = "history-item";
                        if (isInDisplay)
                          className += " history-item-found"; // vert
                        else if (isLexical)
                          className += " history-item-lexical"; // jaune

                        let wordClass = "history-word";
                        if (isInDisplay) wordClass += " history-word-found";
                        else if (isLexical)
                          wordClass += " history-word-lexical";

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
                Vous avez trouvé le mot {revealedTitle && (
                  <span className="target-word">"{revealedTitle}"</span>
                )} en {guesses.length} propositions !
              </p>
              {revealedImage && (
                <div style={{ margin: "18px 0", textAlign: "center" }}>
                  <img src={revealedImage} alt="Illustration de la page" style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 8, boxShadow: "0 2px 8px #0002" }} />
                </div>
              )}
              <button
                onClick={async () => {
                  await revealFullText();
                  setShowCongrats(false);
                }}
                className="new-game-button"
              >
                Voir la page complète
              </button>
              {/* Boutons de partage */}
              <div style={{ marginTop: 18, textAlign: 'center' }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                  N'oublie pas de partager ton résultat :
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                  {/* Twitter/X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`J'ai trouvé le mot du jour Pedantix en ${attempts} propositions ! Essaie aussi : https://tonsitepedantix.fr`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-button twitter"
                    title="Partager sur Twitter/X"
                  >
                    {/* Logo X (Twitter) officiel */}
                    <svg width="28" height="28" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="1227" rx="240" fill="#fff"/><path d="M908.305 180H1092.5L726.305 583.305L1150 1047.5H857.5L589.5 759.5L287.5 1047.5H103.5L489.5 616.5L90 180H390.5L629.5 445.5L908.305 180ZM854.5 963.5H943.5L372.5 259.5H277.5L854.5 963.5Z" fill="#000"/></svg>
                  </a>
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://tonsitepedantix.fr')}&quote=${encodeURIComponent(`J'ai trouvé le mot du jour Pedantix en ${attempts} propositions ! Essaie aussi !`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-button facebook"
                    title="Partager sur Facebook"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877f3"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .771 23.406 0 22.675 0"/></svg>
                  </a>
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`J'ai trouvé le mot du jour Pedantix en ${attempts} propositions ! Essaie aussi : https://tonsitepedantix.fr`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-button whatsapp"
                    title="Partager sur WhatsApp"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#25d366"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.281 5.3.16 12 .16c3.17 0 6.155 1.233 8.413 3.488a11.822 11.822 0 0 1 3.495 8.414c-.003 6.7-5.142 11.839-11.844 11.839a11.9 11.9 0 0 1-5.938-1.594L.057 24zm6.597-3.807c1.735.995 3.276 1.591 5.346 1.593 5.448 0 9.886-4.434 9.889-9.877.002-2.651-1.033-5.136-2.909-7.01A9.825 9.825 0 0 0 12 2.155c-5.444 0-9.877 4.434-9.877 9.877a9.82 9.82 0 0 0 1.602 5.357l-.999 3.648 3.628-.944zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.366.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  </a>
                  {/* Reddit */}
                  <a
                    href={`https://www.reddit.com/submit?url=${encodeURIComponent('https://tonsitepedantix.fr')}&title=${encodeURIComponent(`J'ai trouvé le mot du jour Pedantix en ${attempts} propositions !`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-button reddit"
                    title="Partager sur Reddit"
                  >
                    {/* Logo Reddit officiel fidèle (Snoo tête blanche, yeux orange, sourire, antenne) */}
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="20" fill="#FF4500"/>
                      <g>
                        <ellipse cx="20" cy="22" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
                        <circle cx="17" cy="22" r="1.3" fill="#FF4500" stroke="#000" stroke-width="0.7"/>
                        <circle cx="23" cy="22" r="1.3" fill="#FF4500" stroke="#000" stroke-width="0.7"/>
                        <path d="M17.5 25c1.2 1 3.8 1 5 0" stroke="#000" stroke-width="0.7" stroke-linecap="round" fill="none"/>
                        <path d="M24 16l2-4" stroke="#000" stroke-width="0.7"/>
                        <circle cx="26.2" cy="12" r="1.1" fill="#fff" stroke="#000" stroke-width="0.7"/>
                        <circle cx="26.2" cy="12" r="0.7" fill="#FF4500"/>
                      </g>
                    </svg>
                  </a>
                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent("Pedantix - J'ai trouvé le mot du jour !")}&body=${encodeURIComponent(`J'ai trouvé le mot du jour Pedantix en ${attempts} propositions ! Essaie aussi : https://tonsitepedantix.fr`)}`}
                    className="share-button email"
                    title="Partager par Email"
                    style={{textDecoration:'none'}}
                  >
                    {/* Logo Email moderne */}
                    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#fff"/><rect x="8" y="14" width="32" height="20" rx="4" fill="#EA4335"/><path d="M12 18l12 9l12-9" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/><rect x="8" y="14" width="32" height="20" rx="4" stroke="#EA4335" strokeWidth="2"/></svg>
                  </a>
                  {/* Copier le score */}
                  <button
                    onClick={handleShare}
                    className="share-button copy"
                    title="Copier le score"
                    style={{ cursor: "pointer", background: 'none', border: 'none', padding: 0 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#666"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
