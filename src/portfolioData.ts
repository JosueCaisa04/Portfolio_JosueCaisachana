export interface Project {
  id: string;
  title: string;
  category: string;
  detailCategory?: string;
  gridSize?: "grande" | "medio" | "stretto";
  mediaType?: "image" | "video";
  mediaUrl?: string;
  videoUrl?: string;
  gallery?: string[];
  role: string;
  software: string[];
  projectWorkNum?: string;
  formatRecommended?: string;
  description: string;
  liveUrl?: string;
}

export interface AIExperiment {
  id: string;
  title: string;
  tag: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
  description: string;
}

export interface ReelWork {
  id: string;
  videoUrl: string;
  startTime?: number;
  fallbackUrl?: string;
  username: string;
  caption: string;
  tags: string;
  likes: string;
  comments: string;
}

export interface PortfolioData {
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  reels: ReelWork[];
  about: {
    title: string;
    paragraphs: string[];
    photos: {
      url: string;
      caption: string;
    }[];
    strengthsTitle: string;
    strengths: {
      title: string;
      description: string;
    }[];
  };
  philosophy: {
    intro: string;
    quote: string;
    subtitle: string;
    author: string;
  };
  projects: Project[];
  aiCreation: {
    title: string;
    subtitle: string;
    experiments: AIExperiment[];
  };
  skills: {
    sectionTitle: string;
    items: Skill[];
  };
  objectives: {
    title: string;
    text: string;
  };
  contacts: {
    title: string;
    subtitle: string;
    ctaWhatsapp: string;
    whatsappNumber: string;
    whatsappMessage: string;
    email: string;
    socials: {
      platform: string;
      handle: string;
      url: string;
    }[];
  };
}

