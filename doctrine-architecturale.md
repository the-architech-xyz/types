
# **The Architech CLI : Doctrine Architecturale et Raison d'Être du Système**

## **Préambule : La "Triforce" de nos Principes**

Chaque décision architecturale dans ce projet doit être jugée à l'aune de notre "Triforce", un équilibre entre trois forces fondamentales et souvent contradictoires :

1.  **Simplicité du Contributeur (`Blueprint` Author Experience) :** La création d'un module doit être aussi simple, déclarative et intuitive que possible. La complexité doit être absorbée par la CLI.
2.  **Qualité et Sécurité du Code Généré (End-User Experience) :** Le résultat final doit être un code de qualité industrielle, maintenable, et le processus doit être sûr, sans jamais corrompre le projet de l'utilisateur.
3.  **Agnosticisme et Scalabilité (Ecosystem Health) :** L'architecture doit être aussi agnostique que possible pour permettre l'intégration de n'importe quelle technologie et assurer la croissance saine de l'écosystème.

Ce document détaille comment nous avons appliqué ces principes pour concevoir chaque couche du système.

---

## **1. La Hiérarchie des Rôles : `Adapters` vs. `Integrators`**

C'est la distinction la plus fondamentale de notre écosystème. Une mauvaise compréhension de cette séparation mène à des `Blueprints` défectueux.

| | **`Adapters`** | **`Integrators`** |
| :--- | :--- | :--- |
| **Mission** | Installer une technologie **isolée**. | **Connecter** 2+ `Adapters` existants. |
| **Philosophie** | "Je construis mon pilier." | "Je construis un pont entre les piliers." |
| **Actions Typiques** | `CREATE_FILE`, `INSTALL_PACKAGES` | `ENHANCE_FILE`, `ADD_TS_IMPORT` |
| **État** | Idéalement **"Stateless"** vis-à-vis des autres modules. | Intrinsèquement **"Stateful"**, il dépend de l'état créé par les `Adapters`. |

**Pourquoi ce choix ?**
Cette séparation des responsabilités est cruciale pour la maintenabilité. Elle garantit que les `Adapters` sont des briques de base pures, agnostiques et réutilisables. Toute la complexité contextuelle est isolée dans les `Integrators`. Sans cette règle, chaque `Adapter` tenterait de gérer ses propres intégrations, menant à un chaos de duplication.

---

## **2. Le Cœur du Système : Le "VFS à la Demande" par Blueprint**

C'est notre compromis stratégique pour la gestion des fichiers.

*   **Le problème à résoudre :** Comment garantir la sécurité des modifications de fichiers sans paralyser le système avec un VFS global ?
*   **La décision architecturale :** Un VFS n'est instancié **que pour les `Blueprints` qui en ont besoin.**
*   **Le mécanisme :** Un `BlueprintAnalyzer` scanne les actions d'un blueprint avant exécution.
    *   **Si le blueprint est "Simple"** (contient uniquement des actions additives comme `CREATE_FILE` ou `RUN_COMMAND`, typique des `Adapters`), les opérations sont exécutées directement sur le disque pour une performance maximale. Le risque est jugé minimal.
    *   **Si le blueprint est "Complexe"** (contient des actions modificatives comme `ENHANCE_FILE` ou `MERGE_JSON`, typique des `Integrators`), un **VFS transactionnel** est créé pour la durée de vie de ce blueprint.

**Pourquoi ce choix ? (La justification face aux alternatives)**
*   **Pourquoi pas un VFS global ?** Trop complexe à maintenir, gourmand en mémoire, et le problème de la synchronisation avec les `RUN_COMMAND` est un cauchemar de performance et de fiabilité.
*   **Pourquoi pas un VFS par fichier ?** Trop simpliste. Il ne permet pas d'opérations interdépendantes au sein d'un même `Integrator` (ex: créer un fichier, puis l'importer dans un autre). Il brise l'atomicité au niveau de la "transaction métier" qu'est un `Integrator`.
*   **Le VFS par `Blueprint` est donc le juste milieu :** il fournit une **atomicité contextuelle** (l'intégration réussit ou échoue en bloc) sans le coût d'une atomicité globale.

---

## **3. L'API des Blueprints : Actions Sémantiques vs. Primitives de Bas Niveau**

C'est le reflet de notre principe "Simplicité pour le Contributeur".

*   **Le problème à résoudre :** Comment donner aux créateurs de `Blueprint` la puissance de modifier des fichiers sans leur imposer la complexité de l'AST ?
*   **La décision architecturale :** Fournir deux niveaux d'API : une API de **Haut Niveau Sémantique** pour les 95% de cas, et une API de **Bas Niveau Puissante** comme "échappatoire".

**La hiérarchie des actions :**

1.  **Actions Sémantiques (Haut Niveau) :** `INSTALL_PACKAGES`, `ADD_SCRIPT`, `ADD_ENV_VAR`, `ADD_TS_IMPORT`.
    *   **Raisonnement :** Ce sont les intentions les plus courantes. Le contributeur ne devrait pas avoir à savoir que "installer un paquet" est en fait une opération de `MERGE_JSON` sur un fichier `package.json`. La CLI abstrait ce détail pour lui. C'est le cœur de l'expérience développeur.

2.  **Action d'Échappatoire (`ENHANCE_FILE`) (Bas Niveau, mais avec garde-fous) :**
    *   **Raisonnement :** Nous ne pouvons pas prédire toutes les modifications de code possibles. Nous avons donc besoin d'une porte de sortie. Mais au lieu de laisser le contributeur écrire de l'AST directement dans le blueprint (ce qui serait fragile et dangereux), nous avons créé le **système de `Modifiers`**.
    *   **Le `Modifier` est le contrat :** C'est un outil chirurgical, générique et réutilisable (`js-export-wrapper`, `ts-module-enhancer`...) qui réside dans la CLI.
    *   **Le `Blueprint` est le chirurgien :** Il appelle l'outil (`modifier: 'js-export-wrapper'`) et lui donne des instructions précises (`params: { ... }`).
    *   **Pourquoi ce choix ?** Ce modèle est le compromis parfait. Il donne une flexibilité quasi infinie tout en garantissant que la logique de manipulation d'AST, complexe et dangereuse, est centralisée, testée et maintenue par l'équipe cœur. Le `Blueprint` reste un fichier de configuration déclaratif et non un script impératif.

---

## **4. Conclusion : Une Architecture de Compromis Intelligents**

L'architecture de The Architech n'est pas le fruit du hasard. C'est une série de **compromis délibérés** pour équilibrer notre "Triforce".

*   Nous sacrifions l'atomicité **globale** pour gagner en **performance** et en **simplicité** avec le VFS à la demande.
*   Nous sacrifions la "pureté" d'une API avec une seule action pour offrir une **expérience développeur supérieure** avec des actions sémantiques.
*   Nous sacrifions la "flexibilité absolue" du contributeur (qui ne peut pas écrire d'AST directement) pour garantir la **sécurité, la maintenabilité et la scalabilité** de l'écosystème entier grâce au système de `Modifiers`.

Chaque choix a été fait pour résoudre un problème réel, en anticipant les besoins futurs et en respectant toujours notre mission principale : rendre la création de logiciels de haute qualité radicalement plus simple et plus accessible.

