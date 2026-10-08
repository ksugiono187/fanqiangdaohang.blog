document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const toast = document.querySelector('.toast');
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    toast.textContent = '已复制优惠码：' + button.dataset.copy;
  } catch {
    toast.textContent = '请手动复制优惠码：' + button.dataset.copy;
  }
  toast.classList.add('visible');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
});
// Comparison columns preserve the publisher's original brand order.
const compareInputs = [...document.querySelectorAll('[data-compare-select]')];
if (compareInputs.length) {
  const requested = new Set((new URLSearchParams(location.search).get('brands') || '').split(',').filter(slug => compareInputs.some(input => input.dataset.compareSelect === slug)));
  if (requested.size >= 2 && requested.size <= 4) compareInputs.forEach(input => { input.checked = requested.has(input.dataset.compareSelect); });
  const status = document.querySelector('#compare-status');
  const paint = () => {
    const selected = new Set(compareInputs.filter(input => input.checked).map(input => input.dataset.compareSelect));
    document.querySelectorAll('[data-compare-brand]').forEach(cell => { cell.hidden = !selected.has(cell.dataset.compareBrand); });
    status.textContent = `已选 ${selected.size} 个品牌，可选择 2–4 个。表格保持原有目录顺序。`;
  };
  compareInputs.forEach(input => input.addEventListener('change', () => {
    const count = compareInputs.filter(item => item.checked).length;
    if (count > 4 || count < 2) {
      input.checked = !input.checked;
      status.textContent = count > 4 ? '最多对比 4 个品牌，请先取消一个候选。' : '请至少保留 2 个品牌进行对比。';
      return;
    }
    paint();
  }));
  document.querySelector('[data-compare-reset]').addEventListener('click', () => {
    compareInputs.forEach((input, index) => { input.checked = index < 3; });
    paint();
  });
  paint();
}
