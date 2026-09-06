import type { MarketingMessages } from "./types";

export const nlMarketing: MarketingMessages = {
  shared: {
    missionNewsletter: {
      heading: "Onze missie",
      statementLead: "is het bieden van een",
      safe: "veilige",
      honest: "eerlijke",
      transparent: "transparante",
      statementTail: "keuze bij het boeken van cosmetische behandelingen",
      stayInTouch: "Blijf op de hoogte",
      newsletterSubtitle: "Ontvang updates en nieuws van Cosmediate",
      emailPlaceholder: "Uw e-mailadres",
      send: "Versturen",
      toastInvalidEmail: "Voer een geldig e-mailadres in",
      toastSuccess: "Bedankt dat u voor ons hebt gekozen",
      toastError: "Verzoek kon niet worden verzonden",
    },
    benefits: {
      transparent: {
        title: "Transparant",
        description:
          "Ons doel is een platform te zijn dat zich volledig richt op de ontwikkelingen in de cosmetische markt. Daarbij vinden we het belangrijk transparante informatie te bieden over het brede aanbod aan cosmetische behandelingsopties en de gekwalificeerde klinieken en artsen die deze uitvoeren.",
      },
      safe: {
        title: "Veilig",
        description:
          "We willen aangesloten klinieken de mogelijkheid geven zich via ons platform te presenteren, waarbij we het belangrijk vinden de kwaliteitskeurmerken en de juiste expertise van de betreffende kliniek te benadrukken. Zo werken we samen aan meer veiligheid en zekerheid voor u als consument.",
      },
      accessible: {
        title: "Toegankelijk",
        description:
          "De handige zoekfunctie op Cosmediate maakt het eenvoudig om alle informatie over aangesloten klinieken en mogelijke behandelingen te vinden. Zo maken we het overzicht van mogelijkheden met betrekking tot behandelingen en klinieken toegankelijker voor u als consument.",
      },
    },
    partnerBenefits: {
      moreVisibility: {
        title: "Meer zichtbaarheid",
        description:
          "Vergroot de online zichtbaarheid van uw kliniek. Elke dag zoeken potentiële klanten naar behandelingen op Cosmediate.",
      },
      directBookings: {
        title: "Directe boekingen",
        description:
          "Geïnteresseerde klanten komen rechtstreeks in uw eigen boekingssysteem terecht. Boekingen worden dus direct in de online agenda van uw kliniek ingevoerd.",
      },
      trustworthyReviews: {
        title: "Betrouwbare reviews",
        description:
          "Krijg de reputatie die u verdient. Elke review die u op Cosmediate ontvangt, is van een echte klant, zodat potentiële klanten met vertrouwen kunnen boeken.",
      },
      lowerMarketingCosts: {
        title: "Lagere marketingkosten",
        description:
          "Veel pagina's van Cosmediate scoren hoog in Google-zoekfuncties, wat op zijn beurt gratis marketing en meer verkeer naar de website van uw kliniek oplevert!",
      },
    },
    registerBenefits: {
      moreOnlineVisibility: "Meer online zichtbaarheid",
      lowerMarketingCosts: "Lagere marketingkosten",
      directBookings: "Directe boekingen",
      reliableReviews: "Betrouwbare reviews",
    },
    contactPrompt:
      "Heeft u een vraag of opmerking over een behandeling? Bent u benieuwd naar de mogelijkheden van het platform als kliniek of arts? Of wilt u om een andere reden contact met ons opnemen? Aarzel niet om contact met ons op te nemen.",
    applyNow: "Nu solliciteren!",
    contactUsNow: "Neem nu contact op",
    signUp: "Aanmelden",
    benefitsHeadingClinic: "Wat levert het u als kliniek op?",
    benefitsHeadingRegisterClinic: "Wat levert het mij als kliniek op?",
    benefitsHeadingRegisterDoctor: "Wat levert het mij als arts op?",
    registerFollowUp:
      "Na het invullen van het formulier nemen we graag contact met u op voor meer informatie.",
    heroImageAlt: "Hero-afbeelding",
    contactImageAlt: "contactafbeelding",
    benefitImageAlt: "voordeelafbeelding",
    dateFallback: "Datum",
    blogImageFallback: "Blogafbeelding",
  },
  home: {
    hero: {
      title: "Zorg voor zelfvertrouwen",
      subtitle:
        "Het online platform dat cosmetische behandelingen transparant, veilig en toegankelijk maakt",
      items: [
        "Vergelijk kosten en behandelingen",
        "Vind uw kliniek",
        "Boek uw afspraak",
      ],
      heroImageAlt: "Hero-afbeelding",
    },
    search: {
      tabs: {
        treatments: "behandelingen",
        clinics: "klinieken",
        specialists: "specialisten",
      },
      placeholders: {
        treatments: "Vind uw behandelingen",
        clinics: "Zoek klinieken",
        specialists: "Zoek specialisten",
        dateTime: "Elke datum en tijd",
        location: "Stad / Postcode",
      },
      searchButton: "Zoeken",
    },
    popularClinics: "Populaire klinieken",
    popularTreatments: "Populair gezochte behandelingen",
    exploreCta: "Ontdekken",
    services: {
      headingLine1: "Cosmediate geeft om",
      headingLine2: "de cosmetische sector",
      exploreClinics: "Ontdek klinieken",
      findTreatments: "Vind behandelingen",
      backgroundAlt: "achtergrond diensten",
      cards: [
        {
          title: "Zoeken",
          description: "op locatie of behandeling",
          subDescription: "Vind alle klinieken en artsen bij u in de buurt",
        },
        {
          title: "Lezen",
          description: "eerlijke reviews",
          subDescription:
            "Eerlijke informatie over de behandelingen en klinieken",
        },
        {
          title: "Boeken",
          description: "nu een behandeling",
          subDescription:
            "Kies de behandeling, arts of kliniek die bij u past",
        },
      ],
    },
    features: [
      {
        name: "Behandelingen",
        description: "Cosmetisch",
        urlLabel: "Vinden",
      },
      {
        name: "Beste klinieken",
        description: "in Nederland",
        urlLabel: "Vergelijk",
      },
      {
        name: "Onze blog",
        description: "voor al het nieuws & tips",
        urlLabel: "Lezen",
      },
    ],
    testimonials: {
      registerTitleLine1: "Cosmediate maakt",
      registerTitleLine2: "het verschil",
      registerBody1:
        "We streven ernaar uw platform te worden voor alles wat met de cosmetische markt te maken heeft.",
      registerBody2:
        "Dat kan informatieve artikelen over cosmetische behandelingen zijn, het vergelijken van prijzen en klinieken, maar ook echte ervaringen van klanten en de artsen achter de cosmetische behandelingen.",
      registerCta: "Nu registreren",
      registerImageAlt: "Karin Aarts",
      noReviewsTitle: "Nog geen reviews",
      noReviewsBody:
        "Ontdek, zoek en vergelijk behandelingen en klinieken en voeg uw reviews toe",
    },
    blog: {
      title: "Onze blog",
      subtitle:
        "Geld besparen op cosmetische chirurgie? Controleer uw zorgkosten!",
      readAllPosts: "Lees alle berichten",
    },
  },
  about: {
    pageTitle: "Over ons",
    breadcrumb: "Over ons",
    hero: {
      tagline: "Onze missie",
      title: "Een veilige keuze bieden bij het boeken van cosmetische behandelingen",
      heroImageAlt: "over ons headerafbeelding",
    },
    mission: [
      {
        title: "Cosmediate geeft om de cosmetische sector",
        paragraphs: [
          "Onze missie is consumenten een veilige keuze te bieden bij het boeken van cosmetische behandelingen. Dat doen we door een transparant platform te creëren dat consumenten helpt een weloverwogen beslissing te nemen waarbij ze zich bewust zijn van zowel de voordelen als mogelijke nadelen van een cosmetische behandeling.",
          "Daarnaast willen we professionele klinieken helpen hun expertise aan de wereld te tonen door hun behandelingen, ervaringen, opleidingen, kwaliteitskeurmerken en aangesloten beroepsverenigingen op ons platform te kunnen presenteren. Dit alles zodat een weloverwogen keuze kan worden gemaakt voor een kliniek of arts.",
        ],
        alt: "Cosmediate geeft om de cosmetische sector",
      },
      {
        title: "Het platform bij uitstek voor cosmetische behandelingen",
        paragraphs: [
          "Cosmediate streeft ernaar het platform bij uitstek te worden voor consumenten om meer te leren over cosmetische behandelingen, hun ervaringen te delen en in contact te komen met de beste gecertificeerde klinieken en artsen.",
        ],
      },
      {
        title: "Onze visie",
        paragraphs: [
          "De visie van Cosmediate gaat verder dan alleen cosmetische chirurgie. Nu het taboe rond cosmetische chirurgie verdwijnt, willen we de komende jaren zoveel mogelijk mensen informeren over de normen en waarden in de cosmetische sector en de vele cosmetische opties die beschikbaar zijn.",
          "Vandaag de dag zijn er meer cosmetische behandelingsopties dan ooit tevoren – van botulinetoxine tot fillers, van Emsculpt tot CoolSculpt – en dit zal de komende jaren alleen maar toenemen. Omdat het voor consumenten steeds moeilijker wordt de juiste behandeling en kliniek te vinden in de wirwar van opties, wil Cosmediate onpartijdige en duidelijke informatie bieden over cosmetische behandelingen en de artsen en klinieken die deze uitvoeren. Ons doel is het meest betrouwbare platform in de cosmetische sector te worden.",
        ],
      },
      {
        title: "Vragen?",
        paragraphs: [
          "Heeft u een vraag of opmerking over een behandeling? Bent u benieuwd naar de mogelijkheden van het platform als kliniek of arts? Of wilt u om een andere reden contact met ons opnemen? Aarzel niet om contact met ons op te nemen.",
        ],
        linkLabel: "Neem nu contact op",
        alt: "Cosmediate neem contact op",
      },
    ],
  },
  contact: {
    pageTitle: "Neem nu contact op",
    introHeading:
      "Blijf op de hoogte van het laatste nieuws over cosmetische trends. Cosmediate helpt u de juiste cosmetische behandeling te lezen, vergelijken en boeken!",
    sectionHeading: "Cosmediate geeft om de cosmetische sector.",
    sectionBody:
      "Heeft u een vraag of opmerking over een behandeling? Bent u benieuwd naar de mogelijkheden van het platform als kliniek of arts? Of wilt u om een andere reden contact met ons opnemen? Aarzel niet om contact met ons op te nemen:",
  },
  vacancies: {
    pageTitle: "Vacatures",
    header: {
      title: "Werken bij Cosmediate",
      description:
        "Cosmediate helpt consumenten de juiste cosmetische behandeling te lezen, vergelijken en boeken! Een snelgroeiend platform dat op zoek is naar ambitieuze mensen om met ons mee te groeien en de cosmetische sector te verbeteren!",
      tagLine: "Benieuwd naar onze vacatures?",
    },
    vacancy: {
      title: "Vacature Marketing & Communicatie Stagiair(e)",
      secondaryTitle:
        "Ben jij de marketing- en communicatiestagiair die ons helpt de toekomst van de cosmetische sector te verbeteren?",
      paragraphs: [
        "We zoeken een echte allrounder, zowel creatief als strategisch sterk, om onze groei te versnellen en de merkbekendheid te vergroten. Dit is een unieke kans om deel uit te maken van een start-up en nauw samen te werken met de oprichters in een snelgroeiend platform. Cosmediate is een opkomend cosmetisch platform waar je alle informatie over cosmetische behandelingen kunt vinden. Het is daarom een voordeel als je affiniteit hebt met beauty en cosmetica.",
        "Tijdens je stage leer en doe je veel verschillende dingen. Zeker geen stage waarbij je alleen koffie haalt! 😉 Denk bijvoorbeeld aan het ondersteunen van het SEO-proces door keyword-analyses te maken, social media bij te houden, blogartikelen te schrijven en keiharde sales van kwaliteitsklinieken en artsen. De functie is fulltime en op elk moment beschikbaar. Natuurlijk hanteren we een flexibel hybride werkbeleid, waarbij je zowel op afstand als vanuit kantoor kunt werken. Vrijheid en verantwoordelijkheid 😉 !",
      ],
    },
    sections: [
      {
        title: "Wat houdt je stage in?",
        items: [
          {
            description:
              "Je bent verantwoordelijk voor allround contentmarketing. Je fantasierijke geest kan de vrije loop: denk aan visueel ontwerp, aantrekkelijke SEO-vriendelijke blogs, socialmediaberichten en nieuwsbrieven.",
          },
          {
            description:
              "Je creëert de contentstrategie, stroomlijnt alles in een contentkalender en werkt proactief aan het maken van content.",
          },
          {
            description:
              "Je bewaakt de kanalen en creëert kansen om ons bereik te vergroten. Op basis van de data ontdek je welke content het beste werkt en hoe je deze kunt verbeteren.",
          },
          {
            description:
              "Je ondersteunt het verkoopproces, genereert nieuwe leads en helpt hoogwaardige artsen en klinieken in Nederland te verbinden.",
          },
          {
            description:
              "Naast het ontwikkelen van content ondersteun je het team en de organisatie graag op diverse andere marketingcommunicatiegebieden.",
          },
        ],
        footer:
          "Natuurlijk word je gedurende de hele stage begeleid en ontwikkel je je tot een echte allrounder!",
      },
      {
        title: "Het is een plus als je..",
        items: [
          { description: "Een relevante HBO/WO-opleiding volgt" },
          {
            description:
              "Affiniteit hebt met online marketing en sales en cold calling geen probleem voor je is",
          },
          {
            description:
              "Een zelfstarter bent en kansen met beide handen aangrijpt",
          },
          {
            description:
              "Gemotiveerd bent en hard werken voor jou niet ongewoon is",
          },
          {
            description:
              "Uitstekende beheersing van de Nederlandse taal, zowel mondeling als schriftelijk.",
          },
          {
            description:
              "Beschikbaar bent voor minimaal 32 uur per week gedurende een periode van minimaal 20 weken.",
          },
          { description: "Geïnteresseerd bent in beauty en cosmetica" },
          { description: "Open staat voor gezamenlijke borrels en uitjes" },
        ],
        footer:
          "Als je om groei geeft en er deel van wilt uitmaken, praten we graag met je. Aarzel niet om te reageren als je denkt dat je nog niet helemaal in het profiel past; we kijken naar jou als persoon en niet alleen naar je diploma's en kwalificaties en staan altijd open voor een kop koffie!",
      },
    ],
  },
  partnersClinics: {
    pageTitle: "Informatie voor klinieken",
    breadcrumb: "Informatie voor klinieken",
    hero: {
      title: "Cosmediate geeft om de cosmetische sector.",
      secondaryText:
        "Daarom investeren we in een platform dat de cosmetische sector transparant, veilig en toegankelijk maakt.",
      imageAlt: "partners hero-afbeelding",
    },
    contactCards: [
      {
        title: "Zichtbaar zijn op Cosmediate?",
        paragraphs: [
          "Registreren op Cosmediate is eenvoudig en vrijblijvend! Omdat we alle kwaliteitsklinieken en artsen een eerlijke kans willen geven de bètaversie van ons platform en de voordelen ervan te ervaren, is deelname aan ons platform volledig vrijblijvend – u bent aan niets gebonden!",
          "Neem dus snel contact met ons op of registreer uw kliniek via de knop hieronder.",
        ],
      },
      {
        title: "Vraag?",
        paragraphs: [
          "Heeft u een vraag of opmerking over een behandeling? Bent u benieuwd naar de mogelijkheden van het platform als kliniek of arts? Of wilt u om een andere reden contact met ons opnemen? Aarzel niet om contact met ons op te nemen.",
        ],
      },
    ],
    coreBenefits: {
      transparent: {
        title: "Transparant",
        description:
          "We streven ernaar een platform te worden dat zich volledig richt op de ontwikkelingen in de cosmetische markt. Daarbij vinden we het belangrijk informatie te bieden over behandelingen, kwaliteitsklinieken uit te lichten en interviews te houden met de artsen achter de cosmetische behandelingen.",
      },
      safe: {
        title: "Veilig",
        description:
          "We willen aangesloten klinieken de mogelijkheid geven zich via ons platform te presenteren, waarbij we het belangrijk vinden de kwaliteitskeurmerken en expertise van uw kliniek te benadrukken. Door uw kliniek via ons platform te registreren, kunnen klanten in een mum van tijd zien waarom uw kliniek een goede keuze is. Zo werken we samen aan meer veiligheid en zekerheid voor de consument.",
      },
      accessible: {
        title: "Toegankelijk",
        description:
          "De handige zoekfunctie op Cosmediate maakt het eenvoudig om alle informatie over aangesloten klinieken en mogelijke behandelingen te vinden. Zo maken we het overzicht van mogelijkheden met betrekking tot behandelingen en klinieken toegankelijk voor consumenten.",
      },
    },
  },
  registerClinic: {
    pageTitle: "Registreer een kliniek",
    heroTitle:
      "Registreer nu vrijblijvend als kliniek en creëer meer zichtbaarheid via Cosmediate.",
  },
  registerDoctor: {
    pageTitle: "Registreer als arts",
    heroTitle:
      "Registreer nu vrijblijvend als arts en creëer meer zichtbaarheid via Cosmediate.",
  },
};