export const portfolioData: PortfolioData = {
  hero: {
    tagline: "GIOVANE CREATIVO & NATIVO DIGITALE",
    title: "Benvenuto nel mio portfolio personale",
    subtitle: "Sono Josue Caisachana ed entro nel mondo del Digital Marketing .",
    ctaPrimary: "Guarda i miei lavori",
    ctaSecondary: "Scrivimi su WhatsApp"
  },
  // Supporta file video locali, link diretti (MP4) o link standard YouTube/Vimeo
  reels: [
    {
      id: "reel-1",
      videoUrl: "https://youtube.com/shorts/ZP43JtpVFKk?feature=share",
      startTime: 10,
      fallbackUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-marketing-specialist-working-on-her-laptop-42345-large.mp4",
      username: "@josue.cais",
      caption: "Università o lavoro vero? All'ITS AMMI lavoriamo su casi, strategie di marketing e progetti reali per aziende d'eccellenza! 🎓💼",
      tags: "#ItsAmmi #DigitalMarketing #Milano",
      likes: "18.4K",
      comments: "421"
    },
    {
      id: "reel-2",
      videoUrl: "https://youtube.com/shorts/An7BEPhf2ss?feature=share",
      startTime: 10,
      fallbackUrl: "https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-showing-a-social-media-feed-41566-large.mp4",
      username: "@josue.cais",
      caption: "Digital Marketing in azione: non solo una materia astratta da studiare, ma un vero lavoro pratico da allenare giorno dopo giorno! 📈⚡",
      tags: "#MarketingStrategy #Pratica #ITS",
      likes: "21.2K",
      comments: "583"
    },
    {
      id: "reel-3",
      videoUrl: "https://youtube.com/shorts/EsEN2pqtg5Q?feature=share",
      startTime: 10,
      fallbackUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-man-holding-smartphone-scrolling-social-media-42417-large.mp4",
      username: "@josue.cais",
      caption: "Brand Identity ed Esposizione: Da Guess a Marilyn Monroe e Coca-Cola. Analizziamo come un'icona diventa emozione pura! 🎨📽️",
      tags: "#BrandDesign #Cinema #MilanoExhb",
      likes: "24.9K",
      comments: "692"
    },
    {
      id: "reel-4",
      videoUrl: "https://youtube.com/shorts/1ZBxC3fMGpw?feature=share",
      startTime: 10,
      fallbackUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-his-laptop-and-smartphone-41589-large.mp4",
      username: "@josue.cais",
      caption: "Zaino in spalla, passione e gioco di squadra. Se vuoi fare la differenza nel mondo digitale con progetti concreti, scegli AMMI! ⚽🏆",
      tags: "#ScegliAmmi #DigitalMarketer #GenZ",
      likes: "29.5K",
      comments: "812"
    }
  ],
  about: {
    title: "01 / Chi Sono",
    paragraphs: [
      "Mi chiamo Josue Caisachana e ho un sacco di energia. Mi piacciono le idee un po' matte e tutto ciò che è dinamico, ed è una cosa che si vede in tutto quello che faccio.",
      "Questa \"pazzia\" la porto prima di tutto sul campo da calcio: gioco da trequartista con il numero 10, dove devi inventare la giocata che nessuno si aspetta in un secondo e far girare la squadra. La stessa carica la cerco nella musica, passando dalla fotta del rap italiano al ritmo del reggaeton, e nel mio modo di viaggiare: zaino in spalla e senza programmi, per il gusto di improvvisare.",
      "Sono una persona trasparente, amo fare squadra e so adattarmi al volo quando le cose cambiano. In questo momento cerco un percorso che mi stimoli davvero, dove alzarmi la mattina con la voglia di imparare e mettermi alla prova. Con la mia mentalità e la mia passione, sono sicuro che troverò la mia strada."
    ],
    photos: [
      {
        url: "https://drive.google.com/file/d/1RNC04GpvnFO6uSpOn4Feb8s1YcezSqZj/view?usp=drive_link",
        caption: "Josue — Digital Marketer & Strategia Creativa"
      },
      {
        url: "https://drive.google.com/file/d/1Y4_0UxFNy1fV1_U_3iE8g0NQQEOW_5Ma/view?usp=drive_link",
        caption: "Analisi e logica — Fondendo numeri con creatività"
      },
      {
        url: "https://drive.google.com/file/d/1tH0cA6X3GA6vrAh29Vg4k54xOgNK5Yfe/view?usp=drive_link",
        caption: "On the Road — Viaggi, calcio e nuove mete"
      },
      {
        url: "https://drive.google.com/file/d/1N0r_yuSnXjLAgNYKkJS8FYRSaXQ_YJX6/view?usp=drive_link",
        caption: "Creatività in azione — Sogni visivi e digital marketing"
      }
    ],
    strengthsTitle: "I miei punti di forza",
    strengths: [
      {
        title: "Mentalità ",
        description: " imparo alla velocità della luce adattandomi ai trend in tempo reale."
      },
      {
        title: "Orientamento al Risultato",
        description: "Non mi fermo finché il contenuto visivo prodotto non genera una reale conversione o reazione."
      },
      {
        title: "AI Workflows",
        description: "Uso del Prompt Engineering ed ecosistemi come Midjourney o Runway per moltiplicare il ritmo produttivo."
      }
    ]
  },
  philosophy: {
    intro: "Nel Digital Marketing, questa frase per me significa una cosa sola: prendere un'idea creativa astratta, un trend o una visione e trasformarli in contenuti reali, visivi, capaci di connettersi con le persone e posizionare un brand.",
    quote: "Se abbiamo il potere di sognarlo, abbiamo anche il potere di renderlo realtà.",
    subtitle: "Sogni Visivi Tradotti in Realtà.",
    author: "Josue Caisachana"
  },
  projects: [
    {
      id: "vans-instagram",
      title: "VANS – \"OFF THE WALL\" | INSTAGRAM CAMPAIGN CONCEPT",
      category: "Grafica",
      detailCategory: "PROGETTO GRAFICO",
      gridSize: "grande",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/102U6iuQPkEXw_6Ac6okkcgFKQnHLdO55/view?usp=drive_link",
      gallery: ["https://drive.google.com/file/d/102U6iuQPkEXw_6Ac6okkcgFKQnHLdO55/view?usp=drive_link"],
      role: "Creative Concept & Graphic Design",
      software: ["Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #1",
      formatRecommended: "Post Instagram 1080×1350 px",
      description: "Progetto accademico di Graphic Design. Realizzazione di un concept per un post Instagram dedicato alla campagna \"Urban Classics\" di Vans, con l'obiettivo di valorizzare il modello Old Skool attraverso il concept \"La città è la tua tela\". Il lavoro prevedeva lo scontorno della scarpa, l'integrazione in un contesto urbano, l'armonizzazione di colori e luci tramite color grading e la progettazione di una gerarchia visiva efficace, con il claim \"OFF THE WALL\" come elemento principale e il logo Vans a supporto del visual. L'obiettivo era realizzare un'immagine dinamica e credibile attraverso techniques di photo compositing, tipografia e composizione grafica."
    },
    {
      id: "coca-jack-acmilan",
      title: "COCA-COLA X JACK DANIEL'S X AC MILAN | 3D PACKAGING & SOCIAL CAMPAIGN",
      category: "Multimediale",
      detailCategory: "PROGETTO MULTIMEDIALE",
      gridSize: "grande",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/11VxW1aOp7GhDnCLyrY37t7GIo89fGtjj/view?usp=drive_link",
      gallery: ["https://drive.google.com/file/d/11VxW1aOp7GhDnCLyrY37t7GIo89fGtjj/view?usp=drive_link"],
      role: "3D Modeling & Visual Compositing",
      software: ["Adobe InDesign", "Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #2",
      formatRecommended: "Modello 3D / Immagine",
      description: "Progetto accademico di Graphic Design. Realizzazione di un concept di packaging 3D e della relativa comunicazione social, con totale libertà nella scelta del prodotto e della collaborazione con un brand. Ho progettato una lattina 3D partendo da una semplice immagine bidimensionale della confezione, ricostruendola interamente tramite gli strumenti 3D ed esportandola successivamente per la post-produzione. Per il concept ho scelto la collaborazione tra Coca-Cola e Jack Daniel's, sviluppando poi una campagna Instagram immaginaria in partnership con AC Milan, guidato dalla coerenza cromatica tra il brand calcistico e la palette della lattina. Il progetto ha permesso di approfondire la progettazione di packaging 3D, il photo compositing, contenuti social e brand identity."
    },
    {
      id: "jagermeister-campaign",
      title: "JÄGERMEISTER | INSTAGRAM SOCIAL CAMPAIGN CONCEPT",
      category: "AI Tech",
      detailCategory: "PROGETTO AI TECH",
      gridSize: "medio",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/13qpAGrdwIhkWsPAKmcLRHTzGDHM5M51z/view?usp=drive_link",
      gallery: ["https://drive.google.com/file/d/13qpAGrdwIhkWsPAKmcLRHTzGDHM5M51z/view?usp=drive_link"],
      role: "AI Prompting & Post-Production",
      software: ["Flow (IA)", "Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #3",
      formatRecommended: "Immagine",
      description: "Progetto accademico di Social Media Marketing. Realizzazione di un concept per un post Instagram dedicato a Jägermeister, con l'obiettivo di sviluppare un contenuto coerente con l'identità, lo stile comunicativo e lo storytelling del marchio. Ho ideato un visual in linea con il tone of voice del brand: la bottiglia e l'immagine principale sono state generate con l'Intelligenza Artificiale, mentre tutta la phase di post-produzione (colori, illuminazione, tipografia e dettagli grafici) è stata curata per ottenere una composizione coerente e d'impatto."
    },
    {
      id: "acmilan-carousel",
      title: "AC MILAN SOCIAL CAMPAIGN | INSTAGRAM CAROUSEL CONCEPT",
      category: "Grafica",
      detailCategory: "PROGETTO GRAFICO",
      gridSize: "medio",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/1vrOigsecHobvtRPKD1XXfvYH2vJMTkkV/view?usp=drive_link",
      gallery: [
        "https://drive.google.com/file/d/1vrOigsecHobvtRPKD1XXfvYH2vJMTkkV/view?usp=drive_link",
        "https://drive.google.com/file/d/1FDnQHgwXyaWAo2JKzcIFaQxJ_ztiHfHR/view?usp=drive_link",
        "https://drive.google.com/file/d/1XM0NSyZMr54oKgDt1nkC5FgVfxMw1Xwn/view?usp=drive_link",
        "https://drive.google.com/file/d/1uIJTr3W19t5vRpx055DRkzJ_oYNi2tkC/view?usp=drive_link",
        "https://drive.google.com/file/d/1sHlCuUhXeO7BmKjVuMJgFk08iGz-FDBg/view?usp=drive_link",
        "https://drive.google.com/file/d/1v3MdBUobV1PJUef7E7KDjkrsZPWevH0N/view?usp=drive_link",
        "https://drive.google.com/file/d/1OclFXjOVvKxpUv1hM70t2xm3D2Yk7qPW/view?usp=drive_link"
      ],
      role: "Content Strategy & Layout Design",
      software: ["Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #4",
      formatRecommended: "Immagine (Carosello Verticale 1080×1350 px)",
      description: "Progetto accademico di Social Media Marketing. Realizzazione di un concept per un post Instagram come caso studio per sviluppare una strategia di comunicazione social. Ho progettato un carosello Instagram strutturato con una sequenza narrativa composta da una slide iniziale d'impatto, una parte centrale dedicata allo storytelling e una conclusione con una Call To Action per favorire l'interazione della community."
    },
    {
      id: "vlog-fiera",
      title: "VLOG FIERA MILANO RHO | INSTAGRAM REEL",
      category: "Multimediale",
      detailCategory: "PROGETTO MULTIMEDIALE",
      gridSize: "grande",
      mediaType: "video",
      mediaUrl: "https://drive.google.com/file/d/1OEiiymAFSCell9YSFw34q6GIzMYQXfME/view?usp=drive_link",
      videoUrl: "https://youtube.com/shorts/ZP43JtpVFKk?feature=share",
      role: "Video Making & Editing",
      software: ["CapCut"],
      projectWorkNum: "PROJECT WORK #5",
      formatRecommended: "Video (Formato Verticale)",
      description: "Progetto accademico di Contenuti per i Social. Produzione di un Reel in stile vlog ambientato presso Fiera Milano Rho per raccontare l'esperienza in modo dinamico e coinvolgente. Ho curato l'ideazione del format, le riprese e il montaggio del video con l'obiettivo di creare un contenuto ottimizzato per i social, capace di catturare l'attenzione attraverso uno storytelling autentico e un ritmo coinvolgente, pensato per valorizzare la location e favorire il coinvolgimento del pubblico."
    },
    {
      id: "its-vs-universita",
      title: "ITS VS UNIVERSITÀ | INSTAGRAM REEL",
      category: "Multimediale",
      detailCategory: "PROGETTO MULTIMEDIALE",
      gridSize: "grande",
      mediaType: "video",
      mediaUrl: "https://drive.google.com/file/d/1cgYPNfcEDx-cI-7cEB0iumcekqYbvlZ7/view?usp=drive_link",
      videoUrl: "https://youtube.com/shorts/1ZBxC3fMGpw?si=uOMCOHCNnMeOMWW-",
      role: "Creative Concept & Social Editing",
      software: ["Adobe Premiere Pro"],
      projectWorkNum: "PROJECT WORK #6",
      formatRecommended: "Video (Formato Verticale)",
      description: "Progetto realizzato per il corso di Contenuti per i Social. Produzione di un Reel incentrato sul confronto tra il percorso ITS e quello universitario, scelto per raccontare in modo chiaro e coinvolgente la mia esperienza attuale. Ho ideato il concept e realizzato l'intero processo di produzione del video, occupandomi personalmente delle riprese, del montaggio e dell'editing completo, creando un ritmo dinamico e uno stile pensato per catturare l'attenzione sui social."
    },
    {
      id: "marilyn-coca",
      title: "MARILYN MONROE X COCA-COLA | SOCIAL POST CONCEPT",
      category: "Multimediale",
      detailCategory: "PROGETTO MULTIMEDIALE",
      gridSize: "grande",
      mediaType: "video",
      mediaUrl: "https://drive.google.com/file/d/1yZheJkcoDpPDcPW7-xw-CTzfq8IHX4tq/view?usp=drive_link",
      videoUrl: "https://youtube.com/shorts/An7BEPhf2ss?feature=share",
      role: "Graphic Design & Branding",
      software: ["Canva"],
      projectWorkNum: "PROJECT WORK #7",
      formatRecommended: "Video (Formato Verticale)",
      description: "Progetto realizzato per il corso di Contenuti per i Social. Creazione di un contenuto ispirato alla mostra dedicata a Marilyn Monroe a Milano. L'obiettivo era sviluppare un visual capace di promuovere il brand Coca-Cola utilizzando il linguaggio e l'immaginario dell'artista attraverso il testo e la comunicazione visiva, ponendo attenzione alla coerenza tra messaggio, identità del brand e stile comunicativo."
    },
    {
      id: "instagram-concept-brand",
      title: "INSTAGRAM POST CONCEPT | BRAND COMMUNICATION",
      category: "Social",
      detailCategory: "PROGETTO SOCIAL",
      gridSize: "stretto",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/1N3ECXGyWEdtVtv5V55cVveAb8x9ZBLYo/view?usp=drive_link",
      gallery: [
        "https://drive.google.com/file/d/1N3ECXGyWEdtVtv5V55cVveAb8x9ZBLYo/view?usp=drive_link",
        "https://drive.google.com/file/d/1qJrV-dAgxZENmC4xdy2WbxlBXWHUrWjr/view?usp=drive_link"
      ],
      role: "Visual Design",
      software: ["Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #8",
      formatRecommended: "Immagine",
      description: "Progetto realizzato per il corso di Social Media Marketing. Creazione di un post Instagram partendo dalla scelta casuale di un oggetto, successivamente associato a un brand per sviluppare un contenuto coerente con la sua identità e strategia comunicativa. Ho curato l'ideazione del concept, la definizione del messaggio e la progettazione grafica, curando composizione, tipografia e coerenza visiva.\n\n🔗 Link ai Brief Assegnati:\n• Brief 1: https://drive.google.com/file/d/1N3ECXGyWEdtVtv5V55cVveAb8x9ZBLYo/view?usp=drive_link\n• Brief 2: https://drive.google.com/file/d/1qJrV-dAgxZENmC4xdy2WbxlBXWHUrWjr/view?usp=drive_link"
    },
    {
      id: "quindici-studio",
      title: "QUINDICI STUDIO MILANO | INSTAGRAM POST CONCEPT",
      category: "Social",
      detailCategory: "PROGETTO SOCIAL",
      gridSize: "medio",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/1rCT-pqZCbh4pYPyy_2hYFd4j4h7wmAFH/view?usp=drive_link",
      gallery: [
        "https://drive.google.com/file/d/1rCT-pqZCbh4pYPyy_2hYFd4j4h7wmAFH/view?usp=drive_link",
        "https://drive.google.com/file/d/16MauUpONtrXupBG-ses_NWj7UD49PQGn/view?usp=drive_link"
      ],
      role: "Visual & Event Launch Concept",
      software: ["Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #9",
      formatRecommended: "Immagine",
      description: "Progetto realizzato per il corso di Social Media Marketing, nato da un brief di Quindici Studio Milano che prevedeva la creazione di un post Instagram partendo da un oggetto assegnato. Concept sviluppato a partire da un disco della band XYQuarter, trasformandolo in un contenuto creativo. Il post è stato strutturato come annuncio dell’uscita del loro nuovo album in un luogo e orario immaginari, simulando una comunicazione reale di lancio evento.\n\n🔗 Link ai Brief Assegnati:\n• Brief 1: https://drive.google.com/file/d/1rCT-pqZCbh4pYPyy_2hYFd4j4h7wmAFH/view?usp=drive_link\n• Brief 2: https://drive.google.com/file/d/16MauUpONtrXupBG-ses_NWj7UD49PQGn/view?usp=drive_link"
    },
    {
      id: "ai-startup-chatbot",
      title: "AI STARTUP PROJECT | VOICE CHATBOT",
      category: "AI Tech",
      detailCategory: "PROGETTO AI TECH",
      gridSize: "grande",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/1kBGvz_Q_kPSHjbxlhfq30kf4kyowNBg4/view?usp=drive_link",
      gallery: ["https://drive.google.com/file/d/1kBGvz_Q_kPSHjbxlhfq30kf4kyowNBg4/view?usp=drive_link"],
      liveUrl: "https://yieldops.lovable.app/",
      role: "AI Research & Prototyping",
      software: ["Gemini Pro", "NotebookLM", "ElevenLabs"],
      projectWorkNum: "PROJECT WORK #10",
      formatRecommended: "Elemento Interattivo / Immagine Prototipo",
      description: "Progetto realizzato per il corso di Uso della IA. Creazione di un’idea di startup sviluppata in gruppo attraverso strumenti di intelligenza artificiale. Dopo una fase iniziale di ricerca, raccolta e organizzazione delle informazioni supportata da tool dedicati, il concept è stato trasformato in un prototipo digitale. Il progetto ha previsto inoltre la realizzazione di un chatbot vocale interattivo che consente agli utenti di comunicare direttamente tramite voce, integrando l'IA lungo tutto il processo."
    },
    {
      id: "creative-practice",
      title: "CREATIVE PRACTICE | SOCIAL MOCKUPS & VISUAL EXPERIMENTS",
      category: "Grafica",
      detailCategory: "PROGETTO GRAFICO",
      gridSize: "stretto",
      mediaType: "image",
      mediaUrl: "https://drive.google.com/file/d/1rHLKfcg6qUKrbNFcuOb4Jra6K7iHbcmn/view?usp=drive_link",
      gallery: [
        "https://drive.google.com/file/d/1rHLKfcg6qUKrbNFcuOb4Jra6K7iHbcmn/view?usp=drive_link",
        "https://drive.google.com/file/d/1OGU7Im0POouRNHnzOn_0VTz3EmPa-O4w/view?usp=drive_link",
        "https://drive.google.com/file/d/1nXK5RZ7eAnElzDtRIFA7WHx3DreFGhzb/view?usp=drive_link"
      ],
      role: "Personal Experimentation & Splicing",
      software: ["Adobe Photoshop"],
      projectWorkNum: "PROJECT WORK #11",
      formatRecommended: "Galleria Immagini / Mockup",
      description: "Attività nata come esercizio personale di sperimentazione creativa per testare strumenti e linguaggi del visual design e migliorare le mie competenze. Ho realizzato una serie di post simulati ispirati a figure del mondo musicale e sportivo (Kid Yugi, Luchè, Neymar). Ogni contenuto è stato progettato come un vero post social, curando composizione, tipografia e impatto visivo per sviluppare maggiore dimestichezza con la comunicazione digitale."
    }
  ],
  aiCreation: {
    title: "Dall'immaginazione all'immagine.",
    subtitle: "Spingo i confini del videomaking tradizionale fondendo riprese reali ad alto contrasto con l'infinito potenziale dell''Intelligenza Artificiale generativa. Un ponte tra intenzione artistica e sogno lucido.",
    experiments: [
      {
        id: "exp-1",
        title: "The Neon Samurai",
        tag: "Concept Art / Midjourney",
        description: "Un'ambientazione sci-fi e cyberpunk che declina l'antico onore feudale nella cornice di una futuristica Milano sotterranea."
      },
      {
        id: "exp-2",
        title: "Fluid Dreams",
        tag: "Generative Video / Runway",
        description: "Un viaggio onirico in cui elementi fisici si decompongono e si ricreano a tempo di un sound sintetizzato analogicamente."
      },
      {
        id: "exp-3",
        title: "Echoes of Tomorrow",
        tag: "AI Storytelling / Synthesizer",
        description: "Breve cortometraggio interamente pre-visualizzato e orchestrato legando intelligenze artificiali generative a scenografie digitali."
      },
      {
        id: "exp-4",
        title: "Cybernetic Oasis",
        tag: "Matte Painting AI",
        description: "Fusione di elementi vegetali iper-realistici e architettura brutalista futuristica generata per overlay di livello."
      },
      {
        id: "exp-5",
        title: "Chroma Shift",
        tag: "Style Transfer Video",
        description: "Video esportato e reinterpretato fotogramma per fotogramma attraverso l'ausilio di texture pittoriche generative."
      },
      {
        id: "exp-6",
        title: "Sport of Infinity",
        tag: "Upscale / Details Synthesis",
        description: "Miglioramento ed espansione di frame sportivi storici tramite algoritmi predittivi e reinvenzione dei dettagli a bordo campo."
      },
      {
        id: "exp-7",
        title: "Meta-Milano",
        tag: "Synthetic Photography",
        description: "Viste aeree surreali del quartiere di Rho reinterpretate digitalmente per mostrare una città fluttuante nel cielo lombardo."
      },
      {
        id: "exp-8",
        title: "Sound of Artificial Voices",
        tag: "Voice & Music Generation",
        description: "Narrazione vocale generata sinteticamente per accompagnare video cinematografici, simulando un documentario d'autore."
      }
    ]
  },
  skills: {
    sectionTitle: "Il mio arsenale creativo.",
    items: [
      {
        id: "sk-premiere",
        name: "Adobe Premiere Pro",
        level: "Focus: Montaggio Cinematografico",
        description: "Lo standard professionale per i progetti principali su schermo panoramico: Travel e Sport."
      },
      {
        id: "sk-capcut",
        name: "CapCut Pro",
        level: "Focus: Social Trends & Speed",
        description: "Utilizzato strategicamente per dominare l'estetica frenetica di TikTok, Shorts e Reels."
      },
      {
        id: "sk-photoshop",
        name: "Adobe Photoshop",
        level: "Focus: Visual Art",
        description: "Fondamentale per la rifinitura dei frame e la manipolazione di texture prima del montaggio."
      },
      {
        id: "sk-ai-tools",
        name: "AI Prompting & Generation",
        level: "Focus: Midjourney / Runway",
        description: "Integrazione di intelligenza artificiale per creare asset visivi e sbloccare idee non riproducibili dal vivo."
      }
    ]
  },
  objectives: {
    title: "04 / Sempre in crescita",
    text: "Gestisco la produzione di contenuti con Premiere e Photoshop, domino CapCut per l'agilità dei trend verticali e uso il Prompt Engineering per generare visual con l'IA. Ma la mia skill più grande è la dedizione. Sto cercando la mia prossima sfida: uno stage o una collaborazione junior in un'agenzia di comunicazione, in un team di marketing o in una startup a Milano. Offro tutta la mia flessibilità e fame di fare in cambio di un posto in squadra dove poter rubare i segreti del mestiere dai professionisti del settore."
  },
  contacts: {
    title: "Creiamo qualcosa di straordinario insieme.",
    subtitle: "Sei un'agenzia, un Social Media Manager che cerca supporto o un brand in crescita? Se hai un progetto in mente o cerchi energia junior nel tuo team, parliamone.",
    ctaWhatsapp: "Parliamone su WhatsApp 💬",
    whatsappNumber: "393454690373",
    whatsappMessage: "Ciao Josue! Ho visto il tuo fantastico portfolio e la tua palestra digitale. Vorrei fare due chiacchiere per conoscerci!",
    email: "jeremyjosue334@gmail.com",
    socials: [
      {
        platform: "Instagram",
        handle: "@josue.cais",
        url: "https://instagram.com"
      },
      {
        platform: "TikTok",
        handle: "@josue_cais",
        url: "https://tiktok.com"
      },
      {
        platform: "YouTube",
        handle: "Josue Caisachana Creative",
        url: "https://youtube.com"
      }
    ]
  }
};
