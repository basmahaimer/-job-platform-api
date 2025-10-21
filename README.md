
```markdown
# 🚀 Job Platform API

Une API RESTful complète pour une plateforme d'emploi, développée avec Laravel et Laravel Sanctum. Cette API permet la gestion des utilisateurs, des offres d'emploi et des candidatures avec un système de rôles et permissions avancé.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture Technique](#-architecture-technique)
- [Installation](#-installation)
- [Documentation API](#-documentation-api)
- [Endpoints](#-endpoints)
- [Sécurité](#-sécurité)
- [Tests](#-tests)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Fonctionnalités

### 🔐 Authentification & Autorisation
- **Inscription** avec choix de rôle (candidat/employeur)
- **Connexion** sécurisée avec tokens JWT
- **Système de rôles** maison (sans packages externes)
- **Permissions granulaires** par endpoint

### 💼 Gestion des Offres d'Emploi
- **CRUD complet** pour les employeurs
- **Recherche avancée** par titre, entreprise, localisation
- **Statut actif/inactif** des offres
- **Relations** employeur → offres

### 📝 Système de Candidatures
- **Postulation** aux offres avec lettre de motivation
- **Suivi des candidatures** selon le rôle
- **Statuts** : pending, accepted, rejected
- **Protection** anti-double candidature

### 📊 Rôles et Permissions
- **Candidat** : Postuler, voir ses candidatures
- **Employeur** : Gérer ses offres et candidatures
- **Administrateur** : Accès complet à toutes les ressources

## 🏗️ Architecture Technique

```
app/
├── Controllers/
│   ├── AuthController.php      # Authentification
│   ├── JobController.php       # Gestion des offres
│   └── ApplicationController.php # Gestion des candidatures
├── Models/
│   ├── User.php               # Utilisateurs
│   ├── Role.php               # Rôles
│   ├── Job.php                # Offres d'emploi
│   └── Application.php        # Candidatures
routes/
└── api.php                    # Routes API
```

## ⚙️ Installation

### Prérequis
- PHP 8.1+
- Composer
- MySQL/PostgreSQL/SQLite
- Laravel 10+

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/ton-username/job-platform-api.git
cd job-platform-api
```

2. **Installer les dépendances**
```bash
composer install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configurer la base de données**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=job_platform
DB_USERNAME=root
DB_PASSWORD=
```

5. **Exécuter les migrations et seeders**
```bash
php artisan migrate --seed
```

6. **Installer Laravel Sanctum**
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

7. **Démarrer le serveur**
```bash
php artisan serve
```

## 📖 Documentation API

### Accéder à la documentation
La documentation Swagger est disponible à l'adresse :
```
http://localhost:8000/api/documentation
```

### Installation de la documentation
```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider="L5Swagger\L5SwaggerServiceProvider"
php artisan l5-swagger:generate
```

## 🛣️ Endpoints

### 🔐 Authentification
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/api/register` | Inscription utilisateur | Public |
| `POST` | `/api/login` | Connexion | Public |
| `POST` | `/api/logout` | Déconnexion | Authentifié |
| `GET` | `/api/me` | Profil utilisateur | Authentifié |

### 💼 Offres d'Emploi
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/jobs` | Liste des offres | Public |
| `GET` | `/api/jobs/search` | Recherche d'offres | Public |
| `GET` | `/api/jobs/{id}` | Détail d'une offre | Public |
| `POST` | `/api/jobs` | Créer une offre | Employeur |
| `PUT` | `/api/jobs/{id}` | Modifier une offre | Propriétaire/Admin |
| `DELETE` | `/api/jobs/{id}` | Supprimer une offre | Propriétaire/Admin |

### 📝 Candidatures
| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/api/applications` | Lister candidatures | Par rôle |
| `POST` | `/api/jobs/{id}/apply` | Postuler | Candidat |
| `PUT` | `/api/applications/{id}` | Modifier statut | Employeur/Admin |
| `DELETE` | `/api/applications/{id}` | Supprimer | Propriétaire/Employeur/Admin |
| `GET` | `/api/applications/{id}` | Voir candidature | Autorisé |

## 🛡️ Sécurité

### Mesures implémentées
- **Tokens JWT** avec Laravel Sanctum
- **Validation des données** Laravel
- **Vérification des rôles** manuelle
- **Protection CSRF** désactivée pour API
- **Codes HTTP** appropriés (200, 201, 400, 401, 403, 404, 409, 500)

### Permissions par Rôle
```php
// Exemple de vérification de rôle
$userRoles = Auth::user()->roles()->pluck('name')->toArray();
if (!in_array('employer', $userRoles)) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

## 🧪 Tests

### Workflows de test
1. **Authentification** → Register/Login pour obtenir les tokens
2. **Employeur** → Créer offre → Voir candidatures
3. **Candidat** → Rechercher → Postuler → Suivre candidatures
4. **Admin** → Accès complet

## 🛠️ Technologies

- **Backend** : Laravel 10+
- **Authentification** : Laravel Sanctum
- **Base de données** : MySQL/PostgreSQL/SQLite
- **Documentation** : Swagger/OpenAPI (L5-Swagger)
- **Validation** : Laravel Validator
- **Sécurité** : JWT Tokens, RBAC maison

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteur

Développé avec ❤️ par [Basma Haimer](https://github.com/basmahaimer)
```
