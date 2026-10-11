# NB : les script.json anglais font foi (convertis ensuite en contexte anglais : Jack Turner, Portsmouth/Leeds/United/City). Ce générateur produit l'ancienne version à clubs français.
import json, os
exec(open('/private/tmp/claude-503/-Users-test-destiny-eleven/dd24372e-e46f-415d-b651-63d5d75347b0/scratchpad/gen.py').read().split("# 01 — Une carrière")[0])
BASE_VOIX_EN="Native English male voice, young and friendly, TikTok style, first person: this is Maxime, the game's solo developer. Quick but clear delivery, natural energy, never salesy. "
FIN_EN={"promesse":"From 16 to retirement,<br>write your <em>legend</em>","detail":"Every choice counts","cta":"Free · iPhone & Android","pose":"salut"}
def projE(slug,titre,duree,objectif,voix,scenes,**extra):
    s={"titre":titre,"app":"destinyfc","langue":"en","charte":"config/charte-destinyfc.json","format":{"largeur":1080,"hauteur":1920,"fps":30,"dureeCible":duree},
       "objectif":objectif,"voix":{"instructions":BASE_VOIX_EN+voix}}
    s.update(extra); s["scenes"]=scenes; s.setdefault("fin",FIN_EN)
    d=f"{ROOT}/destinyfc-en-{slug}"; os.makedirs(d,exist_ok=True)
    json.dump(s,open(d+"/script.json","w"),ensure_ascii=False,indent=2)
def joueurE(**k):
    j=joueur(argent="€50k"); j.update(k); return j
FINALE_EN="Final, 1-0 to {c}, ten last minutes that never end. The coach screams at you to kill the game — how is up to you to work out."
MOMENT_EN={"genre":"moment","tag":"🎯 DECISIVE MOMENT","titre":"National Cup final","options":[{"indice":"Sneaky","texte":"Take the ball to die by the corner flag"},{"indice":"Keep-ball","texte":"Hog the ball, pass after pass"},{"texte":"Go for 2-0 to seal it"},{"texte":"Chop the rhythm with crafty little fouls"}]}
def saisonE(annee,club,niv,une,stats,lignes):
    return {"genre":"saison","tag":f"📊 SEASON {annee}-{str(annee+1)[2:]} · {club.upper()}","niveau":niv,"une":une,"stats":stats,"lignes":lignes}

# 01
projE("01-career-30s","A whole career in 30 seconds",30,
 "English version of destinyfc-01. Downloads, football fans 16–35. Same story: Sochaux at 16 (2026), cup final won with Lens at 19, Paris at 24, retirement at 35 (2045), World star card, score 223.",
 "Fast montage rhythm. Each age announced with punch, short pause after. Smiling, curious ending.",
 [sc("hook","I played a whole football career, start to finish, in thirty seconds. From sixteen… to retirement.",[A("typo","played",texte="From *16* to retirement",fin="retirement")]),
  sc("start","At sixteen, I sign my very first pro contract, with Sochaux.",[A("entree","sixteen"),A("zoom","sign",cible="p-tete",echelle=1.25,hauteur=820)]),
  sc("final","Nineteen: the cup final… and I win it.",[A("zoom","Nineteen",cible="aucun"),A("joueur","Nineteen",age=19,annee=2029,note=68,argent="€0.9m",etoiles=2,**LENS),
     A("carte","final",id="finale",texte=FINALE_EN.format(c="Lens")),A("option","and",n=2),A("carte","win",id="finale-gagnee",position="fin")]),
  sc("paris","Twenty-four: Paris comes calling. I sign.",[A("carte","Twenty-four",id="mercato-paris"),A("option","calling",n=1),A("joueur","sign",age=24,annee=2034,note=81,argent="€12m",etoiles=4,**PARIS),
     A("tampon","sign",texte="Signed",couleur="menthe",duree=1.4)]),
  sc("retire","Thirty-five: I retire. Final score… two hundred and twenty-three.",[A("ecran","retire",nom="fiche"),A("zoom","score",cible="f-score",echelle=1.25,hauteur=900)]),
  sc("cta","So, what legend would you write? Destiny FC, free to play.",[A("fin","Destiny")])],
 ecranInitial="partie",
 cartes={"mercato-paris":{"genre":"mercato","tag":"🪟 TRANSFER WINDOW · 24 YRS","texte":"Your name is starting to circulate on the transfer market.",
   "offres":[dict(niveau="elite",club="Paris",couleurs=PARIS["couleurs"],pays="france",detail="€4.2m/yr · fee €38m"),
             dict(niveau="elite",club="Marseille",couleurs=[C['bleu'],C['blanc']],pays="france",detail="€3.6m/yr · fee €31m")],"bouton":"STAY / RENEW"}},
 ecrans={"partie":{"joueur":joueurE(),"carte":"croissance"},"fiche":{"nom":"Lucas Morel","clubs":"Paris · 2026–2045 · 19 seasons","score":223}})

