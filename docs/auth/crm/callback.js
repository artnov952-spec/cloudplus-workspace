'use strict';
// No grant exchange until the CRM server contract is agreed. Never log/store URL credentials.
if (location.search || location.hash) { history.replaceState(null, '', location.pathname); document.getElementById('status').textContent='Параметры входа удалены из адресной строки. Пропуск не обменен: подключение CRM еще не включено.'; }
