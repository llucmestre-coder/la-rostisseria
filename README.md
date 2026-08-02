# La Rostisseria — L'Ametlla del Vallès

Web estàtica per a **Rostisseria L'Ametlla** (Carrer Major, 24). S'obre fent
doble clic a `index.html`: no hi ha cap procés de compilació, ni dependències,
ni res a instal·lar.

```
index.html          Inici: què fem, com es demana, valoració, preguntes i on som
carta.html          La carta + el compositor de comanda
encarrecs.html      Encàrrecs per a un dia concret (formulari)
avis-legal.html · politica-privacitat.html · politica-cookies.html
css/styles.css      Tot l'estil, amb els colors i les mides a dalt de tot
js/main.js          Menú, horari, ressenyes, mapa, formulari, àncores
js/comanda.js       El compositor de comanda
data/reviews.json   La nota de Google (4,1) i el nombre de ressenyes (142)
assets/             Logotip, icones i les tipografies
robots.txt          ⚠️ ARA BLOQUEJA GOOGLE. Cal esborrar-lo en publicar
```

---

## ⚠️ Les tres coses que s'han de fer abans de publicar

### 1. Esborrar `robots.txt`

Mentre hi sigui, **Google no indexa la web**. És a posta, perquè encara és una
maqueta. En publicar al domini definitiu, s'esborra el fitxer sencer.

### 2. Buscar «PENDENT-CLIENT» i resoldre-ho tot

Són els punts on **falta informació del negoci i no s'ha inventat res**. Es
troben tots amb una sola cerca:

```
PENDENT-CLIENT
```

| On | Què falta |
|---|---|
| `carta.html` | **La llista sencera de plats** i si es publiquen preus |
| `index.html` (preguntes) | Al·lèrgens · mitjans de pagament · entrega a domicili · dates dels encàrrecs |
| `encarrecs.html` | Per a quines dates es fan encàrrecs i amb quanta antelació |
| `js/comanda.js` | El número de WhatsApp, si n'hi ha |
| Els tres legals | `[RAÓ SOCIAL]`, `[NIF]`, `[CORREU DE CONTACTE]`, `[DATA DE PUBLICACIÓ]` |

Es veuen a la pàgina dins d'una caixa amb el filet vermell. **Si es treu la
caixa, s'ha de posar la informació de debò**: no es deixa mai un text d'exemple
sense el distintiu.

### 3. Connectar el formulari

`encarrecs.html` apunta a `https://formspree.io/f/XXXXXXXX`. Mentre hi hagi les
X, **el formulari no envia res i ho diu clarament a qui l'omple**, amb el
telèfon. Es crea un compte a formspree.io, es copia el codi del formulari i se
substitueixen les vuit X.

---

## Com es canvien les coses del dia a dia

### Afegir o treure un plat de la carta

A `carta.html`, dins del grup que toqui:

```html
<li class="plat" data-plat="Nom del plat"><span class="plat__nom">Nom del plat</span></li>
```

L'atribut `data-plat` és **el nom que sortirà a la comanda**; el que hi ha dins
del `<span>` és el que llegeix el client. Normalment són el mateix.

Si s'afegeix un plat, val la pena afegir-lo també al bloc `application/ld+json`
del final de `carta.html`, que és el que llegeix Google.

### Canviar l'horari

Està en **dos llocs i han de dir el mateix**:

1. La taula d'`index.html` (`class="horaris"`) i el bloc «Horari» de la secció
   «On som».
2. `js/main.js`, a la constant `HORARI`, en minuts des de mitjanit
   (`600` = 10:00, `930` = 15:30). D'aquí surt el cartell «Ara obert» / «Ara
   tancat» i el càlcul de quan es torna a obrir.
3. I l'`openingHoursSpecification` del JSON-LD d'`index.html`.

### El número de WhatsApp

A `js/comanda.js`, a dalt de tot:

```js
var WHATSAPP = '34938432649';     // ← el número que rep les comandes
```

D'aquí surt el botó **«Enviar per WhatsApp»** del full de comanda, que obre la
conversa amb la llista ja escrita.

⚠️ **Ara mateix hi ha el número fix publicat del negoci, i està pendent de
confirmar que el rebi.** WhatsApp Business deixa donar d'alta un fix (el verifica
amb una trucada de veu), però si no s'ha fet, qui premi el botó rep un error.
Comprovació de deu segons: obrir `carta.html` al mòbil, marcar dos plats i prémer
el botó.

- Si les comandes van a un **mòbil diferent**, es canvia aquí i prou, en format
  internacional sense signes: `34` + els nou dígits.