# 02
projE("02-what-would-you-do","What would you do?",28,
 "English version of destinyfc-02. Real decisive moment (National Cup final), 4 options, countdown, reveal. Outcome is random in game: one possible result shown.",
 "Playful challenge tone. Clear pause after 'What do you do?'. Four options listed fast and clean. Slow tense countdown. Burst of joy on 'the cup is ours'.",
 [sc("situation","Cup final. You're one goal up, with ten minutes left to hold on.",[A("entree","Cup"),A("tableau","Cup",titre="Final · National cup",domicile=dict(nom="Sochaux",couleurs=SOCHAUX["couleurs"]),exterieur=dict(nom="Nantes",couleurs=NANTES["couleurs"]),score=[1,0],minute=80)]),
  sc("question","The coach wants you to kill the game. What do you do?",[A("masquer","coach")]),
  sc("options","One: waste time by the corner flag. Two: keep the ball. Three: go for the second goal. Four: crafty little fouls.",
     [A("appui","One",cible="p-opt-1"),A("appui","Two",cible="p-opt-2"),A("appui","Three",cible="p-opt-3"),A("appui","Four",cible="p-opt-4")]),
  sc("countdown","Think fast. Three… two… one.",[A("chiffre","Three",valeur=1,depart=3,montee=1.6,sous="Choose!",duree=2.6)]),
  sc("answer","I kept the ball. And the cup is ours!",[A("option","kept",n=2),A("carte","cup",id="finale-gagnee"),A("tampon","ours",texte="Champions",couleur="or")]),
  sc("cta","What would you have picked? Tell me in the comments. Destiny FC, free to play.",[A("disposition","What",mode="coin"),A("pose","What",nom="clin"),A("fin","Destiny")])],
 ecranInitial="partie",
 ecrans={"partie":{"joueur":joueurE(age=19,annee=2029,note=66,argent="€0.6m",etoiles=2),"carte":{**MOMENT_EN,"texte":FINALE_EN.format(c="Sochaux")}}})

# 03
projE("03-two-destinies","Same player, two destinies",30,
 "English version of destinyfc-03. One real decision (growth spurt at 16) and its two real outcomes.",
 "Intriguing narrator. 'Destiny one' and 'Destiny two' clearly separated. Relief on 'a brand-new body', wince on 'groin strain'. Calm, convinced ending.",
 [sc("hook","Same player, same age, one single decision… and two completely different careers.",[A("typo","Same",texte="One *single* decision",sous="Two destinies",fin="careers")]),
  sc("situation","Sixteen: I grow eight centimetres in a year. The medical staff are worried.",[A("entree","Sixteen"),A("zoom","grow",cible="p-carte",echelle=1.2,hauteur=960)]),
  sc("destiny1","Destiny one: I follow the protocol. Six months of discipline… and a brand-new body.",
     [A("tampon","Destiny",texte="Destiny 1",couleur="menthe",duree=1.4),A("option","follow",n=1),A("carte","discipline",id="croissance-ok"),A("joueur","body",note=59),A("jauges","body",forme=80)]),
  sc("destiny2","Destiny two: I keep playing. Groin strain. Eight weeks out.",
     [A("carte","Destiny",id="croissance"),A("joueur","Destiny",note=56),A("jauges","Destiny",forme=74),A("tampon","Destiny",texte="Destiny 2",couleur="rouge",duree=1.4),
      A("option","keep",n=2),A("carte","Groin",id="croissance-pubalgie"),A("jauges","Eight",moral=66)]),
  sc("cta","One decision, a whole career. In Destiny FC, every choice counts.",[A("fin","In")])],
 ecranInitial="partie", ecrans={"partie":{"joueur":joueurE(),"carte":"croissance"}},
 fin={**FIN_EN,"promesse":"One decision,<br>a whole <em>career</em>"})

