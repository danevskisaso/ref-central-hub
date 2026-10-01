/* ============================================================
   REF CENTRAL HUB — Internationalization
   Translates the navigation shell, page headers and primary actions.
   Deep form/table content stays English for now — see project notes.
   ============================================================ */

var REFCH_LANG_KEY = 'refch_lang';

var LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' }
];

var TRANSLATIONS = {
  en: {
    grp_overview: 'Overview', grp_performance: 'Performance', grp_planning: 'Planning', grp_intelligence: 'Intelligence', grp_admin: 'Admin',
    nav_dashboard: 'Dashboard', nav_referees: 'Referees', nav_training: 'Training', nav_drills: 'Drills', nav_match_analysis: 'Match Analysis',
    nav_training_analysis: 'Training Analysis', nav_onfield_review: 'On-Field Review', nav_fitness_tests: 'Fitness Tests',
    nav_screening: 'Screening', nav_recommendations: 'Recommendations', nav_training_programmes: 'Training Programmes',
    nav_calendar: 'Calendar', nav_communication: 'Communication', nav_documents: 'Documents', nav_reports: 'Reports',
    nav_analytics: 'Analytics', nav_signals_alerts: 'Signals & Alerts', nav_education: 'Education',
    nav_user_management: 'User Management', nav_settings: 'Settings',
    label_international_referee: 'International Referee', label_refereeing_officer: 'Refereeing Officer',
    search_placeholder_default: 'Search referees, matches, reports…', search_placeholder_documents: 'Search documents…', search_placeholder_organizations: 'Search organizations…',
    title_calendar: 'Calendar', title_messages: 'Messages', title_notifications: 'Notifications', title_help: 'Help',
    page_dashboard_title: 'Welcome to Ref Central Hub', page_dashboard_sub: 'Performance intelligence for modern refereeing.',
    page_referees_title: 'Referee Database', page_referees_sub: 'Search, filter and manage every referee in your ecosystem.',
    page_organizations_title: 'Organizations & Roles', page_organizations_sub: 'Manage organizations and decide which referee belongs to which organization, and in what role.',
    page_fitness_title: 'Fitness Tests', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, aerobic and custom protocols — one results log.',
    page_screening_title: 'Performance & Injury Screening', page_screening_sub: 'Anthropometrics, VALD system results (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) and body map status.',
    page_calendar_title: 'Calendar', page_calendar_sub: "Every match, training topic, fitness assessment and screening — tagged with the referee's name.",
    page_communication_title: 'Communication', page_communication_sub: 'Message all referees, a whole organization, a specific role, or one person — with a full send log.',
    page_documents_title: 'Documents', page_documents_sub: 'Upload PDF, JPEG, Excel or Word files and choose exactly who can see them — or publish to the general library for everyone.',
    page_training_analysis_title: 'Training Analysis', page_training_analysis_sub: 'Eleven-metric monthly evaluation — consistency, load, HR intensity distribution, recovery balance and more.',
    page_settings_title: 'Settings', page_settings_sub: 'Integrations, personal preferences, organization and security.',
    btn_new_report: 'New Report', btn_add_referee: 'Add Referee', btn_add_organization: 'Add Organization', btn_add_result: 'Add Result',
    btn_add_screening_result: 'Add Screening Result', btn_add_event: 'Add Event', btn_upload_share: 'Upload & Share', btn_log_session: 'Log Training Session',
    page_drills_title: 'Drills', page_drills_sub: 'Design professional referee drills on a pitch canvas, or generate a training proposal from intensity and distance.',
    btn_generate_training: 'Generate Training', btn_create_drill: 'Create new drill', modal_create_drill: 'Create new drill', modal_generator: 'Training Generator'
  },
  es: {
    grp_overview: 'Resumen', grp_performance: 'Rendimiento', grp_planning: 'Planificación', grp_intelligence: 'Inteligencia', grp_admin: 'Administración',
    nav_dashboard: 'Panel', nav_referees: 'Árbitros', nav_training: 'Entrenamiento', nav_drills: 'Ejercicios', nav_match_analysis: 'Análisis de Partido',
    nav_training_analysis: 'Análisis de Entrenamiento', nav_onfield_review: 'Revisión en Campo', nav_fitness_tests: 'Pruebas Físicas',
    nav_screening: 'Evaluación Médica', nav_recommendations: 'Recomendaciones', nav_training_programmes: 'Programas de Entrenamiento',
    nav_calendar: 'Calendario', nav_communication: 'Comunicación', nav_documents: 'Documentos', nav_reports: 'Informes',
    nav_analytics: 'Analítica', nav_signals_alerts: 'Señales y Alertas', nav_education: 'Formación',
    nav_user_management: 'Gestión de Usuarios', nav_settings: 'Configuración',
    label_international_referee: 'Árbitro Internacional', label_refereeing_officer: 'Oficial de Arbitraje',
    search_placeholder_default: 'Buscar árbitros, partidos, informes…', search_placeholder_documents: 'Buscar documentos…', search_placeholder_organizations: 'Buscar organizaciones…',
    title_calendar: 'Calendario', title_messages: 'Mensajes', title_notifications: 'Notificaciones', title_help: 'Ayuda',
    page_dashboard_title: 'Bienvenido a Ref Central Hub', page_dashboard_sub: 'Inteligencia de rendimiento para el arbitraje moderno.',
    page_referees_title: 'Base de Datos de Árbitros', page_referees_sub: 'Busca, filtra y gestiona a todos los árbitros de tu ecosistema.',
    page_organizations_title: 'Organizaciones y Roles', page_organizations_sub: 'Gestiona las organizaciones y decide qué árbitro pertenece a cada organización, y en qué rol.',
    page_fitness_title: 'Pruebas Físicas', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, protocolos aeróbicos y personalizados — un único registro de resultados.',
    page_screening_title: 'Evaluación de Rendimiento y Lesiones', page_screening_sub: 'Antropometría, resultados de sistemas VALD (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) y mapa corporal.',
    page_calendar_title: 'Calendario', page_calendar_sub: 'Cada partido, sesión de entrenamiento, prueba física y evaluación — con el nombre del árbitro.',
    page_communication_title: 'Comunicación', page_communication_sub: 'Envía mensajes a todos los árbitros, a una organización, a un rol específico o a una persona — con un registro completo de envíos.',
    page_documents_title: 'Documentos', page_documents_sub: 'Sube archivos PDF, JPEG, Excel o Word y elige exactamente quién puede verlos — o publícalos en la biblioteca general para todos.',
    page_training_analysis_title: 'Análisis de Entrenamiento', page_training_analysis_sub: 'Evaluación mensual de once métricas — consistencia, carga, distribución de intensidad de FC, equilibrio de recuperación y más.',
    page_settings_title: 'Configuración', page_settings_sub: 'Integraciones, preferencias personales, organización y seguridad.',
    btn_new_report: 'Nuevo Informe', btn_add_referee: 'Añadir Árbitro', btn_add_organization: 'Añadir Organización', btn_add_result: 'Añadir Resultado',
    btn_add_screening_result: 'Añadir Resultado de Evaluación', btn_add_event: 'Añadir Evento', btn_upload_share: 'Subir y Compartir', btn_log_session: 'Registrar Sesión de Entrenamiento',
    page_drills_title: 'Ejercicios', page_drills_sub: 'Diseña ejercicios profesionales para árbitros sobre un campo, o genera una propuesta de entrenamiento a partir de la intensidad y la distancia.',
    btn_generate_training: 'Generar Entrenamiento', btn_create_drill: 'Crear nuevo ejercicio', modal_create_drill: 'Crear nuevo ejercicio', modal_generator: 'Generador de Entrenamientos'
  },
  de: {
    grp_overview: 'Übersicht', grp_performance: 'Leistung', grp_planning: 'Planung', grp_intelligence: 'Analyse', grp_admin: 'Verwaltung',
    nav_dashboard: 'Dashboard', nav_referees: 'Schiedsrichter', nav_training: 'Training', nav_drills: 'Übungen', nav_match_analysis: 'Spielanalyse',
    nav_training_analysis: 'Trainingsanalyse', nav_onfield_review: 'Platzbegehung', nav_fitness_tests: 'Fitnesstests',
    nav_screening: 'Screening', nav_recommendations: 'Empfehlungen', nav_training_programmes: 'Trainingsprogramme',
    nav_calendar: 'Kalender', nav_communication: 'Kommunikation', nav_documents: 'Dokumente', nav_reports: 'Berichte',
    nav_analytics: 'Analytik', nav_signals_alerts: 'Signale & Warnungen', nav_education: 'Weiterbildung',
    nav_user_management: 'Benutzerverwaltung', nav_settings: 'Einstellungen',
    label_international_referee: 'Internationaler Schiedsrichter', label_refereeing_officer: 'Schiedsrichter-Beauftragter',
    search_placeholder_default: 'Schiedsrichter, Spiele, Berichte suchen…', search_placeholder_documents: 'Dokumente suchen…', search_placeholder_organizations: 'Organisationen suchen…',
    title_calendar: 'Kalender', title_messages: 'Nachrichten', title_notifications: 'Benachrichtigungen', title_help: 'Hilfe',
    page_dashboard_title: 'Willkommen bei Ref Central Hub', page_dashboard_sub: 'Leistungsdaten für modernes Schiedsrichterwesen.',
    page_referees_title: 'Schiedsrichter-Datenbank', page_referees_sub: 'Suchen, filtern und verwalten Sie alle Schiedsrichter Ihres Systems.',
    page_organizations_title: 'Organisationen & Rollen', page_organizations_sub: 'Verwalten Sie Organisationen und legen Sie fest, welcher Schiedsrichter zu welcher Organisation gehört und in welcher Rolle.',
    page_fitness_title: 'Fitnesstests', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, Sprint, aerobe und individuelle Protokolle — ein zentrales Ergebnisprotokoll.',
    page_screening_title: 'Leistungs- und Verletzungs-Screening', page_screening_sub: 'Anthropometrie, VALD-Systemergebnisse (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) und Körperstatus-Karte.',
    page_calendar_title: 'Kalender', page_calendar_sub: 'Jedes Spiel, Trainingsthema, Fitnesstest und Screening — versehen mit dem Namen des Schiedsrichters.',
    page_communication_title: 'Kommunikation', page_communication_sub: 'Nachrichten an alle Schiedsrichter, eine ganze Organisation, eine bestimmte Rolle oder eine einzelne Person senden — mit vollständigem Sendeprotokoll.',
    page_documents_title: 'Dokumente', page_documents_sub: 'PDF-, JPEG-, Excel- oder Word-Dateien hochladen und genau festlegen, wer sie sehen darf — oder in der allgemeinen Bibliothek für alle veröffentlichen.',
    page_training_analysis_title: 'Trainingsanalyse', page_training_analysis_sub: 'Monatliche Auswertung anhand von elf Kennzahlen — Konstanz, Belastung, HF-Intensitätsverteilung, Erholungsbalance und mehr.',
    page_settings_title: 'Einstellungen', page_settings_sub: 'Integrationen, persönliche Einstellungen, Organisation und Sicherheit.',
    btn_new_report: 'Neuer Bericht', btn_add_referee: 'Schiedsrichter hinzufügen', btn_add_organization: 'Organisation hinzufügen', btn_add_result: 'Ergebnis hinzufügen',
    btn_add_screening_result: 'Screening-Ergebnis hinzufügen', btn_add_event: 'Termin hinzufügen', btn_upload_share: 'Hochladen & Teilen', btn_log_session: 'Trainingseinheit erfassen',
    page_drills_title: 'Übungen', page_drills_sub: 'Entwerfen Sie professionelle Schiedsrichterübungen auf einem Spielfeld-Canvas oder erstellen Sie einen Trainingsvorschlag aus Intensität und Distanz.',
    btn_generate_training: 'Training generieren', btn_create_drill: 'Neue Übung erstellen', modal_create_drill: 'Neue Übung erstellen', modal_generator: 'Trainingsgenerator'
  },
  fr: {
    grp_overview: 'Aperçu', grp_performance: 'Performance', grp_planning: 'Planification', grp_intelligence: 'Intelligence', grp_admin: 'Administration',
    nav_dashboard: 'Tableau de bord', nav_referees: 'Arbitres', nav_training: 'Entraînement', nav_drills: 'Exercices', nav_match_analysis: 'Analyse de Match',
    nav_training_analysis: "Analyse d'Entraînement", nav_onfield_review: 'Revue sur le Terrain', nav_fitness_tests: 'Tests Physiques',
    nav_screening: 'Dépistage', nav_recommendations: 'Recommandations', nav_training_programmes: "Programmes d'Entraînement",
    nav_calendar: 'Calendrier', nav_communication: 'Communication', nav_documents: 'Documents', nav_reports: 'Rapports',
    nav_analytics: 'Analytique', nav_signals_alerts: 'Signaux et Alertes', nav_education: 'Formation',
    nav_user_management: 'Gestion des Utilisateurs', nav_settings: 'Paramètres',
    label_international_referee: 'Arbitre International', label_refereeing_officer: "Responsable de l'Arbitrage",
    search_placeholder_default: 'Rechercher arbitres, matchs, rapports…', search_placeholder_documents: 'Rechercher des documents…', search_placeholder_organizations: 'Rechercher des organisations…',
    title_calendar: 'Calendrier', title_messages: 'Messages', title_notifications: 'Notifications', title_help: 'Aide',
    page_dashboard_title: 'Bienvenue sur Ref Central Hub', page_dashboard_sub: "L'intelligence de la performance au service de l'arbitrage moderne.",
    page_referees_title: 'Base de Données des Arbitres', page_referees_sub: 'Recherchez, filtrez et gérez tous les arbitres de votre écosystème.',
    page_organizations_title: 'Organisations et Rôles', page_organizations_sub: 'Gérez les organisations et décidez quel arbitre appartient à quelle organisation, et selon quel rôle.',
    page_fitness_title: 'Tests Physiques', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, protocoles aérobies et personnalisés — un seul journal de résultats.',
    page_screening_title: 'Dépistage de la Performance et des Blessures', page_screening_sub: 'Anthropométrie, résultats des systèmes VALD (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) et carte corporelle.',
    page_calendar_title: 'Calendrier', page_calendar_sub: "Chaque match, thème d'entraînement, test physique et dépistage — associé au nom de l'arbitre.",
    page_communication_title: 'Communication', page_communication_sub: 'Envoyez un message à tous les arbitres, à une organisation entière, à un rôle spécifique ou à une personne — avec un journal d\'envoi complet.',
    page_documents_title: 'Documents', page_documents_sub: 'Téléversez des fichiers PDF, JPEG, Excel ou Word et choisissez exactement qui peut les voir — ou publiez-les dans la bibliothèque générale pour tous.',
    page_training_analysis_title: "Analyse d'Entraînement", page_training_analysis_sub: "Évaluation mensuelle en onze indicateurs — régularité, charge, répartition de l'intensité cardiaque, équilibre de récupération et plus encore.",
    page_settings_title: 'Paramètres', page_settings_sub: 'Intégrations, préférences personnelles, organisation et sécurité.',
    btn_new_report: 'Nouveau Rapport', btn_add_referee: 'Ajouter un Arbitre', btn_add_organization: 'Ajouter une Organisation', btn_add_result: 'Ajouter un Résultat',
    btn_add_screening_result: 'Ajouter un Résultat de Dépistage', btn_add_event: 'Ajouter un Événement', btn_upload_share: 'Téléverser et Partager', btn_log_session: 'Enregistrer une Séance',
    page_drills_title: 'Exercices', page_drills_sub: "Concevez des exercices professionnels pour arbitres sur un terrain, ou générez une proposition d'entraînement à partir de l'intensité et de la distance.",
    btn_generate_training: 'Générer un Entraînement', btn_create_drill: 'Créer un nouvel exercice', modal_create_drill: 'Créer un nouvel exercice', modal_generator: "Générateur d'Entraînement"
  },
  pt: {
    grp_overview: 'Visão Geral', grp_performance: 'Desempenho', grp_planning: 'Planeamento', grp_intelligence: 'Inteligência', grp_admin: 'Administração',
    nav_dashboard: 'Painel', nav_referees: 'Árbitros', nav_training: 'Treino', nav_drills: 'Exercícios', nav_match_analysis: 'Análise de Jogo',
    nav_training_analysis: 'Análise de Treino', nav_onfield_review: 'Revisão em Campo', nav_fitness_tests: 'Testes Físicos',
    nav_screening: 'Rastreio', nav_recommendations: 'Recomendações', nav_training_programmes: 'Programas de Treino',
    nav_calendar: 'Calendário', nav_communication: 'Comunicação', nav_documents: 'Documentos', nav_reports: 'Relatórios',
    nav_analytics: 'Análises', nav_signals_alerts: 'Sinais e Alertas', nav_education: 'Formação',
    nav_user_management: 'Gestão de Utilizadores', nav_settings: 'Definições',
    label_international_referee: 'Árbitro Internacional', label_refereeing_officer: 'Responsável de Arbitragem',
    search_placeholder_default: 'Pesquisar árbitros, jogos, relatórios…', search_placeholder_documents: 'Pesquisar documentos…', search_placeholder_organizations: 'Pesquisar organizações…',
    title_calendar: 'Calendário', title_messages: 'Mensagens', title_notifications: 'Notificações', title_help: 'Ajuda',
    page_dashboard_title: 'Bem-vindo ao Ref Central Hub', page_dashboard_sub: 'Inteligência de desempenho para a arbitragem moderna.',
    page_referees_title: 'Base de Dados de Árbitros', page_referees_sub: 'Pesquise, filtre e gira todos os árbitros do seu ecossistema.',
    page_organizations_title: 'Organizações e Funções', page_organizations_sub: 'Gira organizações e decida a que organização pertence cada árbitro, e em que função.',
    page_fitness_title: 'Testes Físicos', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, protocolos aeróbios e personalizados — um único registo de resultados.',
    page_screening_title: 'Rastreio de Desempenho e Lesões', page_screening_sub: 'Antropometria, resultados dos sistemas VALD (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) e mapa corporal.',
    page_calendar_title: 'Calendário', page_calendar_sub: 'Cada jogo, tema de treino, teste físico e rastreio — identificado com o nome do árbitro.',
    page_communication_title: 'Comunicação', page_communication_sub: 'Envie mensagens a todos os árbitros, a uma organização inteira, a uma função específica ou a uma pessoa — com um registo completo de envios.',
    page_documents_title: 'Documentos', page_documents_sub: 'Carregue ficheiros PDF, JPEG, Excel ou Word e escolha exatamente quem os pode ver — ou publique-os na biblioteca geral para todos.',
    page_training_analysis_title: 'Análise de Treino', page_training_analysis_sub: 'Avaliação mensal com onze métricas — consistência, carga, distribuição de intensidade de FC, equilíbrio de recuperação e mais.',
    page_settings_title: 'Definições', page_settings_sub: 'Integrações, preferências pessoais, organização e segurança.',
    btn_new_report: 'Novo Relatório', btn_add_referee: 'Adicionar Árbitro', btn_add_organization: 'Adicionar Organização', btn_add_result: 'Adicionar Resultado',
    btn_add_screening_result: 'Adicionar Resultado de Rastreio', btn_add_event: 'Adicionar Evento', btn_upload_share: 'Carregar e Partilhar', btn_log_session: 'Registar Sessão de Treino',
    page_drills_title: 'Exercícios', page_drills_sub: 'Crie exercícios profissionais para árbitros num campo, ou gere uma proposta de treino a partir da intensidade e distância.',
    btn_generate_training: 'Gerar Treino', btn_create_drill: 'Criar novo exercício', modal_create_drill: 'Criar novo exercício', modal_generator: 'Gerador de Treino'
  },
  it: {
    grp_overview: 'Panoramica', grp_performance: 'Prestazione', grp_planning: 'Pianificazione', grp_intelligence: 'Intelligence', grp_admin: 'Amministrazione',
    nav_dashboard: 'Dashboard', nav_referees: 'Arbitri', nav_training: 'Allenamento', nav_drills: 'Esercizi', nav_match_analysis: 'Analisi Partita',
    nav_training_analysis: 'Analisi Allenamento', nav_onfield_review: 'Revisione sul Campo', nav_fitness_tests: 'Test Fisici',
    nav_screening: 'Screening', nav_recommendations: 'Raccomandazioni', nav_training_programmes: 'Programmi di Allenamento',
    nav_calendar: 'Calendario', nav_communication: 'Comunicazione', nav_documents: 'Documenti', nav_reports: 'Report',
    nav_analytics: 'Analisi', nav_signals_alerts: 'Segnali e Avvisi', nav_education: 'Formazione',
    nav_user_management: 'Gestione Utenti', nav_settings: 'Impostazioni',
    label_international_referee: 'Arbitro Internazionale', label_refereeing_officer: 'Responsabile Arbitrale',
    search_placeholder_default: 'Cerca arbitri, partite, report…', search_placeholder_documents: 'Cerca documenti…', search_placeholder_organizations: 'Cerca organizzazioni…',
    title_calendar: 'Calendario', title_messages: 'Messaggi', title_notifications: 'Notifiche', title_help: 'Aiuto',
    page_dashboard_title: 'Benvenuto in Ref Central Hub', page_dashboard_sub: "Intelligence delle prestazioni per l'arbitraggio moderno.",
    page_referees_title: 'Database Arbitri', page_referees_sub: 'Cerca, filtra e gestisci tutti gli arbitri del tuo ecosistema.',
    page_organizations_title: 'Organizzazioni e Ruoli', page_organizations_sub: 'Gestisci le organizzazioni e decidi quale arbitro appartiene a quale organizzazione, e con quale ruolo.',
    page_fitness_title: 'Test Fisici', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, protocolli aerobici e personalizzati — un unico registro dei risultati.',
    page_screening_title: 'Screening di Prestazione e Infortuni', page_screening_sub: 'Antropometria, risultati dei sistemi VALD (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) e mappa corporea.',
    page_calendar_title: 'Calendario', page_calendar_sub: "Ogni partita, argomento di allenamento, test fisico e screening — con il nome dell'arbitro.",
    page_communication_title: 'Comunicazione', page_communication_sub: "Invia messaggi a tutti gli arbitri, a un'intera organizzazione, a un ruolo specifico o a una persona — con un registro completo degli invii.",
    page_documents_title: 'Documenti', page_documents_sub: 'Carica file PDF, JPEG, Excel o Word e scegli esattamente chi può vederli — oppure pubblicali nella libreria generale per tutti.',
    page_training_analysis_title: 'Analisi Allenamento', page_training_analysis_sub: "Valutazione mensile su undici metriche — costanza, carico, distribuzione dell'intensità cardiaca, equilibrio di recupero e altro.",
    page_settings_title: 'Impostazioni', page_settings_sub: 'Integrazioni, preferenze personali, organizzazione e sicurezza.',
    btn_new_report: 'Nuovo Report', btn_add_referee: 'Aggiungi Arbitro', btn_add_organization: 'Aggiungi Organizzazione', btn_add_result: 'Aggiungi Risultato',
    btn_add_screening_result: 'Aggiungi Risultato Screening', btn_add_event: 'Aggiungi Evento', btn_upload_share: 'Carica e Condividi', btn_log_session: 'Registra Sessione',
    page_drills_title: 'Esercizi', page_drills_sub: 'Progetta esercizi professionali per arbitri su un campo, oppure genera una proposta di allenamento da intensità e distanza.',
    btn_generate_training: 'Genera Allenamento', btn_create_drill: 'Crea nuovo esercizio', modal_create_drill: 'Crea nuovo esercizio', modal_generator: 'Generatore di Allenamento'
  },
  nl: {
    grp_overview: 'Overzicht', grp_performance: 'Prestatie', grp_planning: 'Planning', grp_intelligence: 'Intelligence', grp_admin: 'Beheer',
    nav_dashboard: 'Dashboard', nav_referees: 'Scheidsrechters', nav_training: 'Training', nav_drills: 'Oefeningen', nav_match_analysis: 'Wedstrijdanalyse',
    nav_training_analysis: 'Trainingsanalyse', nav_onfield_review: 'Veldbeoordeling', nav_fitness_tests: 'Fitheidstests',
    nav_screening: 'Screening', nav_recommendations: 'Aanbevelingen', nav_training_programmes: "Trainingsprogramma's",
    nav_calendar: 'Kalender', nav_communication: 'Communicatie', nav_documents: 'Documenten', nav_reports: 'Rapporten',
    nav_analytics: 'Analyse', nav_signals_alerts: 'Signalen & Meldingen', nav_education: 'Opleiding',
    nav_user_management: 'Gebruikersbeheer', nav_settings: 'Instellingen',
    label_international_referee: 'Internationaal Scheidsrechter', label_refereeing_officer: 'Scheidsrechterscoördinator',
    search_placeholder_default: 'Zoek scheidsrechters, wedstrijden, rapporten…', search_placeholder_documents: 'Zoek documenten…', search_placeholder_organizations: 'Zoek organisaties…',
    title_calendar: 'Kalender', title_messages: 'Berichten', title_notifications: 'Meldingen', title_help: 'Help',
    page_dashboard_title: 'Welkom bij Ref Central Hub', page_dashboard_sub: 'Performance-intelligentie voor modern scheidsrechterschap.',
    page_referees_title: 'Scheidsrechtersdatabase', page_referees_sub: 'Zoek, filter en beheer alle scheidsrechters in uw ecosysteem.',
    page_organizations_title: 'Organisaties & Rollen', page_organizations_sub: 'Beheer organisaties en bepaal welke scheidsrechter bij welke organisatie hoort, en in welke rol.',
    page_fitness_title: 'Fitheidstests', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, aerobe en aangepaste protocollen — één resultatenlogboek.',
    page_screening_title: 'Prestatie- en Blessurescreening', page_screening_sub: 'Antropometrie, VALD-systeemresultaten (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) en lichaamskaart.',
    page_calendar_title: 'Kalender', page_calendar_sub: 'Elke wedstrijd, trainingsonderwerp, fitheidstest en screening — voorzien van de naam van de scheidsrechter.',
    page_communication_title: 'Communicatie', page_communication_sub: 'Stuur een bericht naar alle scheidsrechters, een hele organisatie, een specifieke rol of één persoon — met een volledig verzendlogboek.',
    page_documents_title: 'Documenten', page_documents_sub: 'Upload PDF-, JPEG-, Excel- of Word-bestanden en kies precies wie ze mag zien — of publiceer ze in de algemene bibliotheek voor iedereen.',
    page_training_analysis_title: 'Trainingsanalyse', page_training_analysis_sub: 'Maandelijkse evaluatie op elf meetwaarden — consistentie, belasting, HF-intensiteitsverdeling, herstelbalans en meer.',
    page_settings_title: 'Instellingen', page_settings_sub: 'Integraties, persoonlijke voorkeuren, organisatie en beveiliging.',
    btn_new_report: 'Nieuw Rapport', btn_add_referee: 'Scheidsrechter Toevoegen', btn_add_organization: 'Organisatie Toevoegen', btn_add_result: 'Resultaat Toevoegen',
    btn_add_screening_result: 'Screeningresultaat Toevoegen', btn_add_event: 'Gebeurtenis Toevoegen', btn_upload_share: 'Uploaden & Delen', btn_log_session: 'Trainingssessie Registreren',
    page_drills_title: 'Oefeningen', page_drills_sub: 'Ontwerp professionele scheidsrechtersoefeningen op een veldcanvas, of genereer een trainingsvoorstel op basis van intensiteit en afstand.',
    btn_generate_training: 'Training Genereren', btn_create_drill: 'Nieuwe oefening maken', modal_create_drill: 'Nieuwe oefening maken', modal_generator: 'Trainingsgenerator'
  },
  pl: {
    grp_overview: 'Przegląd', grp_performance: 'Wydajność', grp_planning: 'Planowanie', grp_intelligence: 'Analityka', grp_admin: 'Administracja',
    nav_dashboard: 'Panel', nav_referees: 'Sędziowie', nav_training: 'Trening', nav_drills: 'Ćwiczenia', nav_match_analysis: 'Analiza Meczu',
    nav_training_analysis: 'Analiza Treningu', nav_onfield_review: 'Przegląd na Boisku', nav_fitness_tests: 'Testy Sprawnościowe',
    nav_screening: 'Badania Przesiewowe', nav_recommendations: 'Rekomendacje', nav_training_programmes: 'Programy Treningowe',
    nav_calendar: 'Kalendarz', nav_communication: 'Komunikacja', nav_documents: 'Dokumenty', nav_reports: 'Raporty',
    nav_analytics: 'Analityka', nav_signals_alerts: 'Sygnały i Alerty', nav_education: 'Edukacja',
    nav_user_management: 'Zarządzanie Użytkownikami', nav_settings: 'Ustawienia',
    label_international_referee: 'Sędzia Międzynarodowy', label_refereeing_officer: 'Koordynator Sędziowski',
    search_placeholder_default: 'Szukaj sędziów, meczów, raportów…', search_placeholder_documents: 'Szukaj dokumentów…', search_placeholder_organizations: 'Szukaj organizacji…',
    title_calendar: 'Kalendarz', title_messages: 'Wiadomości', title_notifications: 'Powiadomienia', title_help: 'Pomoc',
    page_dashboard_title: 'Witamy w Ref Central Hub', page_dashboard_sub: 'Inteligencja wydajności dla nowoczesnego sędziowania.',
    page_referees_title: 'Baza Sędziów', page_referees_sub: 'Wyszukuj, filtruj i zarządzaj wszystkimi sędziami w Twoim ekosystemie.',
    page_organizations_title: 'Organizacje i Role', page_organizations_sub: 'Zarządzaj organizacjami i decyduj, który sędzia należy do której organizacji i w jakiej roli.',
    page_fitness_title: 'Testy Sprawnościowe', page_fitness_sub: 'UEFA20, FIFA Fitness Test, ARIET, Yo-Yo, sprint, protokoły aerobowe i własne — jeden rejestr wyników.',
    page_screening_title: 'Badania Przesiewowe Wydolności i Urazów', page_screening_sub: 'Antropometria, wyniki systemów VALD (ForceDecks, ForceFrame, NordBord, Dynamo, HumanTrak) i mapa ciała.',
    page_calendar_title: 'Kalendarz', page_calendar_sub: 'Każdy mecz, temat treningu, test sprawnościowy i badanie — oznaczone imieniem i nazwiskiem sędziego.',
    page_communication_title: 'Komunikacja', page_communication_sub: 'Wyślij wiadomość do wszystkich sędziów, całej organizacji, określonej roli lub jednej osoby — z pełnym rejestrem wysyłki.',
    page_documents_title: 'Dokumenty', page_documents_sub: 'Prześlij pliki PDF, JPEG, Excel lub Word i wybierz dokładnie, kto może je zobaczyć — lub opublikuj w ogólnej bibliotece dla wszystkich.',
    page_training_analysis_title: 'Analiza Treningu', page_training_analysis_sub: 'Comiesięczna ocena w jedenastu wskaźnikach — regularność, obciążenie, rozkład intensywności HR, równowaga regeneracji i więcej.',
    page_settings_title: 'Ustawienia', page_settings_sub: 'Integracje, preferencje osobiste, organizacja i bezpieczeństwo.',
    btn_new_report: 'Nowy Raport', btn_add_referee: 'Dodaj Sędziego', btn_add_organization: 'Dodaj Organizację', btn_add_result: 'Dodaj Wynik',
    btn_add_screening_result: 'Dodaj Wynik Badania', btn_add_event: 'Dodaj Wydarzenie', btn_upload_share: 'Prześlij i Udostępnij', btn_log_session: 'Zarejestruj Sesję Treningową',
    page_drills_title: 'Ćwiczenia', page_drills_sub: 'Projektuj profesjonalne ćwiczenia dla sędziów na boisku, albo wygeneruj propozycję treningu na podstawie intensywności i dystansu.',
    btn_generate_training: 'Generuj Trening', btn_create_drill: 'Utwórz nowe ćwiczenie', modal_create_drill: 'Utwórz nowe ćwiczenie', modal_generator: 'Generator Treningów'
  }
};

