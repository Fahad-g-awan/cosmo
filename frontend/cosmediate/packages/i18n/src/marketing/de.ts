import type { MarketingMessages } from "./types";

export const deMarketing: MarketingMessages = {
  shared: {
    missionNewsletter: {
      heading: "Unsere Mission",
      statementLead: "ist es, eine",
      safe: "sichere",
      honest: "ehrliche",
      transparent: "transparente",
      statementTail: "Wahl bei der Buchung kosmetischer Behandlungen zu bieten",
      stayInTouch: "Bleiben Sie in Kontakt",
      newsletterSubtitle: "Erhalten Sie Updates und Neuigkeiten von Cosmediate",
      emailPlaceholder: "Ihre E-Mail-Adresse",
      send: "Senden",
      toastInvalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      toastSuccess: "Vielen Dank, dass Sie sich für uns entschieden haben",
      toastError: "Anfrage konnte nicht gesendet werden",
    },
    benefits: {
      transparent: {
        title: "Transparent",
        description:
          "Unser Ziel ist es, eine Plattform zu sein, die sich vollständig auf die Entwicklungen im Kosmetikmarkt konzentriert. Dabei ist es uns wichtig, transparente Informationen über das breite Spektrum kosmetischer Behandlungsoptionen und die qualifizierten Kliniken und Ärzte, die diese durchführen, bereitzustellen.",
      },
      safe: {
        title: "Sicher",
        description:
          "Wir möchten angeschlossenen Kliniken die Möglichkeit geben, sich über unsere Plattform zu präsentieren, wobei wir es wichtig finden, die Qualitätssiegel und die richtige Expertise der jeweiligen Klinik hervorzuheben. So arbeiten wir gemeinsam an mehr Sicherheit für Sie als Verbraucher.",
      },
      accessible: {
        title: "Zugänglich",
        description:
          "Die praktische Suchfunktion auf Cosmediate macht es einfach, alle Informationen über angeschlossene Kliniken und mögliche Behandlungen zu finden. So machen wir den Überblick über Behandlungs- und Klinikmöglichkeiten für Sie als Verbraucher zugänglicher.",
      },
    },
    partnerBenefits: {
      moreVisibility: {
        title: "Mehr Sichtbarkeit",
        description:
          "Steigern Sie die Online-Sichtbarkeit Ihrer Klinik. Jeden Tag suchen potenzielle Kunden auf Cosmediate nach Behandlungen.",
      },
      directBookings: {
        title: "Direkte Buchungen",
        description:
          "Interessierte Kunden gelangen direkt in Ihr eigenes Buchungssystem. Buchungen werden somit direkt in den Online-Kalender Ihrer Klinik eingetragen.",
      },
      trustworthyReviews: {
        title: "Vertrauenswürdige Bewertungen",
        description:
          "Erhalten Sie die Reputation, die Sie verdienen. Jede Bewertung, die Sie auf Cosmediate erhalten, stammt von einem echten Kunden, sodass potenzielle Kunden mit Vertrauen buchen können.",
      },
      lowerMarketingCosts: {
        title: "Geringere Marketingkosten",
        description:
          "Viele Seiten von Cosmediate erzielen hohe Rankings in Google-Suchfunktionen, was wiederum kostenloses Marketing und mehr Traffic auf die Website Ihrer Klinik bringt!",
      },
    },
    registerBenefits: {
      moreOnlineVisibility: "Mehr Online-Sichtbarkeit",
      lowerMarketingCosts: "Geringere Marketingkosten",
      directBookings: "Direkte Buchungen",
      reliableReviews: "Zuverlässige Bewertungen",
    },
    contactPrompt:
      "Haben Sie eine Frage oder Anmerkung zu einer Behandlung? Sind Sie neugierig auf die Möglichkeiten der Plattform als Klinik oder Arzt? Oder möchten Sie uns aus einem anderen Grund erreichen? Zögern Sie nicht, uns zu kontaktieren.",
    applyNow: "Jetzt bewerben!",
    contactUsNow: "Kontaktieren Sie uns jetzt",
    signUp: "Registrieren",
    benefitsHeadingClinic: "Was bringt es Ihnen als Klinik?",
    benefitsHeadingRegisterClinic: "Was bringt es mir als Klinik?",
    benefitsHeadingRegisterDoctor: "Was bringt es mir als Arzt?",
    registerFollowUp:
      "Nach dem Ausfüllen des Formulars kontaktieren wir Sie gerne für weitere Informationen.",
    heroImageAlt: "Hero-Bild",
    contactImageAlt: "Kontaktbild",
    benefitImageAlt: "Vorteilsbild",
    dateFallback: "Datum",
    blogImageFallback: "Blog-Bild",
  },
  home: {
    hero: {
      title: "Pflege für Selbstvertrauen",
      subtitle:
        "Die Online-Plattform, die kosmetische Behandlungen transparent, sicher und zugänglich macht",
      items: [
        "Kosten und Behandlungen vergleichen",
        "Ihre Klinik finden",
        "Ihren Termin buchen",
      ],
      heroImageAlt: "Hero-Bild",
    },
    search: {
      tabs: {
        treatments: "Behandlungen",
        clinics: "Kliniken",
        specialists: "Spezialisten",
      },
      placeholders: {
        treatments: "Finden Sie Ihre Behandlungen",
        clinics: "Kliniken suchen",
        specialists: "Spezialisten suchen",
        dateTime: "Beliebige Zeit und Datum",
        location: "Stadt / Postleitzahl",
      },
      searchButton: "Suchen",
    },
    popularClinics: "Beliebte Kliniken",
    popularTreatments: "Beliebt gesuchte Behandlungen",
    exploreCta: "Entdecken",
    services: {
      headingLine1: "Cosmediate kümmert sich",
      headingLine2: "um die Kosmetikbranche",
      exploreClinics: "Kliniken entdecken",
      findTreatments: "Behandlungen finden",
      backgroundAlt: "Dienste-Hintergrund",
      cards: [
        {
          title: "Suchen",
          description: "nach Standort oder Behandlung",
          subDescription: "Finden Sie alle Kliniken und Ärzte in Ihrer Nähe",
        },
        {
          title: "Lesen",
          description: "ehrliche Bewertungen",
          subDescription:
            "Ehrliche Informationen über die Behandlungen und Kliniken",
        },
        {
          title: "Buchen",
          description: "jetzt eine Behandlung",
          subDescription:
            "Wählen Sie die Behandlung, den Arzt oder die Klinik, die zu Ihnen passt",
        },
      ],
    },
    features: [
      {
        name: "Behandlungen",
        description: "Kosmetisch",
        urlLabel: "Finden",
      },
      {
        name: "Beste Kliniken",
        description: "in den Niederlanden",
        urlLabel: "Vergleichen",
      },
      {
        name: "Unser Blog",
        description: "für alle News & Tipps",
        urlLabel: "Lesen",
      },
    ],
    testimonials: {
      registerTitleLine1: "Cosmediate macht",
      registerTitleLine2: "den Unterschied",
      registerBody1:
        "Wir streben danach, Ihre Anlaufstelle für alles rund um den Kosmetikmarkt zu werden.",
      registerBody2:
        "Das können informative Artikel über kosmetische Behandlungen sein, der Vergleich von Preisen und Kliniken, aber auch echte Erfahrungen von Kunden und den Ärzten hinter den kosmetischen Behandlungen.",
      registerCta: "Jetzt registrieren",
      registerImageAlt: "Karin Aarts",
      noReviewsTitle: "Noch keine Bewertungen",
      noReviewsBody:
        "Entdecken, suchen und vergleichen Sie Behandlungen und Kliniken und fügen Sie Ihre Bewertungen hinzu",
    },
    blog: {
      title: "Unser Blog",
      subtitle:
        "Geld sparen bei kosmetischer Chirurgie? Prüfen Sie Ihre Gesundheitskosten!",
      readAllPosts: "Alle Beiträge lesen",
    },
  },
  about: {
    pageTitle: "Über uns",
    breadcrumb: "Über uns",
    hero: {
      tagline: "Unsere Mission",
      title: "Eine sichere Wahl bei der Buchung kosmetischer Behandlungen bieten",
      heroImageAlt: "Über-uns-Headerbild",
    },
    mission: [
      {
        title: "Cosmediate kümmert sich um die Kosmetikbranche",
        paragraphs: [
          "Unsere Mission ist es, Verbrauchern eine sichere Wahl bei der Buchung kosmetischer Behandlungen zu bieten. Das tun wir, indem wir eine transparente Plattform schaffen, die Verbrauchern hilft, eine wohlüberlegte Entscheidung zu treffen, bei der sie sich der Vorteile und möglichen Nachteile einer kosmetischen Behandlung bewusst sind.",
          "Darüber hinaus möchten wir professionellen Kliniken helfen, ihre Expertise der Welt zu zeigen, indem sie ihre Behandlungen, Erfahrungen, Ausbildungen, Qualitätssiegel und angeschlossenen Berufsverbände auf unserer Plattform präsentieren können. All dies, damit eine wohlüberlegte Wahl für eine Klinik oder einen Arzt getroffen werden kann.",
        ],
        alt: "Cosmediate kümmert sich um die Kosmetikbranche",
      },
      {
        title: "Die Anlaufstelle für kosmetische Behandlungen",
        paragraphs: [
          "Cosmediate strebt danach, die Anlaufstelle für Verbraucher zu werden, um mehr über kosmetische Behandlungen zu erfahren, ihre Erfahrungen zu teilen und sich mit den besten zertifizierten Kliniken und Ärzten zu verbinden.",
        ],
      },
      {
        title: "Unsere Vision",
        paragraphs: [
          "Die Vision von Cosmediate geht über kosmetische Chirurgie allein hinaus. Gerade jetzt, da das Tabu rund um kosmetische Chirurgie verschwindet, möchten wir in den kommenden Jahren so viele Menschen wie möglich über die Standards und Werte in der Kosmetikbranche und die vielen verfügbaren kosmetischen Optionen informieren.",
          "Heute gibt es mehr kosmetische Behandlungsoptionen als je zuvor – von Botulinumtoxin bis zu Fillern, von Emsculpt bis CoolSculpt – und dies wird in den kommenden Jahren nur noch zunehmen. Da es für Verbraucher immer schwieriger wird, die richtige Behandlung und Klinik im Dickicht der Optionen zu finden, möchte Cosmediate unvoreingenommene und klare Informationen über kosmetische Behandlungen und die Ärzte und Kliniken, die diese durchführen, bieten. Unser Ziel ist es, die zuverlässigste Plattform in der Kosmetikbranche zu werden.",
        ],
      },
      {
        title: "Fragen?",
        paragraphs: [
          "Haben Sie eine Frage oder Anmerkung zu einer Behandlung? Sind Sie neugierig auf die Möglichkeiten der Plattform als Klinik oder Arzt? Oder möchten Sie uns aus einem anderen Grund erreichen? Zögern Sie nicht, uns zu kontaktieren.",
        ],
        linkLabel: "Kontaktieren Sie uns jetzt",
        alt: "Cosmediate kontaktieren",
      },
    ],
  },
  contact: {
    pageTitle: "Kontaktieren Sie uns jetzt",
    introHeading:
      "Bleiben Sie auf dem Laufenden über die neuesten Trends in der Kosmetik. Cosmediate hilft Ihnen, die richtige kosmetische Behandlung zu lesen, zu vergleichen und zu buchen!",
    sectionHeading: "Cosmediate kümmert sich um die Kosmetikbranche.",
    sectionBody:
      "Haben Sie eine Frage oder Anmerkung zu einer Behandlung? Sind Sie neugierig auf die Möglichkeiten der Plattform als Klinik oder Arzt? Oder möchten Sie uns aus einem anderen Grund erreichen? Zögern Sie nicht, uns zu kontaktieren:",
  },
  vacancies: {
    pageTitle: "Stellenangebote",
    header: {
      title: "Arbeiten bei Cosmediate",
      description:
        "Cosmediate hilft Verbrauchern, die richtige kosmetische Behandlung zu lesen, zu vergleichen und zu buchen! Eine schnell wachsende Plattform, die ambitionierte Menschen sucht, die mit uns wachsen und die Kosmetikbranche verbessern möchten!",
      tagLine: "Neugierig auf unsere Stellenangebote?",
    },
    vacancy: {
      title: "Stelle Praktikant/in Marketing & Kommunikation",
      secondaryTitle:
        "Sind Sie der Marketing- und Kommunikationspraktikant, der uns hilft, die Zukunft der Kosmetikbranche zu verbessern?",
      paragraphs: [
        "Wir suchen einen echten Allrounder, sowohl kreativ als auch strategisch stark, um unser Wachstum zu beschleunigen und die Markenbekanntheit zu steigern. Dies ist eine einzigartige Gelegenheit, Teil eines Start-ups zu sein und eng mit den Gründern in einer schnell wachsenden Plattform zusammenzuarbeiten. Cosmediate ist eine aufstrebende Kosmetikplattform, auf der Sie alle Informationen über kosmetische Behandlungen finden können. Es ist daher von Vorteil, wenn Sie eine Affinität zu Beauty und Kosmetik haben.",
        "Während Ihres Praktikums lernen und tun Sie viele verschiedene Dinge. Definitiv kein Praktikum, bei dem Sie nur Kaffee holen! 😉 Denken Sie zum Beispiel an die Unterstützung des SEO-Prozesses durch Keyword-Analysen, die Betreuung der Social-Media-Kanäle, das Schreiben von Blogartikeln und harten Vertrieb von Qualitätskliniken und Ärzten. Die Position ist Vollzeit und jederzeit verfügbar. Natürlich haben wir eine flexible hybride Arbeitsrichtlinie, bei der Sie sowohl remote als auch im Büro arbeiten können. Freiheit und Verantwortung 😉 !",
      ],
    },
    sections: [
      {
        title: "Was beinhaltet Ihr Praktikum?",
        items: [
          {
            description:
              "Sie sind verantwortlich für umfassendes Content-Marketing. Ihrer fantasievollen Ader sind keine Grenzen gesetzt: denken Sie an visuelles Design, ansprechende SEO-freundliche Blogs, Social-Media-Posts und Newsletter.",
          },
          {
            description:
              "Sie erstellen die Content-Strategie, strukturieren alles in einem Content-Kalender und arbeiten proaktiv an der Erstellung von Inhalten.",
          },
          {
            description:
              "Sie überwachen die Kanäle und schaffen Möglichkeiten, unsere Reichweite zu erhöhen. Anhand der Daten finden Sie heraus, welche Inhalte am besten funktionieren und wie Sie diese verbessern können.",
          },
          {
            description:
              "Sie unterstützen den Verkaufsprozess, generieren neue Leads und helfen dabei, hochwertige Ärzte und Kliniken in den Niederlanden zu verbinden.",
          },
          {
            description:
              "Neben der Entwicklung von Inhalten unterstützen Sie das Team und die Organisation gerne in verschiedenen anderen Marketingkommunikationsbereichen.",
          },
        ],
        footer:
          "Natürlich werden Sie währenddessen angeleitet und entwickeln sich zu einem echten Allrounder!",
      },
      {
        title: "Es ist ein Plus, wenn Sie..",
        items: [
          { description: "Eine relevante HBO/WO-Ausbildung absolvieren" },
          {
            description:
              "Eine Affinität zu Online-Marketing und Vertrieb haben und Kaltakquise kein Problem für Sie ist",
          },
          {
            description:
              "Ein Selbststarter sind und Chancen mit beiden Händen ergreifen",
          },
          {
            description:
              "Motiviert sind und harte Arbeit für Sie nicht ungewöhnlich ist",
          },
          {
            description:
              "Ausgezeichnete Beherrschung der niederländischen Sprache, sowohl mündlich als auch schriftlich.",
          },
          {
            description:
              "Für mindestens 32 Stunden pro Woche über einen Zeitraum von mindestens 20 Wochen verfügbar sind.",
          },
          { description: "An Beauty und Kosmetik interessiert sind" },
          { description: "Offen für gemeinsame Drinks und Ausflüge sind" },
        ],
        footer:
          "Wenn Ihnen Wachstum wichtig ist und Sie Teil davon sein möchten, würden wir gerne mit Ihnen sprechen. Zögern Sie nicht zu antworten, wenn Sie denken, dass Sie noch nicht ganz ins Profil passen – wir schauen auf Sie als Person und nicht nur auf Ihre Diplome und Qualifikationen und sind immer offen für eine Tasse Kaffee!",
      },
    ],
  },
  partnersClinics: {
    pageTitle: "Informationen für Kliniken",
    breadcrumb: "Informationen für Kliniken",
    hero: {
      title: "Cosmediate kümmert sich um die Kosmetikbranche.",
      secondaryText:
        "Deshalb investieren wir in eine Plattform, die die Kosmetikbranche transparent, sicher und zugänglich macht.",
      imageAlt: "Partner-Hero-Bild",
    },
    contactCards: [
      {
        title: "Auf Cosmediate sichtbar sein?",
        paragraphs: [
          "Die Registrierung auf Cosmediate ist einfach und unverbindlich! Da wir allen Qualitätskliniken und Ärzten eine faire Chance geben möchten, die Beta-Version unserer Plattform und ihre Vorteile zu erleben, ist der Beitritt zu unserer Plattform völlig unverbindlich – Sie sind zu nichts verpflichtet!",
          "Kontaktieren Sie uns daher schnell oder registrieren Sie Ihre Klinik über die Schaltfläche unten.",
        ],
      },
      {
        title: "Frage?",
        paragraphs: [
          "Haben Sie eine Frage oder Anmerkung zu einer Behandlung? Sind Sie neugierig auf die Möglichkeiten der Plattform als Klinik oder Arzt? Oder möchten Sie uns aus einem anderen Grund erreichen? Zögern Sie nicht, uns zu kontaktieren.",
        ],
      },
    ],
    coreBenefits: {
      transparent: {
        title: "Transparent",
        description:
          "Wir streben danach, eine Plattform zu werden, die sich vollständig auf die Entwicklungen im Kosmetikmarkt konzentriert. Dabei ist es uns wichtig, Informationen über Behandlungen bereitzustellen, Qualitätskliniken hervorzuheben und Interviews mit den Ärzten hinter den kosmetischen Behandlungen zu führen.",
      },
      safe: {
        title: "Sicher",
        description:
          "Wir möchten angeschlossenen Kliniken die Möglichkeit geben, sich über unsere Plattform zu präsentieren, wobei wir es wichtig finden, die Qualitätssiegel und Expertise Ihrer Klinik hervorzuheben. Durch die Registrierung Ihrer Klinik über unsere Plattform können Kunden im Handumdrehen sehen, warum Ihre Klinik eine gute Wahl ist. So arbeiten wir gemeinsam an mehr Sicherheit für die Verbraucher.",
      },
      accessible: {
        title: "Zugänglich",
        description:
          "Die praktische Suchfunktion auf Cosmediate macht es einfach, alle Informationen über angeschlossene Kliniken und mögliche Behandlungen zu finden. So machen wir den Überblick über Möglichkeiten in Bezug auf Behandlungen und Kliniken für Verbraucher zugänglich.",
      },
    },
  },
  registerClinic: {
    pageTitle: "Klinik registrieren",
    heroTitle:
      "Registrieren Sie sich jetzt unverbindlich als Klinik und schaffen Sie mehr Sichtbarkeit über Cosmediate.",
  },
  registerDoctor: {
    pageTitle: "Als Arzt registrieren",
    heroTitle:
      "Registrieren Sie sich jetzt unverbindlich als Arzt und schaffen Sie mehr Sichtbarkeit über Cosmediate.",
  },
};
