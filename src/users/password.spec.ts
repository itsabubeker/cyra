import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the correct password', async () => {
    const passwordHash = await hashPassword('hunter2');

    await expect(
      verifyPassword({ plain: 'hunter2', passwordHash }),
    ).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const passwordHash = await hashPassword('hunter2');

    await expect(
      verifyPassword({ plain: 'hunter3', passwordHash }),
    ).resolves.toBe(false);
  });

  it('stores the hash as hex salt:key', async () => {
    const passwordHash = await hashPassword('hunter2');

    expect(passwordHash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/);
  });

  it('salts: the same password hashes differently each time, and both verify', async () => {
    const first = await hashPassword('hunter2');
    const second = await hashPassword('hunter2');

    expect(first).not.toBe(second);
    await expect(
      verifyPassword({ plain: 'hunter2', passwordHash: first }),
    ).resolves.toBe(true);
    await expect(
      verifyPassword({ plain: 'hunter2', passwordHash: second }),
    ).resolves.toBe(true);
  });

  it('handles unicode passwords', async () => {
    const plain = 'pässwörd 🔑';
    const passwordHash = await hashPassword(plain);

    await expect(verifyPassword({ plain, passwordHash })).resolves.toBe(true);
    await expect(
      verifyPassword({ plain: 'passwerd', passwordHash }),
    ).resolves.toBe(false);
  });

  // Empty passwords are rejected by DTO validation, not here. This pins that
  // the helper itself doesn't care.
  it('round-trips an empty password', async () => {
    const passwordHash = await hashPassword('');

    await expect(verifyPassword({ plain: '', passwordHash })).resolves.toBe(
      true,
    );
  });

  it.each([
    ['empty string', ''],
    ['no colon', 'nocolon'],
    ['only a colon', ':'],
    ['empty key', 'salt:'],
    ['empty salt', ':key'],
    ['non-hex key', 'salt:zzzz'],
    ['truncated key', 'salt:abcd'],
    ['too many parts', 'a:b:c'],
    ['right length but wrong key', `salt:${'00'.repeat(32)}`],
  ])(
    'returns false, without throwing, for a malformed value (%s)',
    async (_label, passwordHash) => {
      await expect(
        verifyPassword({ plain: 'hunter2', passwordHash }),
      ).resolves.toBe(false);
    },
  );
});
