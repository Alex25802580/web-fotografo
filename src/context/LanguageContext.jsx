import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

export const translations = {
  en: {
    nav: { home: 'Home', weddings: 'Weddings', personal: 'Personal', about: 'About', contact: 'Contact' },
    menu: { open: 'Open menu', close: 'Close menu' },
    about: {
      imageAlt: 'Portrait of Diego Carrasco',
      titleTop: 'The extraordinary',
      titleBottom: 'lives in the real.',
      paragraphs: [
        'I’m Diego Carrasco, a wedding photographer with a documentary and deeply personal approach. I’m drawn to gestures that happen without warning, imperfect light, and everything that makes a celebration truly belong to the people living it.',
        'My work moves away from classic formulas and images built to repeat what we already know. I’m not interested in turning a wedding into a posed photo session, but in following it closely and creating an honest, vivid story full of nuance.',
        'Every story has its own rhythm. That’s why I combine quiet portraits, spontaneous scenes, unexpected details, and imperfect moments that often become the ones that matter most with time.',
      ],
    },
    contact: {
      title: 'Contact', formLabel: 'Contact form', name: 'Name', email: 'Email', phone: 'Phone', message: 'Message',
      sending: 'Sending…', send: 'Send enquiry', success: 'Message sent successfully. Thank you for getting in touch.',
      error: 'The message could not be sent.', retry: 'The message could not be sent. Please try again.',
      subject: "New enquiry from Diego Carrasco's website",
    },
  },
  es: {
    nav: { home: 'Inicio', weddings: 'Bodas', personal: 'Personal', about: 'Sobre mí', contact: 'Contacto' },
    menu: { open: 'Abrir menú', close: 'Cerrar menú' },
    about: {
      imageAlt: 'Retrato de Diego Carrasco',
      titleTop: 'Lo extraordinario',
      titleBottom: 'vive en lo real.',
      paragraphs: [
        'Soy Diego Carrasco, fotógrafo de bodas con una mirada documental y profundamente personal. Me interesan los gestos que suceden sin aviso, la luz imperfecta y todo aquello que hace que una celebración pertenezca de verdad a quienes la viven.',
        'Mi trabajo se aleja de las fórmulas clásicas y de las imágenes construidas para repetir lo que ya conocemos. No busco convertir una boda en una sesión de poses, sino acompañarla con atención y crear un relato honesto, vivo y lleno de matices.',
        'Cada historia pide su propio ritmo. Por eso combino retratos serenos, escenas espontáneas, detalles inesperados y momentos imperfectos que, con el tiempo, terminan siendo los más importantes.',
      ],
    },
    contact: {
      title: 'Contacto', formLabel: 'Formulario de contacto', name: 'Nombre', email: 'Email', phone: 'Teléfono', message: 'Mensaje',
      sending: 'Enviando…', send: 'Enviar consulta', success: 'Mensaje enviado correctamente. Gracias por contactar.',
      error: 'No se ha podido enviar el mensaje.', retry: 'No se ha podido enviar el mensaje. Inténtalo de nuevo.',
      subject: 'Nueva consulta desde la web de Diego Carrasco',
    },
  },
  ca: {
    nav: { home: 'Inici', weddings: 'Casaments', personal: 'Personal', about: 'Sobre mi', contact: 'Contacte' },
    menu: { open: 'Obrir menú', close: 'Tancar menú' },
    about: {
      imageAlt: 'Retrat de Diego Carrasco',
      titleTop: "L’extraordinari",
      titleBottom: 'viu en allò real.',
      paragraphs: [
        'Soc Diego Carrasco, fotògraf de casaments amb una mirada documental i profundament personal. M’interessen els gestos que passen sense avís, la llum imperfecta i tot allò que fa que una celebració pertanyi de debò a les persones que la viuen.',
        'La meva feina s’allunya de les fórmules clàssiques i de les imatges construïdes per repetir allò que ja coneixem. No busco convertir un casament en una sessió de posats, sinó acompanyar-lo amb atenció i crear un relat honest, viu i ple de matisos.',
        'Cada història demana el seu propi ritme. Per això combino retrats serens, escenes espontànies, detalls inesperats i moments imperfectes que, amb el temps, acaben sent els més importants.',
      ],
    },
    contact: {
      title: 'Contacte', formLabel: 'Formulari de contacte', name: 'Nom', email: 'Email', phone: 'Telèfon', message: 'Missatge',
      sending: 'Enviant…', send: 'Enviar consulta', success: 'Missatge enviat correctament. Gràcies per contactar.',
      error: "No s’ha pogut enviar el missatge.", retry: "No s’ha pogut enviar el missatge. Torna-ho a provar.",
      subject: 'Nova consulta des del web de Diego Carrasco',
    },
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('site-language') || 'en')

  useEffect(() => {
    localStorage.setItem('site-language', language)
    document.documentElement.lang = language === 'ca' ? 'ca' : language
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t: translations[language] }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
