import json, os
ROOT='/Users/test/pedantix/marketing/video-pipeline/projets'
C={'rouge':'#e52a1e','bleu':'#1a4fb5','jaune':'#f5c400','blanc':'#f2f2f2','vert':'#1e8a3c','noir':'#1b1b1b'}
SOCHAUX=dict(niveau='d2',club='Sochaux',couleurs=[C['jaune'],C['bleu']])
LENS=dict(niveau='d1',club='Lens',couleurs=[C['rouge'],C['jaune']])
PARIS=dict(niveau='elite',club='Paris',couleurs=[C['rouge'],C['bleu']])
NANTES=dict(niveau='d2',club='Nantes',couleurs=[C['jaune'],C['vert']])
BASE_VOIX="Voix française masculine, jeune et complice, façon TikTok, première personne : c'est Maxime, le développeur du jeu. Débit vif mais articulé, énergie naturelle, pas de ton publicitaire. "
FIN_DEF={"promesse":"De 16 ans à la retraite,<br>écris ta <em>légende</em>","detail":"Chaque choix compte","cta":"Gratuit · iPhone et Android","pose":"salut"}
def joueur(**k):
    j=dict(nom="Lucas Morel",pays="france",age=16,annee=2026,poste="milieu",note=56,argent="50 k€",etoiles=1,jauges=dict(forme=74,moral=70,confiance=58,pression=30),**SOCHAUX)
    j.update(k); return j
def proj(slug,titre,duree,objectif,voix,scenes,**extra):
    s={"titre":titre,"app":"destinyfc","charte":"config/charte-destinyfc.json","format":{"largeur":1080,"hauteur":1920,"fps":30,"dureeCible":duree},
       "objectif":objectif,"voix":{"instructions":BASE_VOIX+voix}}
    s.update(extra); s["scenes"]=scenes; s.setdefault("fin",FIN_DEF)
    d=f"{ROOT}/destinyfc-{slug}"; os.makedirs(d,exist_ok=True)
    json.dump(s,open(d+"/script.json","w"),ensure_ascii=False,indent=2)
def sc(id,voix,actions,anim="",bruitages=None,image=None):
    return {"id":id,"voix":voix,"animation":anim,"image":image,"actions":actions,"bruitages":bruitages or []}
A=lambda type,ancre,**k: dict(type=type,ancre=ancre,**k)
FINALE_TXT="Finale, 1-0 pour {c}, dix dernières minutes à n'en plus finir. Le coach vous somme de tuer le match — reste à trouver la manière."
def saison(age,annee,club,niv,une,stats,lignes):
    return {"genre":"saison","tag":f"📊 SAISON {annee}-{str(annee+1)[2:]} · {club.upper()}","niveau":niv,"une":une,"stats":stats,"lignes":lignes}

