import { AppSettings, JobPosition, ContractArticle, ContractTemplate, TagInfo, ContractType, EmployeeStatus } from '../types';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  cdi: 'CDI - Contrat à Durée Indéterminée',
  cdd: 'CDD - Contrat à Durée Déterminée',
  avenant_cdd: 'Avenant de renouvellement CDD',
  avenant_cdi: 'Avenant de passage en CDI',
  convention_tripartite: 'Convention tripartite de mutation',
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  employé: 'Employé',
  conducteur: 'Conducteur',
  ouvrier: 'Ouvrier',
  maitrise: 'Maîtrise',
  haute_maitrise: 'Haute Maîtrise',
  cadre: 'Cadre',
};

export const DEFAULT_SETTINGS: AppSettings = {
  pointValue: 10.92, // Valeur du point en euros
  companyName: 'TABM Transport & Mobilités SAS',
  companyAddress: '14 Boulevard des Transports, Z.I. Nord',
  companyCity: '69000 Lyon',
  companySiret: '482 910 324 00028',
  companyApe: '4939A (Transports routiers réguliers de voyageurs)',
  companyRepresentative: 'Laurent DUPONT',
  representativeRole: 'Directeur Général',
  collectiveAgreement: 'Convention Collective Nationale des Transports Routiers et Activités Auxiliaires du Transport (IDCC 16)',
};

export const DEFAULT_JOBS: JobPosition[] = [
  {
    id: 'job-1',
    title: 'Conducteur(trice) Receveur Lignes Régulières',
    category: 'conducteur',
    coefficient: 140,
    weeklyHours: 35,
    description: 'Conduite de véhicules de transport en commun sur lignes urbaines et interurbaines, vente et contrôle des titres.',
    requiredLicenses: 'Permis D, FIMO/FCO Voyageurs, Carte de qualification conducteur',
  },
  {
    id: 'job-2',
    title: 'Conducteur(trice) Scolaire CPS (Temps Partiel)',
    category: 'conducteur',
    coefficient: 137,
    weeklyHours: 24,
    description: 'Circuits de transports scolaires matin et soir, prise en charge sécurisée des élèves.',
    requiredLicenses: 'Permis D, FIMO/FCO Voyageurs en cours de validité',
  },
  {
    id: 'job-3',
    title: 'Conducteur(trice) Grand Tourisme & Occasionnel',
    category: 'conducteur',
    coefficient: 150,
    weeklyHours: 35,
    description: 'Voyages nationaux et internationaux, prise en charge de groupes, gestion de la billetterie et des bagages.',
    requiredLicenses: 'Permis D, FIMO/FCO Voyageurs, Carte chronotachygraphe numérique',
  },
  {
    id: 'job-4',
    title: 'Conducteur(trice) Poids Lourd Routier (Marchandises)',
    category: 'conducteur',
    coefficient: 148,
    weeklyHours: 39,
    description: 'Transport régional ou longue distance de fret, arrimage et respect des protocoles de sécurité.',
    requiredLicenses: 'Permis C/EC, FIMO/FCO Marchandises, Carte conducteur',
  },
  {
    id: 'job-5',
    title: "Agent d'Exploitation & Planning Transport",
    category: 'employé',
    coefficient: 128,
    weeklyHours: 35,
    description: 'Affectation des services, gestion des plannings des conducteurs et suivi des aléas quotidiens.',
    requiredLicenses: 'Bac Pro Transport / Logistique recommandé',
  },
  {
    id: 'job-6',
    title: 'Dispatcheur / Régulateur de Réseau',
    category: 'maitrise',
    coefficient: 160,
    weeklyHours: 35,
    description: 'Surveillance du réseau en temps réel via SAEIV, gestion des retards, déviations et incidents trafic.',
    requiredLicenses: 'Expérience avérée en régulation urbaine/interurbaine',
  },
  {
    id: 'job-7',
    title: 'Mécanicien(ne) Atelier Poids Lourds & Autocars',
    category: 'ouvrier',
    coefficient: 140,
    weeklyHours: 35,
    description: 'Maintenance préventive et curative de la flotte de bus et autocars, diagnostic valise électronique.',
    requiredLicenses: 'CAP/Bac Pro Mécanique PL, Permis B (Permis D souhaité)',
  },
  {
    id: 'job-8',
    title: "Chef d'Atelier & Maintenance Matériel Roulant",
    category: 'haute_maitrise',
    coefficient: 185,
    weeklyHours: 35,
    description: 'Encadrement de l’équipe de techniciens, suivi des contrôles techniques et conformité réglementaire DREAL.',
    requiredLicenses: 'BTS Maintenance des Véhicules Industriels ou équivalent',
  },
  {
    id: 'job-9',
    title: 'Responsable d’Exploitation et Mouvement',
    category: 'cadre',
    coefficient: 200,
    weeklyHours: 35,
    description: 'Pilotage global du centre de profit, encadrement des conducteurs, interlocuteur des autorités organisatrices.',
    requiredLicenses: 'Attestation de capacité professionnelle de transport de personnes',
  },
  {
    id: 'job-10',
    title: 'Gestionnaire RH & Relations Sociales',
    category: 'maitrise',
    coefficient: 165,
    weeklyHours: 35,
    description: 'Gestion administrative du personnel, paie, contrats de travail et veille juridique convention collective.',
    requiredLicenses: 'Formation supérieure RH / Droit social',
  },
];

