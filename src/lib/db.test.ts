import { describe, it, expect } from 'vitest';
import { buildSetClause } from './db';

describe('buildSetClause', () => {
  it('허용 컬럼만 포함하고 순서대로 번호를 매긴다', () => {
    const { set, params } = buildSetClause(
      { title: 'a', status: 'approved', evil: 'x' },
      ['title', 'status']
    );
    expect(set).toBe('"title" = $1, "status" = $2');
    expect(params).toEqual(['a', 'approved']);
  });
  it('undefined는 건너뛰고 null은 포함한다', () => {
    const { set, params } = buildSetClause(
      { title: undefined, power_plant_id: null },
      ['title', 'power_plant_id']
    );
    expect(set).toBe('"power_plant_id" = $1');
    expect(params).toEqual([null]);
  });
  it('업데이트할 것이 없으면 빈 문자열', () => {
    expect(buildSetClause({}, ['a']).set).toBe('');
  });
});