# 01 — Une carrière entière en 30 secondes
proj("01-carriere-30s","Une carrière entière en 30 secondes",30,
 "Téléchargements, fans de foot 16–35 ans. Montrer la promesse « de 16 ans à la retraite » en accéléré : contrat à Sochaux (D2) à 16 ans, finale de coupe gagnée à 19 ans avec Lens, transfert à Paris à 24 ans, retraite à 35 ans (2045) avec la fiche « Star mondiale », score 223. Âges et années cohérents (16 ans = 2026).",
 "Rythme rapide, comme un montage accéléré. Chaque âge est annoncé avec punch, petite pause après. Fin interrogative, sourire dans la voix.",
 [sc("accroche","J'ai joué une carrière entière de footballeur, en trente secondes. De seize ans… à la retraite.",
    [A("typo","joué",texte="De *16 ans* à la retraite",fin="retraite")],"Texte géant mot à mot."),
  sc("debut","À seize ans, je signe mon tout premier contrat pro, à Sochaux.",
    [A("entree","seize"),A("zoom","signe",cible="p-tete",echelle=1.25,hauteur=820)],"Le téléphone monte sur l'écran de jeu ; zoom sur l'en-tête (16 ans · 2026, D2 Sochaux)."),
  sc("finale","Dix-neuf ans : finale de coupe… et je la gagne.",
    [A("zoom","Dix-neuf",cible="aucun"),A("joueur","Dix-neuf",age=19,annee=2029,note=68,argent="0,9 M€",etoiles=2,**LENS),
     A("carte","finale",id="finale",texte=FINALE_TXT.format(c="Lens")),A("option","et",n=2),A("carte","gagne",id="finale-gagnee",position="fin")],"Moment décisif de la finale, option « Toro », la coupe."),
  sc("paris","Vingt-quatre ans : Paris m'appelle. Je signe.",
    [A("carte","Vingt-quatre",id="mercato-paris"),A("option","Je",n=1),A("joueur","signe",age=24,annee=2034,note=81,argent="12 M€",etoiles=4,**PARIS),
     A("tampon","signe",texte="Signé",couleur="menthe",duree=1.4)],"Mercato : Paris (Élite) ; tampon « Signé »."),
  sc("retraite","Trente-cinq ans : la retraite. Score final… deux cent vingt-trois.",
    [A("ecran","retraite",nom="fiche"),A("zoom","Score",cible="f-score",echelle=1.25,hauteur=900)],"Fiche de fin de carrière, zoom sur le score."),
  sc("cta","Et toi, tu écrirais quelle légende ? Destiny FC, gratuit.",
    [A("fin","Destiny")],"Carte de fin.")],
 ecranInitial="partie",
 cartes={"mercato-paris":{"genre":"mercato","tag":"🪟 MERCATO · 24 ANS","texte":"Votre nom commence à circuler sur le marché des transferts.",
   "offres":[dict(niveau="elite",club="Paris",couleurs=PARIS["couleurs"],pays="france",detail="4,2 M€/an · indemnité 38 M€"),
             dict(niveau="elite",club="Marseille",couleurs=[C['bleu'],C['blanc']],pays="france",detail="3,6 M€/an · indemnité 31 M€")],"bouton":"RESTER / RECONDUIRE"}},
 ecrans={"partie":{"joueur":joueur(),"carte":"croissance"},"fiche":{"nom":"Lucas Morel","clubs":"Paris · 2026–2045 · 19 saisons","score":223}})

# 02 — Tu fais quoi ?
proj("02-tu-fais-quoi","Tu fais quoi ?",28,
 "Engagement (commentaires) puis téléchargements. Moment décisif réel du jeu (finale de coupe nationale, data.js KEY_MOMENTS) : 4 options, compte à rebours, révélation. L'issue est aléatoire dans le jeu : on montre une issue possible (victoire), sans dire que c'était le « bon » choix.",
 "Ton de défi joueur, complice. Pause marquée après « Tu fais quoi ? ». Les quatre options énumérées vite et clairement. Compte à rebours lent et tendu. Explosion de joie sur « la coupe est à nous ».",
 [sc("situation","Finale de coupe. Tu mènes d'un but, et il reste dix minutes à tenir.",
    [A("entree","Finale"),A("tableau","Finale",titre="Finale · Coupe nationale",domicile=dict(nom="Sochaux",couleurs=SOCHAUX["couleurs"]),exterieur=dict(nom="Nantes",couleurs=NANTES["couleurs"]),score=[1,0],minute=80)],"Tableau de score 1–0, 80e."),
  sc("question","Le coach veut que tu tues le match. Tu fais quoi ?",
    [A("masquer","Le")],"Carte « Moment décisif »."),
  sc("options","Un : gagner du temps au corner. Deux : garder le ballon. Trois : chercher le deuxième but. Quatre : les fautes malines.",
    [A("appui","Un",cible="p-opt-1"),A("appui","Deux",cible="p-opt-2"),A("appui","Trois",cible="p-opt-3"),A("appui","Quatre",cible="p-opt-4")],"Doigt sur chaque option."),
  sc("decompte","Réfléchis bien. Trois… deux… un.",
    [A("chiffre","Trois",valeur=1,depart=3,montee=1.6,sous="Choisis !",duree=2.6)],"Compte à rebours."),
  sc("reponse","Moi, j'ai gardé le ballon. Et la coupe est à nous !",
    [A("option","gardé",n=2),A("carte","coupe",id="finale-gagnee"),A("tampon","nous",texte="Champion",couleur="or")],"Option 2, victoire."),
  sc("cta","Toi, t'aurais choisi quoi ? Dis-le en commentaire. Destiny FC, gratuit.",
    [A("disposition","Toi",mode="coin"),A("pose","Toi",nom="clin"),A("fin","Destiny")],"Carte de fin.")],
 ecranInitial="partie",
 ecrans={"partie":{"joueur":joueur(age=19,annee=2029,note=66,argent="0,6 M€",etoiles=2),"carte":{"genre":"moment","tag":"🎯 MOMENT DÉCISIF","titre":"Finale de la coupe nationale","texte":FINALE_TXT.format(c="Sochaux"),
   "options":[{"indice":"Roublard","texte":"Faire mourir le ballon près du poteau de corner"},{"indice":"Toro","texte":"Garder le ballon, passe après passe"},{"texte":"Aller chercher le 2-0 pour sceller l'affaire"},{"texte":"Casser le rythme à coups de fautes malines"}]}}})

