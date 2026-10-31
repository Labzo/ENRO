// Data from the ENRO world bible (2026-10-18) and Labzo's city loop (2026-10-31).
export type Branch = 'Связи' | 'Риск' | 'Вождение' | 'Техника' | 'Внимание';
export const BRANCHES: Branch[] = ['Связи', 'Риск', 'Вождение', 'Техника', 'Внимание'];

export interface SlavName { hu: string; ru: string; meaningHu: string; meaningEn: string; branch: Branch; female: boolean }
export const NAMES: SlavName[] = [
  { hu: 'Milán', ru: 'Милан', meaningHu: 'kedves', meaningEn: 'dear', branch: 'Связи', female: false },
  { hu: 'Bogdán', ru: 'Богдан', meaningHu: 'Isten adta', meaningEn: 'God-given', branch: 'Риск', female: false },
  { hu: 'Ladomér', ru: 'Владимир', meaningHu: 'a világ ura', meaningEn: 'ruler of the world', branch: 'Вождение', female: false },
  { hu: 'Szaniszló', ru: 'Станислав', meaningHu: 'maradandó dicsőség', meaningEn: 'lasting glory', branch: 'Техника', female: false },
  { hu: 'Kázmér', ru: 'Казимир', meaningHu: 'a béke megtörője', meaningEn: 'breaker of peace', branch: 'Риск', female: false },
  { hu: 'Vencel', ru: 'Вячеслав', meaningHu: 'nagyobb dicsőség', meaningEn: 'greater glory', branch: 'Вождение', female: false },
  { hu: 'Ludmilla', ru: 'Людмила', meaningHu: 'a nép kedveltje', meaningEn: 'loved by the people', branch: 'Связи', female: true },
  { hu: 'Milena', ru: 'Милена', meaningHu: 'kedves', meaningEn: 'dear', branch: 'Связи', female: true },
  { hu: 'Szvetlána', ru: 'Светлана', meaningHu: 'fényes', meaningEn: 'bright', branch: 'Внимание', female: true },
  { hu: 'Nadin', ru: 'Надежда', meaningHu: 'remény', meaningEn: 'hope', branch: 'Риск', female: true },
  { hu: 'Zora', ru: 'Зоря', meaningHu: 'hajnal', meaningEn: 'dawn', branch: 'Внимание', female: true },
];

export type Kind = 'woman' | 'man' | 'android';
/** Displayed Skill COIN modifier (Labzo, 2026-10-31). The real race effect is identical for all. */
export const DISPLAY_MOD: Record<Kind, number> = { woman: 2, man: -2, android: 0 };

export interface Cargo { ru: string; hu: string; en: string }
export const CARGO: Cargo[] = [
  { ru: 'МЕРА-фура', hu: 'МЕРА-fuvar: vodka és lazac. Rendőri prioritás 1.', en: 'МЕРА run: vodka and salmon. Police priority 1.' },
  { ru: 'Радиоактивно. Не трясти', hu: 'Fegyveralkatrész. A bójákon kívül robban.', en: 'Weapon parts. Explodes outside the buoys.' },
  { ru: 'Техника', hu: 'Technológia: 16 egyforma rakodó.', en: 'Technology: 16 identical loaders.' },
  { ru: 'Ущерб по вине водителя', hu: 'Ruha és bútor, eleve sérült. 0 €.', en: 'Clothes and furniture, already damaged. €0.' },
  { ru: 'Сбор за привязку', hu: 'Kötődési díj fuvar: fix 25 €, kötelezően a leghosszabb úton.', en: 'Attachment-fee run: fixed €25, longest route required.' },
];