# 04
projE("04-pov-agent","POV: an ambitious agent spotted you",30,
 "English version of destinyfc-04. Player creation with the app's real English lists (Midfielder, Working-class estate, inner circle 'Ambitious agent').",
 "POV storytelling, friendly and a bit cheeky about the agent ('and he won't forget his cut' with a wink in the voice).",
 [sc("hook","POV: you're sixteen, and an ambitious agent has just spotted you.",[A("titre","POV",texte="POV: you're *16*",sous="An agent just spotted you"),A("pose","agent",nom="clin")]),
  sc("create","I create my player. Lucas Morel, midfielder, from a working-class estate.",
     [A("disposition","create",mode="coin"),A("ecran","create",nom="creation"),A("pose","create",nom="neutre"),A("taper","Lucas",mot="Lucas Morel"),
      A("feuille","midfielder",nom="poste"),A("choisir","from",valeur="Midfielder"),A("choisir","estate",nom="origine",valeur="Working-class estate")]),
  sc("agent","Inner circle: the ambitious agent. He swears he'll take me to the top… and won't forget his cut.",
     [A("feuille","Inner",nom="entourage"),A("choisir","He",valeur="Ambitious agent"),A("choisir","top",nom="style",valeur="Balanced"),
      A("attributs","top",tec=61,phy=50,men=58,cha=55),A("pose","cut",nom="clin")]),
  sc("clubs","Result: the scouts have spotted me. Now I pick my club.",[A("ecran","scouts",nom="clubs"),A("pose","scouts",nom="fier"),A("appui","club",cible="cl-4")]),
  sc("cta","And you, who would you trust with your career? Destiny FC, free on iPhone and Android.",[A("pose","you",nom="montre-droite"),A("fin","Destiny")])],
 ecranInitial="creation", dispositionInitiale="avatar", poseInitiale="neutre",
 ecrans={"creation":{"champs":{"nationalite":"France"}},"clubs":{"potentiel":3}})

# 05
PIRE_EN={"genre":"resultat","tag":"😖 PITCH","ton":"bad","texte":"You cough up another mistake and the team goes under: really not your night, a 3-0 defeat.","effets":["-8 Form","-8 Morale","-5 Coach relationship"]}
projE("05-worst-decision","The worst decision of my career",28,
 "English version of destinyfc-05. Real event (blunder, age 17), option 'Crank up the intensity', real outcome 3-0 defeat. Verified: that option succeeds 55% of the time.",
 "Embarrassed, funny confession at first, then storytelling. 'Three-nil' dropped flatly. Short pause before 'The worst part?'. Light ending.",
 [sc("hook","The worst decision of my entire career? Let me show you.",[A("bulle","worst",texte="😬",fin="career"),A("disposition","show",mode="coin"),A("pose","show",nom="neutre")]),
  sc("blunder","Seventeen. I make a huge mistake, and they score.",[A("carte","mistake",id="bevue"),A("jauges","score",moral=58)]),
  sc("choice","So I decide to crank up the intensity to make up for it.",[A("option","crank",n=2),A("pose","crank",nom="fier")]),
  sc("result","Another blunder. We lose three-nil.",[A("carte","blunder",id="pire"),A("pose","lose",nom="tete-main"),A("jauges","lose",forme=66,moral=50)]),
  sc("twist","The worst part? It had more than a fifty-fifty chance of working.",[A("pose","worst",nom="decu"),A("chiffre","chance",valeur=55,suffixe=" %",sous="chance of success",duree=2.6)]),
  sc("cta","In Destiny FC, even a good choice can go wrong. Free on iPhone and Android.",[A("pose","In",nom="neutre"),A("fin","Free")])],
 ecranInitial="partie", dispositionInitiale="avatar", poseInitiale="tete-main",
 cartes={"pire":PIRE_EN},
 ecrans={"partie":{"joueur":joueurE(age=17,annee=2027,note=60,argent="€0.1m",jauges=dict(forme=74,moral=66,confiance=55,pression=38)),"carte":"bevue"}})

