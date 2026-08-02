/* =========================================================================
   LA ROSTISSERIA — comportament comú a totes les pàgines.

   Regla que mana sobre tot el fitxer: res del que hi ha aquí sosté cap
   contingut. Si aquest fitxer no arriba a executar-se, la web es llegeix
   sencera igualment. El JS només hi afegeix la gràcia.
   ========================================================================= */

(function () {
  'use strict';

  var doc = document;
  var arrel = doc.documentElement;

  arrel.classList.add('te-js');

  /* ---- Any del peu ---------------------------------------------------- */

  Array.prototype.forEach.call(doc.querySelectorAll('[data-any]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Menú del mòbil -------------------------------------------------- */

  var boto = doc.getElementById('obre-menu');
  var nav = doc.getElementById('navegacio');

  if (boto && nav) {
    // De sortida, al mòbil el menú va tancat; a partir de 768px el CSS el
    // torna a ensenyar i l'atribut hidden s'ha de treure, o desapareix.
    var ampleGran = window.matchMedia('(min-width: 48em)');

    var sincronitza = function () {
      if (ampleGran.matches) {
        nav.hidden = false;
        boto.setAttribute('aria-expanded', 'false');
      } else {
        nav.hidden = true;
        boto.setAttribute('aria-expanded', 'false');
      }
    };

    sincronitza();

    if (ampleGran.addEventListener) {
      ampleGran.addEventListener('change', sincronitza);
    } else if (ampleGran.addListener) {
      ampleGran.addListener(sincronitza);
    }

    boto.addEventListener('click', function () {
      var obert = boto.getAttribute('aria-expanded') === 'true';
      boto.setAttribute('aria-expanded', obert ? 'false' : 'true');
      nav.hidden = obert;
    });

    doc.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && boto.getAttribute('aria-expanded') === 'true') {
        boto.setAttribute('aria-expanded', 'false');
        nav.hidden = true;
        boto.focus();
      }
    });
  }

  /* ---- Estat: som oberts ara? ------------------------------------------
     Horari real, comprovat a la seva web anterior i a Google:
       dilluns tancat · dimarts a divendres 10:00-15:30 · dissabte,
       diumenge i festius 10:00-15:00.
     Els festius no es poden saber des d'aquí: no s'hi entra.        ------ */

  var HORARI = {
    0: [600, 900],   // diumenge
    1: null,         // dilluns
    2: [600, 930],
    3: [600, 930],
    4: [600, 930],
    5: [600, 930],
    6: [600, 900]    // dissabte
  };

  var DIES = ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'];

  var enHores = function (minuts) {
    var h = Math.floor(minuts / 60);
    var m = minuts % 60;
    return h + ':' + (m < 10 ? '0' + m : m);
  };

  var proximaObertura = function (dia) {
    for (var i = 1; i <= 7; i++) {
      var seguent = (dia + i) % 7;
      if (HORARI[seguent]) {
        return {
          nom: i === 1 ? 'demà' : DIES[seguent],
          obre: enHores(HORARI[seguent][0])
        };
      }
    }
    return null;
  };

  var estat = doc.getElementById('estat');
  var estatFrase = doc.getElementById('estat-frase');

  if (estat && estatFrase) {
    var ara = new Date();
    var dia = ara.getDay();
    var minuts = ara.getHours() * 60 + ara.getMinutes();
    var avui = HORARI[dia];

    if (avui && minuts >= avui[0] && minuts < avui[1]) {
      estat.dataset.obert = 'si';
      estat.textContent = 'Ara obert';
      estatFrase.textContent = 'Avui tanquem a les ' + enHores(avui[1]) + '.';
    } else if (avui && minuts < avui[0]) {
      estat.dataset.obert = 'no';
      estat.textContent = 'Encara tancat';
      estatFrase.textContent = 'Avui obrim a les ' + enHores(avui[0]) + '.';
    } else {
      var seg = proximaObertura(dia);
      estat.dataset.obert = 'no';
      estat.textContent = 'Ara tancat';
      estatFrase.textContent = seg
        ? 'Tornem a obrir ' + seg.nom + ' a les ' + seg.obre + '.'
        : 'Consulteu l’horari aquí sota.';
    }

    var fila = doc.querySelector('.horaris tr[data-dia="' + dia + '"]');
    if (fila) { fila.dataset.avui = 'si'; }
  }

  /* ---- Ressenyes de Google --------------------------------------------
     Les xifres de l'HTML són les bones i les que es veuen si aquest fitxer
     no s'executa o si data/reviews.json no hi és. Aquí només s'actualitzen.
     ---------------------------------------------------------------------- */

  var nota = doc.querySelector('[data-valoracio]');
  var nombre = doc.querySelector('[data-nombre-ressenyes]');

  if (nota && nombre && window.fetch) {
    window.fetch('data/reviews.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (dades) {
        if (!dades) { return; }
        if (typeof dades.rating === 'number') {
          nota.textContent = dades.rating.toFixed(1).replace('.', ',');
        }
        if (typeof dades.count === 'number') {
          nombre.textContent = dades.count.toLocaleString('ca-ES');
        }
      })
      .catch(function () { /* es queden les xifres de l'HTML */ });
  }

  /* ---- Fotografies -----------------------------------------------------
     Cada `.foto[data-foto="nom"]` espera `assets/fotos/<nom>.jpg`. Mentre el
     fitxer no hi sigui, es queda el marcador dissenyat que ja és a l'HTML;
     quan el client el deixi a la carpeta, aquesta funció el detecta i el
     posa. El client no ha de tocar ni una línia de codi: només deixar el
     fitxer amb el nom que toca.

     Va en aquesta direcció i no a l'inrevés a posta: sense JS es veu el
     marcador, que és presentable, i no pas la icona d'imatge trencada.
     Mentre falti alguna foto, la consola del navegador ensenyarà un 404 per
     cadascuna. És esperat i desapareix sol quan hi siguin.        ------ */

  Array.prototype.forEach.call(doc.querySelectorAll('.foto[data-foto]'), function (marc) {
    var ruta = 'assets/fotos/' + marc.dataset.foto + '.jpg';
    var prova = new Image();

    prova.addEventListener('load', function () {
      var img = doc.createElement('img');
      img.src = ruta;
      img.alt = marc.dataset.alt || '';
      img.width = prova.naturalWidth;
      img.height = prova.naturalHeight;

      if (marc.dataset.prioritat === 'alta') {
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.loading = 'lazy';
      }

      marc.innerHTML = '';
      marc.appendChild(img);
      marc.dataset.estat = 'plena';
    });

    prova.src = ruta;
  });

  /* ---- Mapa darrere d'un botó -----------------------------------------
     Fins que el visitant no el demana, Google no rep res.          ------ */

  var contenidorMapa = doc.querySelector('[data-mapa]');
  var obreMapa = doc.querySelector('[data-obre-mapa]');

  if (contenidorMapa && obreMapa) {
    obreMapa.addEventListener('click', function () {
      var marc = doc.createElement('iframe');
      marc.src = 'https://maps.google.com/maps?q=' +
        encodeURIComponent('Carrer Major 24, 08480 L’Ametlla del Vallès') +
        '&output=embed';
      marc.title = 'Mapa amb la situació de La Rostisseria al Carrer Major, 24';
      marc.loading = 'lazy';
      marc.referrerPolicy = 'no-referrer-when-downgrade';
      contenidorMapa.innerHTML = '';
      contenidorMapa.appendChild(marc);
    });
  }

  /* ---- Revelacions en entrar (un sol tret) ----------------------------- */

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  var revelables = doc.querySelectorAll('.apareix');

  if (reduit.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revelables, function (el) { el.classList.add('vist'); });
  } else {
    var vigilant = new IntersectionObserver(function (entrades) {
      entrades.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('vist');
          vigilant.unobserve(entrada.target);   // un sol tret: no es torna a amagar mai
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revelables, function (el) { vigilant.observe(el); });
  }

  /* ---- Formulari d'encàrrec -------------------------------------------
     Mai un «rebut, gràcies» que el codi no hagi aconseguit. Si l'adreça
     de Formspree encara és el marcador, ni tan sols s'intenta enviar: es
     diu que no està connectat i es dona el telèfon.                ------ */

  var form = doc.getElementById('form-encarrec');
  var avis = doc.getElementById('avis-form');

  if (form && avis) {
    var mostra = function (text) {
      avis.textContent = text;
      avis.hidden = false;
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var buits = [];
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (camp) {
        if (!camp.value.trim()) {
          var etiqueta = form.querySelector('label[for="' + camp.id + '"]');
          buits.push(etiqueta ? etiqueta.textContent.trim() : camp.name);
        }
      });

      if (buits.length) {
        mostra('Falta omplir: ' + buits.join(', ') + '.');
        return;
      }

      if (form.action.indexOf('XXXXXXXX') !== -1) {
        mostra('Aquest formulari encara no està connectat a cap bústia, o sigui ' +
               'que això NO s’ha enviat enlloc. Truqueu-nos al 938 43 26 49 ' +
               'i us ho anotem.');
        return;
      }

      mostra('Enviant…');

      window.fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (resposta) {
        if (resposta.ok) {
          form.reset();
          mostra('Rebut. Us truquem per confirmar-vos-ho; fins llavors l’encàrrec no està fet.');
        } else {
          mostra('No s’ha pogut enviar. Truqueu-nos al 938 43 26 49.');
        }
      }).catch(function () {
        mostra('No s’ha pogut enviar. Truqueu-nos al 938 43 26 49.');
      });
    });
  }

  /* ---- Àncores: desplaçament fet a mà ----------------------------------
     `scroll-behavior: smooth` no fa res en algunes configuracions i deixa
     les àncores mortes. Es fa aquí, i amb xarxa de seguretat.       ------ */

  doc.addEventListener('click', function (ev) {
    var enllac = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!enllac) { return; }

    var id = enllac.getAttribute('href').slice(1);
    if (!id) { return; }

    var desti = doc.getElementById(id);
    if (!desti) { return; }

    ev.preventDefault();
    var dalt = desti.getBoundingClientRect().top + window.pageYOffset - 80;

    if (reduit.matches || typeof window.requestAnimationFrame !== 'function') {
      window.scrollTo(0, dalt);
    } else {
      window.scrollTo({ top: dalt, behavior: 'smooth' });
      // Xarxa de seguretat: si la pestanya passa a segon pla, el desplaçament
      // suau es queda a mitges i cal acabar-lo a la brava.
      window.setTimeout(function () {
        if (Math.abs(window.pageYOffset - dalt) > 4) { window.scrollTo(0, dalt); }
      }, 700);
    }

    desti.setAttribute('tabindex', '-1');
    desti.focus({ preventScroll: true });
  });
}());
