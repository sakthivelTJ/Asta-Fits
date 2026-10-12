describe('Settings Screen Logic & Confirmation Tests', () => {
  test('DELETE confirmation dialog requires exact "DELETE" input match', () => {
    const isDeleteConfirmed = (input) => input.trim() === 'DELETE';

    expect(isDeleteConfirmed('DELETE')).toBe(true);
    expect(isDeleteConfirmed('delete')).toBe(false);
    expect(isDeleteConfirmed('DEL')).toBe(false);
    expect(isDeleteConfirmed('')).toBe(false);
  });

  test('Quiet hours warning triggers when reminder time is between 22:00 and 07:00', () => {
    const isQuietHourTime = (timeStr) => {
      const hour = parseInt(timeStr.split(':')[0], 10);
      return hour >= 22 || hour < 7;
    };

    expect(isQuietHourTime('22:30')).toBe(true);
    expect(isQuietHourTime('05:00')).toBe(true);
    expect(isQuietHourTime('08:00')).toBe(false);
    expect(isQuietHourTime('18:00')).toBe(false);
  });
});
