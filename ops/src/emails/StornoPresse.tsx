/* Template: Storno „Presse auslisten" (deindex) – Anfrage geschlossen. Vier Gründe:
   impossible = Auslistung nicht möglich · customer = auf Kundenwunsch ·
   noreply = keine Rückmeldung · scam = unlautere Praktiken / öffentliches Interesse.
   Kein Bezug aufs Google-Unternehmensprofil (das passt nur bei Profil-Aufträgen).
   Sie-Form in allen Sprachen wie PresseEingang. 11 Sprachen. */
import * as React from "react";
import { EmailShell, P, NoteBox, Support, brand, type MailLang } from "./components";

export type PresseStornoReason = "impossible" | "customer" | "noreply" | "scam";

export interface StornoPresseProps {
  lang?: MailLang;
  reason?: PresseStornoReason;
  orderId?: string;
}

interface R { subject: string; preview: string; title: string; body: string; why?: string; nextH?: string; next: string; }
interface Copy {
  greeting: string; thanks: string;
  freeH: string; free: string;
  objH: string; obj: string;
  close: string;
  r: Record<PresseStornoReason, R>;
}

const T: Record<MailLang, Copy> = {
  de: {
    greeting: "Sehr geehrte Damen und Herren,",
    thanks: "vielen Dank für Ihre Anfrage und Ihr Vertrauen.",
    freeH: "Keine Kosten für Sie",
    free: "Für Sie entstehen keine Kosten.",
    objH: "Einspruch:",
    obj: "Falls Sie unsere Einschätzung für nicht korrekt halten, antworten Sie bitte mit Informationen und einer möglichst genauen Beschreibung des Sachverhalts auf diese E-Mail.",
    close: "Vielen Dank für Ihr Verständnis und alles Gute weiterhin!",
    r: {
      impossible: {
        subject: "Ihre Anfrage zur Auslistung wurde geschlossen",
        preview: "Nach unserer Prüfung ist eine Auslistung in Ihrem Fall leider nicht möglich.",
        title: "Ihre Anfrage wurde geschlossen",
        body: "Wir haben die von Ihnen genannten Inhalte sorgfältig geprüft. Leider sehen wir in Ihrem Fall keine realistische Möglichkeit, sie aus den Google-Ergebnissen auslisten oder an der Quelle entfernen zu lassen. Ihre Anfrage haben wir daher geschlossen.",
        why: "Suchmaschinen und Seitenbetreiber entfernen Inhalte nur, wenn ein klarer Anspruch besteht – etwa bei unwahren Tatsachenbehauptungen, stark veralteten Informationen oder Verletzungen der Privatsphäre. Diese Voraussetzungen sehen wir hier nicht. Wir übernehmen nur Fälle, die wir auch erfolgreich abschließen können.",
        nextH: "Wie es weitergehen kann:",
        next: "Ändert sich etwas an der Lage – z. B. durch neue Artikel, eine Berichtigung oder eine Gerichtsentscheidung? Dann melden Sie sich gerne, wir prüfen Ihren Fall kostenlos erneut.",
      },
      customer: {
        subject: "Ihre Anfrage zur Auslistung wurde geschlossen",
        preview: "Ihre Anfrage wurde wie gewünscht geschlossen.",
        title: "Ihre Anfrage wurde geschlossen",
        body: "Wie gewünscht haben wir Ihre Anfrage geschlossen.",
        next: "Möchten Sie die Auslistung später doch angehen? Antworten Sie einfach auf diese E-Mail – wir machen gerne dort weiter, wo wir aufgehört haben.",
      },
      noreply: {
        subject: "Ihre Anfrage zur Auslistung wurde geschlossen",
        preview: "Wir haben leider keine Rückmeldung von Ihnen erhalten.",
        title: "Ihre Anfrage wurde geschlossen",
        body: "Wir haben uns zu Ihrer Anfrage bei Ihnen gemeldet und auf Ihre Rückmeldung gewartet – leider vergeblich. Ihre Anfrage haben wir daher geschlossen.",
        next: "Ist unsere Nachricht untergegangen oder möchten Sie die Auslistung doch angehen? Antworten Sie einfach auf diese E-Mail – wir machen gerne dort weiter, wo wir aufgehört haben.",
      },
      scam: {
        subject: "Ihre Anfrage zur Auslistung wurde geschlossen",
        preview: "Nach unserer Prüfung können wir in diesem Fall nicht tätig werden.",
        title: "Ihre Anfrage wurde geschlossen",
        body: "Wir haben die von Ihnen genannten Inhalte sorgfältig geprüft und können in diesem Fall leider nicht tätig werden. Ihre Anfrage haben wir daher geschlossen.",
        why: "Die Inhalte betreffen Vorgänge, an deren Bekanntheit ein berechtigtes öffentliches Interesse besteht – etwa zum Schutz von Verbrauchern. Als verantwortungsvolles Unternehmen handeln wir nach rechtlichen und ethischen Grundsätzen und lassen solche Inhalte nicht entfernen.",
        next: "",
      },
    },
  },
  en: {
    greeting: "Dear Sir or Madam,",
    thanks: "thank you for your request and the trust you have placed in us.",
    freeH: "No costs for you",
    free: "There are no costs for you.",
    objH: "Objection:",
    obj: "If you believe our assessment is incorrect, please reply to this email with relevant information and as detailed a description of the matter as possible.",
    close: "Thank you for your understanding, and we wish you all the best.",
    r: {
      impossible: {
        subject: "Your removal request has been closed",
        preview: "After our review, removal is unfortunately not possible in your case.",
        title: "Your request has been closed",
        body: "We have carefully reviewed the content you sent us. Unfortunately, we see no realistic way to have it delisted from Google's results or removed at the source in your case. We have therefore closed your request.",
        why: "Search engines and website operators only remove content when there is a clear claim – for example false statements of fact, seriously outdated information or violations of privacy. We do not see these conditions here. We only take on cases we can actually complete successfully.",
        nextH: "What you can do:",
        next: "If anything changes – e.g. new articles, a correction or a court decision – just get in touch and we'll review your case again free of charge.",
      },
      customer: {
        subject: "Your removal request has been closed",
        preview: "Your request has been closed as requested.",
        title: "Your request has been closed",
        body: "As requested, we have closed your request.",
        next: "If you'd like to tackle the removal later after all, simply reply to this email – we'll be happy to pick up where we left off.",
      },
      noreply: {
        subject: "Your removal request has been closed",
        preview: "Unfortunately we haven't heard back from you.",
        title: "Your request has been closed",
        body: "We got back to you about your request and waited for your reply – unfortunately without a response. We have therefore closed your request.",
        next: "Did our message get lost, or would you like to go ahead with the removal after all? Simply reply to this email – we'll be happy to pick up where we left off.",
      },
      scam: {
        subject: "Your removal request has been closed",
        preview: "After our review, we are unable to act in this case.",
        title: "Your request has been closed",
        body: "We have carefully reviewed the content you sent us and are unfortunately unable to act in this case. We have therefore closed your request.",
        why: "The content concerns matters in which there is a legitimate public interest – for example to protect consumers. As a responsible company, we operate in accordance with legal and ethical principles and do not have such content removed.",
        next: "",
      },
    },
  },
  es: {
    greeting: "Estimados señores:",
    thanks: "muchas gracias por su solicitud y por su confianza.",
    freeH: "Sin coste para usted",
    free: "No se le cobrará nada.",
    objH: "Reclamación:",
    obj: "Si considera que nuestra valoración no es correcta, responda a este correo con información y una descripción de los hechos lo más detallada posible.",
    close: "Muchas gracias por su comprensión y le deseamos lo mejor.",
    r: {
      impossible: {
        subject: "Su solicitud de desindexación se ha cerrado",
        preview: "Tras nuestra revisión, lamentablemente no es posible la desindexación en su caso.",
        title: "Su solicitud se ha cerrado",
        body: "Hemos revisado con detenimiento los contenidos que nos indicó. Lamentablemente, en su caso no vemos una posibilidad realista de desindexarlos de los resultados de Google ni de eliminarlos en la fuente. Por ello, hemos cerrado su solicitud.",
        why: "Los buscadores y los operadores de sitios web solo eliminan contenidos cuando existe un derecho claro, por ejemplo afirmaciones de hecho falsas, información muy desactualizada o vulneraciones de la privacidad. No vemos que se cumplan estos requisitos. Solo aceptamos casos que podemos completar con éxito.",
        nextH: "Cómo seguir:",
        next: "Si la situación cambia –por ejemplo, por nuevos artículos, una rectificación o una resolución judicial–, póngase en contacto con nosotros y volveremos a revisar su caso gratuitamente.",
      },
      customer: {
        subject: "Su solicitud de desindexación se ha cerrado",
        preview: "Hemos cerrado su solicitud tal y como nos pidió.",
        title: "Su solicitud se ha cerrado",
        body: "Tal y como nos pidió, hemos cerrado su solicitud.",
        next: "Si más adelante desea retomar la desindexación, simplemente responda a este correo y continuaremos donde lo dejamos.",
      },
      noreply: {
        subject: "Su solicitud de desindexación se ha cerrado",
        preview: "Lamentablemente no hemos recibido respuesta suya.",
        title: "Su solicitud se ha cerrado",
        body: "Nos pusimos en contacto con usted sobre su solicitud y esperamos su respuesta, lamentablemente sin éxito. Por ello, hemos cerrado su solicitud.",
        next: "¿Se le pasó nuestro mensaje o desea seguir adelante con la desindexación? Simplemente responda a este correo y continuaremos donde lo dejamos.",
      },
      scam: {
        subject: "Su solicitud de desindexación se ha cerrado",
        preview: "Tras nuestra revisión, no podemos actuar en este caso.",
        title: "Su solicitud se ha cerrado",
        body: "Hemos revisado con detenimiento los contenidos que nos indicó y lamentablemente no podemos actuar en este caso. Por ello, hemos cerrado su solicitud.",
        why: "Los contenidos se refieren a hechos sobre los que existe un interés público legítimo, por ejemplo para proteger a los consumidores. Como empresa responsable, actuamos conforme a principios legales y éticos y no solicitamos la eliminación de este tipo de contenidos.",
        next: "",
      },
    },
  },
  fr: {
    greeting: "Madame, Monsieur,",
    thanks: "merci beaucoup pour votre demande et votre confiance.",
    freeH: "Aucun frais pour vous",
    free: "Aucun frais ne vous sera facturé.",
    objH: "Contestation :",
    obj: "Si vous estimez que notre évaluation n'est pas correcte, veuillez répondre à cet e-mail en nous transmettant des informations et une description aussi précise que possible des faits.",
    close: "Merci de votre compréhension et nous vous souhaitons une bonne continuation !",
    r: {
      impossible: {
        subject: "Votre demande de déréférencement a été clôturée",
        preview: "Après examen, un déréférencement n'est malheureusement pas possible dans votre cas.",
        title: "Votre demande a été clôturée",
        body: "Nous avons examiné attentivement les contenus que vous nous avez signalés. Malheureusement, nous ne voyons dans votre cas aucune possibilité réaliste de les faire déréférencer des résultats Google ou supprimer à la source. Nous avons donc clôturé votre demande.",
        why: "Les moteurs de recherche et les éditeurs de sites ne suppriment des contenus qu'en présence d'un droit clair, par exemple en cas d'allégations factuelles inexactes, d'informations largement obsolètes ou d'atteintes à la vie privée. Nous ne voyons pas ces conditions réunies ici. Nous n'acceptons que les dossiers que nous pouvons réellement mener à bien.",
        nextH: "Et ensuite ?",
        next: "Si la situation évolue – par exemple avec de nouveaux articles, un rectificatif ou une décision de justice –, n'hésitez pas à nous recontacter : nous réexaminerons votre dossier gratuitement.",
      },
      customer: {
        subject: "Votre demande de déréférencement a été clôturée",
        preview: "Votre demande a été clôturée comme vous le souhaitiez.",
        title: "Votre demande a été clôturée",
        body: "Comme vous l'avez souhaité, nous avons clôturé votre demande.",
        next: "Si vous souhaitez reprendre le déréférencement plus tard, répondez simplement à cet e-mail – nous reprendrons volontiers là où nous nous étions arrêtés.",
      },
      noreply: {
        subject: "Votre demande de déréférencement a été clôturée",
        preview: "Nous n'avons malheureusement pas reçu de réponse de votre part.",
        title: "Votre demande a été clôturée",
        body: "Nous vous avons recontacté au sujet de votre demande et avons attendu votre retour, malheureusement en vain. Nous avons donc clôturé votre demande.",
        next: "Notre message vous a échappé ou vous souhaitez finalement lancer le déréférencement ? Répondez simplement à cet e-mail – nous reprendrons volontiers là où nous nous étions arrêtés.",
      },
      scam: {
        subject: "Votre demande de déréférencement a été clôturée",
        preview: "Après examen, nous ne pouvons pas intervenir dans ce cas.",
        title: "Votre demande a été clôturée",
        body: "Nous avons examiné attentivement les contenus que vous nous avez signalés et ne pouvons malheureusement pas intervenir dans ce cas. Nous avons donc clôturé votre demande.",
        why: "Les contenus portent sur des faits présentant un intérêt public légitime, par exemple pour la protection des consommateurs. En tant qu'entreprise responsable, nous agissons selon des principes juridiques et éthiques et ne faisons pas supprimer ce type de contenus.",
        next: "",
      },
    },
  },
  it: {
    greeting: "Gentili Signore e Signori,",
    thanks: "la ringraziamo per la sua richiesta e per la fiducia accordataci.",
    freeH: "Nessun costo per lei",
    free: "Non le verrà addebitato nulla.",
    objH: "Opposizione:",
    obj: "Se ritiene che la nostra valutazione non sia corretta, risponda a questa e-mail fornendoci informazioni e una descrizione il più possibile dettagliata dei fatti.",
    close: "La ringraziamo per la comprensione e le auguriamo ogni bene!",
    r: {
      impossible: {
        subject: "La sua richiesta di deindicizzazione è stata chiusa",
        preview: "Dopo la nostra verifica, purtroppo la deindicizzazione non è possibile nel suo caso.",
        title: "La sua richiesta è stata chiusa",
        body: "Abbiamo esaminato con attenzione i contenuti che ci ha segnalato. Purtroppo nel suo caso non vediamo una possibilità realistica di farli deindicizzare dai risultati di Google o rimuovere alla fonte. Abbiamo quindi chiuso la sua richiesta.",
        why: "I motori di ricerca e i gestori dei siti rimuovono i contenuti solo in presenza di un diritto chiaro, ad esempio affermazioni di fatto false, informazioni fortemente obsolete o violazioni della privacy. In questo caso non vediamo soddisfatti tali requisiti. Accettiamo solo casi che possiamo portare a termine con successo.",
        nextH: "Come procedere:",
        next: "Se la situazione cambia – ad esempio per nuovi articoli, una rettifica o una decisione giudiziaria – ci contatti pure: riesamineremo gratuitamente il suo caso.",
      },
      customer: {
        subject: "La sua richiesta di deindicizzazione è stata chiusa",
        preview: "Abbiamo chiuso la sua richiesta come desiderato.",
        title: "La sua richiesta è stata chiusa",
        body: "Come richiesto, abbiamo chiuso la sua richiesta.",
        next: "Se in futuro desidera riprendere la deindicizzazione, risponda semplicemente a questa e-mail: ripartiremo volentieri da dove ci eravamo fermati.",
      },
      noreply: {
        subject: "La sua richiesta di deindicizzazione è stata chiusa",
        preview: "Purtroppo non abbiamo ricevuto alcuna risposta da lei.",
        title: "La sua richiesta è stata chiusa",
        body: "L'abbiamo ricontattata in merito alla sua richiesta e abbiamo atteso un suo riscontro, purtroppo invano. Abbiamo quindi chiuso la sua richiesta.",
        next: "Il nostro messaggio le è sfuggito o desidera comunque procedere con la deindicizzazione? Risponda semplicemente a questa e-mail: ripartiremo volentieri da dove ci eravamo fermati.",
      },
      scam: {
        subject: "La sua richiesta di deindicizzazione è stata chiusa",
        preview: "Dopo la nostra verifica, non possiamo intervenire in questo caso.",
        title: "La sua richiesta è stata chiusa",
        body: "Abbiamo esaminato con attenzione i contenuti che ci ha segnalato e purtroppo non possiamo intervenire in questo caso. Abbiamo quindi chiuso la sua richiesta.",
        why: "I contenuti riguardano fatti per i quali esiste un legittimo interesse pubblico, ad esempio la tutela dei consumatori. Come azienda responsabile, agiamo secondo principi legali ed etici e non facciamo rimuovere contenuti di questo tipo.",
        next: "",
      },
    },
  },
  nl: {
    greeting: "Geachte heer/mevrouw,",
    thanks: "hartelijk dank voor uw aanvraag en uw vertrouwen.",
    freeH: "Geen kosten voor u",
    free: "Er worden geen kosten in rekening gebracht.",
    objH: "Bezwaar:",
    obj: "Bent u van mening dat onze beoordeling niet klopt? Beantwoord dan deze e-mail met informatie en een zo nauwkeurig mogelijke beschrijving van de situatie.",
    close: "Hartelijk dank voor uw begrip en het allerbeste gewenst!",
    r: {
      impossible: {
        subject: "Uw aanvraag tot verwijdering is gesloten",
        preview: "Na onze controle is verwijdering in uw geval helaas niet mogelijk.",
        title: "Uw aanvraag is gesloten",
        body: "Wij hebben de door u genoemde inhoud zorgvuldig gecontroleerd. Helaas zien wij in uw geval geen realistische mogelijkheid om deze uit de zoekresultaten van Google te laten verwijderen of bij de bron te laten weghalen. Wij hebben uw aanvraag daarom gesloten.",
        why: "Zoekmachines en websitebeheerders verwijderen inhoud alleen als er een duidelijke aanspraak bestaat – bijvoorbeeld bij onware feitelijke beweringen, sterk verouderde informatie of schending van de privacy. Die voorwaarden zien wij hier niet. Wij nemen alleen zaken aan die wij ook succesvol kunnen afronden.",
        nextH: "Hoe het verder kan:",
        next: "Verandert er iets aan de situatie – bijvoorbeeld door nieuwe artikelen, een rectificatie of een rechterlijke uitspraak? Neem dan gerust contact op, wij controleren uw zaak opnieuw kosteloos.",
      },
      customer: {
        subject: "Uw aanvraag tot verwijdering is gesloten",
        preview: "Uw aanvraag is zoals gewenst gesloten.",
        title: "Uw aanvraag is gesloten",
        body: "Zoals gewenst hebben wij uw aanvraag gesloten.",
        next: "Wilt u de verwijdering later toch oppakken? Beantwoord dan gewoon deze e-mail – wij gaan graag verder waar we gebleven waren.",
      },
      noreply: {
        subject: "Uw aanvraag tot verwijdering is gesloten",
        preview: "Wij hebben helaas geen reactie van u ontvangen.",
        title: "Uw aanvraag is gesloten",
        body: "Wij hebben contact met u opgenomen over uw aanvraag en op uw reactie gewacht – helaas tevergeefs. Wij hebben uw aanvraag daarom gesloten.",
        next: "Is ons bericht ondergesneeuwd of wilt u de verwijdering toch oppakken? Beantwoord dan gewoon deze e-mail – wij gaan graag verder waar we gebleven waren.",
      },
      scam: {
        subject: "Uw aanvraag tot verwijdering is gesloten",
        preview: "Na onze controle kunnen wij in dit geval niets voor u doen.",
        title: "Uw aanvraag is gesloten",
        body: "Wij hebben de door u genoemde inhoud zorgvuldig gecontroleerd en kunnen in dit geval helaas niets voor u doen. Wij hebben uw aanvraag daarom gesloten.",
        why: "De inhoud betreft zaken waarbij een gerechtvaardigd openbaar belang bestaat – bijvoorbeeld ter bescherming van consumenten. Als verantwoordelijk bedrijf handelen wij volgens juridische en ethische principes en laten wij dergelijke inhoud niet verwijderen.",
        next: "",
      },
    },
  },
  pt: {
    greeting: "Exmos. Senhores,",
    thanks: "muito obrigado pelo seu pedido e pela sua confiança.",
    freeH: "Sem custos para si",
    free: "Não lhe será cobrado nada.",
    objH: "Reclamação:",
    obj: "Se considerar que a nossa avaliação não está correta, responda a este e-mail com informações e uma descrição o mais detalhada possível da situação.",
    close: "Muito obrigado pela sua compreensão e desejamos-lhe as maiores felicidades!",
    r: {
      impossible: {
        subject: "O seu pedido de desindexação foi encerrado",
        preview: "Após a nossa análise, infelizmente a desindexação não é possível no seu caso.",
        title: "O seu pedido foi encerrado",
        body: "Analisámos cuidadosamente os conteúdos que nos indicou. Infelizmente, no seu caso não vemos uma possibilidade realista de os desindexar dos resultados do Google ou de os remover na origem. Por isso, encerrámos o seu pedido.",
        why: "Os motores de pesquisa e os operadores de sites só removem conteúdos quando existe um direito claro – por exemplo, afirmações de facto falsas, informações muito desatualizadas ou violações da privacidade. Não vemos esses requisitos preenchidos neste caso. Só aceitamos casos que conseguimos concluir com sucesso.",
        nextH: "Como continuar:",
        next: "Se a situação mudar – por exemplo, com novos artigos, uma retificação ou uma decisão judicial –, contacte-nos e voltaremos a analisar o seu caso gratuitamente.",
      },
      customer: {
        subject: "O seu pedido de desindexação foi encerrado",
        preview: "O seu pedido foi encerrado conforme solicitado.",
        title: "O seu pedido foi encerrado",
        body: "Conforme solicitado, encerrámos o seu pedido.",
        next: "Se mais tarde quiser retomar a desindexação, basta responder a este e-mail – teremos todo o gosto em continuar onde ficámos.",
      },
      noreply: {
        subject: "O seu pedido de desindexação foi encerrado",
        preview: "Infelizmente não recebemos resposta da sua parte.",
        title: "O seu pedido foi encerrado",
        body: "Contactámo-lo sobre o seu pedido e aguardámos a sua resposta – infelizmente sem sucesso. Por isso, encerrámos o seu pedido.",
        next: "A nossa mensagem passou-lhe despercebida ou pretende avançar com a desindexação? Basta responder a este e-mail – teremos todo o gosto em continuar onde ficámos.",
      },
      scam: {
        subject: "O seu pedido de desindexação foi encerrado",
        preview: "Após a nossa análise, não podemos intervir neste caso.",
        title: "O seu pedido foi encerrado",
        body: "Analisámos cuidadosamente os conteúdos que nos indicou e infelizmente não podemos intervir neste caso. Por isso, encerrámos o seu pedido.",
        why: "Os conteúdos dizem respeito a factos sobre os quais existe um interesse público legítimo – por exemplo, a proteção dos consumidores. Enquanto empresa responsável, atuamos segundo princípios legais e éticos e não solicitamos a remoção deste tipo de conteúdos.",
        next: "",
      },
    },
  },
  ja: {
    greeting: "ご担当者様",
    thanks: "このたびはお問い合わせいただき、誠にありがとうございます。",
    freeH: "費用は発生しません",
    free: "お客様に費用は一切発生しません。",
    objH: "異議申し立て：",
    obj: "当社の判断が正しくないとお考えの場合は、関連情報と状況のできるだけ詳しい説明を添えて、このメールにご返信ください。",
    close: "ご理解いただき誠にありがとうございます。今後のますますのご発展をお祈り申し上げます。",
    r: {
      impossible: {
        subject: "削除・非表示のご依頼を終了いたしました",
        preview: "確認の結果、誠に恐れ入りますが、今回は非表示化ができません。",
        title: "ご依頼を終了いたしました",
        body: "ご指定いただいたコンテンツを慎重に確認いたしました。誠に恐れ入りますが、今回のケースでは、Googleの検索結果からの非表示化や掲載元での削除が現実的に見込めません。そのため、ご依頼を終了させていただきました。",
        why: "検索エンジンやサイト運営者がコンテンツを削除するのは、虚偽の事実の記載、著しく古い情報、プライバシーの侵害など、明確な根拠がある場合に限られます。今回はその条件を満たしていないと判断しました。当社は、確実に完了できるご依頼のみをお引き受けしております。",
        nextH: "今後について：",
        next: "新しい記事、訂正記事、裁判所の判断など状況に変化があった場合は、お気軽にご連絡ください。無料で改めて確認いたします。",
      },
      customer: {
        subject: "削除・非表示のご依頼を終了いたしました",
        preview: "ご希望どおり、ご依頼を終了いたしました。",
        title: "ご依頼を終了いたしました",
        body: "ご希望どおり、ご依頼を終了いたしました。",
        next: "改めてご検討される場合は、このメールにご返信いただくだけで、前回の続きから対応いたします。",
      },
      noreply: {
        subject: "削除・非表示のご依頼を終了いたしました",
        preview: "誠に恐れ入りますが、お客様からのご返信をいただけませんでした。",
        title: "ご依頼を終了いたしました",
        body: "ご依頼について当社よりご連絡し、お返事をお待ちしておりましたが、ご返信をいただけませんでした。そのため、ご依頼を終了させていただきました。",
        next: "当社のメールが見落とされていた場合や、改めてご依頼をご希望の場合は、このメールにご返信いただくだけで、前回の続きから対応いたします。",
      },
      scam: {
        subject: "削除・非表示のご依頼を終了いたしました",
        preview: "確認の結果、今回は対応いたしかねます。",
        title: "ご依頼を終了いたしました",
        body: "ご指定いただいたコンテンツを慎重に確認いたしましたが、誠に恐れ入りますが今回は対応いたしかねます。そのため、ご依頼を終了させていただきました。",
        why: "当該コンテンツは、消費者保護など正当な公共の利益が認められる事柄に関するものです。当社は責任ある企業として法的・倫理的な原則に基づいて業務を行っており、このようなコンテンツの削除はお引き受けしておりません。",
        next: "",
      },
    },
  },
  sv: {
    greeting: "Hej,",
    thanks: "tack för din förfrågan och ditt förtroende.",
    freeH: "Inga kostnader för dig",
    free: "Du debiteras ingenting.",
    objH: "Invändning:",
    obj: "Om du anser att vår bedömning inte stämmer, svara gärna på detta e-postmeddelande med information och en så detaljerad beskrivning av omständigheterna som möjligt.",
    close: "Tack för din förståelse och lycka till framöver!",
    r: {
      impossible: {
        subject: "Din förfrågan om borttagning har avslutats",
        preview: "Efter vår granskning är borttagning tyvärr inte möjlig i ditt fall.",
        title: "Din förfrågan har avslutats",
        body: "Vi har noggrant granskat innehållet du skickade till oss. Tyvärr ser vi i ditt fall ingen realistisk möjlighet att få det borttaget från Googles sökresultat eller raderat vid källan. Vi har därför avslutat din förfrågan.",
        why: "Sökmotorer och webbplatsägare tar bara bort innehåll när det finns ett tydligt anspråk – till exempel vid osanna faktapåståenden, kraftigt föråldrad information eller integritetsintrång. Vi ser inte att dessa förutsättningar är uppfyllda här. Vi tar bara uppdrag som vi faktiskt kan slutföra.",
        nextH: "Hur du kan gå vidare:",
        next: "Om något förändras – t.ex. genom nya artiklar, en rättelse eller ett domstolsbeslut – hör gärna av dig, så granskar vi ditt ärende igen kostnadsfritt.",
      },
      customer: {
        subject: "Din förfrågan om borttagning har avslutats",
        preview: "Din förfrågan har avslutats enligt önskemål.",
        title: "Din förfrågan har avslutats",
        body: "Enligt ditt önskemål har vi avslutat din förfrågan.",
        next: "Vill du ta tag i borttagningen senare ändå? Svara bara på detta e-postmeddelande – vi fortsätter gärna där vi slutade.",
      },
      noreply: {
        subject: "Din förfrågan om borttagning har avslutats",
        preview: "Vi har tyvärr inte fått något svar från dig.",
        title: "Din förfrågan har avslutats",
        body: "Vi hörde av oss om din förfrågan och väntade på ditt svar – tyvärr förgäves. Vi har därför avslutat din förfrågan.",
        next: "Missade du vårt meddelande, eller vill du gå vidare med borttagningen ändå? Svara bara på detta e-postmeddelande – vi fortsätter gärna där vi slutade.",
      },
      scam: {
        subject: "Din förfrågan om borttagning har avslutats",
        preview: "Efter vår granskning kan vi inte agera i detta fall.",
        title: "Din förfrågan har avslutats",
        body: "Vi har noggrant granskat innehållet du skickade till oss och kan tyvärr inte agera i detta fall. Vi har därför avslutat din förfrågan.",
        why: "Innehållet gäller omständigheter där det finns ett berättigat allmänintresse – till exempel för att skydda konsumenter. Som ansvarsfullt företag agerar vi enligt rättsliga och etiska principer och låter inte ta bort sådant innehåll.",
        next: "",
      },
    },
  },
  da: {
    greeting: "Kære kunde,",
    thanks: "mange tak for din henvendelse og din tillid.",
    freeH: "Ingen omkostninger for dig",
    free: "Du bliver ikke opkrævet noget.",
    objH: "Indsigelse:",
    obj: "Hvis du mener, at vores vurdering ikke er korrekt, så svar venligst på denne e-mail med oplysninger og en så præcis beskrivelse af forholdene som muligt.",
    close: "Mange tak for din forståelse, og fortsat alt det bedste!",
    r: {
      impossible: {
        subject: "Din anmodning om fjernelse er afsluttet",
        preview: "Efter vores gennemgang er fjernelse desværre ikke mulig i dit tilfælde.",
        title: "Din anmodning er afsluttet",
        body: "Vi har grundigt gennemgået det indhold, du sendte os. Desværre ser vi i dit tilfælde ingen realistisk mulighed for at få det fjernet fra Googles søgeresultater eller slettet ved kilden. Vi har derfor afsluttet din anmodning.",
        why: "Søgemaskiner og webstedsejere fjerner kun indhold, når der er et klart krav – f.eks. ved usande faktuelle påstande, stærkt forældede oplysninger eller krænkelse af privatlivet. Vi ser ikke disse betingelser opfyldt her. Vi påtager os kun sager, som vi rent faktisk kan gennemføre.",
        nextH: "Sådan kan du komme videre:",
        next: "Hvis noget ændrer sig – f.eks. nye artikler, en berigtigelse eller en domstolsafgørelse – er du velkommen til at kontakte os, så gennemgår vi din sag igen gratis.",
      },
      customer: {
        subject: "Din anmodning om fjernelse er afsluttet",
        preview: "Din anmodning er afsluttet som ønsket.",
        title: "Din anmodning er afsluttet",
        body: "Som ønsket har vi afsluttet din anmodning.",
        next: "Vil du alligevel tage fat på fjernelsen senere? Så svar blot på denne e-mail – vi fortsætter gerne, hvor vi slap.",
      },
      noreply: {
        subject: "Din anmodning om fjernelse er afsluttet",
        preview: "Vi har desværre ikke hørt fra dig.",
        title: "Din anmodning er afsluttet",
        body: "Vi vendte tilbage til dig om din anmodning og ventede på dit svar – desværre forgæves. Vi har derfor afsluttet din anmodning.",
        next: "Er vores besked gået tabt, eller vil du alligevel gå videre med fjernelsen? Så svar blot på denne e-mail – vi fortsætter gerne, hvor vi slap.",
      },
      scam: {
        subject: "Din anmodning om fjernelse er afsluttet",
        preview: "Efter vores gennemgang kan vi ikke handle i denne sag.",
        title: "Din anmodning er afsluttet",
        body: "Vi har grundigt gennemgået det indhold, du sendte os, og kan desværre ikke handle i denne sag. Vi har derfor afsluttet din anmodning.",
        why: "Indholdet vedrører forhold, hvor der er en berettiget offentlig interesse – f.eks. af hensyn til forbrugerbeskyttelse. Som ansvarlig virksomhed handler vi efter juridiske og etiske principper og får ikke sådant indhold fjernet.",
        next: "",
      },
    },
  },
  no: {
    greeting: "Hei,",
    thanks: "tusen takk for henvendelsen og tilliten.",
    freeH: "Ingen kostnader for deg",
    free: "Du blir ikke belastet noe.",
    objH: "Innsigelse:",
    obj: "Hvis du mener at vurderingen vår ikke er riktig, ber vi deg svare på denne e-posten med informasjon og en så nøyaktig beskrivelse av forholdene som mulig.",
    close: "Tusen takk for forståelsen, og fortsatt alt godt!",
    r: {
      impossible: {
        subject: "Forespørselen din om fjerning er avsluttet",
        preview: "Etter vår gjennomgang er fjerning dessverre ikke mulig i ditt tilfelle.",
        title: "Forespørselen din er avsluttet",
        body: "Vi har gått nøye gjennom innholdet du sendte oss. Dessverre ser vi i ditt tilfelle ingen realistisk mulighet for å få det fjernet fra Googles søkeresultater eller slettet ved kilden. Vi har derfor avsluttet forespørselen din.",
        why: "Søkemotorer og nettstedeiere fjerner bare innhold når det finnes et klart krav – for eksempel ved usanne faktapåstander, sterkt utdatert informasjon eller brudd på personvernet. Vi ser ikke at disse vilkårene er oppfylt her. Vi tar bare oppdrag vi faktisk kan fullføre.",
        nextH: "Slik kan du gå videre:",
        next: "Hvis noe endrer seg – for eksempel nye artikler, en rettelse eller en rettsavgjørelse – er du velkommen til å kontakte oss, så vurderer vi saken din på nytt kostnadsfritt.",
      },
      customer: {
        subject: "Forespørselen din om fjerning er avsluttet",
        preview: "Forespørselen din er avsluttet som ønsket.",
        title: "Forespørselen din er avsluttet",
        body: "Som ønsket har vi avsluttet forespørselen din.",
        next: "Vil du likevel ta tak i fjerningen senere? Bare svar på denne e-posten – vi fortsetter gjerne der vi slapp.",
      },
      noreply: {
        subject: "Forespørselen din om fjerning er avsluttet",
        preview: "Vi har dessverre ikke hørt fra deg.",
        title: "Forespørselen din er avsluttet",
        body: "Vi tok kontakt med deg om forespørselen din og ventet på svar – dessverre forgjeves. Vi har derfor avsluttet forespørselen din.",
        next: "Har meldingen vår gått deg hus forbi, eller vil du likevel gå videre med fjerningen? Bare svar på denne e-posten – vi fortsetter gjerne der vi slapp.",
      },
      scam: {
        subject: "Forespørselen din om fjerning er avsluttet",
        preview: "Etter vår gjennomgang kan vi ikke bistå i denne saken.",
        title: "Forespørselen din er avsluttet",
        body: "Vi har gått nøye gjennom innholdet du sendte oss og kan dessverre ikke bistå i denne saken. Vi har derfor avsluttet forespørselen din.",
        why: "Innholdet gjelder forhold der det finnes en berettiget offentlig interesse – for eksempel for å beskytte forbrukere. Som et ansvarlig selskap handler vi etter juridiske og etiske prinsipper og får ikke slikt innhold fjernet.",
        next: "",
      },
    },
  },
};

