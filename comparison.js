
'use strict';
(() => {
  document.querySelectorAll('[data-comparison]').forEach(stage => {
    const range = stage.querySelector('input[type="range"]');
    const beforeLabel = stage.dataset.beforeLabel;
    const afterLabel = stage.dataset.afterLabel;
    const update = () => {
      const position = Number(range.value);
      stage.style.setProperty('--compare-position', position + '%');
      stage.classList.toggle('is-only-after', position === 0);
      stage.classList.toggle('is-only-before', position === 100);
      range.setAttribute('aria-valuetext', position + '% ' + beforeLabel + ', ' + (100-position) + '% ' + afterLabel);
    };
    range.addEventListener('input', update);
    stage.parentElement.querySelector('.comparison-instruction').textContent = 'Arraste a divisão para comparar. No teclado, use as setas.';
    range.hidden = false;
    stage.classList.add('is-enhanced');
    update();
  });
})();
