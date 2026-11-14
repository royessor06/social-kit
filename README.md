This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Sites vitrines (développement local)

Après avoir configuré `DATABASE_URL`, appliquez les migrations et chargez les
modèles de démonstration :

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Ouvrez ensuite `/site/nouveau`, choisissez un modèle et publiez le site. Le
parcours redirige vers son slug public, par exemple `/chez-marie`.

## Comptes utilisateurs

Copiez `.env.example` vers `.env`, renseignez `DATABASE_URL` et définissez
`AUTH_SECRET` avec une valeur aléatoire. La migration ajoute les comptes,
sessions et relations optionnelles avec les créations existantes :

```bash
npx prisma migrate dev
npm run dev
```

Les utilisateurs peuvent créer un compte sur `/register`, se connecter sur
`/login` et gérer leurs affiches et sites depuis `/dashboard`. La publication
d’un site reste ouverte aux visiteurs, mais seuls les propriétaires connectés
peuvent modifier leurs sites.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

For production, also set `AUTH_TRUST_HOST=true` when serving through a trusted host or proxy.

## Administration et modération

Après avoir créé un compte, lancez `npx prisma studio`, ouvrez la table `User`
et passez son champ `role` à `ADMIN`. Le compte peut ensuite ouvrir
`/admin` pour modérer les utilisateurs et sites et gérer l’activation des
modèles. Un administrateur ne peut pas suspendre son propre compte ni le
dernier administrateur actif.

## Réinitialisation du mot de passe

Configurez `NEXT_PUBLIC_APP_URL` avec l’URL de l’application. Pour envoyer les
liens par e-mail, ajoutez `RESEND_API_KEY` et `RESEND_FROM_EMAIL`. Sans clé
Resend, le lien est écrit dans la console uniquement hors production; en
production, aucun lien n’est exposé et la réponse reste générique. Les liens
expirent après 30 minutes et ne peuvent être utilisés qu’une fois.

Après ajout d’un modèle d’affiche, exécutez `npm run db:seed` pour le charger.

## Accès gratuit

La création et le téléchargement d’affiches ainsi que la création et la
publication de sites vitrines sont entièrement gratuits, sans abonnement ni
passerelle de paiement.

## Préparation au déploiement Vercel

Configurez `BLOB_READ_WRITE_TOKEN` dans Vercel pour envoyer les images vers
Vercel Blob; sans ce token, les uploads restent stockés dans `public/uploads`
en local. Les exports utilisent Playwright avec Chromium système en
développement et Chromium serverless `@sparticuz/chromium` en production.
Prévoyez au moins 1 Go de mémoire pour la fonction d’export.