const pick = (p: StornoPresseProps) => {
  const c = T[p.lang || "de"] || T.de;
  return { c, r: c.r[p.reason || "impossible"] || c.r.impossible };
};

export function subject(p: StornoPresseProps = {}): string {
  return pick(p).r.subject;
}

export default function StornoPresse(props: StornoPresseProps = {}) {
  const { lang = "de", reason = "impossible", orderId = "" } = props;
  const { c, r } = pick({ lang, reason });
  return (
    <EmailShell preview={r.preview} title={r.title} lang={lang}>
      <P><strong>{c.greeting}</strong></P>
      <P>{c.thanks} <strong>{r.body}</strong>{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      {r.why ? <P>{r.why}</P> : null}
      {reason === "scam" ? <P><strong><u>{c.objH}</u></strong> {c.obj}</P> : (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>{c.freeH}</span><br />
          {c.free}
        </NoteBox>
      )}
      {r.next ? <P>{r.nextH ? <strong>{r.nextH} </strong> : null}{r.next}</P> : null}
      <P>{c.close}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}

/* Fest verdrahtete Varianten für die Vorlagen-Registry (je Grund ein Schlüssel). */
export const StornoPresseImpossible = (p: StornoPresseProps) => <StornoPresse {...p} reason="impossible" />;
export const StornoPresseCustomer = (p: StornoPresseProps) => <StornoPresse {...p} reason="customer" />;
export const StornoPresseNoreply = (p: StornoPresseProps) => <StornoPresse {...p} reason="noreply" />;
export const StornoPresseScam = (p: StornoPresseProps) => <StornoPresse {...p} reason="scam" />;
