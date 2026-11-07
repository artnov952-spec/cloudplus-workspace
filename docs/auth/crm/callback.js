'use strict';
CP_AUTH.callback().catch(()=>{
 document.getElementById('status').textContent='Вход не завершен. Пропуск истек, состояние входа не совпало или CRM еще не включила подключение. Вернитесь в календарь и начните вход заново.';
});
