"use strict";

// English presentation of the shared catalog. Canonical filter values stay in catalogue.js.
(() => {
  const catalog = window.PRATICIEN;
  const labels = {
    "Chanter en égyptien ancien": "Sing in ancient Egyptian",
    "Chercher en quatre langues": "Search in four languages",
    "Dater un strigile": "Date a strigil",
    "Exposer avec l’IA": "Exhibit with AI",
    "Faire circuler une revue": "Keep a journal running",
    "Filmer l’Égypte": "Tell Egypt’s story on video",
    "Lire les sarcophages": "Read the coffins",
    "Mesurer l’audience": "Read YouTube analytics",
    "Pister une référence": "Track down a reference",
    "Poèmes d’amour": "Love poems",
    "Catalogue en ligne": "Online catalog",
    "Boxe antique": "Ancient boxing",
    "Variantes textuelles": "Textual variants",
    "Sons de l’égyptien": "Sounds of Egyptian",
    "OCR des hiéroglyphes": "Hieroglyph OCR",
    "Du catalogue au rayon": "From catalog to shelf",
    "Sous-titres multilingues": "Multilingual subtitles",
    "Jouer avec une frise": "Play with a timeline",

    "Bibliothéconomie": "Library science",
    "Histoire ancienne": "Ancient history",
    "Histoire culturelle": "Cultural history",
    "Humanités numériques": "Digital humanities",
    "Médiation culturelle": "Cultural outreach",
    "Philosophie ancienne": "Ancient philosophy",
    "Édition scientifique": "Scholarly publishing",
    "Égyptologie": "Egyptology",
    "Études du Proche-Orient ancien": "Ancient Near Eastern studies",

    "Akkadien": "Akkadian",
    "Antigonides": "Antigonids",
    "Antiquité afro-eurasienne": "Afro-Eurasian antiquity",
    "Architecture néo-égyptienne": "Egyptian Revival architecture",
    "Archéologie du sport": "Archaeology of sport",
    "Archéologie publique": "Public archaeology",
    "Art pharaonique": "Pharaonic art",
    "Assyriologie": "Assyriology",
    "Bataille de Pydna": "Battle of Pydna",
    "Bibliodiversité": "Bibliodiversity",
    "Bibliothèque du RCWAC": "RCWAC Library",
    "Cartouches royaux": "Royal cartouches",
    "Catalogage multilingue": "Multilingual cataloging",
    "Catalogue public en ligne (OPAC)": "Online public access catalog (OPAC)",
    "Circulation et exposition des momies": "Circulation and display of mummies",
    "Collégiens": "Middle school students",
    "Conquête romaine de la Macédoine": "Roman conquest of Macedonia",
    "Contestations afro-américaines": "African American resistance",
    "Copte": "Coptic",
    "Critique de l’écriture": "Critique of writing",
    "Cultes royaux": "Royal cults",
    "Divinité du pharaon": "Divinity of the pharaoh",
    "Dons de bibliothèques savantes": "Donations of scholarly libraries",
    "Désinformation sur l’Égypte ancienne": "Misinformation about ancient Egypt",
    "Eschatologie": "Eschatology",
    "Femmes et sport": "Women and sport",
    "Gant de pugiliste de Narbonne": "Boxing glove from Narbonne",
    "Grammaires d’Okajima": "Okajima’s grammars",
    "Guerres macédoniennes": "Macedonian Wars",
    "Handicap et sport": "Disability and sport",
    "Histoire des études anciennes en Chine": "History of ancient studies in China",
    "Histoire des études orientales": "History of Oriental studies",
    "Hiéroglyphes": "Hieroglyphs",
    "Idéologie royale": "Royal ideology",
    "Institutions macédoniennes": "Macedonian institutions",
    "Institutions royales": "Royal institutions",
    "Intelligence artificielle": "Artificial intelligence",
    "Jeux olympiques antiques": "Ancient Olympic Games",
    "Jeux olympiques de Paris 2024": "Paris 2024 Olympic Games",
    "Jugement des morts": "Judgment of the dead",
    "Ka royal": "Royal ka",
    "Libre accès": "Open access",
    "Libre accès diamant": "Diamond open access",
    "Logiciel libre": "Free software",
    "Légitimité royale": "Royal legitimacy",
    "Matérialité de l’écrit": "Materiality of writing",
    "Mythe de Theuth": "Myth of Theuth",
    "Mythe de l’Atlantide": "Myth of Atlantis",
    "Oralité et écriture": "Orality and writing",
    "Peinture contemporaine": "Contemporary painting",
    "Phonologie de l’égyptien": "Egyptian phonology",
    "Platon et l’Égypte": "Plato and Egypt",
    "Poésie amoureuse": "Love poetry",
    "Poésie égyptienne ancienne": "Ancient Egyptian poetry",
    "Proche-Orient ancien": "Ancient Near East",
    "Publications scientifiques en japonais": "Japanese-language scholarship",
    "Pugilat": "Ancient boxing",
    "Racisme scientifique et esclavage": "Scientific racism and slavery",
    "Relations entre égyptologues et publics": "Engagement with Egyptology audiences",
    "Relations gréco-égyptiennes": "Greek-Egyptian relations",
    "Religion funéraire": "Funerary religion",
    "Rituels de couronnement": "Coronation rites",
    "Royaume de Macédoine": "Kingdom of Macedonia",
    "Royauté égyptienne": "Egyptian kingship",
    "Réception de Cléopâtre": "Reception of Cleopatra",
    "Réception de l’Antiquité": "Reception of antiquity",
    "Réception de l’Égypte ancienne": "Reception of ancient Egypt",
    "Réseaux scientifiques": "Scholarly networks",
    "Société égyptienne ancienne": "Ancient Egyptian society",
    "Strigile": "Strigil",
    "Sumérien": "Sumerian",
    "Théories du complot": "Conspiracy theories",
    "Titulature royale": "Royal titulary",
    "Travail de terrain archéologique": "Archaeological fieldwork",
    "Travail en musée": "Museum work",
    "Variation textuelle": "Textual variation",
    "Voyage de Platon en Égypte": "Plato’s journey to Egypt",
    "Échanges entre revues": "Journal exchanges",
    "École américaine d’ethnologie": "American school of ethnology",
    "Économie de la médiation": "Economics of outreach",
    "Économie de l’édition": "Economics of publishing",
    "Économie royale": "Royal economy",
    "Écriture hiératique": "Hieratic script",
    "Écriture hiéroglyphique": "Hieroglyphic script",
    "Édition associative": "Nonprofit publishing",
    "Édition numérique": "Digital publishing",
    "Égyptologie au Japon": "Egyptology in Japan",
    "Égyptomanie américaine": "American Egyptomania",
    "Études cunéiformes": "Cuneiform studies",

    "Ancien Empire": "Old Kingdom",
    "Antiquité": "Antiquity",
    "Fin du XVIIIe siècle": "Late 18th century",
    "Moyen Empire": "Middle Kingdom",
    "Moyen Âge": "Middle Ages",
    "Nouvel Empire": "New Kingdom",
    "Néolithique": "Neolithic",
    "XIXe siècle": "19th century",
    "XXIe siècle": "21st century",
    "XXe siècle": "20th century",
    "Égypte ancienne": "Ancient Egypt",
    "Époque classique grecque": "Classical Greek period",
    "Époque contemporaine": "Contemporary period",
    "Époque hellénistique": "Hellenistic period",

    "Animations vidéo": "Video animations",
    "Bibliographie scientifique": "Scholarly bibliography",
    "Cartes d’objets archéologiques": "Archaeological object cards",
    "Catalogues de bibliothèques": "Library catalogs",
    "Chants de tradition arabe": "Traditional Arabic songs",
    "Dialogues de Platon": "Plato’s dialogues",
    "Données d’audience YouTube": "YouTube audience data",
    "Entretiens filmés": "Recorded interviews",
    "Fonds de bibliothèques": "Library collections",
    "Grammaires de l’égyptien": "Egyptian grammars",
    "Grammaires du copte": "Coptic grammars",
    "Iconographie sportive": "Sport iconography",
    "Livre de Thot": "Book of Thoth",
    "Manuels de cunéiforme": "Cuneiform textbooks",
    "Métadonnées bibliographiques": "Bibliographic metadata",
    "Papyrus administratifs": "Administrative papyri",
    "Peintures contemporaines": "Contemporary paintings",
    "Photographies d’art égyptien": "Photographs of Egyptian art",
    "Phèdre": "Phaedrus",
    "Politiques éditoriales": "Editorial policies",
    "Poèmes égyptiens anciens": "Ancient Egyptian poems",
    "Presse américaine du XIXe siècle": "19th-century American press",
    "Périodiques scientifiques": "Scholarly periodicals",
    "Reproductions d’objets": "Object replicas",
    "Revues savantes": "Scholarly journals",
    "Récits de voyage": "Travel accounts",
    "Sarcophages du Moyen Empire": "Middle Kingdom coffins",
    "Sculpture néoclassique": "Neoclassical sculpture",
    "Sources archéologiques": "Archaeological sources",
    "Sources littéraires antiques": "Ancient literary sources",
    "Sources numismatiques": "Numismatic sources",
    "Sources royales": "Royal sources",
    "Sources épigraphiques": "Epigraphic sources",
    "Textes des Pyramides": "Pyramid Texts",
    "Textes des Sarcophages": "Coffin Texts",
    "Textes démotiques": "Demotic texts",
    "Textes hiéroglyphiques": "Hieroglyphic texts",
    "Textes religieux": "Religious texts",
    "Timée": "Timaeus",
    "Tombes privées": "Private tombs",
    "Triptyques": "Triptychs",
    "Vestiges archéologiques": "Archaeological remains",
    "Vidéos YouTube": "YouTube videos",

    "Affichage de droite à gauche": "Right-to-left display",
    "Analyse intertextuelle": "Intertextual analysis",
    "Analyse quantitative d’audience": "Quantitative audience analysis",
    "Animation assistée par IA": "AI-assisted animation",
    "Archivage sur Zenodo": "Archiving on Zenodo",
    "Archéologie expérimentale": "Experimental archaeology",
    "Atelier scolaire": "School workshop",
    "Bibliographie progressive": "Staged bibliography",
    "Bibliographie thématique": "Thematic bibliography",
    "Classement chronologique": "Chronological ordering",
    "Collaboration entre égyptologues et artistes": "Collaboration between Egyptologists and artists",
    "Composition multilingue": "Multilingual composition",
    "Conservation numérique": "Digital preservation",
    "Coopération entre chercheurs et musées": "Collaboration between researchers and museums",
    "Double anonymat": "Double-anonymous review",
    "Exposition": "Exhibition",
    "Fouille de textes": "Text mining",
    "Gestion des cotes": "Call number management",
    "Gestion éditoriale": "Editorial management",
    "Histoire de la réception": "Reception history",
    "Historiographie": "Historiography",
    "Impression 3D": "3D printing",
    "Indexation des publications": "Publication indexing",
    "Interprétation des vestiges": "Interpretation of archaeological remains",
    "Jeu sérieux": "Serious game",
    "Licences Creative Commons": "Creative Commons licenses",
    "Mise en musique des textes anciens": "Setting ancient texts to music",
    "Modélisation 3D": "3D modeling",
    "Médiation par les arts": "Outreach through the arts",
    "Médiation vidéo": "Video outreach",
    "Percussions corporelles": "Body percussion",
    "Philologie matérielle": "Material philology",
    "Philologie numérique": "Digital philology",
    "Production d’entretiens": "Interview production",
    "Projection immersive": "Immersive projection",
    "Publication assistée par ordinateur": "Desktop publishing",
    "Recherche approximative": "Fuzzy search",
    "Recherche sémantique": "Semantic search",
    "Reconnaissance de hiéroglyphes (OCR)": "Hieroglyph recognition (OCR)",
    "Reconstitution de la prononciation": "Pronunciation reconstruction",
    "Repérage documentaire": "Finding research materials",
    "Retour d’expérience": "Case report",
    "Réalité augmentée": "Augmented reality",
    "Réfutation de la désinformation": "Debunking misinformation",
    "Sous-titrage multilingue": "Multilingual subtitling",
    "Traduction de textes égyptiens": "Translation of Egyptian texts",
    "Translittération assyriologique": "Assyriological transliteration",
    "Translittération égyptologique": "Egyptological transliteration",
    "Vidéos courtes": "Short-form videos",
    "Édition multilingue": "Multilingual publishing",
    "Évaluation par les pairs": "Peer review",

    "Athènes": "Athens",
    "Chine": "China",
    "Grèce": "Greece",
    "Grèce antique": "Ancient Greece",
    "Japon": "Japan",
    "Lisbonne": "Lisbon",
    "Macédoine antique": "Ancient Macedonia",
    "Méditerranée orientale": "Eastern Mediterranean",
    "Nubie": "Nubia",
    "Olympie": "Olympia",
    "Philadelphie": "Philadelphia",
    "Rome antique": "Ancient Rome",
    "Thèbes": "Thebes",
    "Égypte": "Egypt",
    "États-Unis": "United States",

    "Guides bibliographiques & documentaires": "Bibliographic & Research Guides",
    "Français": "French",
    "Anglais": "English",

    "Rites funéraires": "Funerary rites",
    "Hiératique": "Hieratic",
    "Poésie": "Poetry",
    "Platon": "Plato",
    "Égyptomanie": "Egyptomania",
    "Momies en vitrine": "Mummies on display",
    "Accès diamant": "Diamond open access",
    "Cartouches": "Cartouches",
    "Couronner un roi": "Crown a king",
    "Variantes funéraires": "Funerary variants",
    "Atlantide": "Atlantis",
    "Cléopâtre en Amérique": "Cleopatra in America",
    "Un pharaon divin ?": "A divine pharaoh?",
    "Revues en ligne": "Online journals",
    "IA dans l’art": "AI in art",
    "Phonologie": "Phonology",
    "Pratiques sportives": "Sporting practices",
    "Proche-Orient": "Near East",
    "Réseaux d’égyptologues": "Egyptologists’ networks",
    "Pouvoir royal": "Royal power",
    "Jeux antiques": "Ancient games",
    "Catalogue quadrilingue": "Four-language catalog",
    "Sarcophages": "Coffins",
    "Numismatique": "Numismatics",
    "Épigraphie": "Epigraphy",
    "Démotique": "Demotic",
    "Cunéiforme": "Cuneiform",
    "Sarcophages inscrits": "Inscribed coffins",
    "Fonds savants": "Scholarly collections",
    "Périodiques savants": "Scholarly periodicals",
    "Vestiges": "Material remains",
    "Peintures": "Paintings",
    "Chants arabes": "Arabic songs",
    "Translittération": "Transliteration",
    "Cotes": "Call numbers",
    "Sous-titres": "Subtitles",
    "Traduction": "Translation",
    "Prononciation": "Pronunciation",
    "Hellénisme": "Hellenistic world",
    "Grèce classique": "Classical Greece",

    "Les fondamentaux": "Fundamentals",
    "Les développements essentiels": "Essential Developments",
    "Les développements complémentaires": "Complementary Developments",
    "Recension des rapports sur la voyage et analyse des Aegyptiaca chez Platon": "Accounts of the journey and analysis of Plato’s Aegyptiaca",
    "L’Atlantide dans le Timée et le Critias": "Atlantis in the Timaeus and Critias",
    "Le Phèdre et la critique de l’écriture": "The Phaedrus and the critique of writing",
    "Autres thèmes et perspectives": "Other topics and perspectives",
    "Égypte monumentale, architecture et culture matérielle · Les fondamentaux": "Monumental Egypt, architecture, and material culture · Fundamentals",
    "Égypte monumentale, architecture et culture matérielle · Les développements essentiels": "Monumental Egypt, architecture, and material culture · Essential Developments",
    "Égypte, science raciale et esclavage · Les fondamentaux": "Egypt, racial science, and slavery · Fundamentals",
    "Contestations afro-américaines · Sources primaires": "African American resistance · Primary sources",
    "Cléopâtre, l’américaine · Sources primaires": "Cleopatra in America · Primary sources"
  };

  const articles = {
    1: {
      lead: "Explore the history of Macedonia after Alexander through the Antigonid dynasty and the sources that illuminate its kingdom.",
      evidence: [
        ["Antigonids", "The introduction defines the period of Macedonian history after Alexander and connects Perseus’s defeat in 168 BCE to the end of the monarchy."],
        ["Types of evidence", "A discussion of the Roman perspective in several ancient authors shows how inscriptions, coins, and excavations complement one another."],
        ["Institutions and numismatics", "Specialized studies examine Macedonian institutions and Antigonid coinage in the Aegean world."]
      ],
      aliases: ["History of Hellenistic Macedonia", "Alexander the Great", "Perseus", "Polybius", "Appian"]
    },
    2: {
      lead: "In Changchun, the Journal of Ancient Civilizations expands its network, adopts double-anonymous review, and makes indexing part of its strategy to reach readers.",
      evidence: [
        ["Building a research library", "The founding of the IHAC at Northeast Normal University was authorized in 1984. The institute combines training in ancient languages and histories, development of a specialized library, and international cooperation."],
        ["The 2015–2016 editorial reform", "The JAC began publishing twice a year and introduced double-anonymous peer review starting with volume 31. The reforms also included ethics guidelines and an international advisory board."],
        ["Special sections, debates, and proceedings", "The journal broadened its formats to include surveys of fields such as ancient economics and law, book debates, and conference proceedings."],
        ["Journal exchanges", "Exchanging print issues with other journals helps the library build its collections. The JAC is considering an electronic edition so it can continue exchanging issues with online journals."]
      ]
    },
    3: {
      lead: "Follow debates on Egyptian kingship, from royal legitimacy and cosmology to the relationship between kingship and society.",
      evidence: [
        ["Divinity of the pharaoh", "The author presents Frankfort’s and Posener’s differing interpretations of the king’s nature and explains the role of the sources they chose."],
        ["Nonroyal sources", "Administrative papyri from Lahun and elite tombs from the Old Kingdom offer other perspectives on how kingship worked."],
        ["Ka and titulary", "The guide places the reassessment of the royal ka and studies of royal titulary within the history of scholarship on kingship."]
      ],
      aliases: ["cosmology", "El-Lahun"]
    },
    4: {
      lead: "Trace variation in the Pyramid Texts and Coffin Texts, from inscribed witnesses to hieroglyph recognition and 3D models.",
      evidence: [
        ["Comparing textual witnesses", "The initial database covers the 1,185 spells or units of the Coffin Texts, each represented by at least one witness. Many of the texts under study are inscribed inside rectangular wooden coffins."],
        ["Recognizing and encoding hieroglyphs", "The OCR-PT-CT project combines sign detection, annotation checked by Egyptologists, and encoding with the Manuel de Codage. The data is organized by witness and spell."],
        ["Linking variants to their locations", "TM-CT links transliterations and translations to images of the signs and to the locations of the texts on the coffins."],
        ["Reading a coffin as an inscribed object", "T3D builds on the source catalog to study the layout of the texts, the decoration, and the paleography of Middle Kingdom coffins."]
      ]
    },
    5: {
      lead: "Explore interpretations of Egypt in Plato, from his possible journey there to the myths of Theuth and Atlantis.",
      evidence: [
        ["Plato’s journey", "Late accounts and their inconsistencies invite readers to distinguish a possible historical journey from the literary motif of the philosopher educated in Egypt."],
        ["The Phaedrus and the Book of Thoth", "Comparisons with the Demotic Book of Thoth shed light on the story of Theuth and bring two conceptions of writing into conversation."],
        ["Judgment of the dead", "The analysis compares the judgment of souls in the Gorgias with Egyptian depictions of funerary judgment, drawing attention to their differences."]
      ],
      aliases: ["Essential Bibliography on Plato and Egypt", "Greek-Egyptian intercultural exchange", "Maat"]
    },
    6: {
      lead: "Trace American uses of ancient Egypt in the 19th century, from Egyptian Revival architecture to debates on slavery and the figure of Cleopatra.",
      evidence: [
        ["Architecture and mummies", "The guide brings together the role of Egyptian Revival architecture in shaping a national identity and the circulation of mummies in American cultural life."],
        ["Scientific racism and slavery", "The analysis traces how the American school of ethnology invoked ancient Egypt to legitimize racial hierarchy and enslavement."],
        ["African American resistance", "African American intellectuals and preachers drew on ancient Egypt in the struggle against slavery and civic exclusion."],
        ["Reception of Cleopatra", "The queen’s reception in the American press, arts, and activist discourse opens up 19th-century debates about gender and power."]
      ],
      aliases: ["America and the Pharaohs: American Egyptomania in the 19th Century", "polygenism"]
    },
    7: {
      lead: "Build a four-language catalog for the University of Tsukuba’s Egyptology and ancient Near Eastern collections.",
      evidence: [
        ["Scholarly collections brought together in Tsukuba", "The collection holds more than 9,000 volumes. It includes the library of Egyptologist Roberto Gozzoli and collections from cuneiform specialists such as Mamoru Yoshikawa."],
        ["Updating the catalog from Zotero", "Catalog records are entered in Zotero and exported as RDF. The browser normalizes the data and retains fields such as series, edition information, and call number."],
        ["Searching across scripts", "The catalog offers four interfaces, including a right-to-left layout for Arabic. Fuzzy search works alongside field filters and transliteration keyboards."],
        ["From the record to the shelf", "Search results show a call number that users can copy. Periodicals and other works are shelved separately, each group ordered by call number."]
      ],
      aliases: ["online public access catalog", "right-to-left layout"]
    },
    8: {
      lead: "Find Japanese-language works on ancient Egypt and the Near East, especially in the RCWAC collections at Tsukuba.",
      evidence: [
        ["RCWAC collections", "The guide explains how to find works through CiNii Books or the Tsukuba catalog and how to consult them in Japanese collections."],
        ["Okajima’s grammars", "The guide places the Japanese textbooks of ancient Egyptian and Coptic published in 1940 and 1942 in the history of the grammars they draw on."],
        ["Periodicals and collections", "The journal Orient and publications from Waseda University mark milestones in the institutional history of Egyptology and Near Eastern studies in Japan."]
      ]
    },
    9: {
      lead: "How do two diamond open access journals operate, from editorial decisions to the long-term deposit of their publications?",
      evidence: [
        ["Running journals at no cost", "BOMA combines volunteer work, free software, and free platforms to preserve its publications. It publishes Bibliothèque ouverte d’égyptologie and Pratiques et pratiques as diamond open access journals."],
        ["Hosting and indexing", "The journal websites are hosted on GitHub Pages. The article describes early indexing efforts, including work with search engines and the use of specialized directories."],
        ["Preserving PDFs and their source files", "BOMA archives PDFs and production materials, including fonts and images, on Zenodo. It chose the CC BY license to make reuse easier."],
        ["The three sections of Pratiques et pratiques", "The author describes how the journal established its bibliographic guides, its section on libraries and publishing, and its public outreach section, Bridging Ancient Worlds."]
      ]
    },
    10: {
      lead: "Simon Thuault introduces Le Phare à On, his Egyptology YouTube channel, and explains how he uses primary sources to discuss ancient Egypt and respond to misinformation.",
      evidence: [
        ["Le Phare à On", "The channel is intended for students, Egyptology enthusiasts, and anyone curious about the field."],
        ["From primary sources to the script", "The author explains how he works with Egyptian texts, images, and archaeological remains. His first script focuses on Khufu."],
        ["Debunking misleading claims", "The article discusses the difficulties of fact-checking on social media and the effort required to rebut false claims, drawing in part on Brandolini’s law."],
        ["Production time and funding", "The author discusses how long the videos take to produce and the limits of what platforms pay for that work."]
      ],
      aliases: ["public scholarship", "pseudoarchaeology", "fact-checking"]
    },
    11: {
      lead: "In ArchéoSport, players place objects such as a strigil and the Narbonne boxing glove on a timeline, trying out methods used in the archaeology of sport.",
      evidence: [
        ["Strigils and sports equipment", "The strigil introduces the topic of hygiene after exercise. The article also describes weights used in the long jump and disks used for throwing."],
        ["Ancient boxing and the Narbonne glove", "A glove discovered in Narbonne was used as a model to reconstruct ancient boxing equipment and try out the movements."],
        ["Digitizing collections", "Museums supplied scans of the strigil, the glove, and a diamond-point armband so the objects could be 3D printed."],
        ["Twenty-four cards on a timeline", "Players identify objects related to sport, date them, and place them in chronological order."]
      ],
      aliases: ["timeline", "boxing equipment"]
    },
    12: {
      lead: "Alicia Flores Martín uses a year of Science Factory’s YouTube data to examine the roles of interviews and short videos in Egyptology outreach.",
      evidence: [
        ["Science Factory’s first year", "The study covers YouTube audience data from March 2025 to March 2026 and compares several interview and video formats."],
        ["Multilingual subtitling", "The author considers the role of subtitles in sharing interviews in multiple languages with the resources of an independent project."],
        ["Shorts and long-form interviews", "In the channel’s data, Shorts draw viewers in. Longer interviews sustain viewing for longer and generate more comments."],
        ["Professional networks and access to specialists", "The interviews draw on connections made at conferences, on archaeological projects, and through training."]
      ]
    },
    13: {
      lead: "In Lisbon, the TA-MERI exhibition brings Ben Helmink’s paintings together with Egyptological interpretations and AI-generated animations.",
      evidence: [
        ["Ismaili Center in Lisbon", "The October 2024 exhibition combines paintings by Ben Helmink, contributions by José das Candeias Sales, and multimedia work by Vasco Sales."],
        ["Augmented reality and painting", "The exhibition uses artificial intelligence and augmented reality to animate motifs in some paintings and create interactive experiences."],
        ["Cartouches and triptychs", "The motifs discussed include hieroglyphs, royal cartouches, and architecture. The painter uses triptychs to bring together several elements of a single interpretation."]
      ],
      aliases: ["Ismaili Center", "Giza", "Menkaure", "Khafre", "Senusret III", "Ramesses II"]
    },
    14: {
      lead: "In Montpellier, Marie Trezanini works with middle school students on ancient Egyptian poems through writing, rhythm, and multilingual songwriting.",
      evidence: [
        ["Love poetry and religious literature", "The NASHAQ music project draws on the study of Egyptian poetry and takes inspiration from Arab, Turkish, Persian, Greek, Kurdish, and Sephardic musical traditions."],
        ["9/8 meter and maqām Hijāz kār", "The second part of Makha Nak Libi combines a Mediterranean 9/8 meter with a mode from Arabic classical music."],
        ["Hieratic, hieroglyphs, and Coptic", "Students copy signs, write in French, and sing passages translated into ancient Egyptian. The artist draws on Coptic among other evidence to propose a pronunciation."],
        ["Public performance", "Composition and rehearsals lead to performances at schools and for the public through partnerships between schools and cultural venues."]
      ]
    }
  };

  const detours = {
    "8,7": ["Track down a reference & Search in four languages", "Two publications by So Miyagawa explore the same collection in Tsukuba. The guide helps readers find work in Japanese, and the case report explains how the collections became searchable in four languages."],
    "14,11": ["Sing in ancient Egyptian & Date a strigil", "A workshop sets Egyptian poems to music. In ArchéoSport, players date objects on a timeline. Both projects give the public hands-on experience with materials from the past."],
    "5,6": ["Egypt in Plato & Egypt in the American imagination", "Two guides examine the reception of ancient Egypt in Plato and in the 19th-century United States."],
    "2,9": ["Publish in Changchun & Publish open access", "The JAC discusses its choices about circulation and peer review. BOMA describes the resources and editorial decisions behind its diamond open access model."],
    "10,12": ["From the script to YouTube analytics", "Two accounts of Egyptology outreach through video. Le Phare à On explains how scripts are made, and Science Factory examines how different formats reach audiences on YouTube."],
    "13,14": ["Exhibit & Sing", "The TA-MERI exhibition works with Egyptian art. The NASHAQ workshop starts from poetry. Both projects give ancient sources a contemporary form."],
    "4,7": ["From coffins to the Tsukuba shelves", "Two research uses for structured data. MORTEXVAR studies textual variants, and the Tsukuba catalog helps readers locate books and their call numbers."],
    "1,3": ["Ruling Macedonia and Egypt", "Two bibliographic guides open up the study of monarchies, from the Antigonid dynasty in Macedonia to Egyptian kingship and its sources."]
  };

  const display = value => Object.hasOwn(labels, value) ? labels[value] : value;
  window.PRATICIEN_EN = { labels };
  for (const article of catalog.articles) {
    const translated = articles[article.id];
    if (!translated) continue;
    article.aliases.push(article.lead, ...(translated.aliases || []));
    article.lead = translated.lead;
    article.evidence.forEach((entry, index) => {
      const translation = translated.evidence[index];
      if (!translation) return;
      article.aliases.push(entry.label, entry.detail);
      [entry.label, entry.detail] = translation;
    });
    for (const entry of article.bibliography) entry.level = display(entry.level);
  }
  for (const entry of catalog.detours) {
    const translated = detours[entry.ids.join(",")];
    if (translated) [entry.title, entry.reason] = translated;
  }
  for (const word of catalog.words) word.label = display(word.label);
})();
