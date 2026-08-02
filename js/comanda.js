/* =========================================================================
   LA ROSTISSERIA — el compositor de comanda (element signatura).

   Marques plats i quantitats i la web t'escriu la comanda. No l'envia:
   l'escriu. La comanda queda feta quan la casa la confirma, i el text que
   surt a la pantalla ho diu amb aquestes paraules.

   Dues regles que no es toquen:
   1. Sense JS, la carta es llegeix sencera igualment. Els controls els crea
      aquest fitxer; si no s'executa, la barra ni tan sols apareix.
   2. Cap missatge d'èxit que el codi no hagi aconseguit.
   ========================================================================= */

(function () {
  'use strict';

  var doc = document;

  /* ⚠️ PENDENT-CLIENT — BLOQUEJANT ABANS DE PUBLICAR.
     Aquest és el número publicat del negoci (938 43 26 49) en format
     internacional. És un FIX: WhatsApp Business permet donar d'alta un fix
     verificant-lo amb una trucada de veu, però NO està confirmat que ho hagin
     fet. Si no el tenen donat d'alta, qui premi «Enviar per WhatsApp» rebrà un
     error de WhatsApp dient que el número no hi és.
     → Preguntar-ho a la reunió (REUNIO-CLIENT.md §1.3) i, si tenen un mòbil
       diferent per a les comandes, canviar-lo aquí i prou. */
  var WHATSAPP = '34938432649';

  var TELEFON = '+34938432649';
  var TELEFON_LLEGIBLE = '938 43 26 49';

  var plats = doc.querySelectorAll('.plat[data-plat]');
  var barra = doc.getElementById('comanda');
  var recompte = doc.getElementById('comanda-recompte');
  var botoEscriu = doc.getElementById('escriu-comanda');
  var botoBuida = doc.getElementById('buida-comanda');
  var full = doc.getElementById('resum');
  var fullLlista = doc.getElementById('resum-llista');
  var fullWhatsApp = doc.getElementById('resum-whatsapp');
  var fullTanca = doc.getElementById('resum-tanca');

  if (!plats.length || !barra || !recompte || !botoEscriu || !full || !fullLlista) {
    return;
  }

  var comanda = {};   // { nom del plat: unitats }

  /* ---- Utilitats -------------------------------------------------------- */

  var unitats = function () {
    var total = 0;
    Object.keys(comanda).forEach(function (nom) { total += comanda[nom]; });
    return total;
  };

  var liniesDeComanda = function () {
    return Object.keys(comanda).map(function (nom) {
      return { nom: nom, quantitat: comanda[nom] };
    });
  };

  var textDeComanda = function () {
    var linies = liniesDeComanda().map(function (l) {
      return '- ' + l.nom + ' x' + l.quantitat;
    });
    return 'Bon dia, voldria encarregar:\n' + linies.join('\n') +
           '\n\n(Llista feta des de la web de La Rostisseria.)';
  };

  /* ---- Pintar l'estat --------------------------------------------------- */

  var pintaBarra = function () {
    var total = unitats();
    var articles = Object.keys(comanda).length;

    if (!total) {
      barra.hidden = true;
      recompte.textContent = 'Encara no heu marcat res';
      botoEscriu.disabled = true;
      return;
    }

    barra.hidden = false;
    botoEscriu.disabled = false;
    recompte.innerHTML = '';

    var xifra = doc.createElement('span');
    xifra.textContent = total + (total === 1 ? ' unitat' : ' unitats');
    recompte.appendChild(xifra);
    recompte.appendChild(
      doc.createTextNode(' de ' + articles + (articles === 1 ? ' plat' : ' plats'))
    );
  };

  var canvia = function (nom, delta, camp, menys) {
    var actual = comanda[nom] || 0;
    var nou = Math.max(0, Math.min(99, actual + delta));

    if (nou === 0) { delete comanda[nom]; } else { comanda[nom] = nou; }

    camp.textContent = String(nou);
    camp.setAttribute('aria-valuenow', String(nou));
    camp.setAttribute('aria-valuetext', nou + ' de ' + nom);
    menys.disabled = nou === 0;
    camp.closest('.plat').dataset.triat = nou > 0 ? 'si' : 'no';

    pintaBarra();
  };

  /* ---- Crear els controls de cada plat ---------------------------------- */

  Array.prototype.forEach.call(plats, function (plat) {
    var nom = plat.dataset.plat;

    var control = doc.createElement('div');
    control.className = 'plat__control';

    var menys = doc.createElement('button');
    menys.type = 'button';
    menys.className = 'pas-quantitat';
    menys.textContent = '−';
    menys.disabled = true;
    menys.setAttribute('aria-label', 'Treure una unitat de ' + nom);

    var camp = doc.createElement('span');
    camp.className = 'quantitat';
    camp.textContent = '0';
    camp.setAttribute('role', 'spinbutton');
    camp.setAttribute('tabindex', '0');
    camp.setAttribute('aria-valuemin', '0');
    camp.setAttribute('aria-valuemax', '99');
    camp.setAttribute('aria-valuenow', '0');
    camp.setAttribute('aria-valuetext', '0 de ' + nom);
    camp.setAttribute('aria-label', 'Unitats de ' + nom);

    var mes = doc.createElement('button');
    mes.type = 'button';
    mes.className = 'pas-quantitat';
    mes.textContent = '+';
    mes.setAttribute('aria-label', 'Afegir una unitat de ' + nom);

    menys.addEventListener('click', function () { canvia(nom, -1, camp, menys); });
    mes.addEventListener('click', function () { canvia(nom, 1, camp, menys); });

    // Operable amb el teclat, com qualsevol spinbutton.
    camp.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight' || ev.key === '+') {
        ev.preventDefault();
        canvia(nom, 1, camp, menys);
      } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft' || ev.key === '-') {
        ev.preventDefault();
        canvia(nom, -1, camp, menys);
      } else if (ev.key === 'Home') {
        ev.preventDefault();
        canvia(nom, -(comanda[nom] || 0), camp, menys);
      }
    });

    control.appendChild(menys);
    control.appendChild(camp);
    control.appendChild(mes);
    plat.appendChild(control);
  });

  /* ---- El full escrit ---------------------------------------------------- */

  var potObrirComDialeg = typeof full.showModal === 'function';

  var pintaFull = function () {
    fullLlista.innerHTML = '';
    liniesDeComanda().forEach(function (linia) {
      var item = doc.createElement('li');
      item.appendChild(doc.createTextNode(linia.nom));
      var q = doc.createElement('span');
      q.textContent = '×' + linia.quantitat;
      item.appendChild(q);
      fullLlista.appendChild(item);
    });

    // L'enllaç es refà cada cop que s'obre el full, amb la comanda del moment.
    // Es fa aquí i no al clic perquè funcioni igual si algú l'obre amb el botó
    // del mig, el manté premut al mòbil o el copia.
    if (fullWhatsApp) {
      fullWhatsApp.href = WHATSAPP
        ? 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(textDeComanda())
        : 'tel:' + TELEFON;
    }
  };

  var obreFull = function () {
    if (!unitats()) { return; }
    pintaFull();
    if (potObrirComDialeg) {
      full.showModal();            // ESC i la gestió del focus, de sèrie
    } else {
      full.setAttribute('open', '');
      full.scrollIntoView();
    }
    if (fullTanca) { fullTanca.focus(); }
  };

  var tancaFull = function () {
    if (potObrirComDialeg && full.open) {
      full.close();
    } else {
      full.removeAttribute('open');
    }
    botoEscriu.focus();
  };

  botoEscriu.addEventListener('click', obreFull);
  if (fullTanca) { fullTanca.addEventListener('click', tancaFull); }

  if (botoBuida) {
    botoBuida.addEventListener('click', function () {
      comanda = {};
      Array.prototype.forEach.call(plats, function (plat) {
        plat.dataset.triat = 'no';
        var camp = plat.querySelector('.quantitat');
        var menys = plat.querySelector('.pas-quantitat');
        if (camp) {
          camp.textContent = '0';
          camp.setAttribute('aria-valuenow', '0');
          camp.setAttribute('aria-valuetext', '0 de ' + plat.dataset.plat);
        }
        if (menys) { menys.disabled = true; }
      });
      pintaBarra();
    });
  }

  /* ---- Els dos botons de contacte del full -------------------------------- */

  var truca = doc.getElementById('resum-truca');
  if (truca) {
    truca.href = 'tel:' + TELEFON;
    truca.textContent = 'Trucar · ' + TELEFON_LLEGIBLE;
  }

  // Si algun dia es buida WHATSAPP, la pàgina no es pot quedar amb un botó que
  // no porta enlloc: passa a ser el de trucar, el de trucar duplicat marxa i
  // l'avís deixa de parlar d'un WhatsApp que no existeix.
  if (!WHATSAPP && fullWhatsApp) {
    fullWhatsApp.textContent = 'Trucar · ' + TELEFON_LLEGIBLE;
    fullWhatsApp.removeAttribute('target');
    fullWhatsApp.removeAttribute('rel');
    if (truca) { truca.hidden = true; }

    var nota = doc.getElementById('resum-nota');
    if (nota) {
      nota.textContent = 'La web només us escriu la llista. La comanda queda ' +
        'feta quan ens la llegiu per telèfon i us diem a quina hora la teniu a punt.';
    }
  }

  pintaBarra();
}());
