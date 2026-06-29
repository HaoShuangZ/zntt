/**
 * 列表行「删除」— 统一确认弹窗（原型，不落库）
 * 操作按钮 class：btn-row-delete
 * 可选：data-delete-label="显示名"；行上 data-code / data-name / data-id / data-task-id
 */
(function () {
  function labelFromRow(row) {
    if (!row) return '该记录';
    var code = row.dataset.code || row.dataset.id || row.dataset.taskId || row.getAttribute('data-order-code') || '';
    var name = row.dataset.name || row.dataset.title || '';
    if (name && code) return name + '（' + code + '）';
    if (code) return code;
    if (name) return name;
    var cells = row.cells;
    if (!cells || !cells.length) return '该记录';
    var a = cells[0] ? cells[0].textContent.trim() : '';
    var b = cells[1] ? cells[1].textContent.trim() : '';
    return b || a || '该记录';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-row-delete');
    if (!btn) return;
    e.preventDefault();
    var label = btn.getAttribute('data-delete-label') || labelFromRow(btn.closest('tr'));
    if (confirm('确定要删除「' + label + '」吗？删除后不可恢复。')) {
      alert('已删除（原型）');
    }
  });
})();