# 03 — Deux destins
proj("03-deux-destins","Même joueur, deux destins",30,
 "Téléchargements. Une seule décision réelle du jeu (ev_growth_spurt, 16 ans) et ses deux issues : protocole respecté (+5 Physique, +3 Discipline) ou pubalgie (−4 Moral, 8 semaines d'absence). Les deux issues existent dans le jeu (50 % pour la pubalgie si on continue de jouer).",
 "Ton de narrateur intrigant. « Destin un » et « Destin deux » bien détachés. Soulagement sur « un corps tout neuf », grimace dans la voix sur « Pubalgie ». Fin posée, conviction.",
 [sc("accroche","Même joueur, même âge, une seule décision… et deux carrières complètement différentes.",
    [A("typo","Même",texte="Une *seule* décision",sous="Deux destins",fin="différentes")],"Texte géant."),
  sc("situation","Seize ans : je grandis de huit centimètres. Le staff médical est inquiet.",
    [A("entree","Seize"),A("zoom","grandis",cible="p-carte",echelle=1.2,hauteur=960)],"Événement réel « Huit centimètres gagnés »."),
  sc("destin1","Destin un : je respecte le protocole. Six mois de rigueur… et un corps tout neuf.",
    [A("tampon","Destin",texte="Destin 1",couleur="menthe",duree=1.4),A("option","respecte",n=1),A("carte","rigueur",id="croissance-ok"),A("joueur","corps",note=59),A("jauges","corps",forme=80)],"Option 1, résultat positif."),
  sc("destin2","Destin deux : je continue à jouer. Pubalgie. Huit semaines sur le flanc.",
    [A("carte","Destin",id="croissance"),A("joueur","Destin",note=56),A("jauges","Destin",forme=74),A("tampon","Destin",texte="Destin 2",couleur="rouge",duree=1.4),
     A("option","continue",n=2),A("carte","Pubalgie",id="croissance-pubalgie"),A("jauges","Huit",moral=66)],"Retour au même événement, option 2, pubalgie."),
  sc("cta","Une seule décision, toute une carrière. Dans Destiny FC, chaque choix compte.",
    [A("fin","Dans")],"Carte de fin.")],
 ecranInitial="partie", ecrans={"partie":{"joueur":joueur(),"carte":"croissance"}},
 fin={**FIN_DEF,"promesse":"Une décision,<br>toute une <em>carrière</em>"})