function refchGetLanguage() {
  return localStorage.getItem(REFCH_LANG_KEY) || 'en';
}

function refchApplyTranslations(lang) {
  var dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-title');
    if (dict[key]) el.title = dict[key];
  });
}

function refchSetLanguage(lang) {
  localStorage.setItem(REFCH_LANG_KEY, lang);
  refchApplyTranslations(lang);
  refchRenderLangSwitcher();
}

function refchRenderLangSwitcher() {
  var btn = document.getElementById('langSelectBtn');
  var dropdown = document.getElementById('langDropdown');
  if (!btn || !dropdown) return;

  var current = refchGetLanguage();
  var currentLang = LANGUAGES.filter(function (l) { return l.code === current; })[0] || LANGUAGES[0];
  document.getElementById('langSelectLabel').textContent = currentLang.code.toUpperCase();

  dropdown.innerHTML = LANGUAGES.map(function (l) {
    return '<div class="lang-option' + (l.code === current ? ' active' : '') + '" data-lang="' + l.code + '">' +
      '<span>' + l.flag + '</span><span>' + l.name + '</span>' +
    '</div>';
  }).join('');

  dropdown.querySelectorAll('.lang-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      refchSetLanguage(opt.getAttribute('data-lang'));
      dropdown.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  refchApplyTranslations(refchGetLanguage());
  refchRenderLangSwitcher();

  var btn = document.getElementById('langSelectBtn');
  var dropdown = document.getElementById('langDropdown');
  if (btn && dropdown) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && e.target !== btn) dropdown.classList.remove('open');
    });
  }
});