# 06
projE("06-transfer-3s","Transfer window: 3 seconds to choose",24,
 "English version of destinyfc-06. Age 22, 3 stars, rating 74 at Lens: offers Paris, Brighton, Marseille. After the move: Elite club, higher wage, Pressure gauge up.",
 "Playful urgency, fast delivery. Tense countdown. 'Signed' snapped. Challenge at the end.",
 [sc("hook","Summer transfer window. Three clubs want you, and you've got three seconds to choose.",[A("entree","Summer")]),
  sc("countdown","Paris, Brighton or Marseille? Three… two… one…",
     [A("appui","Paris",cible="p-opt-1"),A("appui","Brighton",cible="p-opt-2"),A("appui","Marseille",cible="p-opt-3"),A("chiffre","Three",valeur=1,depart=3,montee=1.4,sous="Choose!",duree=2.4)]),
  sc("choice","Me? I'm off to Paris. Signed.",[A("option","off",n=1),A("tampon","Signed",texte="Signed",couleur="menthe"),A("joueur","Signed",age=22,annee=2032,note=76,argent="€5.8m",etoiles=4,**PARIS)]),
  sc("pressure","New club, more money… but a whole lot more pressure.",[A("zoom","New",cible="p-jauges",echelle=1.25,hauteur=900),A("jauges","pressure",pression=64)]),
  sc("cta","Where would you have signed? Tell me in the comments. Destiny FC, free to play.",[A("fin","Destiny")])],
 ecranInitial="partie",
 ecrans={"partie":{"joueur":joueurE(age=22,annee=2032,note=74,argent="€3.1m",etoiles=3,jauges=dict(forme=78,moral=72,confiance=64,pression=34),**LENS),
   "carte":{"genre":"mercato","tag":"🪟 TRANSFER WINDOW · 22 YRS","texte":"Your name is starting to circulate on the transfer market.",
    "offres":[dict(niveau="elite",club="Paris",couleurs=PARIS["couleurs"],pays="france",detail="€4.2m/yr · fee €38m"),
              dict(niveau="d1",club="Brighton",couleurs=[C['bleu'],C['blanc']],pays="angleterre",detail="€1.8m/yr · fee €22m"),
              dict(niveau="elite",club="Marseille",couleurs=[C['bleu'],C['blanc']],pays="france",detail="€3.6m/yr · fee €31m")],"bouton":"STAY / RENEW"}}})

# 07
projE("07-headlines","My career, told by the papers",30,
 "English version of destinyfc-07. Only real in-game headlines (official English HEADLINES): stalls, held his own, gone up a level, crowned. Stats consistent with each headline.",
 "Press-review tone, a little theatrical: each headline read like a front page. Disappointment first, rising pride, big finish.",
 [sc("hook","Here's my career… told only by the newspapers.",[A("pose","career",nom="content"),A("disposition","told",mode="telephone")]),
  sc("flop","Seventeen. Lucas Morel stalls: a season that will leave its mark.",[A("carte","Seventeen",id="s-flop"),A("joueur","Seventeen",age=17,annee=2027,note=58)]),
  sc("solid","Twenty-one. Consistent, diligent, decisive: Lucas Morel held his own all year.",[A("carte","Twenty-one",id="s-solid"),A("joueur","Twenty-one",age=21,annee=2031,note=71,argent="€1.4m",etoiles=2,**LENS)]),
  sc("wonder","Twenty-four. Lucas Morel has gone up a level this year, full stop.",[A("carte","Twenty-four",id="s-wonder"),A("joueur","Twenty-four",age=24,annee=2034,note=80,argent="€9m",etoiles=4,**PARIS)]),
  sc("trophy","And at twenty-seven: crowned with Paris, Lucas Morel turns a season into legend.",[A("carte","twenty-seven",id="s-trophy"),A("joueur","twenty-seven",age=27,annee=2037,note=86,argent="€31m",etoiles=5),A("tampon","legend",texte="Champions",couleur="or")]),
  sc("cta","What headlines will your career make? Destiny FC, free to play.",[A("fin","Destiny")])],
 ecranInitial="partie", dispositionInitiale="avatar",
 cartes={"s-flop":saisonE(2027,"Sochaux","d2","\"Lucas Morel stalls: a season that will leave its mark\"",[["24","Games"],["1","Goals"],["2","Assists"],["4.9","Rating"]],["League: 14th","❌ Club objective: Season rating ≥ 6.5","💰 +€60k (wages & sponsors)"]),
         "s-solid":saisonE(2031,"Lens","d1","\"Consistent, diligent, decisive: Lucas Morel held his own all year\"",[["34","Games"],["6","Goals"],["9","Assists"],["6.9","Rating"]],["League: 7th","✅ Club objective: Season rating ≥ 6.5","💰 +€0.9m (wages & sponsors)"]),
         "s-wonder":saisonE(2034,"Paris","elite","\"Lucas Morel has gone up a level this year, full stop\"",[["36","Games"],["14","Goals"],["12","Assists"],["8.1","Rating"]],["League: 2nd","✅ Club objective: Season rating ≥ 7.0","💰 +€4.6m (wages & sponsors)"]),
         "s-trophy":saisonE(2037,"Paris","elite","\"Crowned with Paris, Lucas Morel turns a season into legend\"",[["38","Games"],["17","Goals"],["15","Assists"],["8.4","Rating"]],["League: 1st","✅ Club objective: Season rating ≥ 7.0","💰 +€6.2m (wages & sponsors)"])},
 ecrans={"partie":{"joueur":joueurE(),"carte":None}})