# 04 — POV agent affamé
proj("04-pov-agent","POV : un agent affamé t'a repéré",30,
 "Téléchargements. Création du joueur avec les vraies listes de l'app (poste Milieu, origine Quartier populaire, entourage « Agent affamé » et sa vraie description). Les clubs proposés suivent le potentiel (pas d'Élite).",
 "Ton de narration POV, complice et un peu moqueur sur l'agent (« et n'oublie pas sa commission » avec un clin d'œil dans la voix).",
 [sc("accroche","POV : t'as seize ans, et un agent affamé vient de te repérer.",
    [A("titre","POV",texte="POV : tu as *16 ans*",sous="Un agent vient de te repérer"),A("pose","agent",nom="clin")],"Avatar face caméra, carte titre."),
  sc("creation","Je crée mon joueur. Lucas Morel, milieu, né dans un quartier populaire.",
    [A("disposition","crée",mode="coin"),A("ecran","crée",nom="creation"),A("pose","crée",nom="neutre"),A("taper","Lucas",mot="Lucas Morel"),
     A("feuille","milieu",nom="poste",position="debut"),A("choisir","né",valeur="Milieu"),A("choisir","populaire",nom="origine",valeur="Quartier populaire")],"Écran « Crée ton joueur »."),
  sc("agent","Entourage : l'agent affamé. Il jure de m'emmener au sommet… et n'oublie pas sa commission.",
    [A("feuille","Entourage",nom="entourage"),A("choisir","Il",valeur="Agent affamé"),A("choisir","sommet",nom="style",valeur="Bien équilibré"),
     A("attributs","sommet",tec=61,phy=50,men=58,cha=55),A("pose","commission",nom="clin")],"Feuille Entourage, Agent affamé."),
  sc("clubs","Résultat : les recruteurs m'ont repéré. À moi de choisir mon club.",
    [A("ecran","recruteurs",nom="clubs"),A("pose","recruteurs",nom="fier"),A("appui","club",cible="cl-4")],"Les clubs vous ont repéré ; appui sur Lens."),
  sc("cta","Et toi, tu partirais avec quel entourage ? Destiny FC, gratuit sur iPhone et Android.",
    [A("pose","toi",nom="montre-droite"),A("fin","Destiny")],"Carte de fin.")],
 ecranInitial="creation", dispositionInitiale="avatar", poseInitiale="neutre",
 ecrans={"creation":{"champs":{"nationalite":"France"}},"clubs":{"potentiel":3}})

# 05 — La pire décision
PIRE={"genre":"resultat","tag":"😖 TERRAIN","ton":"bad","texte":"Vous commettez une nouvelle bourde et l'équipe sombre : ce n'était vraiment pas votre soir, défaite 3-0.","effets":["-8 Forme","-8 Moral","-5 Relation coach"]}
proj("05-pire-decision","La pire décision de ma carrière",28,
 "Téléchargements, ton autodérision. Événement réel ev_ (bévue en match, 17 ans) ; option « Hausser le ton », issue réelle « défaite 3-0 » (−8 Forme, −8 Moral, −5 Relation coach). Fait vérifié : cette option réussit dans 55 % des cas (« plus d'une chance sur deux »).",
 "Ton d'aveu gêné et drôle au début, puis récit. « Défaite trois-zéro » lâché, dépité. Petite pause avant « Le pire ? ». Fin légère.",
 [sc("accroche","La pire décision de toute ma carrière ? Je vous montre.",
    [A("bulle","pire",texte="😬",fin="carrière"),A("disposition","montre",mode="coin"),A("pose","montre",nom="neutre")],"Avatar face caméra, puis démo."),
  sc("bevue","Dix-sept ans. Je fais une grosse erreur, et le but est pour eux.",
    [A("carte","erreur",id="bevue"),A("jauges","but",moral=58)],"Événement réel « Votre bévue offre le but »."),
  sc("choix","Moi, je décide de hausser le ton pour me rattraper.",
    [A("option","hausser",n=2),A("pose","hausser",nom="fier")],"Option 2."),
  sc("resultat","Nouvelle bourde. Défaite trois-zéro.",
    [A("carte","bourde",id="pire"),A("pose","Défaite",nom="tete-main"),A("jauges","Défaite",forme=66,moral=50)],"Résultat réel, jauges qui chutent."),
  sc("twist","Le pire ? Ça avait plus d'une chance sur deux de marcher.",
    [A("pose","pire",nom="decu"),A("chiffre","chance",valeur=55,suffixe=" %",sous="de chances de réussir",duree=2.6)],"Le chiffre réel de l'option."),
  sc("cta","Dans Destiny FC, même un bon choix peut mal tourner. Gratuit, sur iPhone et Android.",
    [A("pose","Dans",nom="neutre"),A("fin","Gratuit")],"Carte de fin.")],
 ecranInitial="partie", dispositionInitiale="avatar", poseInitiale="tete-main",
 cartes={"pire":PIRE},
 ecrans={"partie":{"joueur":joueur(age=17,annee=2027,note=60,argent="0,1 M€",jauges=dict(forme=74,moral=66,confiance=55,pression=38)),"carte":"bevue"}})