export const DEFAULT_ARTICLES: ContractArticle[] = [
  {
    id: 'art-engagement',
    code: 'ART-01',
    title: 'Article 1 - Engagement et Qualification',
    category: 'Général',
    content: `La société {{societe}}, sise {{adresse_societe}}, représentée par {{representant_societe}} en sa qualité de {{role_representant}}, engage {{civilite}} {{prenom}} {{nom}}, demeurant {{adresse}}, sous le statut de {{statut}}, en qualité de {{metier}} (Coefficient {{coefficient}}).

Le présent engagement est conclu sous réserve des résultats concluants de la visite d'information et de prévention (visite médicale d'embauche) et de la présentation de l'ensemble des justificatifs et titres professionnels requis.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 1,
  },
  {
    id: 'art-cdd-duree',
    code: 'ART-02-CDD',
    title: 'Article 2 - Nature et Durée du Contrat (Spécifique CDD)',
    category: 'Général',
    content: `Le présent contrat à durée déterminée est conclu à compter du {{date_debut}} jusqu'au {{date_fin}}.
Il est expressément motivé par le recours suivant : {{motif_recours}}.
{{details_remplacement}}

Conformément à l'article L. 1243-13 du Code du travail, le présent contrat pourra faire l'objet de renouvellements dans le respect des dispositions légales et conventionnelles applicables.`,
    validContractTypes: ['cdd', 'avenant_cdd'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 2,
  },
  {
    id: 'art-cdi-prise-effet',
    code: 'ART-02-CDI',
    title: 'Article 2 - Prise d’effet et Période d’essai (Spécifique CDI)',
    category: 'Général',
    content: `Le présent contrat prendra effet le {{date_debut}} pour une durée indéterminée.
Il est subordonné à une période d’essai de {{periode_essai}} de travail effectif. Durant cette période, chacune des parties pourra mettre fin au contrat, sous réserve du respect du délai de prévenance prévu par les articles L. 1221-25 et L. 1221-26 du Code du travail.
{{modalites_renouvellement}}`,
    validContractTypes: ['cdi'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 2,
  },
  {
    id: 'art-fonctions',
    code: 'ART-03',
    title: 'Article 3 - Fonctions et Attributions',
    category: 'Poste & Missions',
    content: `En sa qualité de {{metier}}, le salarié exercera l'ensemble des attributions inhérentes à sa qualification telles que définies par la {{convention_collective}} et la fiche de poste annexée.

Le salarié s'engage à exécuter ses tâches avec toute la conscience professionnelle requise, dans le respect des consignes hiérarchiques, des règles d'exploitation ainsi que des procédures de qualité et d'accueil de la clientèle de l'entreprise.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 3,
  },
  {
    id: 'art-lieu-mobilite',
    code: 'ART-04',
    title: 'Article 4 - Lieu de travail et Mobilité',
    category: 'Poste & Missions',
    content: `Le salarié sera affecté principalement au dépôt de rattachement situé à {{lieu_travail}}.

Compte tenu de la nature des activités de transport de l'entreprise, le salarié reconnaît et accepte expressément que son lieu d'exercice pourra varier en fonction des lignes, des services confiés ou des réorganisations de desserte au sein de la zone géographique suivante : {{zone_mobilite}}.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: false,
    order: 4,
  },
  {
    id: 'art-duree-travail',
    code: 'ART-05',
    title: 'Article 5 - Durée et Organisation du Temps de Travail',
    category: 'Temps de travail',
    content: `La durée de travail est fixée à {{duree_hebdo}} par semaine (soit un horaire mensuel de référence de {{duree_mensuelle}}).

Les horaires de travail ainsi que les tableaux de roulement ou feuilles de service seront communiqués au salarié conformément aux délais de prévenance conventionnels. Le salarié pourra être amené à effectuer des heures supplémentaires ou complémentaires selon les nécessités de service et les dispositions légales en vigueur dans le secteur des transports routiers.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 5,
  },
  {
    id: 'art-remuneration-point',
    code: 'ART-06',
    title: 'Article 6 - Rémunération et Calcul lié au Point d’Entreprise',
    category: 'Rémunération',
    content: `En contrepartie de ses fonctions, le salarié percevra une rémunération brute mensuelle de base calculée selon la table de correspondance de l'entreprise et la valeur du point en vigueur.

- Coefficient attribué : {{coefficient}}
- Valeur actuelle du point d'entreprise : {{valeur_point}} €
- Salaire de base mensuel brut : {{salaire_mensuel}} € (pour un temps plein de {{duree_hebdo}})
- Taux horaire brut équivalent : {{taux_horaire}} €

À cette rémunération s'ajouteront, le cas échéant, les primes et indemnités conventionnelles (indemnité de repas, prime de dimanche, prime de panier, prime de non-accident) conformément aux barèmes applicables au sein de la société {{societe}}.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 6,
  },
  {
    id: 'art-specificite-transport',
    code: 'ART-07-TRANSPORT',
    title: 'Article 7 - Titres Professionnels, FIMO/FCO et Obligations Conduite',
    category: 'Transport & Sécurité',
    content: `Le maintien du présent contrat est strictement conditionné à la détention permanente et en cours de validité des titres et autorisations réglementaires suivants :
{{permis_requis}}

Le salarié s'engage à informer immédiatement la direction de tout retrait, suspension, annulation ou invalidation de son permis de conduire, ainsi que de toute perte de points susceptible de remettre en cause la validité de son titre. Tout manquement à cette obligation d'information constituera une faute grave.
Le salarié s'engage également à utiliser sa carte de conducteur numérique conformément à la réglementation sociale européenne (RSE) et à en assurer le téléchargement régulier.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['conducteur'],
    isMandatory: true,
    order: 7,
  },
  {
    id: 'art-securite-vehicule',
    code: 'ART-08-SECURITE',
    title: 'Article 8 - Sécurité, Code de la Route et Entretien du Matériel',
    category: 'Transport & Sécurité',
    content: `Le salarié est tenu de se conformer scrupuleusement aux règles du Code de la route, aux réglementations applicables aux transports de personnes et de marchandises, ainsi qu'aux consignes internes de sécurité.

Avant chaque départ, le salarié doit réaliser les contrôles de sécurité préalables d'usage (état des pneus, éclairage, niveaux, équipements obligatoires à bord, éthylotest antidémarrage). Tout dysfonctionnement constaté sur le véhicule doit faire l'objet d'un signalement immédiat sur le carnet de bord ou auprès du chef d'atelier.
Il est strictement interdit de conduire sous l'emprise de l'alcool, de stupéfiants ou de substances altérant la vigilance.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['conducteur', 'ouvrier'],
    isMandatory: false,
    order: 8,
  },
  {
    id: 'art-secret-loyaute',
    code: 'ART-09',
    title: 'Article 9 - Obligation de Loyauté, Discrétion et Confidentialité',
    category: 'Général',
    content: `Le salarié s'engage à observer la plus stricte réserve et discrétion sur l'ensemble des informations, procédés, fichiers clients, plannings, circuits et données tarifaires dont il pourrait avoir connaissance dans l'exercice de ses fonctions.

Cette obligation de confidentialité survivra à la rupture du présent contrat de travail, quelle qu'en soit la cause.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 9,
  },
  {
    id: 'art-non-concurrence',
    code: 'ART-10-CADRE',
    title: 'Article 10 - Clause de Non-Concurrence',
    category: 'Spécifique Encadrement',
    content: `Compte tenu des responsabilités managériales et des contacts stratégiques confiés au salarié avec les autorités organisatrices de transport et clients industriels, le salarié s'interdit, en cas de cessation du contrat, d'entrer au service d'une entreprise concurrente ou de s'intéresser directement ou indirectement à une activité similaire.

Cette interdiction est limitée à un rayon de 50 kilomètres autour du siège de la société et pour une durée de 12 mois à compter du départ effectif de l'entreprise. En contrepartie, la société versera mensuellement au salarié une indemnité spéciale correspondant à 30 % de la moyenne de sa rémunération brute des trois derniers mois. La société se réserve la faculté de renoncer unilatéralement à cette clause dans les conditions légales.`,
    validContractTypes: ['cdi', 'avenant_cdi'],
    validStatuses: ['maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: false,
    order: 10,
  },
  {
    id: 'art-prevoyance-sante',
    code: 'ART-11',
    title: 'Article 11 - Prévoyance et Mutuelle Frais de Santé',
    category: 'Général',
    content: `Le salarié bénéficie du régime obligatoire de prévoyance et de la couverture complémentaire frais de santé (mutuelle d'entreprise) souscrits par la société {{societe}} au profit de l'ensemble de son personnel, sous réserve des cas légaux de dispense.

Les cotisations y afférentes sont réparties entre l'employeur et le salarié conformément à l'accord d'entreprise et à la {{convention_collective}}.`,
    validContractTypes: ['cdi', 'cdd', 'avenant_cdd', 'avenant_cdi', 'convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 11,
  },
  {
    id: 'art-convention-tripartite',
    code: 'ART-TRIPARTITE',
    title: 'Article Spécifique - Continuité des Droits et Ancienneté (Mutation Tripartite)',
    category: 'Mutation',
    content: `Dans le cadre de la convention tripartite de mutation inter-entreprises signée ce jour, la société {{societe}} reprend à son compte l'ancienneté acquise par le salarié au sein de son précédent employeur, fixée au {{date_anciennete_reprise}}.

Les congés payés acquis et non soldés font l'objet d'un transfert financier entre les deux structures conformément au protocole d'accord joint en annexe.`,
    validContractTypes: ['convention_tripartite'],
    validStatuses: ['employé', 'conducteur', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: true,
    order: 12,
  },
];

export const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl-cdi-conducteur',
    name: 'CDI Conducteur(trice) Lignes Régulières',
    description: 'Modèle standard CDI pour conducteur de car / bus avec clauses de sécurité transport, permis, FCO et carte chronotachygraphe.',
    contractType: 'cdi',
    status: 'conducteur',
    defaultJobTitle: 'Conducteur(trice) Receveur Lignes Régulières',
    defaultWeeklyHours: 35,
    articleIds: [
      'art-engagement',
      'art-cdi-prise-effet',
      'art-fonctions',
      'art-lieu-mobilite',
      'art-duree-travail',
      'art-remuneration-point',
      'art-specificite-transport',
      'art-securite-vehicule',
      'art-secret-loyaute',
      'art-prevoyance-sante',
    ],
  },
  {
    id: 'tpl-cdd-conducteur-remplacement',
    name: 'CDD Conducteur Remplacement Absent',
    description: 'Modèle CDD pour conducteur avec motif de recours légal et clauses transport complètes.',
    contractType: 'cdd',
    status: 'conducteur',
    defaultJobTitle: 'Conducteur(trice) Receveur Lignes Régulières',
    defaultWeeklyHours: 35,
    articleIds: [
      'art-engagement',
      'art-cdd-duree',
      'art-fonctions',
      'art-lieu-mobilite',
      'art-duree-travail',
      'art-remuneration-point',
      'art-specificite-transport',
      'art-securite-vehicule',
      'art-secret-loyaute',
      'art-prevoyance-sante',
    ],
  },
  {
    id: 'tpl-cdi-exploitation-maitrise',
    name: "CDI Dispatcheur / Exploitation Maîtrise",
    description: "Modèle pour agent de maîtrise régulateur ou dispatcheur de réseau transport.",
    contractType: 'cdi',
    status: 'maitrise',
    defaultJobTitle: 'Dispatcheur / Régulateur de Réseau',
    defaultWeeklyHours: 35,
    articleIds: [
      'art-engagement',
      'art-cdi-prise-effet',
      'art-fonctions',
      'art-lieu-mobilite',
      'art-duree-travail',
      'art-remuneration-point',
      'art-secret-loyaute',
      'art-non-concurrence',
      'art-prevoyance-sante',
    ],
  },
  {
    id: 'tpl-cdi-cadre',
    name: "CDI Responsable Exploitation Cadre",
    description: "Contrat cadre transport avec clause de non-concurrence et responsabilités étendues.",
    contractType: 'cdi',
    status: 'cadre',
    defaultJobTitle: 'Responsable d’Exploitation et Mouvement',
    defaultWeeklyHours: 35,
    articleIds: [
      'art-engagement',
      'art-cdi-prise-effet',
      'art-fonctions',
      'art-lieu-mobilite',
      'art-duree-travail',
      'art-remuneration-point',
      'art-secret-loyaute',
      'art-non-concurrence',
      'art-prevoyance-sante',
    ],
  },
];

export const AVAILABLE_TAGS: TagInfo[] = [
  {
    tag: '{{nom}}',
    label: 'Nom de famille',
    category: 'Salarié',
    description: 'Nom de famille du salarié embauché',
    example: 'MARTIN',
  },
  {
    tag: '{{prenom}}',
    label: 'Prénom',
    category: 'Salarié',
    description: 'Prénom du salarié',
    example: 'Thomas',
  },
  {
    tag: '{{civilite}}',
    label: 'Civilité',
    category: 'Salarié',
    description: 'Civilité (M. ou Mme)',
    example: 'M.',
  },
  {
    tag: '{{adresse}}',
    label: 'Adresse complète',
    category: 'Salarié',
    description: 'Numéro, rue, code postal et ville du salarié',
    example: '25 Rue de la République, 69002 Lyon',
  },
  {
    tag: '{{num_secu}}',
    label: 'N° Sécurité Sociale',
    category: 'Salarié',
    description: 'Numéro d’immatriculation NIR à 15 chiffres',
    example: '1 89 05 69 123 456 78',
  },
  {
    tag: '{{date_naissance}}',
    label: 'Date de naissance',
    category: 'Salarié',
    description: 'Date de naissance au format JJ/MM/AAAA',
    example: '15/05/1989',
  },
  {
    tag: '{{lieu_naissance}}',
    label: 'Lieu de naissance',
    category: 'Salarié',
    description: 'Ville et département/pays de naissance',
    example: 'Lyon 3ème (69)',
  },
  {
    tag: '{{nationalite}}',
    label: 'Nationalité',
    category: 'Salarié',
    description: 'Nationalité déclarée',
    example: 'Française',
  },
  {
    tag: '{{metier}}',
    label: 'Intitulé du poste',
    category: 'Poste & Salaire',
    description: 'Métier sélectionné dans la table de correspondance',
    example: 'Conducteur(trice) Receveur Lignes Régulières',
  },
  {
    tag: '{{statut}}',
    label: 'Statut du salarié',
    category: 'Poste & Salaire',
    description: 'Statut conventionnel (Conducteur, Employé, Ouvrier, Maîtrise...)',
    example: 'Conducteur',
  },
  {
    tag: '{{coefficient}}',
    label: 'Coefficient conventionnel',
    category: 'Poste & Salaire',
    description: 'Coefficient hiérarchique rattaché au métier',
    example: '140',
  },
  {
    tag: '{{valeur_point}}',
    label: 'Valeur du point entreprise',
    category: 'Poste & Salaire',
    description: 'Valeur actuelle du point d’entreprise en euros (€)',
    example: '10.92',
  },
  {
    tag: '{{salaire_mensuel}}',
    label: 'Salaire mensuel brut (€)',
    category: 'Poste & Salaire',
    description: 'Calculé automatiquement via Coefficient × Valeur du point',
    example: '1 528,80',
  },
  {
    tag: '{{taux_horaire}}',
    label: 'Taux horaire brut (€)',
    category: 'Poste & Salaire',
    description: 'Taux horaire calculé sur la base des heures mensuelles',
    example: '10,08',
  },
  {
    tag: '{{duree_hebdo}}',
    label: 'Durée hebdomadaire',
    category: 'Dates & Durées',
    description: 'Nombre d’heures hebdomadaires contractuelles',
    example: '35h00',
  },
  {
    tag: '{{duree_mensuelle}}',
    label: 'Durée mensuelle',
    category: 'Dates & Durées',
    description: 'Nombre d’heures mensuelles de référence',
    example: '151,67 heures',
  },
  {
    tag: '{{date_debut}}',
    label: 'Date de début / embauche',
    category: 'Dates & Durées',
    description: 'Date de prise d’effet du contrat',
    example: '01/10/2026',
  },
  {
    tag: '{{date_fin}}',
    label: 'Date de fin (CDD)',
    category: 'Dates & Durées',
    description: 'Terme prévu pour les contrats à durée déterminée',
    example: '30/06/2027',
  },
  {
    tag: '{{motif_recours}}',
    label: 'Motif de recours CDD',
    category: 'Dates & Durées',
    description: 'Justification légale du CDD (remplacement, surcroît, etc.)',
    example: 'Remplacement de M. Jean DUPUIS, conducteur en congé maladie',
  },
  {
    tag: '{{periode_essai}}',
    label: 'Période d’essai',
    category: 'Dates & Durées',
    description: 'Durée initiale de la période d’essai',
    example: '2 mois renouvelable',
  },
  {
    tag: '{{lieu_travail}}',
    label: 'Dépôt / Lieu de travail',
    category: 'Transport',
    description: 'Dépôt principal d’affectation des véhicules',
    example: 'Dépôt Central de Vaise - Lyon',
  },
  {
    tag: '{{zone_mobilite}}',
    label: 'Zone de mobilité',
    category: 'Transport',
    description: 'Périmètre géographique d’intervention',
    example: 'Bassin métropolitain lyonnais et département du Rhône',
  },
  {
    tag: '{{permis_requis}}',
    label: 'Permis et habilitations requis',
    category: 'Transport',
    description: 'Permis D/C, FIMO/FCO, carte chronotachygraphe',
    example: 'Permis D en cours de validité, FIMO Voyageurs et Carte conducteur',
  },
  {
    tag: '{{societe}}',
    label: 'Raison sociale',
    category: 'Entreprise',
    description: 'Nom de l’entreprise employeur',
    example: 'TABM Transport & Mobilités SAS',
  },
  {
    tag: '{{adresse_societe}}',
    label: 'Adresse du siège social',
    category: 'Entreprise',
    description: 'Adresse complète de la société',
    example: '14 Boulevard des Transports, 69000 Lyon',
  },
  {
    tag: '{{representant_societe}}',
    label: 'Représentant de l’entreprise',
    category: 'Entreprise',
    description: 'Nom et prénom du signataire de la société',
    example: 'Laurent DUPONT',
  },
  {
    tag: '{{role_representant}}',
    label: 'Qualité du représentant',
    category: 'Entreprise',
    description: 'Titre ou fonction du signataire employeur',
    example: 'Directeur Général',
  },
  {
    tag: '{{convention_collective}}',
    label: 'Convention collective',
    category: 'Entreprise',
    description: 'Convention collective applicable',
    example: 'Convention Collective Nationale des Transports Routiers (IDCC 16)',
  },
];
