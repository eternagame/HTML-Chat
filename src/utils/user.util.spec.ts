import { describe, expect, it } from 'vitest';
import { parseNick, parseUid } from './user.util';

describe('user', () => {
  it('parses username from nick', () => {
    expect(parseNick('AnotherUser')).toBe('AnotherUser');
    expect(parseNick('Anonymous^12')).toBe('Anonymous');
    expect(parseNick('Chatter__123^1')).toBe('Chatter');
  });

  it('parses UID from ident or former nick format', () => {
    expect(parseUid('AnotherUser', 'anon')).toBe('0');
    expect(parseUid('UnverifiedUser', '~987')).toBe('987');
    expect(parseUid('Anonymous^456', '67890')).toBe('67890');
    expect(parseUid('Chatter__123^1', 'anon')).toBe('123');
  });
});
