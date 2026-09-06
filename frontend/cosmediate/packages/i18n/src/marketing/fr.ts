import type { MarketingMessages } from "./types";

export const frMarketing: MarketingMessages = {
  shared: {
    missionNewsletter: {
      heading: "Notre mission",
      statementLead: "est de fournir un choix",
      safe: "sûr",
      honest: "honnête",
      transparent: "transparent",
      statementTail: "lors de la réservation de traitements cosmétiques",
      stayInTouch: "Restez en contact",
      newsletterSubtitle: "Recevez les actualités et nouvelles de Cosmediate",
      emailPlaceholder: "Votre adresse e-mail",
      send: "Envoyer",
      toastInvalidEmail: "Veuillez saisir une adresse e-mail valide",
      toastSuccess: "Merci de nous avoir choisis",
      toastError: "Échec de l'envoi de la demande",
    },
    benefits: {
      transparent: {
        title: "Transparent",
        description:
          "Notre objectif est d'être une plateforme entièrement axée sur les évolutions du marché cosmétique. Pour ce faire, nous estimons important de fournir des informations transparentes sur le large éventail d'options de traitements cosmétiques et les cliniques et médecins qualifiés qui les pratiquent.",
      },
      safe: {
        title: "Sûr",
        description:
          "Nous souhaitons donner aux cliniques affiliées la possibilité de se présenter via notre plateforme, en mettant en avant les labels de qualité et l'expertise appropriée de la clinique concernée. Ainsi, nous travaillons ensemble pour plus de sécurité pour vous en tant que consommateur.",
      },
      accessible: {
        title: "Accessible",
        description:
          "La fonction de recherche pratique sur Cosmediate facilite la recherche de toutes les informations sur les cliniques affiliées et les traitements possibles. De cette manière, nous rendons l'aperçu des possibilités en matière de traitements et de cliniques plus accessible pour vous en tant que consommateur.",
      },
    },
    partnerBenefits: {
      moreVisibility: {
        title: "Plus de visibilité",
        description:
          "Augmentez la visibilité en ligne de votre clinique. Chaque jour, des clients potentiels recherchent des traitements sur Cosmediate.",
      },
      directBookings: {
        title: "Réservations directes",
        description:
          "Les clients intéressés accèdent directement à votre propre système de réservation. Les réservations sont donc saisies directement dans l'agenda en ligne de votre clinique.",
      },
      trustworthyReviews: {
        title: "Avis fiables",
        description:
          "Obtenez la réputation que vous méritez. Chaque avis que vous recevez sur Cosmediate provient d'un vrai client, permettant aux clients potentiels de réserver en toute confiance.",
      },
      lowerMarketingCosts: {
        title: "Coûts marketing réduits",
        description:
          "De nombreuses pages de Cosmediate obtiennent de bons classements dans les fonctions de recherche Google, ce qui offre un marketing gratuit et plus de trafic vers le site web de votre clinique !",
      },
    },
    registerBenefits: {
      moreOnlineVisibility: "Plus de visibilité en ligne",
      lowerMarketingCosts: "Coûts marketing réduits",
      directBookings: "Réservations directes",
      reliableReviews: "Avis fiables",
    },
    contactPrompt:
      "Vous avez une question ou un commentaire sur un traitement ? Vous êtes curieux des possibilités de la plateforme en tant que clinique ou médecin ? Ou souhaitez-vous nous contacter pour une autre raison ? N'hésitez pas à nous contacter.",
    applyNow: "Postulez maintenant !",
    contactUsNow: "Contactez-nous maintenant",
    signUp: "S'inscrire",
    benefitsHeadingClinic: "Qu'est-ce que cela vous apporte en tant que clinique ?",
    benefitsHeadingRegisterClinic: "Qu'est-ce que cela m'apporte en tant que clinique ?",
    benefitsHeadingRegisterDoctor: "Qu'est-ce que cela m'apporte en tant que médecin ?",
    registerFollowUp:
      "Après avoir rempli le formulaire, nous serons heureux de vous contacter pour plus d'informations.",
    heroImageAlt: "Image hero",
    contactImageAlt: "image de contact",
    benefitImageAlt: "image avantage",
    dateFallback: "Date",
    blogImageFallback: "Image du blog",
  },
  home: {
    hero: {
      title: "Prendre soin de la confiance en soi",
      subtitle:
        "La plateforme en ligne qui rend les traitements cosmétiques transparents, sûrs et accessibles",
      items: [
        "Comparer les coûts et les traitements",
        "Trouver votre clinique",
        "Réserver votre rendez-vous",
      ],
      heroImageAlt: "Image hero",
    },
    search: {
      tabs: {
        treatments: "traitements",
        clinics: "cliniques",
        specialists: "spécialistes",
      },
      placeholders: {
        treatments: "Trouvez vos traitements",
        clinics: "Rechercher des cliniques",
        specialists: "Rechercher des spécialistes",
        dateTime: "Toute date et heure",
        location: "Ville / Code postal",
      },
      searchButton: "Rechercher",
    },
    popularClinics: "Cliniques populaires",
    popularTreatments: "Traitements les plus recherchés",
    exploreCta: "Explorer",
    services: {
      headingLine1: "Cosmediate se soucie",
      headingLine2: "de l'industrie cosmétique",
      exploreClinics: "Explorer les cliniques",
      findTreatments: "Trouver des traitements",
      backgroundAlt: "arrière-plan services",
      cards: [
        {
          title: "Rechercher",
          description: "par lieu ou traitement",
          subDescription: "Trouvez toutes les cliniques et médecins près de chez vous",
        },
        {
          title: "Lire",
          description: "des avis honnêtes",
          subDescription:
            "Des informations honnêtes sur les traitements et les cliniques",
        },
        {
          title: "Réserver",
          description: "un traitement maintenant",
          subDescription:
            "Choisissez le traitement, le médecin ou la clinique qui vous convient",
        },
      ],
    },
    features: [
      {
        name: "Traitements",
        description: "Cosmétique",
        urlLabel: "Trouver",
      },
      {
        name: "Meilleures cliniques",
        description: "aux Pays-Bas",
        urlLabel: "Comparer",
      },
      {
        name: "Notre blog",
        description: "pour toutes les actualités & conseils",
        urlLabel: "Lire",
      },
    ],
    testimonials: {
      registerTitleLine1: "Cosmediate fait",
      registerTitleLine2: "la différence",
      registerBody1:
        "Nous visons à devenir votre plateforme de référence pour tout ce qui concerne le marché cosmétique.",
      registerBody2:
        "Il peut s'agir d'articles informatifs sur les traitements cosmétiques, de la comparaison des prix et des cliniques, mais aussi des expériences réelles des clients et des médecins derrière les traitements cosmétiques.",
      registerCta: "S'inscrire maintenant",
      registerImageAlt: "Karin Aarts",
      noReviewsTitle: "Pas encore d'avis",
      noReviewsBody:
        "Explorez, recherchez et comparez les traitements et les cliniques et ajoutez vos avis",
    },
    blog: {
      title: "Notre blog",
      subtitle:
        "Économiser sur la chirurgie esthétique ? Vérifiez vos frais de santé !",
      readAllPosts: "Lire tous les articles",
    },
  },
  about: {
    pageTitle: "À propos de nous",
    breadcrumb: "À propos de nous",
    hero: {
      tagline: "Notre mission",
      title: "Offrir un choix sûr lors de la réservation de traitements cosmétiques",
      heroImageAlt: "image d'en-tête à propos",
    },
    mission: [
      {
        title: "Cosmediate se soucie de l'industrie cosmétique",
        paragraphs: [
          "Notre mission est d'offrir aux consommateurs un choix sûr lors de la réservation de traitements cosmétiques. Nous le faisons en créant une plateforme transparente qui aide les consommateurs à prendre une décision réfléchie en étant conscients à la fois des avantages et des inconvénients possibles d'un traitement cosmétique.",
          "De plus, nous souhaitons aider les cliniques professionnelles à montrer leur expertise au monde en pouvant présenter leurs traitements, expériences, formations, labels de qualité et associations professionnelles affiliées sur notre plateforme. Tout cela pour qu'un choix réfléchi puisse être fait pour une clinique ou un médecin.",
        ],
        alt: "Cosmediate se soucie de l'industrie cosmétique",
      },
      {
        title: "La plateforme de référence pour les traitements cosmétiques",
        paragraphs: [
          "Cosmediate vise à devenir la plateforme de référence pour les consommateurs afin d'en apprendre davantage sur les traitements cosmétiques, de partager leurs expériences et de se connecter avec les meilleures cliniques et médecins certifiés.",
        ],
      },
      {
        title: "Notre vision",
        paragraphs: [
          "La vision de Cosmediate va au-delà de la chirurgie esthétique seule. Surtout maintenant que le tabou entourant la chirurgie esthétique disparaît, nous souhaitons informer le plus grand nombre de personnes possible dans les années à venir sur les normes et valeurs de l'industrie cosmétique et les nombreuses options cosmétiques disponibles.",
          "Aujourd'hui, il existe plus d'options de traitements cosmétiques que jamais – de la toxine botulique aux fillers, d'Emsculpt à CoolSculpt – et cela ne fera qu'augmenter dans les années à venir. Comme il devient de plus en plus difficile pour les consommateurs de trouver le bon traitement et la bonne clinique dans la multitude d'options, Cosmediate souhaite offrir des informations impartiales et claires sur les traitements cosmétiques et les médecins et cliniques qui les pratiquent. Notre objectif est de devenir la plateforme la plus fiable de l'industrie cosmétique.",
        ],
      },
      {
        title: "Des questions ?",
        paragraphs: [
          "Vous avez une question ou un commentaire sur un traitement ? Vous êtes curieux des possibilités de la plateforme en tant que clinique ou médecin ? Ou souhaitez-vous nous contacter pour une autre raison ? N'hésitez pas à nous contacter.",
        ],
        linkLabel: "Contactez-nous maintenant",
        alt: "Cosmediate contactez-nous",
      },
    ],
  },
  contact: {
    pageTitle: "Contactez-nous maintenant",
    introHeading:
      "Restez informé des dernières tendances cosmétiques. Cosmediate vous aide à lire, comparer et réserver le bon traitement cosmétique !",
    sectionHeading: "Cosmediate se soucie de l'industrie cosmétique.",
    sectionBody:
      "Vous avez une question ou un commentaire sur un traitement ? Vous êtes curieux des possibilités de la plateforme en tant que clinique ou médecin ? Ou souhaitez-vous nous contacter pour une autre raison ? N'hésitez pas à nous contacter :",
  },
  vacancies: {
    pageTitle: "Offres d'emploi",
    header: {
      title: "Travailler chez Cosmediate",
      description:
        "Cosmediate aide les consommateurs à lire, comparer et réserver le bon traitement cosmétique ! Une plateforme en pleine croissance à la recherche de personnes ambitieuses pour grandir avec nous et améliorer l'industrie cosmétique !",
      tagLine: "Curieux de nos offres d'emploi ?",
    },
    vacancy: {
      title: "Offre Stagiaire Marketing & Communication",
      secondaryTitle:
        "Êtes-vous le stagiaire en marketing et communication qui nous aidera à améliorer l'avenir de l'industrie cosmétique ?",
      paragraphs: [
        "Nous recherchons un véritable touche-à-tout, à la fois créatif et stratégiquement fort, pour accélérer notre croissance et accroître la notoriété de la marque. C'est une opportunité unique de faire partie d'une start-up et de travailler en étroite collaboration avec les fondateurs sur une plateforme en pleine croissance. Cosmediate est une plateforme cosmétique émergente où vous pouvez trouver toutes les informations sur les traitements cosmétiques. Il est donc un avantage d'avoir une affinité avec la beauté et les cosmétiques.",
        "Pendant votre stage, vous apprendrez et ferez beaucoup de choses différentes. Certainement pas un stage où vous ne faites que servir le café ! 😉 Pensez par exemple à soutenir le processus SEO en réalisant des analyses de mots-clés, en gérant les réseaux sociaux, en rédigeant des articles de blog et en assurant un commercial acharné auprès de cliniques et médecins de qualité. Le poste est à temps plein et disponible à tout moment. Bien sûr, nous avons une politique de travail hybride flexible, où vous pouvez travailler à distance et au bureau. Liberté et responsabilité 😉 !",
      ],
    },
    sections: [
      {
        title: "Alors, en quoi consistera votre stage ?",
        items: [
          {
            description:
              "Vous serez responsable du marketing de contenu global. Votre esprit imaginatif pourra s'exprimer librement : pensez au design visuel, aux blogs attrayants et optimisés SEO, aux publications sur les réseaux sociaux et aux newsletters.",
          },
          {
            description:
              "Vous créez la stratégie de contenu, organisez tout dans un calendrier éditorial et travaillez de manière proactive à la création de contenu.",
          },
          {
            description:
              "Vous surveillez les canaux et créez des opportunités pour augmenter notre portée. Sur la base des données, vous découvrez quel contenu fonctionne le mieux et comment l'améliorer.",
          },
          {
            description:
              "Vous soutenez le processus de vente, générez de nouveaux prospects et aidez à connecter des médecins et cliniques de haute qualité aux Pays-Bas.",
          },
          {
            description:
              "En plus de développer du contenu, vous aimez soutenir l'équipe et l'organisation dans divers autres aspects de la communication marketing.",
          },
        ],
        footer:
          "Bien sûr, vous serez accompagné tout au long du processus et vous deviendrez un véritable touche-à-tout !",
      },
      {
        title: "C'est un plus si vous..",
        items: [
          { description: "Suivez une formation HBO/WO pertinente" },
          {
            description:
              "Avez une affinité avec le marketing en ligne et la vente et que la prospection téléphonique ne vous pose pas de problème",
          },
          {
            description:
              "Êtes autonome et saisissez les opportunités à deux mains",
          },
          {
            description:
              "Êtes motivé et le travail acharné n'est pas inhabituel pour vous",
          },
          {
            description:
              "Maîtrisez parfaitement la langue néerlandaise, à l'oral comme à l'écrit.",
          },
          {
            description:
              "Êtes disponible au moins 32 heures par semaine pendant une période d'au moins 20 semaines.",
          },
          { description: "Êtes intéressé par la beauté et les cosmétiques" },
          { description: "Êtes ouvert aux verres et sorties en groupe" },
        ],
        footer:
          "Si la croissance vous tient à cœur et que vous souhaitez en faire partie, nous serions ravis d'échanger avec vous. N'hésitez pas à répondre si vous pensez ne pas correspondre tout à fait au profil – nous regardons la personne que vous êtes et pas seulement vos diplômes et qualifications, et nous sommes toujours ouverts à un café !",
      },
    ],
  },
  partnersClinics: {
    pageTitle: "Informations pour les cliniques",
    breadcrumb: "Informations pour les cliniques",
    hero: {
      title: "Cosmediate se soucie de l'industrie cosmétique.",
      secondaryText:
        "C'est pourquoi nous investissons dans une plateforme qui rend l'industrie cosmétique transparente, sûre et accessible.",
      imageAlt: "image hero partenaires",
    },
    contactCards: [
      {
        title: "Vous souhaitez être visible sur Cosmediate ?",
        paragraphs: [
          "S'inscrire sur Cosmediate est simple et sans engagement ! Comme nous souhaitons donner à toutes les cliniques et médecins de qualité une chance équitable de découvrir la version bêta de notre plateforme et ses avantages, rejoindre notre plateforme est entièrement sans engagement – vous n'êtes engagé envers rien !",
          "Contactez-nous rapidement ou inscrivez votre clinique via le bouton ci-dessous.",
        ],
      },
      {
        title: "Question ?",
        paragraphs: [
          "Vous avez une question ou un commentaire sur un traitement ? Vous êtes curieux des possibilités de la plateforme en tant que clinique ou médecin ? Ou souhaitez-vous nous contacter pour une autre raison ? N'hésitez pas à nous contacter.",
        ],
      },
    ],
    coreBenefits: {
      transparent: {
        title: "Transparent",
        description:
          "Nous visons à devenir une plateforme entièrement axée sur les développements du marché cosmétique. Pour ce faire, il nous importe de fournir des informations sur les traitements, de mettre en avant les cliniques de qualité et de mener des entretiens avec les médecins derrière les traitements cosmétiques.",
      },
      safe: {
        title: "Sûr",
        description:
          "Nous voulons donner aux cliniques affiliées la possibilité de se présenter via notre plateforme, en mettant en avant les labels de qualité et l'expertise de votre clinique. En inscrivant votre clinique via notre plateforme, les clients peuvent rapidement voir pourquoi votre clinique est un bon choix. Ainsi, nous travaillons ensemble pour plus de sécurité pour le consommateur.",
      },
      accessible: {
        title: "Accessible",
        description:
          "La fonction de recherche pratique sur Cosmediate permet de trouver facilement toutes les informations sur les cliniques affiliées et les traitements possibles. Ainsi, nous rendons l'aperçu des possibilités concernant les traitements et les cliniques accessible aux consommateurs.",
      },
    },
  },
  registerClinic: {
    pageTitle: "Inscrire une clinique",
    heroTitle:
      "Inscrivez-vous maintenant sans engagement en tant que clinique et gagnez en visibilité via Cosmediate.",
  },
  registerDoctor: {
    pageTitle: "S'inscrire en tant que médecin",
    heroTitle:
      "Inscrivez-vous maintenant sans engagement en tant que médecin et gagnez en visibilité via Cosmediate.",
  },
};
