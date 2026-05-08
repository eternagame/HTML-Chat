import { describe, expect, it } from 'vitest';
import { isMaskMatch, parseNick, parseUid } from './user.util';

describe('user', () => {
  it('parses username from nick', () => {
    expect(parseNick('AnotherUser')).toBe('AnotherUser');
    expect(parseNick('Anonymous^12')).toBe('Anonymous');
  });

  it('parses UID from ident or former nick format', () => {
    expect(parseUid('anon')).toBe('0');
    expect(parseUid('~987')).toBe('987');
    expect(parseUid('67890')).toBe('67890');
  });

  it('matches masks', () => {
    expect(isMaskMatch('anonymous^24', 'anonymous^*!*@*')).toBe(true);
    expect(isMaskMatch('AnotherUser^25', 'm:AnotherUser^*!*@*')).toBe(true);
  });
});
