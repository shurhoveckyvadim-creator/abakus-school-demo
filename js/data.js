// Демонстрационные данные. Все имена и расписание вымышленные.

export const teachers = {
  AS: { initials: 'АС', name: 'Анна Соколова' },
  ML: { initials: 'МЛ', name: 'Мария Лебедева' },
  EK: { initials: 'ЕК', name: 'Елена Крылова' },
  PO: { initials: 'ПО', name: 'Полина Орлова' },
  DV: { initials: 'ДВ', name: 'Дмитрий Волков' },
  NS: { initials: 'НС', name: 'Наталья Смирнова' },
  IL: { initials: 'ИЛ', name: 'Ирина Ли' },
};

export const days = [
  { id: 'mon', short: 'Пн', name: 'Понедельник' },
  { id: 'tue', short: 'Вт', name: 'Вторник' },
  { id: 'wed', short: 'Ср', name: 'Среда' },
  { id: 'thu', short: 'Чт', name: 'Четверг' },
  { id: 'fri', short: 'Пт', name: 'Пятница' },
  { id: 'sat', short: 'Сб', name: 'Суббота' },
];

// 0 — подготовка к школе (отдельная группа 6–7 лет).
export const PREP_GRADE = 0;

export const grades = [
  { id: 'all', label: 'Все группы' },
  { id: PREP_GRADE, label: 'Подготовка к школе' },
  { id: 1, label: '1 класс' },
  { id: 2, label: '2 класс' },
  { id: 3, label: '3 класс' },
  { id: 4, label: '4 класс' },
  { id: 5, label: '5 класс' },
];

export const lessonTypes = [
  { id: 'all', label: 'Все занятия' },
  { id: 'school', label: 'Школьные занятия' },
  { id: 'extra', label: 'Дополнительные' },
];

const schoolDays = ['mon', 'tue', 'wed', 'thu', 'fri'];

const schoolGroups = [
  { gradeIds: [1], teacher: 'AS' },
  { gradeIds: [2, 3], teacher: 'ML' },
  { gradeIds: [4, 5], teacher: 'EK' },
];

const schoolLessons = schoolDays.flatMap((day) =>
  schoolGroups.map((group) => ({
    day,
    start: '09:00',
    end: '13:30',
    title: 'Учебный день',
    type: 'school',
    gradeIds: group.gradeIds,
    teacher: group.teacher,
  })),
);

// [день, начало, конец, название, классы, преподаватель, подпись группы]
const extraRows = [
  ['mon', '14:00', '14:45', 'Занимательная математика', [1, 2], 'AS'],
  ['mon', '15:00', '15:45', 'Английский язык', [1, 2, 3], 'PO'],
  ['mon', '16:00', '16:45', 'Русский язык', [3, 4, 5], 'NS'],

  ['tue', '14:00', '14:45', 'Шахматы', [1, 2, 3, 4, 5], 'DV'],
  ['tue', '15:00', '16:00', 'Творческая мастерская', [1, 2, 3, 4, 5], 'ML'],
  ['tue', '16:15', '17:00', 'Китайский язык', [1, 2, 3], 'IL'],

  ['wed', '14:00', '14:45', 'Олимпиадная математика', [3, 4, 5], 'EK'],
  ['wed', '15:00', '15:45', 'Английский язык', [4, 5], 'PO'],
  ['wed', '16:00', '16:45', 'Биология', [4, 5], 'ML'],

  ['thu', '14:00', '14:45', 'Занимательная математика', [1, 2], 'AS'],
  ['thu', '15:00', '15:45', 'Шахматы', [1, 2, 3, 4, 5], 'DV'],
  ['thu', '16:00', '16:45', 'Литература', [3, 4, 5], 'NS'],

  ['fri', '14:00', '14:45', 'Олимпиадная математика', [3, 4, 5], 'EK'],
  ['fri', '15:00', '16:00', 'Творческая мастерская', [1, 2, 3, 4, 5], 'ML'],
  ['fri', '16:15', '17:00', 'ИЗО', [1, 2, 3, 4, 5], 'ML'],

  ['sat', '10:00', '10:45', 'Подготовка к школе', [PREP_GRADE], 'AS', '6–7 лет, отдельная группа'],
  ['sat', '11:00', '11:45', 'Разговорный английский', [1, 2, 3], 'PO'],
  ['sat', '12:00', '12:45', 'Китайский язык', [4, 5], 'IL'],
];

const extraLessons = extraRows.map(([day, start, end, title, gradeIds, teacher, groupLabel]) => ({
  day,
  start,
  end,
  title,
  type: 'extra',
  gradeIds,
  teacher,
  ...(groupLabel ? { groupLabel } : {}),
}));

export const lessons = [...schoolLessons, ...extraLessons].map((lesson, index) => ({
  id: `lesson-${index + 1}`,
  ...lesson,
}));
