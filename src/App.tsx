import { useState, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User { username: string; avatar: string }
interface Comment { id: number; author: string; avatar: string; text: string; date: string }
interface NewsItem { id: number; title: string; body: string; author: string; date: string; comments: Comment[] }

// ─── Constants ────────────────────────────────────────────────────────────────

const NEWS_AUTHOR = 'Faranatic'
const AVATARS = ['🦑', '🚀', '🔧', '⚓', '🐟', '🌊', '💀', '⚡', '🎮', '🛠️']

const INIT_NEWS: NewsItem[] = [
  {
    id: 1, title: 'КРИТИЧЕСКОЕ ОБНОВЛЕНИЕ v2.7.1',
    body: 'Выполнена полная перезагрузка реакторных систем. Устранена утечка радиации в секторе B-7. Новые мутанты добавлены в зону Аберрации. Не выходите в открытый океан без полного снаряжения — зафиксированы случаи нападения Эндворма на дистанции менее 400м от базы.',
    author: NEWS_AUTHOR, date: '07.08.2026 // 04:17',
    comments: [
      { id: 1, author: 'DeepDiver_Rex', avatar: '🐟', text: 'Наконец-то починили реактор! Прошлую неделю буквально горели заживо.', date: '07.08.2026 // 05:02' },
      { id: 2, author: 'Субмарина404', avatar: '🚀', text: 'Новые мутанты — хорошо, надеюсь лут тоже обновили', date: '07.08.2026 // 06:45' },
    ],
  },
  {
    id: 2, title: 'СОБЫТИЕ: ОХОТА НА ЛЕВИАФАНА',
    body: 'С 8 по 14 августа проходит недельное событие. Левиафан появляется каждые 3 часа в случайном секторе. За первое убийство — 5000 кредитов командиру судна. Одиночкам категорически не рекомендуется — потери в прошлом сезоне составили 87%.',
    author: NEWS_AUTHOR, date: '06.08.2026 // 22:00',
    comments: [
      { id: 3, author: 'KrakenSlayer', avatar: '⚓', text: 'Уже собираю команду! Нужны медик и инженер.', date: '06.08.2026 // 22:34' },
    ],
  },
  {
    id: 3, title: 'ТЕХНИЧЕСКИЕ РАБОТЫ — 9 АВГУСТА',
    body: 'В ночь с 9 на 10 августа сервер будет недоступен с 03:00 до 05:00 МСК. Плановая замена гидравлических насосов и обновление навигационных алгоритмов. Прогресс игроков сохранится полностью.',
    author: NEWS_AUTHOR, date: '05.08.2026 // 18:30',
    comments: [],
  },
]

// ─── Wiki Data ────────────────────────────────────────────────────────────────

interface Entry {
  id: string; name: string; icon: string
  subtitle: string; hp?: number; threat?: string; rarity?: string; location?: string
  description: string; flavor: string
  abilities: string[]; tips: string[]
  stats: { label: string; value: number; color: string }[]
  page: number
}

const PROFESSIONS: Entry[] = [
  {
    id: 'captain', name: 'Капитан', icon: '🎖', subtitle: 'Командование / Навигация', page: 1,
    description: 'Мозг и воля экипажа. Управляет субмариной, принимает стратегические решения и несёт полную ответственность за выживание. Без грамотного капитана любая вылазка превращается в катастрофу — слепой корабль, дрейфующий к гибели.',
    flavor: '«Я веду вас в темноту. Ваша задача — вернуться из неё.»',
    abilities: ['Управление рулём и двигателями', 'Навигация по батиметрической карте', 'Командование турелями и торпедами', 'Работа с сонаром', 'Координация экипажа'],
    tips: ['Держи карту открытой постоянно — сюрпризы не прощают', 'Следи за глубиной: корпус не резиновый', 'При атаке Молоха — полный назад, уходи в расщелины', 'Доверяй инженеру, но дублируй контроль реактора'],
    stats: [{ label: 'Сложность', value: 85, color: '#FF6B00' }, { label: 'Значимость', value: 100, color: '#00D4FF' }, { label: 'Боеспособность', value: 35, color: '#FF2244' }, { label: 'Навигация', value: 96, color: '#00CC66' }],
  },
  {
    id: 'engineer', name: 'Инженер', icon: '⚙', subtitle: 'Реактор / Электросети', page: 3,
    description: 'Сердце субмарины бьётся только пока работает реактор. Инженер поддерживает энергосистему, ремонтирует критические узлы и следит за тем, чтобы весь экипаж не задохнулся в темноте на глубине трёх километров.',
    flavor: '«Реактор — это бог. Я его жрец.»',
    abilities: ['Управление ядерным реактором', 'Ремонт электрических цепей', 'Настройка орудийных систем', 'Работа с детонаторами', 'Сборка устройств из компонентов'],
    tips: ['Никогда не оставляй реактор без присмотра дольше минуты', 'Запасные стержни всегда при себе', 'При пожаре — отключи кислород СНАЧАЛА', 'Выучи схему проводки как собственное имя'],
    stats: [{ label: 'Сложность', value: 78, color: '#FF6B00' }, { label: 'Значимость', value: 95, color: '#00D4FF' }, { label: 'Боеспособность', value: 20, color: '#FF2244' }, { label: 'Электротехника', value: 92, color: '#00CC66' }],
  },
  {
    id: 'mechanic', name: 'Механик', icon: '🔧', subtitle: 'Ремонт корпуса / Оружие', page: 7,
    description: 'Руки, которые держат субмарину целой. Чинит корпус, обслуживает вооружение и создаёт нужное снаряжение из обломков. Хороший механик — это разница между подводной лодкой и братской могилой.',
    flavor: '«Я не чиню вещи. Я заставляю их жить снова.»',
    abilities: ['Сварочный ремонт корпуса и труб', 'Обслуживание пушек и турелей', 'Крафт предметов и боеприпасов', 'Управление балластными помпами', 'Установка мин и ловушек'],
    tips: ['Держи сварочный аппарат заряженным всегда', 'Проверяй корпус после каждого столкновения', 'При крупной пробоине — помпы на максимум, потом ремонт', 'Кислородные баллоны в шлюзах — не забывай проверять'],
    stats: [{ label: 'Сложность', value: 60, color: '#FF6B00' }, { label: 'Значимость', value: 88, color: '#00D4FF' }, { label: 'Боеспособность', value: 50, color: '#FF2244' }, { label: 'Ремонт', value: 94, color: '#00CC66' }],
  },
  {
    id: 'medic', name: 'Медик', icon: '🩺', subtitle: 'Хирургия / Фармакология', page: 11,
    description: 'Единственный, кто стоит между смертью и воскрешением. Лечит травмы, создаёт препараты и проводит полостные операции под огнём. Без медика любая серьёзная вылазка — самоубийство.',
    flavor: '«Они сражаются. Я решаю, кто из них вернётся.»',
    abilities: ['Лечение ран, переломов, ожогов', 'Синтез медикаментов и антидотов', 'Полостные хирургические операции', 'Снятие отравлений и инфекций', 'Психотропная поддержка экипажа'],
    tips: ['Морфин всегда наготове — замешательство убивает', 'Психоз лечится — не паникуй при симптомах', 'Заражение хаской требует вмешательства до 3-й стадии', 'Противоядие от кравлера и противоядие от хаски — разные вещи'],
    stats: [{ label: 'Сложность', value: 92, color: '#FF6B00' }, { label: 'Значимость', value: 94, color: '#00D4FF' }, { label: 'Боеспособность', value: 28, color: '#FF2244' }, { label: 'Медицина', value: 99, color: '#00CC66' }],
  },
  {
    id: 'security', name: 'Офицер безопасности', icon: '🔫', subtitle: 'Охрана / Ближний бой', page: 15,
    description: 'Последний рубеж между порядком и хаосом. Охраняет экипаж от внешних угроз и внутренних предателей. Первым идёт в шлюз. Последним выходит из боя. Если выходит.',
    flavor: '«Моя работа — умереть последним. Я не тороплюсь.»',
    abilities: ['Огнестрельное и холодное оружие', 'Тактический ближний бой', 'Задержание и изоляция угроз', 'Работа в тяжёлой броне', 'Применение взрывчатых веществ'],
    tips: ['Никогда не ходи в открытый океан один — никогда', 'Дробовик — лучший друг в узких коридорах субмарины', 'Следи за манометром скафандра в ВКД', 'При хаске в экипаже — изолируй подозреваемых без дискуссий'],
    stats: [{ label: 'Сложность', value: 50, color: '#FF6B00' }, { label: 'Значимость', value: 82, color: '#00D4FF' }, { label: 'Боеспособность', value: 96, color: '#FF2244' }, { label: 'Выживаемость', value: 72, color: '#00CC66' }],
  },
  {
    id: 'assistant', name: 'Ассистент', icon: '🪛', subtitle: 'Общая поддержка', page: 19,
    description: 'Новобранец без специализации. Делает всё понемногу — носит грузы, помогает чинить, стреляет при нужде. Кажется бесполезным, пока не остаёшься с ним один против Молоха.',
    flavor: '«Я не знаю, что делаю. Но я стараюсь.»',
    abilities: ['Базовый ремонт и сварка', 'Переноска грузов и боеприпасов', 'Базовое стрелковое оружие', 'Помощь всем членам экипажа', 'Крафт расходников'],
    tips: ['Учись у всех — у тебя нет класса, только опыт', 'Не стой без дела — спрашивай, что нужно', 'В критической ситуации даже ты можешь спасти судно', 'Главное правило: не умирай первым'],
    stats: [{ label: 'Сложность', value: 22, color: '#FF6B00' }, { label: 'Значимость', value: 52, color: '#00D4FF' }, { label: 'Боеспособность', value: 42, color: '#FF2244' }, { label: 'Адаптивность', value: 85, color: '#00CC66' }],
  },
]

const MONSTERS: Entry[] = [
  {
    id: 'mudraptor', name: 'Мудраптор', icon: '🦎', subtitle: 'Класс: Рептилоид', page: 2,
    threat: 'ВЫСОКАЯ', hp: 240, location: 'Пещеры / Мелководье', rarity: 'Обычный',
    description: 'Агрессивный рептилоид с мощными когтями и толстой кожей. Обитает в пещерных системах и на мелководье. Атакует субмарину снаружи, пытаясь прорваться через шлюзы. В стае — смертельная угроза.',
    flavor: '«Первый раз слышал его когти на обшивке. Думал, показалось.»',
    abilities: ['Мощный укус — 65 ед. урона', 'Цепляние за внешний корпус', 'Прокусывание обшивки', 'Стайная координация', 'Откладывание яиц'],
    tips: ['Уничтожай яйца при первой возможности', 'Дробовик эффективен в упор — один выстрел в голову', 'Закрой все внешние люки перед нырком в пещеру', 'Торпеда в плотную стаю — оптимально'],
    stats: [{ label: 'Скорость', value: 65, color: '#FFB800' }, { label: 'Урон/удар', value: 70, color: '#FF2244' }, { label: 'Прочность', value: 55, color: '#00D4FF' }, { label: 'Агрессия', value: 88, color: '#FF6B00' }],
  },
  {
    id: 'crawler', name: 'Кравлер', icon: '🕷', subtitle: 'Класс: Членистоногий', page: 4,
    threat: 'СРЕДНЯЯ', hp: 80, location: 'Везде', rarity: 'Очень обычный',
    description: 'Маленькое, стремительное, смертоносное. Проникает внутрь через трещины и вентиляцию. Поодиночке — мелкая неприятность. В стае из двадцати особей — конец для неопытного экипажа в тёмном коридоре.',
    flavor: '«Их было так много, что пол двигался.»',
    abilities: ['Молниеносный прыжок', 'Укус — 25 ед. урона', 'Проникновение через щели', 'Нападение с потолка', 'Стайный рой'],
    tips: ['Пистолет и фонарик — базовая защита от одиночки', 'Проверяй вентиляцию регулярно в дальних вылазках', 'Не паникуй — они хрупкие, бьются с одного выстрела', 'Огнемёт в коридоре решает стаю за секунды'],
    stats: [{ label: 'Скорость', value: 92, color: '#FFB800' }, { label: 'Урон/удар', value: 30, color: '#FF2244' }, { label: 'Прочность', value: 18, color: '#00D4FF' }, { label: 'Агрессия', value: 100, color: '#FF6B00' }],
  },
  {
    id: 'husk', name: 'Хаска', icon: '🧟', subtitle: 'Класс: Паразитический', page: 6,
    threat: 'КРИТИЧЕСКАЯ', hp: 150, location: 'Внутри субмарины', rarity: 'Редкий',
    description: 'Заражённый паразитом член экипажа. Внешне неотличим от живого человека на ранней стадии. Заражает укусом. Главная угроза — не снаружи, а среди вас. Параноя — нормальная реакция.',
    flavor: '«Он звал меня по имени. Правильным голосом. Но глаза были пустые.»',
    abilities: ['Заражение укусом (3 стадии)', 'Имитация поведения экипажа', 'Управление другими хасками', 'Ускоренная регенерация', 'Безмолвная координация роя'],
    tips: ['Регулярно проверяй статус здоровья всего экипажа', 'Симптомы: судороги, дезориентация, агрессия к союзникам', 'Антидот нужно ввести строго до 3-й стадии — после поздно', 'При малейшем подозрении изолируй немедленно без дискуссий'],
    stats: [{ label: 'Скорость', value: 78, color: '#FFB800' }, { label: 'Урон/удар', value: 62, color: '#FF2244' }, { label: 'Прочность', value: 68, color: '#00D4FF' }, { label: 'Угроза', value: 100, color: '#FF6B00' }],
  },
  {
    id: 'hammerhead', name: 'Кувалда', icon: '🦈', subtitle: 'Класс: Мегафауна', page: 8,
    threat: 'ОЧЕНЬ ВЫСОКАЯ', hp: 2800, location: 'Открытый океан', rarity: 'Обычный',
    description: 'Колоссальная акулоподобная тварь с бронированным черепом. Таранит субмарину с разгона. Один удар в нос — и переборки идут трещинами. Любимая добыча опытных охотников. Кошмар новичков.',
    flavor: '«Я думал, что мы врезались в скалу. Скала оказалась живой.»',
    abilities: ['Таранный удар — 300+ ед. урона по корпусу', 'Взрывная скорость разгона', 'Сдирание внешнего оборудования', 'Частичная регенерация', 'Преследование на дальних дистанциях'],
    tips: ['Уходи от лобовой атаки в сторону — он не маневренный', 'Railgun в голову — единственное гарантированное слабое место', 'Держи скорость — не давай разогнаться для тарана', 'Медуза из торпедной установки эффективна'],
    stats: [{ label: 'Скорость', value: 80, color: '#FFB800' }, { label: 'Урон/удар', value: 96, color: '#FF2244' }, { label: 'Прочность', value: 90, color: '#00D4FF' }, { label: 'Агрессия', value: 82, color: '#FF6B00' }],
  },
  {
    id: 'moloch', name: 'Молох', icon: '👹', subtitle: 'Класс: Левиафан', page: 12,
    threat: 'ЭКСТРЕМАЛЬНАЯ', hp: 12000, location: 'Глубокий океан', rarity: 'Редкий',
    description: 'Левиафан. Размером с небольшой город. Бронепанцирь выдерживает прямое попадание торпеды. Встреча с ним — не бой, а экзамен на выживание. Единственно верная тактика — бегство.',
    flavor: '«Мы стреляли двадцать минут. Он даже не замедлился.»',
    abilities: ['Тараны с мегауроном по корпусу', 'Призыв роя кравлеров', 'Бронированный несокрушимый панцирь', 'Захват субмарины конечностями', 'Абсолютная ярость: не отступает'],
    tips: ['ГЛАВНОЕ ПРАВИЛО: НЕ ВОЮЙ — БЕГИ', 'Прячься в расщелинах, куда он физически не влезет', 'Если деваться некуда — торпеды только в глаза', 'Весь экипаж на аварийные посты при обнаружении'],
    stats: [{ label: 'Скорость', value: 48, color: '#FFB800' }, { label: 'Урон/удар', value: 100, color: '#FF2244' }, { label: 'Прочность', value: 100, color: '#00D4FF' }, { label: 'Ужас', value: 100, color: '#FF6B00' }],
  },
  {
    id: 'endworm', name: 'Эндворм', icon: '🪱', subtitle: 'Класс: Планетарный паразит', page: 16,
    threat: 'ЭКСТРЕМАЛЬНАЯ', hp: 8000, location: 'Открытый океан / Аномалии', rarity: 'Очень редкий',
    description: 'Планетарный паразит. Длина превышает любую субмарину. Поглощает суда целиком. Если ты его видишь — уже слишком поздно. Не существует известных способов его убить.',
    flavor: '«В журнале была только одна запись: "Оно больше, чем мир".»',
    abilities: ['Поглощение судна целиком', 'Невидимость на любом сонаре', 'Аномальная скорость финального рывка', 'Кислотное внутреннее пищеварение', 'Предположительная бессмертность'],
    tips: ['Избегай открытого океана без абсолютной необходимости', 'На сонаре не отображается вообще до момента удара', 'Единственный шанс — рывок на полных двигателях', 'Нет надежды. Только скорость.'],
    stats: [{ label: 'Скорость', value: 90, color: '#FFB800' }, { label: 'Урон', value: 100, color: '#FF2244' }, { label: 'Прочность', value: 94, color: '#00D4FF' }, { label: 'Смертоносность', value: 100, color: '#FF6B00' }],
  },
  {
    id: 'charybdis', name: 'Харибда', icon: '🌀', subtitle: 'Класс: Абиссальный охотник', page: 20,
    threat: 'ВЫСОКАЯ', hp: 3200, location: 'Глубины / Аномалии', rarity: 'Необычный',
    description: 'Биолюминесцентное существо, создающее мощные водовороты. Затягивает субмарину в центр вихря и удерживает, пока давление не раздавит корпус или экипаж не потеряет рассудок.',
    flavor: '«Свет был красивым. Мы плыли к нему, как мотыльки.»',
    abilities: ['Создание водоворота притяжения', 'Биолюминесцентная ловушка-приманка', 'Электрические разряды-щупальца', 'Абиссальный рывок из темноты', 'Дезориентирующий сонар-шум'],
    tips: ['Двигатели на максимум при первых признаках затяжки', 'Стреляй в светящиеся органы — единственное уязвимое место', 'Уходи по диагонали, не против потока', 'Глубинные бомбы точно в центр вихря'],
    stats: [{ label: 'Скорость', value: 58, color: '#FFB800' }, { label: 'Урон', value: 78, color: '#FF2244' }, { label: 'Прочность', value: 82, color: '#00D4FF' }, { label: 'Контроль', value: 94, color: '#FF6B00' }],
  },
  {
    id: 'bonethresher', name: 'Костодробитель', icon: '🦑', subtitle: 'Класс: Цефалопод', page: 24,
    threat: 'ВЫСОКАЯ', hp: 600, location: 'Средние глубины', rarity: 'Необычный',
    description: 'Гигантское головоногое с костяными мандибулами. Захватывает субмарину щупальцами и удерживает, не давая двигаться. Пока механик не починит повреждения — остаётся только молиться.',
    flavor: '«Двигатели выли. Мы не двигались. Оно держало нас.»',
    abilities: ['Захват субмарины щупальцами', 'Полная фиксация — движение невозможно', 'Кислотный плевок по корпусу', 'Бронированный экзоскелет', 'Регенерация конечностей'],
    tips: ['Режь щупальца по одному — они не регенерируют мгновенно', 'Не глуши двигатели в захвате — рвись с полной тягой', 'Взрывчатка в зоне захвата даёт шанс', 'Сонар покажет направление следующего захвата'],
    stats: [{ label: 'Скорость', value: 38, color: '#FFB800' }, { label: 'Урон', value: 82, color: '#FF2244' }, { label: 'Прочность', value: 78, color: '#00D4FF' }, { label: 'Контроль', value: 97, color: '#FF6B00' }],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Tt({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', zIndex: 400, pointerEvents: 'none', background: '#040810', border: '1px solid #1A2A3A', color: '#4A6070', fontFamily: 'Roboto Mono', fontSize: 10, padding: '5px 10px', letterSpacing: '0.05em', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
          {text}
        </div>
      )}
    </div>
  )
}

function RivetRow({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rivet-row" style={{ margin: '16px 0' }}>
      <div className="rivet" />
      <div className="rivet" />
      {children}
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'Roboto Mono', fontSize: 9, color: '#5A7080', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: 'Orbitron', fontSize: 10, color, fontWeight: 700 }}>{value}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}77, ${color})`, boxShadow: `0 0 8px ${color}55` }} />
      </div>
    </div>
  )
}

function ThreatBadge({ threat }: { threat: string }) {
  const isLethal = threat.includes('ЭКСТРЕМ') || threat.includes('КРИТИЧ')
  const isHard = threat.includes('ОЧЕНЬ')
  const color = isLethal ? '#FF2244' : isHard ? '#FF6B00' : threat.includes('ВЫСО') ? '#FFB800' : '#00CC66'
  return (
    <span style={{ fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', padding: '3px 9px', border: `1px solid ${color}55`, background: `${color}12`, color, textTransform: 'uppercase', display: 'inline-block' }}>
      ⚠ {threat}
    </span>
  )
}

// ─── Ink stat bar ─────────────────────────────────────────────────────────────

function InkBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: 'IM Fell English SC', fontSize: 10, color: 'rgba(30,20,8,0.55)', letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ fontFamily: 'IM Fell English SC', fontSize: 10, color: 'rgba(30,20,8,0.65)' }}>{value}</span>
      </div>
      <div className="ink-bar-track">
        <div className="ink-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─── Book / Wiki ──────────────────────────────────────────────────────────────

// Per-leaf ageing presets. Each leaf gets ONE preset, so pages differ:
// some are just faded & foxed, some water-damaged, some scorched, some ink-stained.
// Shapes are deliberately irregular (organic border-radius) — not plain circles.
type WearMark = { type: string; style: React.CSSProperties }
function getWearVariants(): WearMark[][] { return [
  // 0 — mostly clean: sun-fade + a few age spots + one crease
  [
    { type: 'fade',   style: { top: '18%', left: '10%', width: 180, height: 150, borderRadius: '58% 42% 47% 53% / 52% 60% 40% 48%', transform: 'rotate(-10deg)' } },
    { type: 'foxing', style: { top: '30%', left: '28%', width: 6, height: 5 } },
    { type: 'foxing', style: { top: '64%', left: '72%', width: 5, height: 4 } },
    { type: 'foxing', style: { top: '52%', left: '61%', width: 7, height: 6 } },
    { type: 'crease', style: { top: '40%', left: '55%', width: '34%', transform: 'rotate(3deg)' } },
  ],
  // 1 — water damage: irregular tide-line stain + a ring + mildew, no burns
  [
    { type: 'water',  style: { top: '4%', left: '2%', width: 220, height: 180, borderRadius: '46% 54% 61% 39% / 55% 42% 58% 45%', transform: 'rotate(6deg)' } },
    { type: 'ring',   style: { bottom: '16%', right: '12%', width: 84, height: 70, borderRadius: '52% 48% 44% 56% / 48% 55% 45% 52%' } },
    { type: 'mildew', style: { top: '55%', left: '14%', width: 90, height: 64, borderRadius: '60% 40% 55% 45% / 50% 55% 45% 50%', transform: 'rotate(-14deg)' } },
  ],
  // 2 — scorched: charred patch + one small burn hole + crease (dry, no water)
  [
    { type: 'scorch', style: { bottom: '6%', left: '4%', width: 150, height: 120, borderRadius: '48% 52% 60% 40% / 58% 46% 54% 42%', transform: 'rotate(-7deg)' } },
    { type: 'burn',   style: { top: '22%', right: '18%', width: 40, height: 32, borderRadius: '52% 48% 40% 60% / 46% 58% 42% 54%', transform: 'rotate(12deg)' } },
    { type: 'crease', style: { top: '58%', left: '48%', width: '30%', transform: 'rotate(-4deg)' } },
  ],
  // 3 — ink-stained: spilt ink blot + splatter + a foxing spot
  [
    { type: 'ink',    style: { top: '34%', left: '18%', width: 76, height: 62, borderRadius: '56% 44% 63% 37% / 42% 58% 44% 56%', transform: 'rotate(9deg)' } },
    { type: 'ink',    style: { top: '30%', left: '30%', width: 14, height: 12, borderRadius: '60% 40% 45% 55%' } },
    { type: 'ink',    style: { top: '46%', left: '13%', width: 8, height: 7, borderRadius: '50%' } },
    { type: 'foxing', style: { bottom: '20%', right: '22%', width: 6, height: 5 } },
    { type: 'crease', style: { bottom: '28%', right: '8%', width: '26%', transform: 'rotate(-6deg)' } },
  ],
  // 4 — heavy tatter: folded corner + creases + edge damp + age spots
  [
    { type: 'dogear', style: { bottom: 0, right: 0 } },
    { type: 'crease', style: { top: '26%', left: '8%', width: '40%', transform: 'rotate(4deg)' } },
    { type: 'crease', style: { top: '70%', left: '52%', width: '36%', transform: 'rotate(-5deg)' } },
    { type: 'water',  style: { top: '2%', right: '0%', width: 120, height: 150, borderRadius: '50% 50% 40% 60% / 60% 40% 55% 45%', transform: 'rotate(-8deg)' } },
    { type: 'foxing', style: { top: '48%', left: '40%', width: 6, height: 5 } },
  ],
  // 5 — damp & mildewed: soft mildew bloom + faint tide stain + spots
  [
    { type: 'mildew', style: { bottom: '10%', left: '20%', width: 140, height: 100, borderRadius: '55% 45% 50% 50% / 48% 52% 48% 52%', transform: 'rotate(8deg)' } },
    { type: 'water',  style: { top: '10%', right: '6%', width: 150, height: 130, borderRadius: '44% 56% 58% 42% / 52% 45% 55% 48%', transform: 'rotate(-5deg)', opacity: 0.6 } },
    { type: 'foxing', style: { top: '40%', left: '30%', width: 7, height: 6 } },
    { type: 'foxing', style: { top: '58%', left: '66%', width: 5, height: 5 } },
  ],
  // 6 — sun-bleached with a cluster of foxing spots
  [
    { type: 'fade',   style: { top: '8%', left: '30%', width: 240, height: 200, borderRadius: '50% 50% 55% 45% / 55% 48% 52% 45%', transform: 'rotate(6deg)' } },
    { type: 'foxing', style: { top: '36%', left: '22%', width: 6, height: 5 } },
    { type: 'foxing', style: { top: '40%', left: '26%', width: 4, height: 4 } },
    { type: 'foxing', style: { top: '45%', left: '20%', width: 5, height: 6 } },
    { type: 'foxing', style: { top: '66%', left: '70%', width: 7, height: 5 } },
    { type: 'foxing', style: { top: '72%', left: '74%', width: 4, height: 4 } },
  ],
  // 7 — lightly singed edge + one crease + a spot (subtle)
  [
    { type: 'scorch', style: { top: '0%', right: '0%', width: 130, height: 90, borderRadius: '40% 60% 50% 50% / 60% 40% 55% 45%', transform: 'rotate(10deg)', opacity: 0.7 } },
    { type: 'crease', style: { top: '52%', left: '10%', width: '38%', transform: 'rotate(-2deg)' } },
    { type: 'foxing', style: { bottom: '24%', left: '44%', width: 6, height: 5 } },
  ],
] }

// Number of hinged strips the turning leaf is built from — more = smoother curl.
const SEG_COUNT = 9
// Build a nested chain of segments. Each child sits at the right edge of its
// parent and hinges on its own left edge, so cumulative rotation forms an arc.
function buildLeafSegments(n: number): React.ReactNode {
  let node: React.ReactNode = null
  for (let i = n - 1; i >= 0; i--) {
    const style: React.CSSProperties = i === 0
      ? { width: `${100 / n}%`, left: 0 }
      : { width: '100%', left: '100%' }
    node = (
      <div className="leaf-seg" style={{ ...style, animationDelay: `${i * 8}ms` }}>
        <div className="leaf-facet" />
        {node}
      </div>
    )
  }
  return node
}

function WikiBook() {
  const [mainTab, setMainTab] = useState<'professions' | 'monsters'>('professions')
  const [activeId, setActiveId] = useState('captain')
  const [flipPhase, setFlipPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [flipDir, setFlipDir] = useState<1 | -1>(1)
  const [displayedId, setDisplayedId] = useState('captain')

  const list = mainTab === 'professions' ? PROFESSIONS : MONSTERS
  const entry = list.find(e => e.id === displayedId) ?? list[0]
  const idx = Math.max(0, list.findIndex(e => e.id === activeId))
  // Deterministic per-leaf ageing seed (professions & bestiary offset so they differ)
  const displayedIdx = Math.max(0, list.findIndex(e => e.id === displayedId))
  const wearSeed = (mainTab === 'professions' ? 0 : 3) + displayedIdx

  function navigate(id: string, newMain?: 'professions' | 'monsters', dir: 1 | -1 = 1) {
    if (id === activeId && !newMain) return
    if (flipPhase !== 'idle') return

    setFlipDir(dir)
    setFlipPhase('out')
    // Swap the page content while the leaf is edge-on (mid-turn), then finish.
    setTimeout(() => {
      if (newMain) setMainTab(newMain)
      setActiveId(id)
      setDisplayedId(id)
      setFlipPhase('in')
      setTimeout(() => setFlipPhase('idle'), 360)
    }, 360)
  }

  function switchMain(t: 'professions' | 'monsters') {
    if (t === mainTab) return
    const firstId = (t === 'professions' ? PROFESSIONS : MONSTERS)[0].id
    navigate(firstId, t, 1)
  }

  // Turn a single page/leaf via the folded corner
  function turnPage(dir: 1 | -1) {
    const ni = idx + dir
    if (ni < 0 || ni >= list.length) return
    navigate(list[ni].id, undefined, dir)
  }

  const threatStamp = (threat?: string) => {
    if (!threat) return null
    const cls = threat.includes('ЭКСТРЕМ') || threat.includes('КРИТИЧ') ? 'lethal'
      : threat.includes('ОЧЕНЬ') ? 'hard'
      : threat.includes('ВЫСО') ? 'medium' : 'easy'
    return <span className={`threat-stamp ${cls}`}>⚠ {threat}</span>
  }

  const dirClass = flipDir === 1 ? 'fwd' : 'back'
  // Pages stay put; a single leaf turns on top. Underneath we just dim/settle.
  const pageClass = flipPhase === 'out' ? 'page-settle-out' : flipPhase === 'in' ? 'page-settle-in' : ''

  // Ink decorative cross-hatch divider
  const InkDivider = ({ label }: { label?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 12px' }}>
      <div style={{ flex: 1, borderTop: '1px solid rgba(26,18,8,0.3)' }} />
      {label && <span style={{ fontFamily: 'IM Fell English SC', fontSize: 11, color: 'rgba(26,18,8,0.38)', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{label}</span>}
      <div style={{ flex: 1, borderTop: '1px solid rgba(26,18,8,0.3)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Title above book — still handwritten feel */}
      <div style={{ textAlign: 'center', padding: '24px 20px 0' }}>
        <div style={{ fontFamily: 'UnifrakturMaguntia', fontSize: 38, color: 'rgba(30,18,6,0.55)', letterSpacing: '0.02em', lineHeight: 1, textShadow: '1px 2px 0 rgba(0,0,0,0.15)' }}>
          Полевое руководство выжившего
        </div>
        <div style={{ fontFamily: 'IM Fell English SC', fontSize: 11, color: 'rgba(30,18,6,0.32)', letterSpacing: '0.06em', marginTop: 6, fontStyle: 'italic' }}>
          Barotrauma · глубоководная экспедиция · том II
        </div>
      </div>

      <div className="book-scene">

        {/* ── LEATHER BOOKMARK RIBBONS (only two, hanging from the top) ── */}
        <div className="book-ribbons">
          {[
            { key: 'professions', label: 'Профессии', sub: '§ I' },
            { key: 'monsters',    label: 'Бестиарий', sub: '§ II' },
          ].map(t => (
            <button key={t.key} className={`book-ribbon ${mainTab === t.key ? 'active' : ''}`}
              onClick={() => switchMain(t.key as any)}>
              <span className="ribbon-sub">{t.sub}</span>
              <span className="ribbon-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── BOOK COVER ── */}
        <div className="book-cover">
          <div className="book-spread">

            {/* ── LEFT PAGE ── */}
            <div className={`book-page-left ${pageClass}`}>

              {/* Chapter & section heading */}
              <div style={{ fontFamily: 'UnifrakturMaguntia', fontSize: 12, color: 'rgba(26,18,8,0.4)', letterSpacing: '0.04em', marginBottom: 18 }}>
                {mainTab === 'professions' ? '§ I — Классы экипажа' : '§ II — Каталог угроз'}
              </div>

              {/* Icon box — hand-drawn border style */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 80, height: 80, flexShrink: 0,
                  border: '2px solid rgba(26,18,8,0.5)',
                  boxShadow: '2px 2px 0 rgba(26,18,8,0.15), inset 0 0 12px rgba(26,18,8,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 42, position: 'relative',
                  background: 'rgba(26,18,8,0.04)',
                }}>
                  {entry.icon}
                  {/* Ink corner marks */}
                  {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h], i) => (
                    <div key={i} style={{
                      position:'absolute', [v]: -3, [h]: -3, width: 8, height: 8,
                      borderStyle: 'solid', borderColor: 'rgba(26,18,8,0.6)',
                      borderWidth: v==='top' ? (h==='left' ? '2px 0 0 2px' : '2px 2px 0 0') : (h==='left' ? '0 0 2px 2px' : '0 2px 2px 0'),
                    }} />
                  ))}
                </div>

                <div style={{ flex: 1, paddingTop: 4 }}>
                  {/* Name in heavy ink */}
                  <h2 style={{ fontFamily: 'UnifrakturMaguntia', fontSize: 28, color: '#0E0A04', margin: '0 0 5px', lineHeight: 1, letterSpacing: '0.02em' }}>
                    {entry.name}
                  </h2>
                  {/* Subtitle */}
                  <div style={{ fontFamily: 'IM Fell English SC', fontSize: 10, color: 'rgba(26,18,8,0.5)', letterSpacing: '0.05em', marginBottom: 8, fontStyle: 'italic' }}>
                    {entry.subtitle}
                  </div>
                  {/* Meta row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {entry.threat && threatStamp(entry.threat)}
                    {entry.hp && (
                      <span style={{ fontFamily: 'IM Fell English SC', fontSize: 10, color: 'rgba(26,18,8,0.6)', border: '1px solid rgba(26,18,8,0.25)', padding: '1px 7px' }}>
                        ЖЗН: {entry.hp.toLocaleString()}
                      </span>
                    )}
                    {entry.rarity && (
                      <span style={{ fontFamily: 'IM Fell English', fontSize: 10, color: 'rgba(26,18,8,0.45)', fontStyle: 'italic' }}>{entry.rarity}</span>
                    )}
                    {entry.location && (
                      <span style={{ fontFamily: 'IM Fell English', fontSize: 10, color: 'rgba(26,18,8,0.45)', fontStyle: 'italic' }}>📍 {entry.location}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ink divider with crosshatch */}
              <InkDivider label="❧" />

              {/* Description — main body text */}
              <p style={{ fontFamily: 'IM Fell English', fontSize: 15, color: '#1A1208', lineHeight: 2.0, margin: '0 0 12px' }}>
                {entry.description}
              </p>

              {/* Flavor quote — in italic ink */}
              <div style={{ margin: '0 8px 16px', padding: '9px 14px', borderLeft: '3px solid rgba(26,18,8,0.3)', borderBottom: '1px solid rgba(26,18,8,0.12)' }}>
                <p style={{ fontFamily: 'IM Fell English', fontSize: 12, color: 'rgba(26,18,8,0.55)', lineHeight: 1.9, margin: 0, fontStyle: 'italic' }}>
                  {entry.flavor}
                </p>
              </div>

              {/* Abilities list */}
              <InkDivider label={mainTab === 'professions' ? 'навыки' : 'способности'} />
              {entry.abilities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 7, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'IM Fell English', fontSize: 12, color: 'rgba(26,18,8,0.5)', flexShrink: 0 }}>—</span>
                  <span style={{ fontFamily: 'IM Fell English', fontSize: 14, color: '#1A1208', lineHeight: 1.6 }}>{a}</span>
                </div>
              ))}

              {/* Footer */}
              <div style={{ position: 'absolute', bottom: 18, left: 60, right: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="book-page-num">{mainTab === 'professions' ? 'гл. I' : 'гл. II'}</span>
                <div style={{ flex: 1, borderTop: '1px solid rgba(26,18,8,0.15)', margin: '0 12px' }} />
                <span className="book-page-num">— {entry.page} —</span>
              </div>
            </div>

            {/* ── SPINE ── */}
            <div className="book-spine">
              {[...Array(9)].map((_, i) => <div key={i} className="spine-dot" />)}
            </div>

            {/* ── RIGHT PAGE ── */}
            <div className={`book-page-right ${pageClass}`}>

              {/* Section title right-aligned */}
              <div style={{ textAlign: 'right', fontFamily: 'UnifrakturMaguntia', fontSize: 12, color: 'rgba(26,18,8,0.4)', letterSpacing: '0.03em', marginBottom: 18 }}>
                {mainTab === 'professions' ? 'Тактические данные' : 'Уровень угрозы'}
              </div>

              {/* Stats — ink bar style */}
              <InkDivider label="показатели" />
              {entry.stats.map(s => <InkBar key={s.label} label={s.label} value={s.value} />)}

              {/* Hand-drawn double rule */}
              <div style={{ borderTop: '2px solid rgba(26,18,8,0.25)', borderBottom: '1px solid rgba(26,18,8,0.12)', height: 5, margin: '20px 0 18px' }} />

              {/* Tips — numbered notes style */}
              <div style={{ fontFamily: 'UnifrakturMaguntia', fontSize: 13, color: 'rgba(26,18,8,0.45)', marginBottom: 12 }}>
                заметки на полях:
              </div>
              {entry.tips.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  {/* Circled number — hand-drawn feel */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '1.5px solid rgba(26,18,8,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                    fontFamily: 'IM Fell English SC', fontSize: 9, color: 'rgba(26,18,8,0.6)',
                    background: 'rgba(26,18,8,0.04)',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontFamily: 'IM Fell English', fontSize: 14, color: '#1A1208', lineHeight: 1.7 }}>{t}</span>
                </div>
              ))}

              {/* Faded ink watermark — large icon ghost */}
              <div style={{ position: 'absolute', bottom: 48, right: 28, fontSize: 110, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', filter: 'grayscale(1)' }}>
                {entry.icon}
              </div>

              {/* Footer */}
              <div style={{ position: 'absolute', bottom: 18, left: 26, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="book-page-num">— {entry.page + 1} —</span>
                <div style={{ flex: 1, borderTop: '1px solid rgba(26,18,8,0.15)', margin: '0 12px' }} />
                <span className="book-page-num">{entry.id}</span>
              </div>
            </div>

            {/* ── PER-PAGE AGEING (a different kind of damage on each leaf) ── */}
            <div className="book-wear" aria-hidden>
              {/* The ragged block edges are physical to the book, so they stay */}
              <span className="wear-tear top" />
              <span className="wear-tear bottom" />
              {/* Everything else is chosen per entry so no two leaves age alike */}
              {getWearVariants()[wearSeed % getWearVariants().length].map((m, i) => (
                <span key={i} className={`wear ${m.type}`} style={m.style} />
              ))}
            </div>

            {/* ── TURNING LEAF (a chain of hinged segments that curls) ── */}
            {flipPhase !== 'idle' && (
              <div className={`turn-leaf ${dirClass}`} aria-hidden>
                <div className="leaf-shade" />
                <div className="leaf-pivot">{buildLeafSegments(SEG_COUNT)}</div>
              </div>
            )}

            {/* ── CORNER PAGE-TURN (fold a leaf) ── */}
            {idx > 0 && (
              <button className="page-corner prev" onClick={() => turnPage(-1)}
                disabled={flipPhase !== 'idle'} aria-label="Предыдущая страница">
                <span className="corner-hint">‹ {list[idx - 1].name}</span>
              </button>
            )}
            {idx < list.length - 1 && (
              <button className="page-corner next" onClick={() => turnPage(1)}
                disabled={flipPhase !== 'idle'} aria-label="Следующая страница">
                <span className="corner-hint">{list[idx + 1].name} ›</span>
              </button>
            )}

            {/* ── Spread indicator (dots per leaf) ── */}
            <div className="book-leaf-dots">
              {list.map((e, i) => (
                <button key={e.id} className={`leaf-dot ${i === idx ? 'on' : ''}`}
                  onClick={() => navigate(e.id, undefined, i >= idx ? 1 : -1)}
                  title={e.name} aria-label={e.name} />
              ))}
            </div>

          </div>
          <div className="book-bottom-edge" />
        </div>
      </div>
    </div>
  )
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (u: User) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function submit() {
    setError('')
    if (!username.trim() || !password.trim()) { setError('Заполните все поля'); return }
    if (tab === 'register' && password !== confirm) { setError('Пароли не совпадают'); return }
    if (password.length < 4) { setError('Пароль слишком короткий'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({ username: username.trim(), avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] })
    }, 900)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel corners anim-fade-up" style={{ width: '100%', maxWidth: 420, padding: 32, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#00D4FF', letterSpacing: '0.22em', opacity: 0.7 }}>СИСТЕМА ИДЕНТИФИКАЦИИ</div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(0,212,255,0.25),transparent)' }} />
        </div>
        <div style={{ display: 'flex', marginBottom: 24, border: '1px solid #1A2A3A' }}>
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{ flex: 1, padding: '10px', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(0,212,255,0.08)' : 'transparent', color: tab === t ? '#00D4FF' : '#2A4050', borderBottom: tab === t ? '2px solid #00D4FF' : '2px solid transparent', transition: 'all 0.2s' }}>
              {t === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'ПОЗЫВНОЙ', val: username, set: setUsername, type: 'text', ph: 'Введите логин' },
            { label: 'КОД ДОСТУПА', val: password, set: setPassword, type: 'password', ph: '••••••••' },
            ...(tab === 'register' ? [{ label: 'ПОВТОР КОДА', val: confirm, set: setConfirm, type: 'password', ph: '••••••••' }] : []),
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontFamily: 'Roboto Mono', fontSize: 8, color: '#2A4050', letterSpacing: '0.16em', marginBottom: 7 }}>{f.label}</div>
              <input className="input-field" type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          ))}
          {error && <div style={{ fontFamily: 'Roboto Mono', fontSize: 10, color: '#FF6B00', background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.18)', padding: '8px 12px' }}>⚠ {error}</div>}
          <button className="btn-primary" onClick={submit} disabled={loading} style={{ padding: 13, width: '100%', opacity: loading ? 0.75 : 1 }}>
            {loading ? '● АВТОРИЗАЦИЯ...' : tab === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ'}
          </button>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 11, width: '100%' }}>ОТМЕНА</button>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 14, fontFamily: 'Roboto Mono', fontSize: 8, color: '#142030', letterSpacing: '0.1em' }}>BARO-AUTH v2.7</div>
      </div>
    </div>
  )
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────

function ProfileDrawer({ user, onClose, onAvatarChange, onLogout }: { user: User; onClose: () => void; onAvatarChange: (a: string) => void; onLogout: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => onAvatarChange(ev.target?.result as string)
    r.readAsDataURL(f)
  }
  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-slide-right" style={{ width: '100%', maxWidth: 340, height: '100vh', overflowY: 'auto', background: 'linear-gradient(180deg,#0C1622 0%,#070B16 100%)', borderLeft: '1px solid #1A2A3A', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #0E1A28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#00D4FF', letterSpacing: '0.24em', opacity: 0.8 }}>ЛИЧНЫЙ КАБИНЕТ</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#2A4050', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="anim-float-glow" style={{ width: 80, height: 80, borderRadius: '50%', background: '#060C18', border: '1px solid #1A2A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
              {user.avatar.startsWith('data:') ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.avatar}
            </div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#D0DDE8', fontWeight: 700 }}>{user.username}</div>
            <div style={{ fontFamily: 'Roboto Mono', fontSize: 9, color: '#4A6070', background: 'rgba(0,0,0,0.3)', border: '1px solid #1A2A3A', padding: '3px 12px', letterSpacing: '0.12em' }}>
              ● CREW MEMBER
            </div>
          </div>
          <RivetRow />
          <div>
            <div style={{ fontFamily: 'Roboto Mono', fontSize: 8, color: '#2A4050', letterSpacing: '0.16em', marginBottom: 12 }}>ВЫБРАТЬ АВАТАР</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7 }}>
              {AVATARS.map(em => (
                <button key={em} onClick={() => onAvatarChange(em)} style={{ fontSize: 20, padding: '9px 0', border: '1px solid', borderColor: user.avatar === em ? '#00D4FF' : '#1A2A3A', background: user.avatar === em ? 'rgba(0,212,255,0.07)' : 'rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1 }}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()} className="btn-ghost" style={{ width: '100%', padding: 10 }}>☁ ЗАГРУЗИТЬ ИЗОБРАЖЕНИЕ</button>
          </div>
          <RivetRow />
          {[['Позывной', user.username], ['Статус', 'Экипаж'], ['Доступ', 'ОГРАНИЧЕН']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #0A1420' }}>
              <span style={{ fontFamily: 'Roboto Mono', fontSize: 9, color: '#2A4050', letterSpacing: '0.06em' }}>{l}</span>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 14, color: '#B0C4D4' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 24, borderTop: '1px solid #0A1420' }}>
          <button className="btn-danger" onClick={onLogout} style={{ width: '100%', padding: 13 }}>⏏ ПОКИНУТЬ СУБМАРИНУ</button>
        </div>
      </div>
    </div>
  )
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: NewsItem }) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(item.comments)

  function addComment() {
    if (!comment.trim()) return
    setComments(prev => [...prev, { id: Date.now(), author: 'Гость', avatar: '🐟', text: comment.trim(), date: new Date().toLocaleString('ru') }])
    setComment('')
  }

  return (
    <article className="glass-panel card-hover" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg, #00D4FF, rgba(0,212,255,0.15), transparent)' }} />
      <div style={{ padding: '20px 24px' }}>

        <div style={{ fontFamily: 'Roboto Mono', fontSize: 9, color: '#2A4050', letterSpacing: '0.1em', marginBottom: 8 }}>{item.date}</div>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: '#D0DDE8', margin: '0 0 12px', lineHeight: 1.35 }}>{item.title}</h2>
        <p style={{ fontFamily: 'Rajdhani', fontSize: 15, color: '#6A8090', lineHeight: 1.8, margin: '0 0 14px' }}>{item.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #0A1A28', paddingTop: 12 }}>
          <div style={{ width: 4, height: 4, background: '#00D4FF', boxShadow: '0 0 6px #00D4FF' }} />
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: '#00D4FF', letterSpacing: '0.04em' }}>{item.author}</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setOpen(!open)} style={{ fontFamily: 'Roboto Mono', fontSize: 9, background: 'none', border: 'none', color: open ? '#00D4FF' : '#2A4050', cursor: 'pointer', letterSpacing: '0.06em', transition: 'color 0.15s' }}>
            💬 {comments.length}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #0A1A28', background: 'rgba(0,0,0,0.25)', padding: '16px 24px' }}>
          {comments.length === 0 && <div style={{ fontFamily: 'Roboto Mono', fontSize: 10, color: '#1A2E3A', textAlign: 'center', padding: '8px 0' }}>// нет комментариев</div>}
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#060C18', border: '1px solid #1A2A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{c.avatar}</div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)', padding: '7px 11px', border: '1px solid #0E1A28' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: '#4A6070' }}>{c.author}</span>
                  <span style={{ fontFamily: 'Roboto Mono', fontSize: 8, color: '#1A2E3A' }}>{c.date}</span>
                </div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 14, color: '#8AA0B0' }}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
            <input className="input-field" placeholder="Ваш комментарий..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} style={{ flex: 1, padding: '7px 12px', fontSize: 13 }} />
            <button className="btn-primary" onClick={addComment} style={{ padding: '7px 16px', flexShrink: 0 }}>→</button>
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function LinksWidget() {
  const links = [{ label: 'Правила сервера', icon: '📜' }, { label: 'Discord сообщества', icon: '💬' }, { label: 'Поддержать проект', icon: '💎' }]
  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#2A4050', letterSpacing: '0.24em', marginBottom: 14 }}>// НАВИГАЦИЯ</div>
      {links.map(l => (
        <a key={l.label} href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid #0E1A28', fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 14, color: '#4A6070', textDecoration: 'none', transition: 'all 0.18s', marginBottom: 5 }}
          onMouseEnter={e => Object.assign((e.currentTarget as HTMLAnchorElement).style, { color: '#00D4FF', borderColor: 'rgba(0,212,255,0.18)', background: 'rgba(0,212,255,0.04)' })}
          onMouseLeave={e => Object.assign((e.currentTarget as HTMLAnchorElement).style, { color: '#4A6070', borderColor: '#0E1A28', background: 'rgba(0,0,0,0.25)' })}>
          <span>{l.icon}</span><span>{l.label}</span><span style={{ marginLeft: 'auto', opacity: 0.3 }}>›</span>
        </a>
      ))}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ user, page, setPage, onOpenAuth, onOpenProfile }: {
  user: User | null; page: string; setPage: (p: string) => void; onOpenAuth: () => void; onOpenProfile: () => void
}) {
  return (
    <header style={{ background: 'linear-gradient(180deg,rgba(10,18,32,0.98) 0%,rgba(6,11,22,0.99) 100%)', borderBottom: '1px solid #0E1A28', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
      <div style={{ background: '#040810', borderBottom: '1px solid #0A1420', padding: '4px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Roboto Mono', fontSize: 8, color: '#1A2E3A', letterSpacing: '0.14em' }}>BAROTRAUMA RU,EU // SECTOR-X // DEPTH 3000m // PRESSURE CRITICAL</div>
        <div style={{ fontFamily: 'Roboto Mono', fontSize: 8, color: '#1A2E3A', letterSpacing: '0.14em' }}>SCX // DEEP-SEA STATION</div>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 24, marginRight: 6, borderRight: '1px solid #0E1A28' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🚢</div>
          <div>
            <div className="neon-cyan anim-flicker" style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 15, letterSpacing: '0.07em', lineHeight: 1 }}>BAROTRAUMA</div>
            <div style={{ fontFamily: 'Roboto Mono', fontSize: 7, color: '#1A3040', letterSpacing: '0.18em', marginTop: 3 }}>SCX · SERVER HUB</div>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
          {[{ key: 'home', label: 'Главная', icon: '⊞' }, { key: 'wiki', label: 'Вики', icon: '📖' }].map(t => (
            <button key={t.key} className={`nav-tab ${page === t.key ? 'active' : ''}`} onClick={() => setPage(t.key)}>
              <span style={{ opacity: 0.5, fontSize: 12 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tt text="Уведомления">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontSize: 15, lineHeight: 1, padding: 6 }}>
              🔔
              <div className="anim-blink" style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#FF2244', boxShadow: '0 0 6px rgba(255,34,68,0.9)' }} />
            </button>
          </Tt>
          {user ? (
            <button onClick={onOpenProfile} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.04)', border: '1px solid #0E1A28', padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#0E1A28'}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#060C18', border: '1px solid #1A2A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, position: 'relative' }}>
                {user.avatar.startsWith('data:') ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.avatar}
              </div>
              <div>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: '#C0D4E0', lineHeight: 1 }}>{user.username}</div>
                <div style={{ fontFamily: 'Roboto Mono', fontSize: 7, color: '#2A4050', lineHeight: 1, marginTop: 2, letterSpacing: '0.1em' }}>CREW</div>
              </div>
              <span style={{ color: '#1A2E3A', fontSize: 8 }}>▾</span>
            </button>
          ) : (
            <button className="btn-primary" onClick={onOpenAuth} style={{ padding: '8px 18px' }}>ВОЙТИ</button>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroBanner() {
  const [copied, setCopied] = useState(false)
  const ip = 'scx.barotrauma.ru:27015'
  const stats = [
    { k: 'ГЛУБИНА', v: '3000 м' },
    { k: 'РЕГИОН', v: 'RU · EU' },
    { k: 'РЕЖИМ', v: 'Кампания' },
    { k: 'КАРТА', v: 'Европа' },
  ]
  return (
    <div className="hero card-hover" style={{ marginBottom: 28 }}>
      <img className="hero-img"
        src="https://images.unsplash.com/photo-1743656619958-68d85790bdb4?w=1600&h=720&fit=crop&auto=format"
        alt="Аквалангист погружается в тёмную синюю бездну океана" />
      <div className="hero-scrim" />
      <div className="hero-grid" />
      <div className="hero-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: 'Roboto Mono', fontSize: 9, color: '#5A8598', letterSpacing: '0.22em' }}>// ГЛУБОКОВОДНАЯ СТАНЦИЯ · SECTOR-X</span>
        </div>
        <h1 className="neon-cyan" style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(34px,6vw,64px)', letterSpacing: '0.04em', lineHeight: 0.95, margin: '0 0 6px' }}>
          BAROTRAUMA
        </h1>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 'clamp(15px,2vw,20px)', color: '#8FB4C8', letterSpacing: '0.05em', marginBottom: 18, maxWidth: 560 }}>
          Русскоязычное сообщество глубоководной станции. Выживай, чини корпус и держи давление под контролем.
        </div>
        <div className="hero-stats">
          {stats.map(s => (
            <div key={s.k} className="hero-chip">
              <div style={{ fontFamily: 'Roboto Mono', fontSize: 7, color: '#3E5E70', letterSpacing: '0.16em', marginBottom: 3 }}>{s.k}</div>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: 13, color: '#C8E4F0' }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-primary" style={{ padding: '11px 22px' }}
            onClick={() => { navigator.clipboard?.writeText(ip).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600) }}>
            {copied ? '✓ IP СКОПИРОВАН' : '⚓ ПОДКЛЮЧИТЬСЯ'}
          </button>
          <div className="hero-ip"><span style={{ color: '#3E5E70' }}>ip //</span> {ip}</div>
        </div>
      </div>
    </div>
  )
}

function SonarWidget() {
  return (
    <div className="glass-panel corners" style={{ padding: 18 }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#2A4050', letterSpacing: '0.24em', marginBottom: 12 }}>// СОНАР</div>
      <div className="sonar">
        <div className="sonar-ring r1" /><div className="sonar-ring r2" /><div className="sonar-ring r3" />
        <div className="sonar-sweep" />
        <div className="sonar-blip b1" /><div className="sonar-blip b2" /><div className="sonar-blip b3" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        {[['ГЛУБИНА', '3000 м'], ['ДАВЛЕНИЕ', 'КРИТ.'], ['КОРПУС', '67%'], ['O₂', '82%']].map(([k, v]) => (
          <div key={k} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0E1A28', padding: '6px 9px' }}>
            <div style={{ fontFamily: 'Roboto Mono', fontSize: 7, color: '#2A4050', letterSpacing: '0.12em' }}>{k}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, color: v === 'КРИТ.' ? '#FF6B00' : '#00D4FF', marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid #0E1A28', marginTop: 48, background: 'linear-gradient(180deg, transparent, rgba(4,8,16,0.6))' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="neon-cyan" style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em' }}>BAROTRAUMA · SCX</div>
          <div style={{ fontFamily: 'Roboto Mono', fontSize: 8, color: '#1A3040', letterSpacing: '0.14em', marginTop: 5 }}>СООБЩЕСТВО ГЛУБОКОВОДНОЙ СТАНЦИИ · © 2026</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Discord', 'Steam', 'Правила'].map(l => (
            <a key={l} href="#" className="footer-link">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ news }: { news: NewsItem[] }) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
      <HeroBanner />
      <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div className="rivet" /><div className="rivet" />
            <h1 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: '#2A4050', margin: 0, letterSpacing: '0.18em' }}>НОВОСТИ СЕРВЕРА</h1>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#0E1A28,transparent)' }} />
            <Tt text="Создание новостей недоступно">
              <button disabled style={{ padding: '8px 18px', fontFamily: 'Orbitron', fontSize: 9, background: '#060C18', border: '1px solid #0E1A28', color: '#1A2E3A', cursor: 'not-allowed', letterSpacing: '0.12em' }}>+ СОЗДАТЬ</button>
            </Tt>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {news.map(item => <NewsCard key={item.id} item={item} />)}
          </div>
        </div>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 84 }}>
          <LinksWidget />
          <SonarWidget />
        </aside>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const news = INIT_NEWS
  const [page, setPage] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      {/* Atmosphere layers */}
      <div className="bg-abyss" />
      <div className="fog-layer" />
      <div className="scanlines" />
      <div className="vignette" />

      {/* App */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        <Header user={user} page={page} setPage={setPage}
          onOpenAuth={() => setShowAuth(true)} onOpenProfile={() => setShowProfile(true)} />

        {page === 'home' && <HomePage news={news} />}
        {page === 'wiki' && <WikiBook />}

        <SiteFooter />

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => { setUser(u); setShowAuth(false) }} />}
        {showProfile && user && (
          <ProfileDrawer user={user} onClose={() => setShowProfile(false)}
            onAvatarChange={a => setUser({ ...user, avatar: a })}
            onLogout={() => { setUser(null); setShowProfile(false) }} />
        )}
      </div>
    </>
  )
}