# 06 — Mercato en 3 secondes
proj("06-mercato-3s","Mercato : 3 secondes pour choisir",24,
 "Engagement + téléchargements. Écran mercato réel ; 22 ans, 3 étoiles, note 74 à Lens (D1) : offres Paris, Brighton, Marseille cohérentes avec le niveau. Après le transfert : club Élite, salaire en hausse, jauge Pression qui monte.",
 "Urgence ludique, débit rapide. Compte à rebours tendu. « Signé » claqué. Fin en défi.",
 [sc("accroche","Mercato d'été. Trois clubs veulent te recruter, et tu as trois secondes pour choisir.",
    [A("entree","Mercato")],"Carte mercato à trois offres."),
  sc("decompte","Paris, Brighton ou Marseille ? Trois… deux… un…",
    [A("appui","Paris",cible="p-opt-1"),A("appui","Brighton",cible="p-opt-2"),A("appui","Marseille",cible="p-opt-3"),A("chiffre","Trois",valeur=1,depart=3,montee=1.4,sous="Choisis !",duree=2.4)],"Doigt sur chaque offre, compte à rebours."),
  sc("choix","Moi, je fonce à Paris. Signé.",
    [A("option","fonce",n=1),A("tampon","Signé",texte="Signé",couleur="menthe"),A("joueur","Signé",age=22,annee=2032,note=76,argent="5,8 M€",etoiles=4,**PARIS)],"Option Paris, tampon, en-tête mis à jour."),
  sc("pression","Nouveau club, plus d'argent… mais aussi beaucoup plus de pression.",
    [A("zoom","Nouveau",cible="p-jauges",echelle=1.25,hauteur=900),A("jauges","pression",pression=64)],"Zoom sur l'en-tête, jauge Pression qui passe au rouge."),
  sc("cta","Et toi, t'aurais signé où ? Dis-le en commentaire. Destiny FC, gratuit.",
    [A("fin","Destiny")],"Carte de fin.")],
 ecranInitial="partie",
 ecrans={"partie":{"joueur":joueur(age=22,annee=2032,note=74,argent="3,1 M€",etoiles=3,jauges=dict(forme=78,moral=72,confiance=64,pression=34),**LENS),
   "carte":{"genre":"mercato","tag":"🪟 MERCATO · 22 ANS","texte":"Votre nom commence à circuler sur le marché des transferts.",
    "offres":[dict(niveau="elite",club="Paris",couleurs=PARIS["couleurs"],pays="france",detail="4,2 M€/an · indemnité 38 M€"),
              dict(niveau="d1",club="Brighton",couleurs=[C['bleu'],C['blanc']],pays="angleterre",detail="1,8 M€/an · indemnité 22 M€"),
              dict(niveau="elite",club="Marseille",couleurs=[C['bleu'],C['blanc']],pays="france",detail="3,6 M€/an · indemnité 31 M€")],"bouton":"RESTER / RECONDUIRE"}}})