# 08
CHOKE_EN={"genre":"evenement","tag":"😰 DRESSING ROOM · 25 YRS","texte":"The pressure peaks before the big game. Your hands shake slightly during the warm-up — your body is talking.",
       "options":[{"texte":"Lean on your routine and your breathing"},{"texte":"Charge in head-down so you don't overthink"}]}
CALME_EN={"genre":"resultat","tag":"😰 DRESSING ROOM","ton":"great","texte":"The ritual grounds you: calm returns just in time.","effets":["+4 Confidence","-12 Pressure"]}
ZONE_EN={"genre":"evenement","tag":"🔥 PITCH · 25 YRS","texte":"Everything is clicking right now. The ball sticks to your feet, time slows down — you're in the zone.",
      "options":[{"texte":"Try the moves you never dared before"},{"texte":"Keep it simple to make the hot streak last"}]}
projE("08-mindset","Your mind matters as much as your feet",30,
 "English version of destinyfc-08. Real events ev_pressure_choke_risk (Pressure ≥ 62) and ev_in_the_zone (Confidence ≥ 72, Pressure ≤ 35); gauges respect those conditions. Real effects +4 Confidence, -12 Pressure.",
 "Explaining like a coach, but lively. Tension on 'your hands start shaking', relief on 'calm comes back', excitement on 'you're in the zone'.",
 [sc("hook","In my football game, your mind matters as much as your feet.",[A("pose","mind",nom="montre-droite")]),
  sc("gauges","Look at these gauges: confidence and pressure.",[A("disposition","Look",mode="telephone"),A("zoom","gauges",cible="p-jauges",echelle=1.25,hauteur=900)]),
  sc("pressure","If the pressure gets too high, your hands start shaking before the match.",[A("jauges","pressure",pression=70,confiance=44),A("zoom","hands",cible="p-carte",echelle=1.2,hauteur=960),A("carte","hands",id="choke")]),
  sc("routine","I lean on my routine… and the calm comes back.",[A("option","routine",n=1),A("carte","calm",id="calme"),A("jauges","back",pression=58,confiance=48)]),
  sc("zone","And when your confidence is sky-high, you're in the zone.",[A("jauges","confidence",confiance=78,pressure=None) if False else A("jauges","confidence",confiance=78,pression=30),A("carte","zone",id="zone")]),
  sc("cta","Your mindset can be trained. Destiny FC, free on iPhone and Android.",[A("fin","Destiny")])],
 ecranInitial="partie", dispositionInitiale="duo",
 cartes={"choke":CHOKE_EN,"calme":CALME_EN,"zone":ZONE_EN},
 ecrans={"partie":{"joueur":joueurE(age=25,annee=2035,note=79,argent="€14m",etoiles=4,jauges=dict(forme=76,moral=68,confiance=55,pression=48),**PARIS),"carte":None}})