- Si **no tenen WhatsApp**, es posa `var WHATSAPP = null;` i el botó es
  converteix sol en el de trucar, sense deixar cap forat a la pàgina.

### La valoració de Google

Es llegeix de `data/reviews.json`. Les xifres també són escrites a l'HTML: si el
fitxer falla, es veuen igualment les de l'HTML.

Hi ha un procés automàtic preparat a `.github/workflows/update-reviews.yml` que
l'actualitza sol dues vegades al dia. **Encara no està engegat**: li falten el
`PLACE_ID` del negoci i el secret `GOOGLE_API_KEY`. Mentrestant, les execucions
programades acaben en verd sense fer res i deixen un avís, per no enviar un
correu d'error cada dia. Les instruccions són al capdamunt del mateix fitxer.

---

## Fotografies: es posen soles

La web té **sis espais de fotografia** repartits pel disseny. Per posar-hi una
foto **no cal tocar codi**: n'hi ha prou de deixar el fitxer a
`assets/fotos/` amb el nom exacte que toca.

| Fitxer | Quina foto | On surt |
|---|---|---|
| `rostidor.jpg` | El rostidor amb els pollastres girant | Inici, tira de tres |
| `taulell.jpg` | El taulell amb les safates del dia | Inici, tira de tres |
| `facana.jpg` | La façana des del carrer | Inici, tira de tres |
| `equip.jpg` | Qui hi ha darrere el taulell (**vertical**) | Inici, «La casa» |
| `pollastre.jpg` | Un pollastre acabat de treure | Inici, banda ampla |
| `plats.jpg` | Plats preparats per emportar | Capçalera de la carta |

Les instruccions per al client, escrites perquè les pugui llegir ell, són a
**`assets/fotos/LLEGIU-ME.txt`**.

**Mentre en falti alguna**, al seu lloc hi ha un rètol negre amb la marca de la
casa que diu quina foto hi anirà i que està pendent. No és una caixa grisa: és
un espai dissenyat, i la pàgina es pot ensenyar tal com està.

Com funciona per dins: `js/main.js` mira si existeix `assets/fotos/<nom>.jpg` i,
si hi és, el posa al lloc del rètol. Va en aquesta direcció i no a l'inrevés a
posta — si el JavaScript no arrenca, es veu el rètol, que és presentable, i no
la icona d'imatge trencada. **Mentre falti alguna foto, la consola del navegador
ensenyarà un 404 per cadascuna**: és esperat i desapareix sol.

⚠️ **Les fotos del perfil de Google del negoci no es poden fer servir.** Bona
part les han penjat clients i no són de la casa.

### La banda ampla i el text a sobre

`pollastre.jpg` porta text a sobre. El vel que hi ha entremig està calculat
perquè el text es llegeixi **amb qualsevol foto**, no només amb una de fosca:
s'ha provat amb una foto blanca del tot i el text blanc s'hi manté a 14,6:1 al
mòbil i entre 16,5:1 i 9,3:1 a l'ordinador. Per això la nota de Google va dins
d'un bloc vermell opac i no en vermell sobre la foto: així el contrast no depèn
de la imatge que s'hi posi.

---

## Detalls tècnics que val la pena saber

- **Cap petició a cap altre servidor en carregar la pàgina.** Les tipografies
  (Archivo Black i Newsreader, totes dues amb llicència OFL, inclosa a
  `assets/fonts/`) estan allotjades aquí mateix, i **el mapa de Google no es
  carrega fins que el visitant prem el botó**. Per això la política de galetes
  pot dir, i diu, que la web no en fa servir cap.
- **El logotip és el seu**, recuperat de la seva web anterior. Fa 570 px
  d'ample: n'hi ha prou per a la mida a què es fa servir, però **convé demanar
  l'original** (idealment vectorial). La icona de pestanya (`assets/favicon.ico`)
  està retallada del mateix logotip: és l'ou amb la cresta vermella.
- **Els colors surten del logotip**, mostrejats píxel a píxel: negre `#000000`,
  blanc `#FFFFFF` i el vermell de la cresta `#CE2832`. Tots els contrastos
  compleixen el nivell AA.
- **Sense JavaScript la web funciona igual**: es llegeix tot, inclosa la carta
  sencera, i als espais de foto s'hi veu el rètol dissenyat. El compositor de
  comanda i el pas de rètol a fotografia són millores que s'hi afegeixen a sobre.
- **El compositor no envia cap comanda i ho diu.** Només escriu la llista. La
  comanda queda feta quan la confirma la casa.
- Provat a 375, 768 i 1440 px d'amplada.
