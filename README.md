# TABM-Contrats 🚌📄
> **Outil RH de rédaction automatisée des contrats de travail, calcul de salaire par coefficient et suivi des signatures pour société de transport.**

Application web autonome (React 19 + TypeScript + Tailwind CSS) développée spécifiquement pour la gestion des contrats de travail dans le secteur du transport routier et de voyageurs (Convention Collective Nationale des Transports Routiers - IDCC 16).

---

## 🔒 Confidentialité & Zéro Stockage en Ligne

Afin de garantir la stricte confidentialité des données des collaborateurs :
- **Aucune donnée n'est stockée sur des serveurs distants**.
- L'outil fonctionne **100% en mémoire locale dans le navigateur**.
- **Sauvegarde et Restauration par Excel (.xlsx)** :
  - Un bouton permet de charger sa mémoire au démarrage.
  - Un bouton permet d'exporter l'entièreté de la base (paramètres, coefficients, articles, modèles, historique des contrats) vers un fichier Excel horodaté en fin de journée.
  - La session peut être remise à zéro en un clic.

---

## ✨ Fonctionnalités Principales

1. **Générateur de Contrats & Prévisualisation PDF** :
   - Saisie des informations du salarié (état civil, numéro de sécurité sociale, adresse).
   - Prise en compte des types de contrat : CDI, CDD (avec motifs de recours et remplacement), Avenants, Convention tripartite.
   - Prévisualisation fidèle au format papier A4 officiel avec en-tête d'entreprise, clauses compilées et pavés de signatures.
   - Téléchargement immédiat au format PDF et impression directe.

2. **Table de Correspondance Métiers & Calcul du Salaire** :
   - Définition de la **valeur du point d'entreprise** (€).
   - Association automatique métier ➔ statut (Conducteur, Employé, Ouvrier, Maîtrise, Haute Maîtrise, Cadre) ➔ coefficient hiérarchique.
   - Calcul en temps réel du salaire brut mensuel et du taux horaire :
     $$\text{Salaire Brut Mensuel} = \text{Coefficient} \times \text{Valeur du Point}$$

3. **Bibliothèque d'Articles & Clauses Juridiques** :
   - Sélection intuitive et filtrage dynamique selon le profil du salarié et le type de contrat.
   - Gestion facilitée des ajouts et suppressions d'articles avec balises dynamiques (`{{nom}}`, `{{salaire_mensuel}}`, `{{coefficient}}`, etc.).
   - Enregistrement de modèles de contrats réutilisables.

4. **Historique & Suivi des Signatures (Workflow RH)** :
   - Traçabilité complète du cycle de vie du contrat via des cases à cocher interactives :
     - [x] Envoi dans les délais légaux
     - [x] Signature du collaborateur
     - [x] Signature de la direction
     - [x] Déclaration DPAE URSSAF
     - [x] Visite médicale d'embauche
     - [x] Contrôle permis et cartes conducteurs
     - [x] Archivage sur SharePoint (avec lien d'accès direct)

---

## 🚀 Déploiement Public Gratuit sur GitHub Pages

Ce dépôt contient un workflow automatisé **GitHub Actions** (`.github/workflows/deploy.yml`).

### Activer votre URL public GitHub :

1. Poussez votre code sur votre dépôt GitHub (`main` ou `master`).
2. Dans votre dépôt GitHub, cliquez sur **Settings** (Paramètres) > **Pages** (dans le menu de gauche).
3. Dans la section **Build and deployment** :
   - Sous **Source**, sélectionnez **GitHub Actions**.
4. L'action se lance automatiquement à chaque `git push`.
5. Votre application sera instantanément accessible via l'URL public :
   ```
   https://<votre-nom-utilisateur>.github.io/<nom-du-depot>/
   ```

---

## 💻 Développement Local

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- npm

### Installation & Lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-nom-utilisateur>/<nom-du-depot>.git
cd <nom-du-depot>

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Compiler pour la production
npm run build
```

---

## 🛠️ Stack Technique

- **Framework** : React 19 + TypeScript
- **Bundler** : Vite (avec chemin relatif pour GitHub Pages)
- **Styles** : Tailwind CSS v4
- **Génération PDF** : jsPDF + html2canvas
- **Export / Import Excel** : SheetJS (xlsx)
- **Icônes** : Lucide React
- **CI/CD** : GitHub Actions
