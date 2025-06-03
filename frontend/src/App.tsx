import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [extractTokens, setExtractTokens] = useState<string[]>([]);
  const [displayTokens, setDisplayTokens] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState<string[]>([]);
  const [synonymGuesses, setSynonymGuesses] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [titleGuess, setTitleGuess] = useState('');
  const [title, setTitle] = useState('');
  const [win, setWin] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [fullText, setFullText] = useState('');

  const fetchPage = async () => {
    setLoading(true);
    setRevealed([]);
    setSynonymGuesses({});
    setInput('');
    setMessage('');
    setTitleGuess('');
    setWin(false);
    setShowTitle(false);
    setShowFullText(false);
    setFullText('');
    const res = await fetch('http://localhost:5000/api/random_page');
    const data = await res.json();
    setExtractTokens(data.extract_tokens);
    setDisplayTokens(data.extract_tokens.map((t: string) => t.match(/\w/) ? '█'.repeat(t.length) : t));
    setTitle(data.title);
    setFullText(data.extract_tokens.join(''));
    setLoading(false);
  };

  useEffect(() => {
    fetchPage();
  }, []);

  const handleWordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (revealed.includes(input.toLowerCase())) {
      setMessage('Déjà proposé !');
      setInput('');
      return;
    }
    const res = await fetch('http://localhost:5000/api/reveal_word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extract_tokens: extractTokens,
        revealed,
        synonym_guesses: synonymGuesses,
        word: input
      })
    });
    const data = await res.json();
    setDisplayTokens(data.display);
    setRevealed(data.revealed);
    setSynonymGuesses(data.synonym_guesses || {});
    setMessage('');
    setInput('');
  };

  const handleTitleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (titleGuess.trim().toLowerCase() === title.trim().toLowerCase()) {
      setWin(true);
      setMessage('Bravo, tu as trouvé le titre !');
    } else {
      setMessage("Ce n'est pas le bon titre.");
    }
  };

  // Affichage stylé : mots exacts normaux, synonymes proposés en blanc sur fond noir, le reste masqué
  const renderToken = (t: string, i: number) => {
    if (t.startsWith('[') && t.endsWith(']')) {
      return (
        <span key={i} style={{ color: '#fff', background: '#222', borderRadius: 4, padding: '2px 6px', marginRight: 2, fontWeight: 600 }}>
          {t.slice(1, -1)}
        </span>
      );
    }
    return <span key={i} style={{ marginRight: /\w/.test(t) ? 2 : 0 }}>{t}</span>;
  };

  return (
    <div className="App" style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h1>Pedantix - Wikipédia</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 20, minHeight: 120, fontSize: 18, lineHeight: '1.7em', wordBreak: 'break-word' }}>
            {displayTokens.map((t: string, i: number) => renderToken(t, i))}
          </div>
          <form onSubmit={handleWordSubmit} style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Propose un mot..."
              disabled={win}
              style={{ padding: 8, fontSize: 16, flex: 1 }}
            />
            <button type="submit" disabled={win} style={{ padding: 8 }}>
              Révéler
            </button>
          </form>
          <form onSubmit={handleTitleSubmit} style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={titleGuess}
              onChange={e => setTitleGuess(e.target.value)}
              placeholder="Quel est le titre de la page ?"
              disabled={win}
              style={{ padding: 8, fontSize: 16, flex: 1 }}
            />
            <button type="submit" disabled={win} style={{ padding: 8 }}>
              Valider le titre
            </button>
          </form>
          <div style={{ marginBottom: 20, color: win ? '#007b00' : 'red' }}>{message}</div>
          <button onClick={() => setShowTitle(true)} style={{ marginRight: 8 }}>
            Abandonner / Révéler la réponse
          </button>
          <button onClick={fetchPage}>Nouvelle page</button>
          <button onClick={() => setShowFullText(true)} style={{ marginLeft: 8 }}>
            Révéler le texte complet
          </button>
          {showTitle && (
            <div style={{ marginTop: 20, color: 'red' }}>
              <strong>Le titre était : {title}</strong>
            </div>
          )}
          {showFullText && (
            <div style={{ marginTop: 20, color: '#333', background: '#fffbe6', padding: 16, borderRadius: 8 }}>
              <strong>Texte complet :</strong>
              <div style={{ marginTop: 8 }}>{fullText}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
