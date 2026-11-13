/* Posledný zostrel – pomocný skript pre luc.sk (načítaný z pätičky e-shopu).
 * #kosik[&utm...]      po POST z poslednyzostrel.sk: presmeruje do košíka, UTM prenesie do adresy
 * #zostrelN[&utm...]   zdieľateľný link: vloží N ks knihy (priceId 5522) a presmeruje do košíka
 */
(function () {
  var h = location.hash;
  if (!h) return;
  var m = /^#(kosik|zostrel(\d))(?:[?&](.*))?$/.exec(h);
  if (!m) return;
  var q = (m[3] || '').replace(/[^\w.=&%-]/g, '');
  var R = function () { location.replace('/kosik/' + (q ? '?' + q : '')); };
  if (m[1] === 'kosik') return R();
  try {
    var k = 'pz' + m[1], S = sessionStorage;
    if (Date.now() - S.getItem(k) < 6e5) return R();
    S.setItem(k, Date.now());
  } catch (x) {}
  function r () {
    var d = 0, g = function () { d++ || R(); };
    document.addEventListener('ShoptetCartUpdated', g);
    shoptet.cartShared.addToCart({ priceId: 5522, amount: +m[2] }, true);
    setTimeout(g, 2500);
  }
  window.shoptet && shoptet.cartShared ? r() : addEventListener('DOMContentLoaded', r);
})();
