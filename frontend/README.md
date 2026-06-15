# Recruit. — Auth Page

Page d'authentification inspirée du design Recruit. (dark navy + teal + orange).

## Installation

```bash
npm install
npm start        # http://localhost:3000
```

## Fichiers livrés

| Fichier | Rôle |
|---|---|
| `src/Login.jsx` | Composant React principal |
| `src/Login.css` | Styles dark-theme Recruit. |
| `src/index.js`  | Point d'entrée |

## API attendue

### POST `http://localhost:3000/api/auth/login`
```json
{ "email": "...", "password": "..." }
// Réponse : { "token": "...", "user": { "role": "CANDIDAT|RECRUTEUR", ... } }
```

### POST `http://localhost:3000/api/auth/register`
```json
{
  "nom": "Dupont", "prenom": "Marie",
  "email": "...", "password": "...",
  "role": "CANDIDAT|RECRUTEUR",
  "entreprise": "",        // si RECRUTEUR
  "enChomage": false       // si CANDIDAT
}
```

## Redirection après connexion
Modifiez le callback `onLoginSuccess` dans `src/index.js` :
```js
window.location.href = user.role === 'RECRUTEUR'
  ? '/recruiter/dashboard'
  : '/candidate/dashboard';
```
