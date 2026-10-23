import type { MealRegistration } from '../types';

export type FacilityId = 1 | 2;
export type FacilityFilter = 'all' | 'unassigned' | FacilityId;
export type FacilityPerson = { id?: number; fullName?: string };
export type FacilityOverrides = Record<string, { name: string; facilityId: FacilityId | null }>;

// Photo supplied by the administrator. Keep accents to avoid matching different people.
// Only the two confirmed account aliases are included; Tuân is not guessed to be Tuấn.
export const FACILITY_1_NAMES = [
  'Kim Mạnh Cường', 'Vũ Lê Duy', 'Trần Duy Khánh', 'Bùi Minh Hiệp',
  'Đinh Thị Hằng', 'Đinh Thị Hải', 'Tô Ngọc Anh', 'Dương Quang Huy',
  'Nguyễn Thế Hùng', 'Hoàng Minh Tuấn', 'Đàm Phan Hạnh', 'Trần Minh Đức',
  'Hoàng Đức Thắng', 'Đỗ Hồng Quân', 'Đỗ Minh Ngọc', 'Nguyễn Thắng Nghĩa',
  'Nguyễn Hải Vinh', 'Hoàng Văn Quang', 'Vũ Đức Hiếu', 'Nguyễn Đức Trọng',
  'Nguyễn Việt Hà', 'Lê Duy Long', 'Nguyễn Tiến Đạt', 'Nguyễn Thành Long',
  'Nguyễn Quang Việt', 'Trịnh Đức Thọ', 'Bùi Thị Hương Giang',
  'Nguyễn Công Tuấn Dũng', 'Nguyễn Thị Minh Phương', 'Nguyễn T.Minh Phương',
  'Bùi Thị Hải Hà', 'Bùi Thị Hải Hà (cũ)', 'Đức Anh (mới)', 'Nguyễn Đức Anh',
];

export const normalizeFacilityName = (name: string) =>
  name.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('vi');
const facility1Names = new Set(FACILITY_1_NAMES.map(normalizeFacilityName));

export function getFacility(person: FacilityPerson, overrides: FacilityOverrides = {}): FacilityId | null {
  const name = normalizeFacilityName(person.fullName || '');
  const override = person.id === undefined ? undefined : overrides[String(person.id)];
  // A reused account ID must not inherit the previous person's local assignment.
  if (override && normalizeFacilityName(override.name) === name) return override.facilityId;
  return facility1Names.has(name) ? 1 : null;
}

export const facilityLabel = (value: FacilityFilter | null) =>
  value === 'all' ? 'Tất cả cơ sở' : value === 1 ? 'Cơ sở 1' : value === 2 ? 'Cơ sở 2' : 'Chưa phân cơ sở';

export const matchesFacility = (facility: FacilityId | null, filter: FacilityFilter) =>
  filter === 'all' || (filter === 'unassigned' ? facility === null : facility === filter);

export function registrationPerson(record: MealRegistration, users: FacilityPerson[] = []): FacilityPerson {
  return users.find(person => person.id === record.userId) || {
    id: record.userId, fullName: record.user?.fullName || record.userName,
  };
}

export function summarizeFacilityMeals(
  records: MealRegistration[], users: FacilityPerson[], overrides: FacilityOverrides = {},
) {
  const summary = {
    1: { staff: 0, guests: 0, total: 0 },
    2: { staff: 0, guests: 0, total: 0 },
    unassigned: { staff: 0, guests: 0, total: 0 },
  };
  for (const record of records) {
    if (record.status !== 'confirmed' && record.status !== 'completed') continue;
    const facility = getFacility(registrationPerson(record, users), overrides);
    const group = summary[facility ?? 'unassigned'];
    const guests = Math.max(0, Number(record.guestCount) || 0);
    group.staff += 1;
    group.guests += guests;
    group.total += 1 + guests;
  }
  return summary;
}
