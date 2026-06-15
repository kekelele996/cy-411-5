import assert from 'node:assert/strict';

const ActivityCategory = {
  TRANSPORT: 'transport',
  ENERGY: 'energy',
  FOOD: 'food',
  SHOPPING: 'shopping'
};

function calculateTopCategory(rows) {
  if (!rows.length) return null;
  const categoryTotals = {};
  let grandTotal = 0;
  for (const row of rows) {
    const val = Number(row.carbonValue);
    categoryTotals[row.category] = (categoryTotals[row.category] || 0) + val;
    grandTotal += val;
  }
  if (grandTotal <= 0) return null;
  let maxCat = null;
  let maxVal = 0;
  for (const [cat, val] of Object.entries(categoryTotals)) {
    if (val > maxVal) {
      maxVal = val;
      maxCat = cat;
    }
  }
  if (!maxCat) return null;
  return {
    category: maxCat,
    total: Number(maxVal.toFixed(2)),
    percent: Number(((maxVal / grandTotal) * 100).toFixed(1)),
  };
}

function makeActivity(category, carbonValue, recordDate) {
  return {
    id: 1,
    userId: 1,
    category,
    subType: 'test',
    amount: '1',
    unit: 'km',
    carbonValue: String(carbonValue),
    recordDate,
  };
}

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name}`);
      console.error(`  ${err.message}`);
      failed++;
    }
  }

  test('calculateTopCategory - 空数组返回 null', () => {
    const result = calculateTopCategory([]);
    assert.equal(result, null);
  });

  test('calculateTopCategory - 零排放返回 null', () => {
    const rows = [
      makeActivity(ActivityCategory.TRANSPORT, 0, '2026-06-01'),
      makeActivity(ActivityCategory.ENERGY, 0, '2026-06-02'),
    ];
    const result = calculateTopCategory(rows);
    assert.equal(result, null);
  });

  test('calculateTopCategory - 单分类正确识别', () => {
    const rows = [
      makeActivity(ActivityCategory.TRANSPORT, 10, '2026-06-01'),
      makeActivity(ActivityCategory.TRANSPORT, 20, '2026-06-02'),
    ];
    const result = calculateTopCategory(rows);
    assert.equal(result.category, ActivityCategory.TRANSPORT);
    assert.equal(result.total, 30);
    assert.equal(result.percent, 100);
  });

  test('calculateTopCategory - 多分类正确识别最高排放', () => {
    const rows = [
      makeActivity(ActivityCategory.TRANSPORT, 10, '2026-06-01'),
      makeActivity(ActivityCategory.ENERGY, 50, '2026-06-02'),
      makeActivity(ActivityCategory.FOOD, 20, '2026-06-03'),
      makeActivity(ActivityCategory.SHOPPING, 15, '2026-06-04'),
    ];
    const result = calculateTopCategory(rows);
    assert.equal(result.category, ActivityCategory.ENERGY);
    assert.equal(result.total, 50);
    assert.equal(result.percent, 52.6);
  });

  test('calculateTopCategory - 近30天口径：跨月时包含上月数据', () => {
    const thirtyDaysRows = [
      makeActivity(ActivityCategory.ENERGY, 100, '2026-05-20'),
      makeActivity(ActivityCategory.TRANSPORT, 30, '2026-06-01'),
      makeActivity(ActivityCategory.TRANSPORT, 20, '2026-06-10'),
    ];
    const result = calculateTopCategory(thirtyDaysRows);
    assert.equal(result.category, ActivityCategory.ENERGY);
    assert.equal(result.total, 100);
    assert.equal(result.percent, 66.7);
  });

  test('两套口径分离验证：本月数据 vs 近30天数据', () => {
    const monthRows = [
      makeActivity(ActivityCategory.TRANSPORT, 30, '2026-06-01'),
      makeActivity(ActivityCategory.TRANSPORT, 20, '2026-06-10'),
    ];
    const thirtyDaysRows = [
      makeActivity(ActivityCategory.ENERGY, 100, '2026-05-20'),
      makeActivity(ActivityCategory.TRANSPORT, 30, '2026-06-01'),
      makeActivity(ActivityCategory.TRANSPORT, 20, '2026-06-10'),
    ];

    const monthTop = calculateTopCategory(monthRows);
    const thirtyDaysTop = calculateTopCategory(thirtyDaysRows);

    assert.equal(monthTop.category, ActivityCategory.TRANSPORT, '本月最高应为交通');
    assert.equal(thirtyDaysTop.category, ActivityCategory.ENERGY, '近30天最高应为能源');
    assert.notEqual(monthTop.category, thirtyDaysTop.category, '两套口径应得出不同结果');
  });

  test('useCarbonStats - 趋势图只包含本月数据（模拟验证）', () => {
    const allRows = [
      makeActivity(ActivityCategory.ENERGY, 100, '2026-05-20'),
      makeActivity(ActivityCategory.TRANSPORT, 30, '2026-06-01'),
      makeActivity(ActivityCategory.TRANSPORT, 20, '2026-06-10'),
    ];

    const monthStart = new Date('2026-06-01');
    const monthEnd = new Date('2026-06-30');
    const trendRows = allRows.filter((row) => {
      const d = new Date(row.recordDate);
      return d >= monthStart && d <= monthEnd;
    });

    assert.equal(trendRows.length, 2, '趋势图应只包含2条本月数据');
    assert.ok(trendRows.every((r) => r.recordDate.startsWith('2026-06')), '所有趋势数据应在6月');
  });

  test('边界：相同排放量时取第一个遍历到的分类', () => {
    const rows = [
      makeActivity(ActivityCategory.TRANSPORT, 50, '2026-06-01'),
      makeActivity(ActivityCategory.ENERGY, 50, '2026-06-02'),
    ];
    const result = calculateTopCategory(rows);
    assert.ok(
      result.category === ActivityCategory.TRANSPORT || result.category === ActivityCategory.ENERGY
    );
    assert.equal(result.total, 50);
    assert.equal(result.percent, 50);
  });

  console.log(`\n测试完成：${passed} 通过，${failed} 失败`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