# 07 — Les gros titres
proj("07-gros-titres","Ma carrière racontée par les journaux",30,
 "Téléchargements. Uniquement des titres de presse réels du jeu (data.js HEADLINES : flop, solid, wonder, trophy), avec {name}=Lucas Morel et {club}. Statistiques de chaque bilan cohérentes avec le titre (note 4,9 en panne → 8,1 changé de dimension).",
 "Ton de revue de presse, un peu théâtral : chaque titre lu comme une manchette. Dépit au début, fierté qui monte, apothéose à la fin.",
 [sc("accroche","Voici ma carrière… racontée uniquement par les journaux.",
    [A("pose","Voici",nom="content"),A("disposition","racontée",mode="telephone")],"Avatar puis téléphone."),
  sc("flop","Dix-sept ans. Lucas Morel en panne : une saison qui laissera des traces.",
    [A("carte","Dix-sept",id="s-flop"),A("joueur","Dix-sept",age=17,annee=2027,note=58)],"Bilan de saison, titre « en panne »."),
  sc("solid","Vingt et un ans. Constant, appliqué, décisif : Lucas Morel a tenu son rang toute l'année.",
    [A("carte","Vingt",id="s-solid"),A("joueur","Vingt",age=21,annee=2031,note=71,argent="1,4 M€",etoiles=2,**LENS)],"Titre « tenu son rang »."),
  sc("wonder","Vingt-quatre ans. Lucas Morel a changé de dimension cette année, point final.",
    [A("carte","Vingt-quatre",id="s-wonder"),A("joueur","Vingt-quatre",age=24,annee=2034,note=80,argent="9 M€",etoiles=4,**PARIS)],"Titre « changé de dimension »."),
  sc("trophy","Et à vingt-sept ans : sacré avec Paris, Lucas Morel transforme une saison en légende.",
    [A("carte","vingt-sept",id="s-trophy"),A("joueur","vingt-sept",age=27,annee=2037,note=86,argent="31 M€",etoiles=5),A("tampon","légende",texte="Champion",couleur="or")],"Titre de champion."),
  sc("cta","Ta carrière fera quels gros titres ? Destiny FC, gratuit.",
    [A("fin","Destiny")],"Carte de fin.")],
 ecranInitial="partie", dispositionInitiale="avatar",
 cartes={"s-flop":saison(17,2027,"Sochaux","d2","« Lucas Morel en panne : une saison qui laissera des traces »",[["24","Matchs"],["1","Buts"],["2","Passes déc."],["4.9","Note"]],["Championnat : 14ᵉ","❌ Objectif du club : Note de saison ≥ 6.5","💰 +60 k€ (salaire & sponsors)"]),
         "s-solid":saison(21,2031,"Lens","d1","« Constant, appliqué, décisif : Lucas Morel a tenu son rang toute l'année »",[["34","Matchs"],["6","Buts"],["9","Passes déc."],["6.9","Note"]],["Championnat : 7ᵉ","✅ Objectif du club : Note de saison ≥ 6.5","💰 +0,9 M€ (salaire & sponsors)"]),
         "s-wonder":saison(24,2034,"Paris","elite","« Lucas Morel a changé de dimension cette année, point final »",[["36","Matchs"],["14","Buts"],["12","Passes déc."],["8.1","Note"]],["Championnat : 2ᵉ","✅ Objectif du club : Note de saison ≥ 7.0","💰 +4,6 M€ (salaire & sponsors)"]),
         "s-trophy":saison(27,2037,"Paris","elite","« Sacré avec Paris, Lucas Morel transforme une saison en légende »",[["38","Matchs"],["17","Buts"],["15","Passes déc."],["8.4","Note"]],["Championnat : 1ᵉ","✅ Objectif du club : Note de saison ≥ 7.0","💰 +6,2 M€ (salaire & sponsors)"])},
 ecrans={"partie":{"joueur":joueur(),"carte":None}})

# 08 — Le mental
CHOKE={"genre":"evenement","tag":"😰 VESTIAIRE · 25 ANS","texte":"La pression est à son comble avant l'échéance. Vos mains tremblent légèrement à l'échauffement — le corps parle.",
       "options":[{"texte":"Vous appuyer sur la routine et la respiration"},{"texte":"Foncer tête baissée pour ne pas réfléchir"}]}