# 09
projE("09-solo-dev","I'm making a football game on my own",26,
 "English version of destinyfc-09. Real figure: 260 events in EVENTS (data.js, counted 10/10/2026). No mention of the project's origins or competitors.",
 "Sincere, enthusiastic indie dev talking to his community, smile in the voice. Warm ending, inviting feedback.",
 [sc("intro","Hi! I'm a developer, and I'm making a football career game all on my own.",[A("pose","developer",nom="neutre"),A("bulle","own",texte="👨‍💻 Solo dev",fin="own")]),
  sc("concept","The idea: you start at sixteen, and you play all the way to retirement, season after season.",
     [A("disposition","idea",mode="duo"),A("pose","idea",nom="montre-droite"),A("appui","start",cible="a-carriere"),A("ecran","sixteen",nom="creation")]),
  sc("choices","Every season, you make choices. Two hundred and sixty different situations.",
     [A("disposition","Every",mode="coin"),A("pose","Every",nom="neutre"),A("ecran","choices",nom="partie"),A("chiffre","Two",valeur=260,depart=0,montee=1.4,sous="different situations",duree=2.6)]),
  sc("content","Decisive moments, transfers, injuries, and your mindset to manage.",
     [A("carte","Decisive",id="finale"),A("carte","transfers",id="mercato",tag="🪟 TRANSFER WINDOW · 16 YRS"),A("zoom","mindset",cible="p-jauges",echelle=1.25,hauteur=900)]),
  sc("cta","It's free, on iPhone and Android. Tell me what you think!",[A("disposition","free",mode="avatar"),A("pose","free",nom="salut"),A("fin","Tell")])],
 ecranInitial="accueil", dispositionInitiale="avatar",
 ecrans={"partie":{"joueur":joueurE()}},
 fin={**FIN_EN,"promesse":"My football game,<br>made <em>solo</em>","detail":"Destiny FC"})

# 10
projE("10-duel","I challenged my mate",30,
 "English version of destinyfc-10. Friends mode (real: 'Same start, same dice. Highest score wins.'). Two fictional careers from the same start: 142 vs 211 points.",
 "Friendly banter between mates. 'Him' a bit mocking, 'Me' proud. Ends on a challenge to the viewer.",
 [sc("hook","I challenged my mate on Destiny FC. Same start, same dice.",[A("pose","challenged",nom="clin"),A("disposition","mate",mode="duo"),A("appui","Destiny",cible="a-amis")]),
  sc("rule","The only difference between us: our choices.",[A("disposition","only",mode="coin"),A("pose","only",nom="neutre"),A("titre","only",texte="Same start, *same dice*",sous="Only your choices differ")]),
  sc("him","Him? He played it safe. Decent career, score: one hundred and forty-two.",
     [A("frise","Him",titre="*Him*"),A("etape","played",age=16,texte="First contract",club="Sochaux",niveau="d2"),A("etape","Decent",age=33,texte="Retirement",club="Nantes",niveau="d2"),
      A("chiffre","score",valeur=142,sous="his score",duree=2.2)]),
  sc("me","Me? I risked it all. Paris, a league title… and two hundred and eleven points.",
     [A("frise","Me",titre="*Me*"),A("etape","Me",age=16,texte="First contract",club="Sochaux",niveau="d2"),A("etape","Paris",age=24,texte="Transfer",club="Paris",niveau="elite"),
      A("etape","league",age=27,texte="Champions",club="Paris",niveau="elite"),A("chiffre","two",valeur=211,sous="my score",duree=2.4),A("pose","two",nom="fier")]),
  sc("cta","Highest score wins. Send this challenge to a mate. Destiny FC, free on iPhone and Android.",[A("tampon","wins",texte="Winner",couleur="or"),A("pose","wins",nom="celebre"),A("fin","Destiny")])],
 ecranInitial="accueil", dispositionInitiale="avatar",
 fin={**FIN_EN,"promesse":"Challenge<br>your <em>friends</em>","detail":"Same start, same dice"})
print("ok")
