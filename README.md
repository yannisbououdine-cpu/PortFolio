# Portfolio DevOps · Yannis Bououdine

Site vitrine de mes projets DevOps réalisés pendant mon Master (M1 et M2).

**Site en ligne :** https://yannisbououdine-cpu.github.io/PortFolio/

## Ce que montre ce dépôt

Le site est lui-même un premier projet DevOps :

- **Site statique** généré avec [Hugo](https://gohugo.io/), sans thème externe (HTML + CSS maison).
- **CI/CD** : à chaque `push` sur `main`, GitHub Actions construit le site et le déploie sur GitHub Pages ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).
- **Contenu séparé du code** : les compétences et les projets sont des fichiers de données YAML.

```
.
├── .github/workflows/deploy.yml   # pipeline build + déploiement
├── content/_index.md              # texte « À propos »
├── data/competences.yaml          # liste des compétences
├── data/projets.yaml              # liste des projets
├── layouts/index.html             # gabarit de la page
├── static/css/style.css           # styles
└── hugo.toml                      # configuration du site
```

## Lancer en local

```bash
# installer Hugo extended : https://gohugo.io/installation/
hugo server
# puis ouvrir http://localhost:1313/PortFolio/
```

## Ajouter un projet

1. Ouvrir `data/projets.yaml`.
2. Remplir ou copier un bloc (`titre`, `description`, `technos`, `lien`, `statut`).
3. Mettre `statut: termine` et le lien du dépôt.
4. `git commit` puis `git push` : le site se met à jour tout seul en une minute environ.

## Feuille de route

- [x] Site vitrine déployé automatiquement sur GitHub Pages
- [ ] Projet CI/CD : application conteneurisée, tests, build Docker, déploiement
- [ ] Projet Terraform AWS : VPC, sécurité, hébergement de ce site sur S3 + CloudFront
- [ ] Projet réseau virtuel : topologie segmentée, routage, pare-feu
- [ ] Projet Kubernetes : déploiement, Ingress, supervision