CALME={"genre":"resultat","tag":"😰 VESTIAIRE","ton":"great","texte":"Le rituel vous ancre : le calme revient juste à temps.","effets":["+4 Confiance","-12 Pression"]}
ZONE={"genre":"evenement","tag":"🔥 TERRAIN · 25 ANS","texte":"Tout vous réussit en ce moment. Le ballon colle au pied, le temps ralentit — vous êtes dans la zone.",
      "options":[{"texte":"Tenter les gestes que vous n'osiez pas"},{"texte":"Rester simple pour faire durer l'état de grâce"}]}
proj("08-mental","Le mental compte autant que les pieds",30,
 "Téléchargements, mettre en avant le système mental (Confiance / Pression), différenciant. Événements réels ev_pressure_choke_risk (déclenché si Pression ≥ 62) et ev_in_the_zone (Confiance ≥ 72 et Pression ≤ 35) : les jauges affichées respectent ces conditions. Effets réels : +4 Confiance, −12 Pression (« -12 Pression » affiché en rouge par la règle de signe de l'app).",
 "Ton explicatif mais vivant, comme un coach. Tension sur « tes mains tremblent », soulagement sur « le calme revient », enthousiasme sur « tu entres dans la zone ».",
 [sc("accroche","Dans mon jeu de foot, ton mental compte autant que tes pieds.",
    [A("pose","mental",nom="montre-droite")],"Avatar en duo avec l'écran de jeu."),
  sc("jauges","Regarde ces jauges : confiance et pression.",
    [A("disposition","Regarde",mode="telephone"),A("zoom","jauges",cible="p-jauges",echelle=1.25,hauteur=900)],"Zoom sur les jauges."),
  sc("pression","Si la pression monte trop, tes mains tremblent avant le match.",
    [A("jauges","pression",pression=70,confiance=44),A("zoom","mains",cible="p-carte",echelle=1.2,hauteur=960),A("carte","mains",id="choke")],"Jauge Pression au rouge, événement réel."),
  sc("routine","Je m'appuie sur ma routine… et le calme revient.",
    [A("option","routine",n=1),A("carte","calme",id="calme"),A("jauges","revient",pression=58,confiance=48)],"Option routine, résultat réel."),
  sc("zone","Et quand la confiance est au top, tu entres dans la zone.",
    [A("jauges","confiance",confiance=78,pression=30),A("carte","zone",id="zone")],"Jauges au vert, événement « dans la zone »."),
  sc("cta","Le mental, ça se travaille. Destiny FC, gratuit sur iPhone et Android.",
    [A("fin","Destiny")],"Carte de fin.")],
 ecranInitial="partie", dispositionInitiale="duo",
 cartes={"choke":CHOKE,"calme":CALME,"zone":ZONE},
 ecrans={"partie":{"joueur":joueur(age=25,annee=2035,note=79,argent="14 M€",etoiles=4,jauges=dict(forme=76,moral=68,confiance=55,pression=48),**PARIS),"carte":None}})

