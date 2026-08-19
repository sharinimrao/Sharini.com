/* Draws the curved dashed .section-spine path as the page scrolls, via Anime.js strokeDashoffset. */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paths = document.querySelectorAll('.section-spine path');
  if (!paths.length || typeof anime === 'undefined') return;

  paths.forEach(function (path) {
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;

    if (reduceMotion) {
      path.style.strokeDashoffset = 0;
      return;
    }

    path.style.strokeDashoffset = length;
    var container = path.closest('.section-spine');
    var ticking = false;

    function update() {
      var rect = container.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height + vh;
      var progress = (vh - rect.top) / total;
      progress = Math.min(1, Math.max(0, progress));
      anime.set(path, { strokeDashoffset: length * (1 - progress) });
      ticking = false;
    }

    update();
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update);
  });
})();
