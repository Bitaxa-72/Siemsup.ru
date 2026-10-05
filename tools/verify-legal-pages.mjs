import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../assets/js/pages.js', import.meta.url), 'utf8');
const required = [
  'class="legal-document"',
  'Политика в отношении обработки персональных данных',
  'Порядок отзыва согласия',
  'технические данные браузера',
  'Контакты для обращений',
  '[указать адрес электронной почты для обращений по персональным данным]',
];

const missing = required.filter((text) => !source.includes(text));
if (missing.length) throw new Error(`Не найдены обязательные элементы: ${missing.join('; ')}`);

const obsolete = ['legal-document__toc', 'legal-document__table'];
const found = obsolete.filter((text) => source.includes(text));
if (found.length) throw new Error(`В документе остались интерфейсные блоки: ${found.join('; ')}`);

const styles = readFileSync(new URL('../assets/css/pages-modern.css', import.meta.url), 'utf8');
if (!styles.includes('.legal-document { max-width: none;')) throw new Error('Юридический документ должен занимать всю ширину контейнера');