# 09 — Dev solo
proj("09-dev-solo","Je crée un jeu de foot tout seul",26,
 "Notoriété + téléchargements, format coulisses de développeur indépendant. Chiffre réel : 260 événements dans EVENTS (data.js, compté le 10/10/2026). Ne pas évoquer l'origine du projet ni de concurrent.",
 "Ton sincère et enthousiaste de dev indé qui parle à sa communauté, sourire dans la voix. Fin chaleureuse, invitation à donner son avis.",
 [sc("intro","Salut ! Je suis développeur, et je crée tout seul un jeu de carrière de foot.",
    [A("pose","développeur",nom="neutre"),A("bulle","seul",texte="👨‍💻 Solo dev",fin="foot")],"Avatar face caméra."),
  sc("principe","Le principe : tu commences à seize ans, et tu joues jusqu'à ta retraite, saison après saison.",
    [A("disposition","principe",mode="duo"),A("pose","principe",nom="montre-droite"),A("appui","commences",cible="a-carriere"),A("ecran","seize",nom="creation")],"Accueil puis création du joueur."),
  sc("choix","À chaque saison, des choix. Deux cent soixante situations différentes.",
    [A("disposition","chaque",mode="coin"),A("pose","chaque",nom="neutre"),A("ecran","choix",nom="partie"),A("chiffre","Deux",valeur=260,depart=0,montee=1.4,sous="situations différentes",duree=2.6)],"Écran de jeu, chiffre réel."),
  sc("contenu","Des moments décisifs, des transferts, des blessures, et ton mental à gérer.",
    [A("carte","moments",id="finale"),A("carte","transferts",id="mercato",tag="🪟 MERCATO · 16 ANS"),A("zoom","mental",cible="p-jauges",echelle=1.25,hauteur=900)],"Moment décisif, mercato, jauges."),
  sc("cta","Il est gratuit, sur iPhone et Android. Dis-moi ce que t'en penses !",
    [A("disposition","Il",mode="avatar"),A("pose","Il",nom="salut"),A("fin","Dis-moi")],"Carte de fin.")],
 ecranInitial="accueil", dispositionInitiale="avatar",
 fin={**FIN_DEF,"promesse":"Mon jeu de foot,<br>fait <em>tout seul</em>","detail":"Destiny FC"})

# 10 — Duel
proj("10-duel","J'ai défié mon pote",30,
 "Téléchargements + viralité (mode Amis, réel : « Même départ, mêmes dés, à vos choix près. Le meilleur score gagne. »). Deux carrières fictives au même départ (Sochaux, 16 ans) : lui 142 points, moi 211 points (scores dans la plage réelle du jeu).",
 "Ton de chambrage amical entre potes. « Lui » un peu moqueur, « Moi » fier. Fin en défi lancé au spectateur.",
 [sc("accroche","J'ai défié mon pote sur Destiny FC. Même départ, mêmes dés.",
    [A("pose","défié",nom="clin"),A("disposition","pote",mode="duo"),A("appui","Destiny",cible="a-amis")],"Avatar, puis accueil et tuile Amis."),
  sc("regle","La seule différence entre nous, ce sont nos choix.",
    [A("disposition","seule",mode="coin"),A("pose","seule",nom="neutre"),A("titre","seule",texte="Même départ, *mêmes dés*",sous="À vos choix près")],"Carte titre avec la règle du mode."),
  sc("lui","Lui, il a joué la sécurité. Carrière correcte, score cent quarante-deux.",
    [A("frise","Lui",titre="*Lui*"),A("etape","joué",age=16,texte="Premier contrat",club="Sochaux",niveau="d2"),A("etape","correcte",age=33,texte="Retraite",club="Nantes",niveau="d2"),
     A("chiffre","score",valeur=142,sous="son score",duree=2.2)],"Frise de sa carrière, score."),
  sc("moi","Moi, j'ai tout risqué. Paris, un titre de champion… et deux cent onze points.",
    [A("frise","Moi",titre="*Moi*"),A("etape","Moi",age=16,texte="Premier contrat",club="Sochaux",niveau="d2"),A("etape","Paris",age=24,texte="Transfert",club="Paris",niveau="elite"),
     A("etape","champion",age=27,texte="Champion",club="Paris",niveau="elite"),A("chiffre","deux",valeur=211,sous="mon score",duree=2.4),A("pose","deux",nom="fier")],"Frise de ma carrière, score."),
  sc("cta","Le meilleur score gagne. Envoie ce défi à un pote. Destiny FC, gratuit sur iPhone et Android.",
    [A("tampon","gagne",texte="Gagné",couleur="or"),A("pose","gagne",nom="celebre"),A("fin","Destiny")],"Tampon, carte de fin.")],
 ecranInitial="accueil", dispositionInitiale="avatar",
 fin={**FIN_DEF,"promesse":"Défie tes <em>amis</em>","detail":"Même départ, mêmes dés"})
print("ok")
