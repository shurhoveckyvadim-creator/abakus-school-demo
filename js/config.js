// Настройки демо. Меняйте значения здесь, а не в main.js.
export const config = {
  // Ссылка на мессенджер школы (например, https://t.me/...).
  // Пока пусто — кнопка «Написать нам» показывает сообщение-заглушку.
  messengerUrl: '',

  // Путь к фону hero относительно index.html (используется для проверки наличия файла).
  heroPatternPath: 'public/images/school-pattern.jpg',

  // Начальное состояние расписания.
  defaults: {
    day: 'mon',
    type: 'all',
    grade: 'all',
  },
};
