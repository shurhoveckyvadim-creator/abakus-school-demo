import { config } from './config.js';
import { days, grades, lessonTypes, lessons, teachers } from './data.js';

const state = { ...config.defaults };

const els = {
  dayList: document.getElementById('day-list'),
  typeFilter: document.getElementById('type-filter'),
  gradeFilter: document.getElementById('grade-filter'),
  summary: document.getElementById('schedule-summary'),
  list: document.getElementById('lesson-list'),
  empty: document.getElementById('empty-state'),
  reset: document.getElementById('reset-filters'),
  footnote: document.getElementById('school-footnote'),
  patternNotice: document.getElementById('pattern-notice'),
  enrollDialog: document.getElementById('enroll-dialog'),
  enrollContext: document.getElementById('enroll-context'),
  enrollForm: document.getElementById('enroll-form'),
  enrollResult: document.getElementById('enroll-result'),
  messengerDialog: document.getElementById('messenger-dialog'),
};

/* ---------- Helpers ---------- */

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function lessonsCount(n) {
  return `${n} ${plural(n, 'занятие', 'занятия', 'занятий')}`;
}

function groupLabel(lesson) {
  if (lesson.groupLabel) return lesson.groupLabel;
  const ids = [...lesson.gradeIds].sort((a, b) => a - b);
  if (ids.length === 1) return `${ids[0]} класс`;
  const contiguous = ids.every((id, i) => i === 0 || id === ids[i - 1] + 1);
  return contiguous ? `${ids[0]}–${ids[ids.length - 1]} классы` : `${ids.join(', ')} классы`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const dayById = Object.fromEntries(days.map((d) => [d.id, d]));

/* ---------- Filtering ---------- */

function matchesFilters(lesson, { type, grade }) {
  if (type !== 'all' && lesson.type !== type) return false;
  if (grade !== 'all' && !lesson.gradeIds.includes(grade)) return false;
  return true;
}

function lessonsFor(dayId) {
  return lessons
    .filter((l) => l.day === dayId && matchesFilters(l, state))
    .sort((a, b) => a.start.localeCompare(b.start) || Math.min(...a.gradeIds) - Math.min(...b.gradeIds));
}

/* ---------- Controls ---------- */

function renderDays() {
  els.dayList.replaceChildren(
    ...days.map((day) => {
      const count = lessonsFor(day.id).length;
      const btn = el('button', 'day');
      btn.type = 'button';
      btn.dataset.day = day.id;
      btn.setAttribute('aria-pressed', String(day.id === state.day));
      btn.setAttribute('aria-label', `${day.name}: ${count ? lessonsCount(count) : 'нет занятий'}`);
      if (!count) btn.classList.add('day--empty');

      const short = el('span', 'day__short', day.short);
      short.setAttribute('aria-hidden', 'true');
      const meta = el('span', 'day__count', count ? lessonsCount(count) : 'нет занятий');
      meta.setAttribute('aria-hidden', 'true');
      btn.append(short, meta);
      return btn;
    }),
  );
}

function renderOptions(container, name, options, current) {
  container.replaceChildren(
    ...options.map((opt) => {
      const label = el('label', 'chip');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = String(opt.id);
      input.checked = opt.id === current;
      input.className = 'chip__input';
      label.append(input, el('span', 'chip__text', opt.label));
      return label;
    }),
  );
}

function syncOptions(container, current) {
  container.querySelectorAll('input').forEach((input) => {
    input.checked = input.value === String(current);
  });
}

/* ---------- Lessons ---------- */

function renderLesson(lesson) {
  const teacher = teachers[lesson.teacher];
  const day = dayById[lesson.day];
  const isExtra = lesson.type === 'extra';

  const item = el('li', `lesson lesson--${lesson.type}`);

  const time = el('p', 'lesson__time');
  const timeEl = el('time', 'lesson__start', lesson.start);
  timeEl.dateTime = lesson.start;
  time.append(timeEl, el('span', 'lesson__end', `– ${lesson.end}`));

  const main = el('div', 'lesson__main');
  main.append(el('h3', 'lesson__title', lesson.title), el('p', 'lesson__group', groupLabel(lesson)));

  const type = el('p', 'lesson__type', isExtra ? 'Дополнительное' : 'Школьное');

  const teacherBox = el('p', 'lesson__teacher');
  const avatar = el('span', 'avatar', teacher.initials);
  avatar.setAttribute('aria-hidden', 'true');
  teacherBox.append(avatar, el('span', 'lesson__teacher-name', teacher.name));

  const action = el('div', 'lesson__action');
  if (isExtra) {
    const btn = el('button', 'btn btn--accent btn--sm', 'На пробное');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Записаться на пробное: ${lesson.title}, ${day.name}, ${lesson.start}`);
    btn.dataset.lesson = lesson.id;
    action.append(btn);
  } else {
    action.append(el('span', 'lesson__note', 'Школьная программа'));
  }

  item.append(time, main, type, teacherBox, action);
  return item;
}

function renderSchedule() {
  renderDays();
  const day = dayById[state.day];
  const list = lessonsFor(state.day);

  els.summary.textContent = `${day.name} · ${list.length ? lessonsCount(list.length) : 'нет занятий'}`;
  els.list.replaceChildren(...list.map(renderLesson));
  els.list.hidden = list.length === 0;
  els.empty.hidden = list.length !== 0;
  els.footnote.hidden = !list.some((l) => l.type === 'school');
}

function parseGrade(value) {
  return value === 'all' ? 'all' : Number(value);
}

function initSchedule() {
  renderOptions(els.typeFilter, 'type', lessonTypes, state.type);
  renderOptions(els.gradeFilter, 'grade', grades, state.grade);
  renderSchedule();

  els.dayList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-day]');
    if (!btn) return;
    state.day = btn.dataset.day;
    renderSchedule();
    els.dayList.querySelector(`[data-day="${state.day}"]`)?.focus();
  });

  els.typeFilter.addEventListener('change', (e) => {
    state.type = e.target.value;
    renderSchedule();
  });

  els.gradeFilter.addEventListener('change', (e) => {
    state.grade = parseGrade(e.target.value);
    renderSchedule();
  });

  els.reset.addEventListener('click', () => {
    state.type = config.defaults.type;
    state.grade = config.defaults.grade;
    syncOptions(els.typeFilter, state.type);
    syncOptions(els.gradeFilter, state.grade);
    renderSchedule();
    els.dayList.querySelector(`[data-day="${state.day}"]`)?.focus();
  });

  els.list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lesson]');
    if (!btn) return;
    const lesson = lessons.find((l) => l.id === btn.dataset.lesson);
    if (lesson) openEnroll(lesson);
  });
}

/* ---------- Dialogs ---------- */

let lastFocus = null;

function openDialog(dialog) {
  lastFocus = document.activeElement;
  document.documentElement.classList.add('is-locked');
  dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

function setupDialog(dialog) {
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('is-locked');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  });
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === dialog) closeDialog(dialog);
  });
}

function contextRow(term, value) {
  const row = el('div', 'enroll-context__row');
  row.append(el('dt', null, term), el('dd', null, value));
  return row;
}

function openEnroll(lesson) {
  const title = els.enrollDialog.querySelector('#enroll-title');
  if (lesson) {
    const day = dayById[lesson.day];
    title.textContent = 'Запись на пробное занятие';
    els.enrollContext.replaceChildren(
      contextRow('Занятие', lesson.title),
      contextRow('Группа', groupLabel(lesson)),
      contextRow('День и время', `${day.name}, ${lesson.start}–${lesson.end}`),
      contextRow('Преподаватель', teachers[lesson.teacher].name),
    );
  } else {
    title.textContent = 'Запись в школу';
    els.enrollContext.replaceChildren(contextRow('Тема', 'Общая запись в школу и на пробное занятие'));
  }
  resetForm();
  openDialog(els.enrollDialog);
  fields.name.focus();
}

/* ---------- Form (demo, nothing is sent) ---------- */

const fields = {
  name: els.enrollForm.elements.parentName,
  phone: els.enrollForm.elements.parentPhone,
};

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  error.textContent = message;
  error.hidden = !message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
}

function validate() {
  const name = fields.name.value.trim();
  const phoneDigits = fields.phone.value.replace(/\D/g, '');
  const errors = [];

  if (!name) errors.push([fields.name, 'Укажите имя родителя']);
  else if (name.length < 2) errors.push([fields.name, 'Имя должно содержать хотя бы 2 символа']);
  else setError(fields.name, '');

  if (!phoneDigits) errors.push([fields.phone, 'Укажите телефон']);
  else if (phoneDigits.length < 10 || phoneDigits.length > 15 || /[^\d\s()+-]/.test(fields.phone.value)) {
    errors.push([fields.phone, 'Проверьте номер: нужно 10–15 цифр']);
  } else setError(fields.phone, '');

  errors.forEach(([input, msg]) => setError(input, msg));
  return errors;
}

function resetForm() {
  els.enrollForm.reset();
  Object.values(fields).forEach((input) => setError(input, ''));
  els.enrollResult.hidden = true;
  els.enrollResult.textContent = '';
}

function initForm() {
  els.enrollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      els.enrollResult.hidden = true;
      errors[0][0].focus();
      return;
    }
    els.enrollResult.textContent = 'Это демонстрация. В полной версии заявка будет передана администратору школы';
    els.enrollResult.hidden = false;
  });

  Object.values(fields).forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(input, '');
      els.enrollResult.hidden = true;
    });
  });
}

/* ---------- Messenger ---------- */

function openMessenger() {
  const url = config.messengerUrl.trim();
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    openDialog(els.messengerDialog);
  }
}

/* ---------- Hero background check ---------- */

function checkPattern() {
  const img = new Image();
  img.onerror = () => {
    document.querySelector('.hero').classList.add('hero--no-pattern');
    els.patternNotice.textContent = `Фоновое изображение не найдено: ${config.heroPatternPath}. Показан временный светлый фон.`;
    els.patternNotice.hidden = false;
  };
  img.src = config.heroPatternPath;
}

/* ---------- Init ---------- */

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-action]');
  if (!trigger) return;
  if (trigger.dataset.action === 'enroll') openEnroll(null);
  if (trigger.dataset.action === 'messenger') openMessenger();
});

[els.enrollDialog, els.messengerDialog].forEach(setupDialog);
initSchedule();
initForm();
checkPattern();
